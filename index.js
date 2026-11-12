/**
 * Host half of the Token usage bundle.
 *
 * Local token counts come from the Client's `tokenUsage` session projection.
 * This half adds the account-wide DeepSeek Platform usage/cost bridge so the
 * page can show real billed spend without exposing the account credential to
 * the browser. The route returns aggregates only; it never returns the token.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const inject = ['webServer'];

/** Same-origin bridge path used by the Client half. */
const API_ROUTE = '/dsh-token-usage/api';
/** The private by-key endpoint rejects windows longer than 31 days. */
const MAX_RANGE_DAYS = 30;
const MAX_BODY_BYTES = 64 * 1024;
const REQUEST_TIMEOUT_MS = 15000;
const PLATFORM_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/** A safe, classified Platform failure. Upstream bodies are never returned. */
class BillingError extends Error {
  /**
   * @param code - stable client-facing code.
   * @param status - optional upstream HTTP status.
   */
  constructor(code, status) {
    super(code);
    this.name = 'BillingError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Serialize one JSON response without caching.
 * @param res - Node response.
 * @param status - HTTP status.
 * @param body - JSON payload.
 */
function json(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff'
  });
  res.end(JSON.stringify(body));
}

/**
 * Read a small JSON request body.
 * @param req - Node request.
 * @returns parsed JSON object.
 */
async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += value.length;
    if (size > MAX_BODY_BYTES) throw new BillingError('request-too-large', 413);
    chunks.push(value);
  }
  let parsed;
  try {
    parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (_error) {
    throw new BillingError('bad-request', 400);
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new BillingError('bad-request', 400);
  }
  return parsed;
}

/**
 * Determine whether one address belongs to the local host.
 * @param address - socket remote address.
 * @returns true for IPv4/IPv6 loopback forms.
 */
function isLoopback(address) {
  return address === '127.0.0.1'
    || address === '::1'
    || address === '::ffff:127.0.0.1';
}

/**
 * Locality check for an origin hostname.
 * @param hostname - URL hostname.
 * @returns true for loopback/localhost forms.
 */
function isLocalHost(hostname) {
  return hostname === '127.0.0.1'
    || hostname === 'localhost'
    || hostname === '::1'
    || hostname === '[::1]';
}

/**
 * Reject non-loopback calls and cross-site browser calls before reading private
 * account data. The custom header also prevents a cross-site form/fetch from
 * reaching the bridge; local port forwarding may legitimately change the port.
 * @param req - Node request.
 * @returns true when the call may touch the Platform account bridge.
 */
function isAdmitted(req) {
  if (!isLoopback(req.socket?.remoteAddress)) return false;
  if (req.headers['x-dsh-usage-client'] !== '1') return false;
  if (typeof req.headers.host !== 'string' || req.headers.host === '') return false;
  let host;
  try {
    host = new URL(`http://${req.headers.host}`);
  } catch (_error) {
    return false;
  }
  if (!isLocalHost(host.hostname)) return false;
  const requestOrigin = req.headers.origin;
  if (requestOrigin !== undefined) {
    let caller;
    try {
      caller = new URL(requestOrigin);
    } catch (_error) {
      return false;
    }
    if (!isLocalHost(caller.hostname)) return false;
  }
  const site = req.headers['sec-fetch-site'];
  if (site !== undefined && site !== 'same-origin' && site !== 'same-site' && site !== 'none') return false;
  return true;
}

/**
 * Build Platform request headers without ever returning them.
 * @param session - Host-only Platform session.
 * @param mode - `both`, `dsh`, or `bearer` authentication.
 * @param tzSec - local UTC offset in seconds.
 * @returns the header record.
 */
