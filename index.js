/**
 * Host half of the Token usage bundle.
 *
 * Local token counts come from the Client's `tokenUsage` session projection.
 * This half adds the account-wide DeepSeek Platform usage/cost bridge so the
 * page can show real billed spend without exposing the account credential to
 * the browser. The route returns aggregates only; it never returns the token.
 */
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

/**
 * Extract the account balance from one Platform payload.
 *
 * The private endpoint is undocumented and has appeared in more than one
 * shape, so every known spelling is tried before giving up.
 * @param payload - parsed Platform JSON.
 * @returns the balance record, or undefined when nothing usable was present.
 */
function parseBalance(payload) {
  const root = payload?.data?.biz_data ?? payload?.data ?? {};
  const infos = root?.balance_infos ?? root?.balanceInfos ?? root?.balances;
  if (Array.isArray(infos) && infos.length > 0) {
    const cny = infos.find((info) => String(info?.currency ?? '').toUpperCase() === 'CNY');
    const info = cny ?? infos[0];
    const total = amountOrUndefined(
      info?.total_balance ?? info?.totalBalance ?? info?.balance ?? info?.amount
    );
    if (total !== undefined) {
      return {
        currency: String(info?.currency ?? ''),
        total,
        granted: amountOrUndefined(info?.granted_balance ?? info?.grantedBalance) ?? 0,
        toppedUp: amountOrUndefined(info?.topped_up_balance ?? info?.toppedUpBalance) ?? 0
      };
    }
  }
  const direct = amountOrUndefined(
    root?.balance ?? root?.total_balance ?? root?.totalBalance ?? root?.remaining ?? root?.remain
  );
  if (direct !== undefined) {
    return {
      currency: String(root?.currency ?? ''),
      total: direct,
      granted: 0,
      toppedUp: 0
    };
  }
  return undefined;
}

/**
 * Ask the Platform for the signed-in account's remaining balance.
 *
 * Several path and header spellings are attempted because the endpoint is
 * private and has moved before; the first usable answer wins.
 * @param session - Host-only Platform session.
 * @param tzSec - local UTC offset in seconds.
 * @returns the balance record.
 * @throws BillingError when no candidate answers.
 */
async function fetchBalance(session, tzSec) {
  const paths = ['/api/v0/users/balance', '/api/v0/user/balance', '/api/v0/user/info'];
  const modes = ['both', 'dsh', 'bearer'];
  let lastError;
  for (const mode of modes) {
    for (const path of paths) {
      try {
        const payload = await platformGet(session, path, new URLSearchParams(), mode, tzSec);
        const parsed = parseBalance(payload);
        if (parsed !== undefined) return parsed;
      } catch (error) {
        lastError = error;
        if (!(error instanceof BillingError)) throw error;
      }
    }
  }
  throw lastError ?? new BillingError('balance-unavailable');
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
    if (session === null) {
      return {
        ok: false,
        code: 'not-signed-in',
        usageUrl: url
      };
    }
    const tzValue = Number(body.tz);
    const tzSec = Number.isInteger(tzValue) && tzValue >= -14 * 60 * 60 && tzValue <= 14 * 60 * 60
      ? tzValue
      : -new Date().getTimezoneOffset() * 60;
    return {
      ok: true,
      data: await fetchBalance(session, tzSec),
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