function platformHeaders(session, mode, tzSec) {
  const origin = String(session.origin).replace(/\/+$/, '');
  const headers = {
    ...(session.requestHeaders ?? {}),
    accept: 'application/json, text/plain, */*',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'x-client-platform': 'web',
    'x-client-bundle-id': '',
    'x-client-version': process.env.DSH_CLIENT_VERSION || '0.2.2-rc.1',
    'x-client-locale': 'zh_CN',
    'x-client-timezone-offset': String(tzSec),
    origin,
    referer: `${origin}/usage`,
    'user-agent': PLATFORM_USER_AGENT
  };
  if (mode !== 'dsh') headers.authorization = `Bearer ${session.token}`;
  if (mode !== 'bearer') headers['x-dsh-auth-token'] = session.token;
  return headers;
}

/**
 * Perform one authenticated Platform read.
 * @param session - Host-only Platform session.
 * @param path - Platform API path.
 * @param query - URLSearchParams.
 * @param mode - authentication header mode.
 * @param tzSec - local UTC offset in seconds.
 * @returns parsed JSON payload.
 * @throws BillingError for HTTP, protocol, or malformed JSON failures.
 */
async function platformGet(session, path, query, mode, tzSec) {
  let url;
  try {
    url = new URL(path, String(session.origin).replace(/\/+$/, ''));
    url.search = query.toString();
  } catch (_error) {
    throw new BillingError('platform-invalid');
  }
  let response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: platformHeaders(session, mode, tzSec),
      redirect: 'error',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
  } catch (_error) {
    throw new BillingError('platform-unavailable');
  }
  if (response.status === 401 || response.status === 403) {
    throw new BillingError('unauthorized', response.status);
  }
  if (!response.ok) {
    throw new BillingError('platform-error', response.status);
  }
  let payload;
  try {
    payload = JSON.parse(await response.text());
  } catch (_error) {
    throw new BillingError('platform-invalid', response.status);
  }
  if (payload === null || typeof payload !== 'object') {
    throw new BillingError('platform-invalid', response.status);
  }
  const topCode = payload.code;
  if (typeof topCode === 'number' && topCode !== 0) {
    throw new BillingError(topCode === 40002 || topCode === 40003 ? 'unauthorized' : 'platform-error', response.status);
  }
  const bizCode = payload.data?.biz_code;
  if (typeof bizCode === 'number' && bizCode !== 0) {
    throw new BillingError(bizCode === 40002 || bizCode === 40003 ? 'unauthorized' : 'platform-error', response.status);
  }
  return payload;
}

/**
 * Fetch and merge Platform amount and cost data for one window.
 * The DSH grant is tried with both accepted header forms before falling back.
 * @param session - Host-only Platform session.
 * @param startSec - inclusive epoch seconds.
 * @param endSec - exclusive epoch seconds.
 * @param tzSec - local UTC offset in seconds.
 * @returns merged daily/hourly rows and totals.
 */
async function fetchBilling(session, startSec, endSec, tzSec) {
  const query = new URLSearchParams({
    start: String(startSec),
    end: String(endSec),
    tz: String(tzSec)
  });
  const modes = ['both', 'dsh', 'bearer'];
  let lastError;
  for (const mode of modes) {
    try {
      const [amount, cost] = await Promise.all([
        platformGet(session, '/api/v0/usage/by_api_key/amount', query, mode, tzSec),
        platformGet(session, '/api/v0/usage/by_api_key/cost', query, mode, tzSec)
      ]);
      return normalize(amount, cost, tzSec, startSec, endSec);
    } catch (error) {
      lastError = error;
      if (!(error instanceof BillingError)) throw error;
      if (error.code !== 'unauthorized' && error.code !== 'platform-error') throw error;
    }
  }
  throw lastError ?? new BillingError('platform-error');
}

/**
 * Read a finite non-negative number from a Platform payload.
 * @param value - number or numeric string.
 * @returns safe numeric value.
 */
function num(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }
  return 0;
}

/**
 * Render one Platform bucket timestamp in the browser's chosen offset.
 * @param value - epoch seconds or an already formatted label.
 * @param tzSec - local UTC offset in seconds.
 * @param bucket - Platform bucket label.
 * @returns `YYYY-MM-DD` or `YYYY-MM-DD HH:00`.
 */
function bucketLabel(value, tzSec, bucket) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return String(value ?? '');
  const date = new Date((value + tzSec) * 1000);
  const pad = (part) => String(part).padStart(2, '0');
  const day = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  if (String(bucket) === '3600' || bucket === '1h' || bucket === 'hour' || bucket === 'hourly') {
    return `${day} ${pad(date.getUTCHours())}:00`;
  }
  return day;
}

/**
 * Merge the amount and cost series into one row set.
 * @param amountPayload - amount response.
 * @param costPayload - cost response.
 * @param tzSec - local UTC offset in seconds.
 * @param startSec - window start.
 * @param endSec - window end.
 * @returns merged rows, totals, currency, and bucket.
 */
function normalize(amountPayload, costPayload, tzSec, startSec, endSec) {
  const amountRoot = amountPayload?.data?.biz_data ?? amountPayload?.data ?? {};
  const bucket = String(amountRoot?.bucket ?? '1d');
  const rows = new Map();
  const ensure = (label) => {
    let row = rows.get(label);
    if (row === undefined) {
      row = {
        time: label,
        promptCacheHit: 0,
        promptCacheMiss: 0,
        completion: 0,
        requests: 0,
        cost: 0
      };
      rows.set(label, row);
    }
    return row;
  };

  const amountSeries = Array.isArray(amountRoot?.series) ? amountRoot.series : [];
  for (const series of amountSeries) {
    const buckets = Array.isArray(series?.buckets) ? series.buckets : [];
    for (const bucketData of buckets) {
      const label = bucketLabel(bucketData?.time, tzSec, bucket);
      if (label === '') continue;
      const row = ensure(label);
      const usage = bucketData?.usage ?? {};
      row.promptCacheHit += num(usage.PROMPT_CACHE_HIT_TOKEN);
      row.promptCacheMiss += num(usage.PROMPT_CACHE_MISS_TOKEN);
      row.completion += num(usage.RESPONSE_TOKEN ?? usage.COMPLETION_TOKEN ?? usage.response_token ?? usage.completion_tokens);
      row.requests += num(usage.REQUEST ?? usage.request ?? usage.api_requests ?? usage.requests);
    }
  }

  const costRoot = costPayload?.data?.biz_data ?? costPayload?.data ?? {};
  const costGroups = Array.isArray(costRoot?.data) ? costRoot.data : [];
  let currency = '';
  for (const group of costGroups) {
    if (currency === '' && typeof group?.currency === 'string') currency = group.currency;
    const seriesList = Array.isArray(group?.series) ? group.series : [];
    for (const series of seriesList) {
      const buckets = Array.isArray(series?.buckets) ? series.buckets : [];
      for (const bucketData of buckets) {
        const label = bucketLabel(bucketData?.time, tzSec, bucket);
        if (label === '') continue;
        ensure(label).cost += num(bucketData?.cost);
      }
    }
  }

  const items = [...rows.values()].sort((left, right) => left.time.localeCompare(right.time));
  const totals = {
    promptCacheHit: 0,
    promptCacheMiss: 0,
    completion: 0,
    requests: 0,
    cost: 0
  };
  for (const item of items) {
    totals.promptCacheHit += item.promptCacheHit;
    totals.promptCacheMiss += item.promptCacheMiss;
    totals.completion += item.completion;
    totals.requests += item.requests;
    totals.cost += item.cost;
  }
  return {
    bucket,
    currency,
    items,
    totals,
    start: startSec,
    end: endSec
  };
}

/**
 * Parse one inclusive calendar date from the browser date input.
 * @param value - `YYYY-MM-DD`.
 * @returns the canonical date and its UTC-midnight epoch, or undefined.
 */
function parseDateValue(value) {
  if (typeof value !== 'string') return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match === null) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = Date.UTC(year, month - 1, day);
  const date = new Date(utc);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return undefined;
  }
  return { utc, value };
}

/**
 * Build the Platform usage page URL without exposing account credentials.
 * @param ctx - Host context.
 * @returns a browser URL.
 */
async function usageUrl(ctx) {
  const account = ctx.get('deepseekAccount');
  if (account === undefined) return 'https://platform.deepseek.com/usage';
  try {
    const state = await account.getState();
    if (typeof state?.links?.usageUrl === 'string' && state.links.usageUrl !== '') {
      return state.links.usageUrl;
    }
  } catch (_error) {
    // Fall through to the public Platform URL.
  }
  return 'https://platform.deepseek.com/usage';
}

/**
 * Read a finite non-negative number, allowing zero, and distinguishing
 * "absent" from "zero".
 * @param value - number or numeric string.
 * @returns the value, or undefined when it is not a usable amount.
 */
function amountOrUndefined(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : undefined;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  }
  return undefined;
}

/** Where the operator's balance configuration is remembered. */
const BALANCE_CONFIG_FILE = fileURLToPath(new URL('./balance-config.json', import.meta.url));

/** DeepSeek's documented balance endpoint, usable with a plain API key. */
const OFFICIAL_BALANCE_URL = 'https://api.deepseek.com/user/balance';

/** Where DSH keeps provider credentials. */
const CREDENTIAL_FILE = join(homedir(), '.dsh', '.credentials.yaml');

/** Key names that plausibly carry a remaining amount. */
const AMOUNT_KEYS = /^(balance|total_balance|totalBalance|remaining|remain|amount|available|credit|quota|balance_amount)$/i;

/** Default configuration: the documented endpoint and its documented path. */
const BALANCE_DEFAULT_CONFIG = {
  mode: 'official',
  url: OFFICIAL_BALANCE_URL,
  field: 'balance_infos.0.total_balance',
  currency: 'CNY',
  apiKey: ''
};

/** In-memory cache of a successful custom probe, keyed by origin. */
const balanceProbeCache = new Map();

/**
 * Normalize one user-supplied configuration object.
 * @param value - candidate from disk or a request body.
 * @returns a complete configuration record.
 */
function normalizeBalanceConfig(value) {
  const source = value !== null && typeof value === 'object' ? value : {};
  const url = typeof source.url === 'string' && source.url.trim() !== ''
    ? source.url.trim()
    : BALANCE_DEFAULT_CONFIG.url;
  return {
    mode: source.mode === 'custom' ? 'custom' : 'official',
    url,
    field: typeof source.field === 'string' && source.field.trim() !== ''
      ? source.field.trim()
      : BALANCE_DEFAULT_CONFIG.field,
    currency: typeof source.currency === 'string' && source.currency !== ''
      ? source.currency.toUpperCase()
      : BALANCE_DEFAULT_CONFIG.currency,
    apiKey: typeof source.apiKey === 'string' ? source.apiKey.trim() : ''
  };
}

/**
 * Load the persisted configuration, falling back to the default.
 * @returns the configuration record.
 */
function loadBalanceConfig() {
  try {
    const raw = readFileSync(BALANCE_CONFIG_FILE, 'utf8');
    return normalizeBalanceConfig(JSON.parse(raw));
  } catch (_error) {
    return { ...BALANCE_DEFAULT_CONFIG };
  }
}

/**
 * Persist one configuration record.
 * @param config - normalized configuration.
 */
function saveBalanceConfig(config) {
  try {
    writeFileSync(BALANCE_CONFIG_FILE, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  } catch (_error) {
    // A read-only package directory only costs persistence across restarts.
  }
}

/**
 * Read the DeepSeek API key DSH already stored for this profile.
 * @returns the key, or an empty string when none is present.
 */
function loadStoredApiKey() {
  try {
    const text = readFileSync(CREDENTIAL_FILE, 'utf8');
    const named = /^\s*DEEPSEEK_API_KEY\s*:\s*(\S+)\s*$/m.exec(text);
    if (named !== null) {
      const value = named[1].replace(/^["']|["']$/g, '');
      if (value !== '') return value;
    }
    const scanned = /sk-[A-Za-z0-9_-]{16,}/.exec(text);
    return scanned === null ? '' : scanned[0];
  } catch (_error) {
    return '';
  }
}

/**
 * Walk one dotted field path such as `data.balance_infos.0.total_balance`.
 * @param root - parsed JSON.
 * @param path - dotted path.
 * @returns the value, or undefined when the path does not resolve.
 */
function readField(root, path) {
  if (path === '') return undefined;
  let node = root;
  for (const part of path.split('.')) {
    if (node === null || typeof node !== 'object') return undefined;
    node = Array.isArray(node) ? node[Number.parseInt(part, 10)] : node[part];
  }
  return node;
}

/**
 * Find every plausible balance amount inside an unknown payload.
 * @param root - parsed JSON.
 * @param currency - preferred currency code.
 * @returns candidate amounts with their paths, best first.
 */
function discoverAmounts(root, currency) {
  const found = [];
  const visit = (node, path, depth) => {
    if (depth > 6 || node === null || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach((item, index) => visit(item, `${path}${path === '' ? '' : '.'}${index}`, depth + 1));
      return;
    }
    const nodeCurrency = typeof node.currency === 'string' ? node.currency.toUpperCase() : '';
    for (const [key, value] of Object.entries(node)) {
      const childPath = `${path}${path === '' ? '' : '.'}${key}`;
      const amount = amountOrUndefined(value);
      if (amount !== undefined && AMOUNT_KEYS.test(key)) {
        const matchesCurrency = nodeCurrency === '' || nodeCurrency === currency;
        found.push({
          path: childPath,
          value: amount,
          currency: nodeCurrency === '' ? currency : nodeCurrency,
          rank: (matchesCurrency ? 0 : 2) + (key.toLowerCase() === 'total_balance' ? 0 : 1)
        });
      }
      visit(value, childPath, depth + 1);
    }
  };
  visit(root, '', 0);
  found.sort((left, right) => left.rank - right.rank);
  return found;
}

/**
 * GET one URL and return its parsed JSON.
 * @param url - absolute URL.
 * @param headers - request headers.
 * @returns parsed payload.
 * @throws BillingError on a transport or status failure.
 */
async function getJson(url, headers) {
  let response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers,
      redirect: 'error',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
  } catch (_error) {
    throw new BillingError('balance-unreachable');
  }
  if (response.status === 401 || response.status === 403) {
    throw new BillingError('balance-unauthorized', response.status);
  }
  if (!response.ok) {
    throw new BillingError('balance-http', response.status);
  }
  try {
    return await response.json();
  } catch (_error) {
    throw new BillingError('balance-not-json');
  }
}

/**
 * Read the balance from the documented endpoint.
 * @param apiKey - DeepSeek API key.
 * @param config - normalized configuration.
 * @returns the balance record.
 */
async function fetchOfficialBalance(apiKey, config) {
  const payload = await getJson(config.url, {
    authorization: `Bearer ${apiKey}`,
    accept: 'application/json'
  });
  return extractBalance(payload, config);
}

/**
 * Pull the remaining amount out of a balance payload.
 *
 * Honours the configured field path first, then falls back to discovery so a
 * payload shape change does not silently blank the figure.
 * @param payload - parsed JSON.
 * @param config - normalized configuration.
 * @returns the balance record.
 */
function extractBalance(payload, config) {
  const direct = amountOrUndefined(readField(payload, config.field));
  if (direct !== undefined) {
    const node = readField(payload, config.field.split('.').slice(0, -1).join('.'));
    const currency = typeof node?.currency === 'string' && node.currency !== ''
      ? node.currency.toUpperCase()
      : config.currency;
    return {
      total: direct,
      currency,
      isAvailable: payload?.is_available === undefined ? undefined : payload.is_available === true
    };
  }
  const discovered = discoverAmounts(payload, config.currency);
  if (discovered.length === 0) throw new BillingError('balance-unreadable');
  return {
    total: discovered[0].value,
    currency: discovered[0].currency,
    isAvailable: payload?.is_available === undefined ? undefined : payload.is_available === true
  };
}

/**
 * Read the remaining balance using the saved configuration.
 * @param session - Host-only Platform session, used only for custom endpoints
 *   that authenticate with the browser session rather than an API key.
 * @param tzSec - local UTC offset in seconds.
 * @returns the balance record and the configuration that produced it.
 */
async function readBalance(session, tzSec) {
  const config = loadBalanceConfig();
  const apiKey = config.apiKey !== '' ? config.apiKey : loadStoredApiKey();

  if (config.mode === 'custom') {
    if (apiKey !== '' && /^https?:\/\//i.test(config.url)) {
      const payload = await getJson(config.url, {
        authorization: `Bearer ${apiKey}`,
        accept: 'application/json'
      });
      return { ...extractBalance(payload, config), config };
    }
    if (session === null) throw new BillingError('not-signed-in');
    const payload = await platformGet(session, config.url, new URLSearchParams(), 'both', tzSec);
    return { ...extractBalance(payload, config), config };
  }

  if (apiKey === '') throw new BillingError('balance-no-key');
  return { ...(await fetchOfficialBalance(apiKey, config)), config };
}

/**
 * Report what the balance read currently sees, without guessing.
 * @returns diagnostics for the panel.
 */
async function describeBalance() {
  const config = loadBalanceConfig();
  const storedKey = loadStoredApiKey();
  const apiKey = config.apiKey !== '' ? config.apiKey : storedKey;
  const diagnostics = {
    config,
    hasStoredKey: storedKey !== '',
    usingCustomKey: config.apiKey !== '',
    url: config.url
  };
  if (apiKey === '') {
    return { ...diagnostics, ok: false, error: 'balance-no-key' };
  }
  try {
    const payload = await getJson(config.url, {
      authorization: `Bearer ${apiKey}`,
      accept: 'application/json'
    });
    const amounts = discoverAmounts(payload, config.currency);
    return {
      ...diagnostics,
      ok: true,
      balance: extractBalance(payload, config),
      discovered: amounts.slice(0, 4),
      sample: JSON.stringify(payload).slice(0, 400)
    };
  } catch (error) {
    return {
      ...diagnostics,
      ok: false,
      error: error instanceof BillingError ? error.code : 'balance-failed'
    };
  }
}

/**
 * Fingerprint the configured model catalog so a change can be detected.
 *
 * The balance endpoint is private, so the set of configured providers and
 * models is the signal that the operator changed something worth re-probing.
 * @param llm - the Host `llm` service, when present.
 * @returns a stable string, or an empty string when unreadable.
 */
async function modelFingerprint(llm) {
  try {
    const providers = llm.listProviders();
    const parts = [providers.map((provider) => String(provider?.id ?? '')).join(',')];
    for (const provider of providers) {
      try {
        const models = await llm.listModels(provider.id);
        parts.push(`${provider.id}:${models.map((model) => String(model?.id ?? '')).join(',')}`);
      } catch (_error) {
        parts.push(`${provider.id}:?`);
      }
    }
    return parts.join('|');
  } catch (_error) {
    return '';
  }
}

/**
 * Drop the learned balance configuration so the next read probes again.
 */
function invalidateBalanceProbe() {
  balanceProbeCache.clear();
}

/**
 * Handle one billing action after the route admitted the caller.
 * @param ctx - Host context.
 * @param action - `status`, `usage`, or `balance`.
 * @param body - parsed request body.
 * @returns response payload.
 */
async function handleBilling(ctx, action, body) {
  const url = await usageUrl(ctx);
  const account = ctx.get('deepseekAccount');
  if (action === 'status') {
    let session = null;
    try {
      session = account === undefined ? null : await account.getPlatformSession();
    } catch (_error) {
      session = null;
    }
    return {
      ok: true,
      signedIn: session !== null,
      usageUrl: url
    };
  }
  if (action === 'balance') {
    let session = null;
    try {
      session = account === undefined ? null : await account.getPlatformSession();
    } catch (_error) {
      session = null;
    }
    const tzValue = Number(body.tz);
    const tzSec = Number.isInteger(tzValue) && tzValue >= -14 * 60 * 60 && tzValue <= 14 * 60 * 60
      ? tzValue
      : -new Date().getTimezoneOffset() * 60;
    try {
      const balance = await readBalance(session, tzSec);
      return {
        ok: true,
        data: balance,
        usageUrl: url
      };
    } catch (error) {
      return {
        ok: false,
        code: error instanceof BillingError ? error.code : 'balance-failed',
        data: { config: loadBalanceConfig() },
        usageUrl: url
      };
    }
  }
  if (action === 'balanceDiagnose') {
    return {
      ok: true,
      data: await describeBalance(),
      usageUrl: url
    };
  }
  if (action === 'balanceConfig') {
    return {
      ok: true,
      data: { config: loadBalanceConfig() },
      usageUrl: url
    };
  }
  if (action === 'balanceSave') {
    const next = normalizeBalanceConfig(body.config);
    saveBalanceConfig(next);
    balanceProbeCache.clear();
    return {
      ok: true,
      data: { config: next },
      usageUrl: url
    };
  }
  if (action !== 'usage') {
    throw new BillingError('bad-request', 400);
  }
  const startDate = parseDateValue(body.start);
  const endDate = parseDateValue(body.end);
  if (startDate === undefined || endDate === undefined || endDate.utc < startDate.utc) {
    throw new BillingError('bad-request', 400);
  }
  const days = Math.floor((endDate.utc - startDate.utc) / 86400000) + 1;
  if (days < 1 || days > MAX_RANGE_DAYS) {
    throw new BillingError('range-too-long', 400);
  }
  const tzValue = Number(body.tz);
  const tzSec = Number.isInteger(tzValue) && tzValue >= -14 * 60 * 60 && tzValue <= 14 * 60 * 60
    ? tzValue
    : -new Date().getTimezoneOffset() * 60;
  const startSec = Math.floor(startDate.utc / 1000 - tzSec);
  const endSec = Math.floor(endDate.utc / 1000 - tzSec + 86400);

  let session;
  try {
    session = account === undefined ? null : await account.getPlatformSession();
  } catch (_error) {
    session = null;
  }
  if (session === null) {
    return {
      ok: false,
      code: 'not-signed-in',
      usageUrl: url
    };
  }

  const data = await fetchBilling(session, startSec, endSec, tzSec);
  return {
    ok: true,
    data: {
      ...data,
      start: startDate.value,
      end: endDate.value,
      days
    },
    usageUrl: url
  };
}

/**
 * Register the same-origin billing route for this bundle.
 * @param ctx - Host context.
 */
export function apply(ctx) {
  ctx.effect(() => {
    const llm = ctx.get('llm');
    if (llm === undefined || typeof llm.listProviders !== 'function') return undefined;
    let last = '';
    let alive = true;
    const tick = async () => {
      const fingerprint = await modelFingerprint(llm);
      if (!alive) return;
      if (fingerprint === '') return;
      if (last !== '' && fingerprint !== last) {
        // A provider or model was added, changed, or removed: the account
        // surface may have moved with it, so probe again on next read.
        invalidateBalanceProbe();
      }
      last = fingerprint;
    };
    tick();
    const timer = setInterval(tick, 30000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, 'dsh-token-usage: model catalog watch');
  ctx.effect(
    () => ctx.webServer.register({
      kind: 'exact',
      path: API_ROUTE,
      handler: async (req, res) => {
        try {
          if (!isAdmitted(req)) {
            return json(res, 403, { ok: false, code: 'forbidden' });
          }
          if (req.method !== 'POST') {
            return json(res, 405, { ok: false, code: 'method-not-allowed' });
          }
          const body = await readBody(req);
          const action = typeof body.action === 'string' ? body.action : '';
          return json(res, 200, await handleBilling(ctx, action, body));
        } catch (error) {
          const status = error instanceof BillingError && error.status !== undefined ? error.status : 500;
          const code = error instanceof BillingError ? error.code : 'internal';
          if (!(error instanceof BillingError) || code === 'internal') {
            console.error('[dsh-token-usage] billing request failed:', code, status);
          }
          return json(res, 200, { ok: false, code });
        }
      }
    }),
    'dsh-token-usage: billing route'
  );
}
