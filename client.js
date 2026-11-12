window.__ModuleLoader__.load({
  id: '@local/dsh-token-usage',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /** Dictionary namespace owned by this plugin. */
    const NS = 'tokenUsage';
    /** The id shared by the sidebar entry and the main panel it opens. */
    const PANEL_ID = 'token-usage';
    /** Host bridge for account-wide billed spend. */
    const BILLING_ROUTE = '/dsh-token-usage/api';
    /** The panel lists the sessions with the largest totals; the summary still covers every session. */
    const SESSION_LIMIT = 100;
    /** Bound the one-time projection backfill when old sessions lack a cached tokenUsage cell. */
    const HYDRATE_LIMIT = 80;
    /** Sessions refreshed per wave; a later list update starts the next wave. */
    const HYDRATE_WAVE = 30;
    /** Bars rendered before the remaining groups are folded into one row. */
    const CHART_GROUP_LIMIT = 8;
    /** Selectable date windows. */
    const RANGE_DEFS = [
      { id: 'today' },
      { id: '7d' },
      { id: '30d' },
      { id: 'custom' }
    ];
    /** Inclusive custom-range limit; the Platform by-key endpoint accepts at most 30 days. */
    const MAX_RANGE_DAYS = 30;
    /** Browser-local display preference; it never reaches the Host or a model request. */
    const UNIT_KEY = 'dsh-token-usage.unit';
    const UNIT_IDS = new Set(['exact', 'metric', 'wan']);

    const en = {
      'meta.title': 'Token usage',
      'panel.label': 'Token usage',
      'page.eyebrow': 'Usage',
      'page.title': 'Token usage',
      'page.subtitle': 'Provider-reported tokens across every session in this profile.',
      'live': 'Live',
      'hero.total': 'Total tokens',
      'hero.meta': 'Sessions in view: {sessions}',
      'hero.empty': 'No usage recorded yet',
      'hero.cacheHit': 'Cache hit rate',
      'hero.cacheHint': 'Cache read ÷ (uncached + cache read)',
      'range.label': 'Date filter',
      'range.today': 'Today',
      'range.7d': '7 days',
      'range.30d': '30 days',
      'range.custom': 'Custom',
      'range.startDate': 'Start',
      'range.endDate': 'End',
      'range.maxDays': 'Up to 30 days',
      'range.note': 'Filters sessions by last activity within the selected dates; token counts are session totals. Defaults to today.',
      'chart.title': 'Usage distribution',
      'chart.subtitle': 'Local session totals · {mode}.',
      'chart.empty': 'No usage in this view',
      'chart.groupBy': 'Group by',
      'chart.session': 'By session',
      'chart.workspace': 'By workspace',
      'chart.other': 'Other',
      'chart.note': 'Top 8 groups; smaller groups are combined into Other.',
      'workspace.none': 'Ungrouped',
      'whale.remaining': 'Left',
      'whale.todayCost': 'Spent today',
      'whale.todayTokens': 'Tokens today',
      'balance.title': 'Balance API',
      'balance.subtitle': 'Remaining balance defaults to DeepSeek\'s documented endpoint, using the key DSH already stores. Override anything below if your account is fronted differently.',
      'balance.mode': 'Source',
      'balance.mode.official': 'official endpoint',
      'balance.mode.custom': 'custom endpoint',
      'balance.url': 'Endpoint URL',
      'balance.field': 'Balance field path',
      'balance.currency': 'Currency',
      'balance.apiKey': 'API key (blank = use the stored one)',
      'balance.placeholder.url': 'https://api.deepseek.com/user/balance',
      'balance.placeholder.field': 'balance_infos.0.total_balance',
      'balance.placeholder.currency': 'CNY',
      'balance.placeholder.apiKey': 'sk-...',
      'balance.diagnose': 'Check now',
      'balance.diagnosing': 'Checking…',
      'balance.diagnoseOk': 'Read {value} from {url}',
      'balance.diagnoseFail': 'Failed: {code}',
      'balance.save': 'Save',
      'balance.saving': 'Saving…',
      'balance.saved': 'Saved',
      'balance.saveFailed': 'Save failed',
      'balance.loading': 'Loading configuration…',
      'balance.current': 'Reading {url} → {field}',
      'balance.currentEmpty': 'No endpoint configured yet',
      'balance.hostTooOld': 'The Host half is still the previous build — restart DSH to activate the new endpoints.',
      'balance.hostUnreachable': 'Could not reach the Host bridge.',
      'billing.title': 'Account-wide usage',
      'billing.subtitle': 'Account-wide token and billed usage, including calls outside this profile.',
      'billing.loading': 'Loading account spend…',
      'billing.notSignedIn': 'DeepSeek account not connected',
      'billing.notSignedInBody': 'Sign in to the DeepSeek account in Settings to show account-wide billed spend.',
      'billing.unauthorized': 'The DeepSeek account session has expired. Sign in again in Settings.',
      'billing.error': 'Account spend unavailable',
      'billing.errorBody': 'Check the DeepSeek account sign-in, then try again.',
      'billing.errorCode': 'Error code',
      'billing.retry': 'Retry',
      'billing.openUsage': 'Open platform usage',
      'billing.average': 'Average per bucket',
      'billing.peak': 'Peak bucket',
      'billing.averageHour': 'Average per hour',
      'billing.peakHour': 'Peak hour',
      'billing.hourly': 'Hourly',
      'billing.daily': 'Daily',
      'billing.requests': 'Requests',
      'billing.totalTokens': 'Total tokens',
      'billing.legendHit': 'Cache hit',
      'billing.legendMiss': 'Cache miss',
      'billing.legendOut': 'Output',
      'billing.legendRate': 'Hit rate',
      'billing.legendCost': 'Spend',
      'billing.legendAvg': 'Average line',
      'billing.tokenTitle': 'Token usage',
      'billing.moneyTitle': 'Billed spend',
      'billing.cumulative': 'Cumulative',
      'billing.share': 'Share of range',
      'billing.scalePeak': 'Peak',
      'billing.noUsage': 'No billed usage in this range.',
      'unit.label': 'Unit',
      'unit.exact': 'Exact',
      'unit.metric': 'K/M',
      'unit.wan': '万',
      'unit.exact.hint': 'Show exact token counts',
      'unit.metric.hint': 'Show token counts in K, M, and B',
      'unit.wan.hint': 'Show token counts in 万',
      'chart.aria': 'Token distribution',
      'stats.input': 'Uncached input',
      'stats.input.hint': 'Prompt tokens billed without cache',
      'stats.output': 'Output',
      'stats.output.hint': 'Generated completion tokens',
      'stats.cacheRead': 'Cache read',
      'stats.cacheRead.hint': 'Prompt tokens served from cache',
      'stats.cacheWrite': 'Cache write',
      'stats.cacheWrite.hint': 'Prompt tokens written to cache',
      'stats.cacheWrite.platformHint': 'The Platform does not report cache writes',
      'hero.accountMeta': 'Account-wide billed usage, including calls outside this profile',
      'list.title': 'Session breakdown',
      'list.count': 'Sessions in view: {n}',
      'list.session': 'Session',
      'list.input': 'Uncached',
      'list.output': 'Output',
      'list.cache': 'Cache',
      'list.total': 'Total',
      'list.lastActive': 'Last active',
      'list.current': 'Current',
      'list.subagent': 'Subagent',
      'list.untitled': 'Untitled session',
      'list.limit': 'Showing the {n} sessions with the highest totals.',
      'search.placeholder': 'Search sessions',
      'search.aria': 'Search sessions',
      'refresh': 'Refresh',
      'loading': 'Loading sessions…',
      'hydrating': 'Loading older usage…',
      'empty.title': 'No token usage yet',
      'empty.body': 'Counts appear after a model finishes a request in a session.',
      'empty.noMatches': 'No matching sessions',
      'empty.noMatchesBody': 'Clear the search or try a different term.',
      'empty.filtered': 'No usage in this range',
      'empty.filteredBody': 'Try a wider activity range.',
      'note': 'Counts come from durable session logs: uncached input + output + cache read + cache write. Forked history may be counted again.'
    };

    const zh = {
      'meta.title': 'Token 用量',
      'panel.label': 'Token 用量',
      'page.eyebrow': '用量',
      'page.title': 'Token 用量',
      'page.subtitle': '查看此配置中所有会话由模型提供商返回的 Token 用量。',
      'live': '实时',
      'hero.total': '总 Token',
      'hero.meta': '当前会话：{sessions} 个',
      'hero.empty': '尚未记录用量',
      'hero.cacheHit': '缓存命中率',
      'hero.cacheHint': '缓存读取 ÷（未缓存 + 缓存读取）',
      'range.label': '日期筛选',
      'range.today': '今天',
      'range.7d': '7 天',
      'range.30d': '30 天',
      'range.custom': '指定日期',
      'range.startDate': '开始',
      'range.endDate': '结束',
      'range.maxDays': '最多 30 天',
      'range.note': '按所选日期筛选会话最近活动时间；Token 为会话累计值。默认今天。',
      'chart.title': '用量分布',
      'chart.subtitle': '本地会话累计 · {mode}。',
      'chart.empty': '当前视图暂无用量',
      'chart.groupBy': '分组方式',
      'chart.session': '按会话',
      'chart.workspace': '按工作区',
      'chart.other': '其他',
      'chart.note': '显示前 8 组，其余合并为“其他”。',
      'workspace.none': '未分组',
      'whale.remaining': '剩余',
      'whale.todayCost': '今日花费',
      'whale.todayTokens': '今日消耗',
      'balance.title': '余额接口',
      'balance.subtitle': '剩余金额默认走 DeepSeek 官方接口，使用 DSH 已保存的 API Key。如果你的账号走别的网关，可以改下面的地址和字段。',
      'balance.mode': '来源',
      'balance.mode.official': '官方接口',
      'balance.mode.custom': '自定义接口',
      'balance.url': '接口地址',
      'balance.field': '余额字段路径',
      'balance.currency': '币种',
      'balance.apiKey': 'API Key（留空则用已保存的）',
      'balance.placeholder.url': 'https://api.deepseek.com/user/balance',
      'balance.placeholder.field': 'balance_infos.0.total_balance',
      'balance.placeholder.currency': 'CNY',
      'balance.placeholder.apiKey': 'sk-...',
      'balance.diagnose': '立即检查',
      'balance.diagnosing': '检查中…',
      'balance.diagnoseOk': '从 {url} 读到 {value}',
      'balance.diagnoseFail': '失败：{code}',
      'balance.save': '保存',
      'balance.saving': '保存中…',
      'balance.saved': '已保存',
      'balance.saveFailed': '保存失败',
      'balance.loading': '正在读取配置…',
      'balance.current': '当前读取 {url} → {field}',
      'balance.currentEmpty': '尚未配置接口',
      'balance.hostTooOld': 'Host 侧还是旧版本，需要重启 DSH 才能启用新接口。',
      'balance.hostUnreachable': '连不上 Host 桥接接口。',
      'billing.title': '平台账户用量',
      'billing.subtitle': '账户全量的 Token 与计费用量，包含 DSH 之外的调用。',
      'billing.loading': '正在读取账户费用…',
      'billing.notSignedIn': '未连接 DeepSeek 账户',
      'billing.notSignedInBody': '请在设置中登录 DeepSeek 账户，以显示账户全量费用。',
      'billing.unauthorized': 'DeepSeek 账户会话已过期，请在设置中重新登录。',
      'billing.error': '账户费用暂不可用',
      'billing.errorBody': '请检查 DeepSeek 账户登录状态后重试。',
      'billing.errorCode': '错误代码',
      'billing.retry': '重试',
      'billing.openUsage': '打开平台用量页',
      'billing.average': '平均每时段',
      'billing.peak': '峰值时段',
      'billing.averageHour': '平均每小时',
      'billing.peakHour': '峰值小时',
      'billing.hourly': '按小时',
      'billing.daily': '按日',
      'billing.requests': '请求数',
      'billing.totalTokens': '总用量',
      'billing.legendHit': '缓存命中',
      'billing.legendMiss': '未命中',
      'billing.legendOut': '输出',
      'billing.legendRate': '命中率',
      'billing.legendCost': '消耗金额',
      'billing.legendAvg': '平均线',
      'billing.tokenTitle': 'Token 用量',
      'billing.moneyTitle': '消耗金额',
      'billing.cumulative': '累计',
      'billing.share': '占本范围',
      'billing.scalePeak': '峰值',
      'billing.noUsage': '该范围内暂无计费用量。',
      'unit.label': '单位',
      'unit.exact': '精确',
      'unit.metric': 'K/M',
      'unit.wan': '万',
      'unit.exact.hint': '显示精确的 Token 数量',
      'unit.metric.hint': '以 K、M、B 为单位显示',
      'unit.wan.hint': '以万为单位显示',
      'chart.aria': 'Token 构成',
      'stats.input': '未缓存输入',
      'stats.input.hint': '未命中缓存的提示词 Token',
      'stats.output': '输出',
      'stats.output.hint': '模型生成的补全 Token',
      'stats.cacheRead': '缓存读取',
      'stats.cacheRead.hint': '从缓存读取的提示词 Token',
      'stats.cacheWrite': '缓存写入',
      'stats.cacheWrite.hint': '写入缓存的提示词 Token',
      'stats.cacheWrite.platformHint': '平台不统计缓存写入',
      'hero.accountMeta': '账户全量计费用量，包含 DSH 之外的调用',
      'list.title': '会话明细',
      'list.count': '当前显示会话：{n}',
      'list.session': '会话',
      'list.input': '未缓存',
      'list.output': '输出',
      'list.cache': '缓存',
      'list.total': '合计',
      'list.lastActive': '最近活动',
      'list.current': '当前',
      'list.subagent': '子代理',
      'list.untitled': '未命名会话',
      'list.limit': '仅显示用量最高的 {n} 个会话。',
      'search.placeholder': '搜索会话',
      'search.aria': '搜索会话',
      'refresh': '刷新',
      'loading': '正在加载会话…',
      'hydrating': '正在补全历史用量…',
      'empty.title': '暂无 Token 用量',
      'empty.body': '会话完成模型请求后，这里会显示用量。',
      'empty.noMatches': '没有匹配的会话',
      'empty.noMatchesBody': '清除搜索或换个关键词。',
      'empty.filtered': '该范围内暂无用量',
      'empty.filteredBody': '试试更宽的活跃范围。',
      'note': '数据来自持久化的会话日志：未缓存输入 + 输出 + 缓存读取 + 缓存写入。Fork 继承的历史可能重复计入。'
    };

    /**
     * Render the bar-chart glyph at the size the sidebar asks for. The host
     * supplies the surrounding button, hit area, tooltip, and selected color.
     * @param props - requested edge length.
     * @returns the 20px-grid stroke icon.
     */
    function TokenUsageIcon({ size }) {
      return h('svg', {
        viewBox: '0 0 20 20',
        width: size,
        height: size,
        fill: 'none',
        'aria-hidden': 'true'
      },
        h('path', { d: 'M4 16v-4.5', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }),
        h('path', { d: 'M10 16V8', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }),
        h('path', { d: 'M16 16V4', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' })
      );
    }

    /** Appended to the host-owned panel title; the Host gives the icon slot no trailing seat. */
    const SIDEBAR_BADGE_CSS = `
      :root { --dsh-token-usage-sidebar-highlight: #15803d; }
      body[data-ds-dark-theme], html[data-ds-dark-theme] { --dsh-token-usage-sidebar-highlight: #4ade80; }
      button[aria-label="Token 用量"]:has(> span[class*="panelTitle"]) > span[class*="panelTitle"],
      button[aria-label="Token usage"]:has(> span[class*="panelTitle"]) > span[class*="panelTitle"] {
        white-space: nowrap;
      }
      button[aria-label="Token 用量"]:has(> span[class*="panelTitle"]) > span[class*="panelTitle"]::after,
      button[aria-label="Token usage"]:has(> span[class*="panelTitle"]) > span[class*="panelTitle"]::after {
        content: var(--dsh-token-usage-sidebar-today, "");
        margin-left: 6px;
        color: var(--dsh-token-usage-sidebar-highlight) !important;
        -webkit-text-fill-color: var(--dsh-token-usage-sidebar-highlight) !important;
        font-size: 12px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        letter-spacing: 0;
        line-height: 1.4;
        white-space: nowrap;
      }
    `;

    /** How long one account-usage response may be reused between the two halves. */
    const USAGE_TTL_MS = 45000;

    /**
     * One account-usage window shared by the sidebar badge and the panel.
     * Whichever half fetches first serves the other, and every committed
     * response republishes the sidebar figure, so the badge and the
     * "Tokens used" stat cannot drift apart.
     */
    const usageStore = { entries: new Map(), waiters: new Map(), listeners: new Set() };

    /**
     * Subscribe to committed account-usage responses.
     * @param listener - called after every successful fetch.
     * @returns the unsubscribe function.
     */
    function subscribeUsage(listener) {
      usageStore.listeners.add(listener);
      return () => usageStore.listeners.delete(listener);
    }

    /**
     * Build the cache key for one local calendar window.
     * @param start - `YYYY-MM-DD`.
     * @param end - `YYYY-MM-DD`.
     * @returns the key, including the browser's UTC offset.
     */
    function usageKey(start, end) {
      return `${start}|${end}|${-new Date().getTimezoneOffset() * 60}`;
    }

    /**
     * Publish today's account figure to the host-owned sidebar label. Both
     * halves reach this through fetchUsage, so a fetch from either one
     * refreshes the badge.
     * @param start - requested window start.
     * @param end - requested window end.
     * @param payload - the route response just committed.
     */
    function publishSidebarToday(start, end, payload) {
      const day = toDateInput(new Date());
      if (start !== day || end !== day) return;
      const root = document.documentElement;
      if (payload !== null && typeof payload === 'object' && payload.ok === true
        && payload.data?.totals !== undefined) {
        const totals = payload.data.totals;
        const tokens = nonNegative(totals.promptCacheHit)
          + nonNegative(totals.promptCacheMiss)
          + nonNegative(totals.completion);
        root.style.setProperty('--dsh-token-usage-sidebar-today', JSON.stringify(
          ` ${formatCompactTokens(tokens)} · ${formatCost2(nonNegative(totals.cost), typeof payload.data.currency === 'string' ? payload.data.currency : '')}`
        ));
        return;
      }
      if (payload !== null && typeof payload === 'object'
        && (payload.code === 'not-signed-in' || payload.code === 'unauthorized')) {
        root.style.removeProperty('--dsh-token-usage-sidebar-today');
      }
    }

    /**
     * Map one route response onto the panel's billing state.
     * @param payload - the route response.
     * @returns the state record the panel renders from.
     */
    function billingStateFrom(payload) {
      if (payload !== null && typeof payload === 'object' && payload.ok === true
        && payload.data !== null && typeof payload.data === 'object') {
        return {
          status: 'ready',
          data: payload.data,
          code: null,
          usageUrl: typeof payload.usageUrl === 'string' ? payload.usageUrl : null
        };
      }
      const code = payload !== null && typeof payload === 'object' && typeof payload.code === 'string'
        ? payload.code
        : 'internal';
      return {
        status: code === 'not-signed-in' ? 'signed-out' : 'error',
        data: null,
        code,
        usageUrl: payload !== null && typeof payload.usageUrl === 'string' ? payload.usageUrl : null
      };
    }

    /**
     * Fetch one account-usage window, deduplicating concurrent callers and
     * reusing a response younger than USAGE_TTL_MS.
     * @param start - `YYYY-MM-DD`.
     * @param end - `YYYY-MM-DD`.
     * @returns the route payload.
     */
    async function fetchUsage(start, end) {
      const key = usageKey(start, end);
      const cached = usageStore.entries.get(key);
      if (cached !== undefined && Date.now() - cached.at < USAGE_TTL_MS) {
        publishSidebarToday(start, end, cached.payload);
        return cached.payload;
      }
      const pending = usageStore.waiters.get(key);
      if (pending !== undefined) return pending;
      const request = (async () => {
        const response = await fetch(BILLING_ROUTE, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json', 'x-dsh-usage-client': '1' },
          body: JSON.stringify({
            action: 'usage',
            start,
            end,
            tz: -new Date().getTimezoneOffset() * 60
          })
        });
        let payload = null;
        try {
          payload = await response.json();
        } catch (_error) {
          payload = null;
        }
        usageStore.waiters.delete(key);
        if (payload === null || typeof payload !== 'object') throw new Error('usage-response');
        usageStore.entries.set(key, { at: Date.now(), payload });
        publishSidebarToday(start, end, payload);
        usageStore.listeners.forEach((listener) => {
          try {
            listener();
          } catch (_error) {
            // One failing listener must not stop the others.
          }
        });
        return payload;
      })().catch((error) => {
        usageStore.waiters.delete(key);
        throw error;
      });
      usageStore.waiters.set(key, request);
      return request;
    }

    /**
     * The sidebar glyph plus a compact, highlighted today summary appended to
     * the host-owned panel label. The row has no trailing slot, so a static
     * scoped stylesheet reads one root CSS variable that the shared usage
     * fetch publishes above.
     * @param props - requested glyph size.
     * @returns the host-compatible icon.
     */
    function SidebarUsageBadge({ size }) {
      React.useEffect(() => {
        let active = true;
        let retryTimer;
        let attempts = 0;
        const load = async () => {
          const day = toDateInput(new Date());
          try {
            await fetchUsage(day, day);
            attempts = 0;
          } catch (_error) {
            // Come back sooner than the minute-long interval so one failed
            // poll cannot freeze the badge at an older figure.
            if (!active) return;
            attempts += 1;
            window.clearTimeout(retryTimer);
            retryTimer = window.setTimeout(load, Math.min(15000 * attempts, 60000));
          }
        };
        load();
        const timer = window.setInterval(load, 60000);
        const onVisibility = () => {
          if (document.visibilityState === 'visible') load();
        };
        const onRefresh = () => load();
        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('dsh-token-usage:refresh', onRefresh);
        return () => {
          active = false;
          window.clearTimeout(retryTimer);
          window.clearInterval(timer);
          document.removeEventListener('visibilitychange', onVisibility);
          window.removeEventListener('dsh-token-usage:refresh', onRefresh);
        };
      }, []);
      return h(TokenUsageIcon, { size });
    }

    /**
     * Read one positive session usage row.
     * @param row - Client Session list row.
     * @returns normalized counts, or undefined when the projection is absent or empty.
     */
    function readUsage(row) {
      const value = row?.projectionValues?.tokenUsage;
      if (value === null || typeof value !== 'object') return undefined;
      const uncachedInputTokens = nonNegative(value.uncachedInputTokens);
      const outputTokens = nonNegative(value.outputTokens);
      const cacheReadTokens = nonNegative(value.cacheReadTokens);
      const cacheWriteTokens = nonNegative(value.cacheWriteTokens);
      const total = uncachedInputTokens + outputTokens + cacheReadTokens + cacheWriteTokens;
      if (total <= 0) return undefined;
      return { uncachedInputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, total };
    }

    /**
     * Coerce a projection count to a finite non-negative number.
     * @param value - projection field.
     * @returns a safe count.
     */
    function nonNegative(value) {
      return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
    }

    /**
     * Derive the visible session rows from one Sessions list snapshot.
     * @param list - Sessions list snapshot supplied by the root hook.
     * @returns rows sorted by total and the list phase.
     */
    function summarize(list) {
      const rows = [];
      const byId = list?.byId;
      if (byId !== null && typeof byId === 'object') {
        for (const row of Object.values(byId)) {
          const usage = readUsage(row);
          if (usage === undefined) continue;
          rows.push({
            id: String(row.id ?? ''),
            title: row.displayTitle || row.title || '',
            meta: rowMeta(row),
            cwd: typeof row.cwd === 'string' ? row.cwd : '',
            folder: folderName(row.cwd),
            current: (row.retainedBy?.mainView ?? 0) > 0,
            subagent: row.origin === 'subagent',
            updatedAt: typeof row.updatedAt === 'number' ? row.updatedAt : 0,
            usage
          });
        }
      }
      rows.sort((left, right) => right.usage.total - left.usage.total || right.updatedAt - left.updatedAt);
      return {
        rows,
        phase: list?.phase ?? 'ready'
      };
    }

    /** A zero bucket set used by summaries and chart groups. */
    function emptyUsage() {
      return {
        uncachedInputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        total: 0
      };
    }

    /**
     * Add one normalized usage row into a mutable bucket set.
     * @param target - bucket set to add into.
     * @param usage - normalized usage.
     */
    function addUsage(target, usage) {
      target.uncachedInputTokens += usage.uncachedInputTokens;
      target.outputTokens += usage.outputTokens;
      target.cacheReadTokens += usage.cacheReadTokens;
      target.cacheWriteTokens += usage.cacheWriteTokens;
      target.total += usage.total;
    }

    /**
     * Aggregate token totals and cache hit for one set of session rows.
     * @param rows - normalized session rows.
     * @returns the bucket totals and cache-hit ratio.
     */
    function sumRows(rows) {
      const totals = emptyUsage();
      for (const row of rows) addUsage(totals, row.usage);
      const cacheBase = totals.uncachedInputTokens + totals.cacheReadTokens;
      return {
        totals,
        cacheHit: cacheBase > 0 ? totals.cacheReadTokens / cacheBase : 0
      };
    }

    /**
     * Group filtered rows for the stacked bar chart.
     * @param rows - normalized session rows.
     * @param mode - `session` or `workspace`.
     * @param t - translate function.
     * @returns at most CHART_GROUP_LIMIT visible groups, with the remainder folded into one row.
     */
    function groupRows(rows, mode, t) {
      const groups = new Map();
      for (const row of rows) {
        const key = mode === 'workspace' ? (row.cwd || '__ungrouped__') : row.id;
        const label = mode === 'workspace'
          ? (row.folder || t('workspace.none'))
          : (row.title || t('list.untitled'));
        let group = groups.get(key);
        if (group === undefined) {
          group = {
            key,
            label,
            usage: emptyUsage(),
            sessions: 0,
            updatedAt: 0
          };
          groups.set(key, group);
        }
        addUsage(group.usage, row.usage);
        group.sessions += 1;
        group.updatedAt = Math.max(group.updatedAt, row.updatedAt);
      }
      const sorted = [...groups.values()].sort((left, right) =>
        right.usage.total - left.usage.total || right.updatedAt - left.updatedAt
      );
      const visible = sorted.slice(0, CHART_GROUP_LIMIT);
      const rest = sorted.slice(CHART_GROUP_LIMIT);
      if (rest.length > 0) {
        const other = {
          key: '__other__',
          label: t('chart.other'),
          usage: emptyUsage(),
          sessions: 0,
          updatedAt: 0
        };
        for (const group of rest) {
          addUsage(other.usage, group.usage);
          other.sessions += group.sessions;
          other.updatedAt = Math.max(other.updatedAt, group.updatedAt);
        }
        visible.push(other);
      }
      return visible;
    }

    /**
     * Format one activity timestamp for the session table.
     * @param value - epoch milliseconds.
     * @returns local `MM-DD HH:mm` text, a year-qualified date for another year, or a dash.
     */
    function formatWhen(value) {
      if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return '—';
      const date = new Date(value);
      const now = new Date();
      const pad = (part) => String(part).padStart(2, '0');
      const datePart = date.getFullYear() === now.getFullYear()
        ? `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
        : `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      return `${datePart} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    /**
     * Format the full local timestamp for a hover title.
     * @param value - epoch milliseconds.
     * @returns local date and time text, or a dash.
     */
    function formatFullWhen(value) {
      if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return '—';
      return new Date(value).toLocaleString();
    }

    /**
     * Render a local calendar date as an `<input type="date">` value.
     * @param value - Date or epoch.
     * @returns `YYYY-MM-DD` in the browser's local time.
     */
    function toDateInput(value) {
      const date = value instanceof Date ? value : new Date(value);
      const pad = (part) => String(part).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }

    /**
     * Parse an `<input type="date">` value as a local midnight Date.
     * @param value - `YYYY-MM-DD`.
     * @returns a Date, or undefined for an invalid calendar date.
     */
    function parseDateInput(value) {
      if (typeof value !== 'string') return undefined;
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
      if (match === null) return undefined;
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return undefined;
      }
      return date;
    }

    /**
     * Return local midnight for one date.
     * @param value - Date or epoch.
     * @returns a local-midnight Date.
     */
    function startOfLocalDay(value) {
      const date = value instanceof Date ? value : new Date(value);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    /**
     * Add calendar days in local time (DST-safe through the Date constructor).
     * @param value - local date.
     * @param days - signed day count.
     * @returns a new local Date.
     */
    function addLocalDays(value, days) {
      const date = value instanceof Date ? value : new Date(value);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
    }

    /**
     * Build the secondary line for one session row: workspace folder plus a
     * short durable id. A title that already equals the id is not repeated.
     * @param row - Client Session list row.
     * @returns the display metadata line, possibly empty.
     */
    function rowMeta(row) {
      const id = String(row.id ?? '');
      const shortId = id.length > 10 ? `${id.slice(0, 8)}…` : id;
      const folder = folderName(row.cwd);
      const title = row.displayTitle || row.title || '';
      const parts = [];
      if (folder !== '' && folder !== title) parts.push(folder);
      if (shortId !== '' && shortId !== title) parts.push(shortId);
      return parts.join(' · ');
    }

    /**
     * Return the last path segment of a workspace directory.
     * @param path - absolute host path, possibly empty.
     * @returns the folder label, or an empty string.
     */
    function folderName(path) {
      if (typeof path !== 'string' || path === '') return '';
      const parts = path.split(/[\\/]+/).filter(Boolean);
      return parts.length === 0 ? path : parts[parts.length - 1];
    }

    /**
     * Format one exact token count in the browser's active numbering locale.
     * @param value - token count.
     * @returns grouped decimal text.
     */
    function formatNumber(value) {
      return Number.isFinite(value) && value > 0 ? Math.round(value).toLocaleString() : '0';
    }

    /**
     * Format one token count for a display unit.
     * @param value - token count.
     * @param unit - `exact`, `metric` (K/M/B), or `wan` (万 only).
     * @returns grouped exact text or one compact unit string.
     */
    function formatTokens(value, unit) {
      if (!Number.isFinite(value) || value <= 0) return '0';
      if (unit === 'exact') return formatNumber(value);
      if (unit === 'wan') {
        if (value >= 10000) return formatWanTokens(value);
        return formatNumber(value);
      }
      if (value >= 1000000000) return compact(value, 1000000000, 2, 'B');
      if (value >= 1000000) return compact(value, 1000000, 2, 'M');
      if (value >= 1000) return compact(value, 1000, 1, 'K');
      return formatNumber(value);
    }

    /**
     * Scale one count and trim meaningless trailing zeroes.
     * @param value - token count.
     * @param divisor - unit size.
     * @param digits - fixed decimal places before trimming.
     * @param suffix - display unit.
     * @returns the compact value.
     */
    function compact(value, divisor, digits, suffix) {
      const scaled = value / divisor;
      const text = scaled.toFixed(digits).replace(/\.?0+$/, '');
      return `${text}${suffix}`;
    }

    /**
     * Format a fixed 万 value, grouping the whole part when it reaches four or
     * more digits. This keeps values beyond the 亿 boundary readable without
     * changing the selected unit.
     * @param value - token count of at least ten thousand.
     * @returns grouped display text, for example `115,144.8万`.
     */
    function formatWanTokens(value) {
      const text = (value / 10000).toFixed(1).replace(/\.0$/, '');
      const split = text.split('.');
      const whole = Number(split[0]).toLocaleString();
      return `${whole}${split.length > 1 ? `.${split[1]}` : ''}万`;
    }

    /**
     * Read the saved display unit, falling back to the active locale's default.
     * @param fallback - initial unit chosen by the caller.
     * @returns a valid unit id.
     */
    function readUnitPreference(fallback) {
      try {
        const stored = window.localStorage.getItem(UNIT_KEY);
        if (stored !== null && UNIT_IDS.has(stored)) return stored;
      } catch (_error) {
        // Storage can be unavailable in restricted browser modes; the switch still works for this render.
      }
      return UNIT_IDS.has(fallback) ? fallback : 'metric';
    }

    /**
     * Persist one display unit for this browser.
     * @param unit - selected unit id.
     */
    function saveUnitPreference(unit) {
      try {
        window.localStorage.setItem(UNIT_KEY, unit);
      } catch (_error) {
        // A blocked storage write must not break the panel.
      }
    }

    /**
     * Format a [0, 1] ratio as a whole percentage.
     * @param value - ratio.
     * @returns percentage text.
     */
    function formatPercent(value) {
      if (!Number.isFinite(value) || value <= 0) return '0%';
      return `${Math.round(value * 100)}%`;
    }

    /**
     * Format a [0, 1] ratio with two decimals for the hourly readout.
     * @param value - ratio.
     * @returns percentage text such as `90.32%`.
     */
    function formatRate(value) {
      if (!Number.isFinite(value) || value <= 0) return '0.00%';
      return `${(value * 100).toFixed(2)}%`;
    }

    /**
     * Format one account cost with its currency marker.
     * @param value - amount in the Platform account currency.
     * @param currency - `CNY`, `USD`, `EUR`, or another Platform code.
     * @returns money text with two decimals (four for sub-unit amounts).
     */
    function formatMoney(value, currency) {
      const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0;
      const symbol = currency === 'CNY' ? '¥' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '';
      const digits = amount > 0 && amount < 1 ? 4 : 2;
      const suffix = symbol === '' && typeof currency === 'string' && currency !== '' ? ` ${currency}` : '';
      return `${symbol}${amount.toFixed(digits)}${suffix}`;
    }

    /**
     * Format a token count for the compact sidebar: 万 below ten million,
     * otherwise 亿, always with exactly two decimals.
     * @param value - token count.
     * @returns the sidebar label fragment, for example `1.23万` or `1.23亿`.
     */
    function formatCompactTokens(value) {
      const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0;
      if (amount >= 10000000) return `${(amount / 100000000).toFixed(2)}亿`;
      return `${(amount / 10000).toFixed(2)}万`;
    }

    /**
     * Format a cost with exactly two decimals for the compact sidebar badge.
     * @param value - amount in the Platform account currency.
     * @param currency - Platform currency code.
     * @returns money text such as `¥4.56`.
     */
    function formatCost2(value, currency) {
      const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0;
      const symbol = currency === 'CNY' ? '¥' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '';
      const suffix = symbol === '' && typeof currency === 'string' && currency !== '' ? ` ${currency}` : '';
      return `${symbol}${amount.toFixed(2)}${suffix}`;
    }

    /**
     * Empty or filtered-empty panel body.
     * @param props - localized title and explanation.
     * @returns the placeholder.
     */
    function EmptyState({ title, body }) {
      return h('div', { className: 'dsu-empty' },
        h('div', { className: 'dsu-empty-icon' }, h(TokenUsageIcon, { size: 34 })),
        h('div', { className: 'dsu-empty-title' }, title),
        h('p', { className: 'dsu-empty-body' }, body)
      );
    }

    /** The brand bar-chart mark shown beside the page title. */
    function BarMark() {
      return h(
        'svg',
        { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' },
        h('rect', { x: 3.5, y: 12.5, width: 4, height: 7.5, rx: 2, fill: 'currentColor', opacity: 0.42 }),
        h('rect', { x: 10, y: 8, width: 4, height: 12, rx: 2, fill: 'currentColor', opacity: 0.68 }),
        h('rect', { x: 16.5, y: 3.5, width: 4, height: 16.5, rx: 2, fill: 'currentColor' }),
        h('path', { d: 'M3.5 21.5h17', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', opacity: 0.32 })
      );
    }

    /**
     * One metric card.
     * @param props - label, exact value, hint, series color, and display unit.
     * @returns the card element.
     */
    function StatCard({ label, value, hint, color, unit }) {
      const pending = value === null || value === undefined;
      return h('div', { className: 'dsu-stat' },
        h('div', { className: 'dsu-stat-head' },
          h('span', { className: 'dsu-dot', style: { background: color }, 'aria-hidden': 'true' }),
          h('span', null, label)
        ),
        h('div', { className: 'dsu-stat-value', title: pending ? '' : formatNumber(value) },
          pending ? '—' : formatTokens(value, unit)),
        h('div', { className: 'dsu-stat-hint' }, hint)
      );
    }

    /**
     * One session row in the breakdown table.
     * @param props - normalized session row, translate function, and display unit.
     * @returns the grid row.
     */
    function SessionRow({ row, t, unit }) {
      const usage = row.usage;
      const cacheTokens = usage.cacheReadTokens + usage.cacheWriteTokens;
      return h('div', { className: 'dsu-row', role: 'row' },
        h('div', { className: 'dsu-session', role: 'cell' },
          h('div', { className: 'dsu-session-title-line' },
            h('span', { className: 'dsu-session-name', title: row.title }, row.title || t('list.untitled')),
            row.current ? h('span', { className: 'dsu-tag current' }, t('list.current')) : null,
            row.subagent ? h('span', { className: 'dsu-tag' }, t('list.subagent')) : null
          ),
          row.meta !== '' ? h('div', { className: 'dsu-session-meta' }, row.meta) : null,
          h('div', { className: 'dsu-mobile-breakdown' },
            `${t('list.cache')} ${formatTokens(cacheTokens, unit)} · `,
            `${t('list.input')} ${formatTokens(usage.uncachedInputTokens, unit)} · `,
            `${t('list.output')} ${formatTokens(usage.outputTokens, unit)}`
          )
        ),
        h('div', {
          className: 'dsu-num dsu-cell-cache',
          role: 'cell',
          title: `${t('stats.cacheRead.hint')} / ${t('stats.cacheWrite.hint')} · ${formatNumber(cacheTokens)}`
        }, formatTokens(cacheTokens, unit)),
        h('div', {
          className: 'dsu-num dsu-cell-input',
          role: 'cell',
          title: `${t('stats.input.hint')} · ${formatNumber(usage.uncachedInputTokens)}`
        }, formatTokens(usage.uncachedInputTokens, unit)),
        h('div', {
          className: 'dsu-num dsu-cell-output',
          role: 'cell',
          title: `${t('stats.output.hint')} · ${formatNumber(usage.outputTokens)}`
        }, formatTokens(usage.outputTokens, unit)),
        h('div', {
          className: 'dsu-num total dsu-cell-total',
          role: 'cell',
          title: `${t('list.total')} · ${formatNumber(usage.total)}`
        }, formatTokens(usage.total, unit)),
        h('div', {
          className: 'dsu-when dsu-cell-last',
          role: 'cell',
          title: formatFullWhen(row.updatedAt)
        }, formatWhen(row.updatedAt))
      );
    }

    /** The page-level stylesheet; unmounting the panel removes it with the component. */
    const CSS = `
      .dsu-page {
        height: 100%;
        overflow-y: auto;
        background: var(--dsw-alias-bg-base);
        color: var(--dsw-alias-label-primary);
        -webkit-font-smoothing: antialiased;
      }
      .dsu-page *, .dsu-page *::before, .dsu-page *::after { box-sizing: border-box; }
      .dsu-shell {
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
        padding: calc(var(--dsh-frame-top-clearance, 0px) + 36px) 32px 56px;
        display: grid;
        grid-template-columns: minmax(0, 1.45fr) minmax(300px, 1fr);
        column-gap: 14px;
      }
      .dsu-shell > * { grid-column: 1 / -1; }
      .dsu-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 24px;
        margin-bottom: 28px;
      }
      .dsu-title-wrap { display: flex; align-items: flex-start; gap: 14px; min-width: 0; }
      .dsu-mark {
        width: 44px;
        height: 44px;
        flex: none;
        display: grid;
        place-items: center;
        border-radius: 13px;
        border: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 22%, var(--dsw-alias-border-l1));
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, var(--dsw-alias-bg-layer-1));
        color: var(--dsw-alias-brand-primary);
      }
      .dsu-eyebrow {
        margin-bottom: 8px;
        color: var(--dsw-alias-label-secondary);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      .dsu-title {
        margin: 0 0 10px;
        font-size: clamp(24px, 3vw, 30px);
        font-weight: 600;
        letter-spacing: -.015em;
        line-height: 1.2;
      }
      .dsu-subtitle {
        max-width: 590px;
        margin: 0;
        color: var(--dsw-alias-label-secondary);
        font-size: 14px;
        line-height: 1.6;
      }
      .dsu-header-tools {
        display: flex;
        flex: none;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
      }
      .dsu-unit {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 3px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 10px;
        background: var(--dsw-alias-bg-layer-2);
      }
      .dsu-unit-label {
        padding: 0 6px 0 7px;
        color: var(--dsw-alias-label-secondary);
        font-size: 11px;
        line-height: 1.4;
        white-space: nowrap;
      }
      .dsu-unit-btn {
        padding: 6px 10px;
        border: 0;
        border-radius: 7px;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        cursor: pointer;
        font: inherit;
        font-size: 11.5px;
        line-height: 1.4;
        white-space: nowrap;
      }
      @media (hover: hover) {
        .dsu-unit-btn:hover {
          background: var(--dsw-alias-bg-layer-1);
          color: var(--dsw-alias-label-primary);
        }
      }
      .dsu-unit-btn:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 1px;
      }
      .dsu-unit-btn[aria-pressed="true"] {
        background: var(--dsw-alias-bg-layer-2);
        box-shadow: 0 1px 2px color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent);
        color: var(--dsw-alias-label-primary);
        font-weight: 600;
      }
      .dsu-header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .dsu-icon-btn {
        display: inline-flex;
        width: 30px;
        height: 30px;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 9px;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-secondary);
        cursor: pointer;
      }
      @media (hover: hover) {
        .dsu-icon-btn:hover:not(:disabled) {
          background: var(--dsw-alias-bg-layer-2);
          color: var(--dsw-alias-label-primary);
        }
      }
      .dsu-icon-btn:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 1px;
      }
      .dsu-icon-btn:disabled { cursor: default; opacity: .6; }
      .dsu-icon-btn.refreshing svg { animation: dsu-spin .8s linear infinite; }
      @keyframes dsu-spin { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) {
        .dsu-icon-btn.refreshing svg { animation: none; }
      }
      .dsu-toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px 16px;
        margin-bottom: 18px;
      }
      .dsu-range {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 2px;
        padding: 3px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 10px;
        background: var(--dsw-alias-bg-layer-2);
      }
      .dsu-range-btn {
        padding: 7px 12px;
        border: 0;
        border-radius: 7px;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        cursor: pointer;
        font: inherit;
        font-size: 12.5px;
        line-height: 1.2;
        white-space: nowrap;
      }
      @media (hover: hover) {
        .dsu-range-btn:hover {
          background: var(--dsw-alias-bg-layer-1);
          color: var(--dsw-alias-label-primary);
        }
      }
      .dsu-range-btn:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 1px;
      }
      .dsu-range-btn[aria-pressed="true"] {
        background: var(--dsw-alias-bg-layer-2);
        box-shadow: 0 1px 2px color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent);
        color: var(--dsw-alias-label-primary);
        font-weight: 600;
      }
      .dsu-scope-note {
        color: var(--dsw-alias-label-secondary);
        font-size: 11.5px;
        line-height: 1.5;
      }
      .dsu-custom-range {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }
      .dsu-date-field {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--dsw-alias-label-secondary);
        font-size: 11.5px;
      }
      .dsu-date-input {
        height: 30px;
        padding: 0 8px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 8px;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-primary);
        font: inherit;
        font-size: 11.5px;
        outline: none;
      }
      .dsu-date-input:focus {
        border-color: var(--dsw-alias-brand-primary);
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 1px;
      }
      .dsu-date-sep { color: var(--dsw-alias-label-secondary); font-size: 12px; }
      .dsu-date-hint { color: var(--dsw-alias-label-secondary); font-size: 10.5px; }
      .dsu-live {
        display: inline-flex;
        flex: none;
        align-items: center;
        gap: 7px;
        padding: 6px 11px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 999px;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-secondary);
        font-size: 12px;
        line-height: 1.4;
        white-space: nowrap;
      }
      .dsu-live-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--dsw-alias-state-success-primary);
        box-shadow: 0 0 0 3px var(--dsw-alias-bg-layer-2);
      }
      .dsu-hero {
        display: grid;
        grid-column: 1;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 32px;
        margin-bottom: 28px;
        padding: 26px 28px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 16px;
        background:
          radial-gradient(120% 100% at 0% 0%, color-mix(in srgb, var(--dsw-alias-brand-primary) 9%, transparent) 0%, transparent 58%),
          var(--dsw-alias-bg-layer-1);
      }
      .dsu-hero-main { display: flex; min-width: 0; flex-direction: column; justify-content: center; }
      .dsu-hero-label {
        color: var(--dsw-alias-label-secondary);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: .07em;
        text-transform: uppercase;
      }
      .dsu-hero-value {
        margin: 8px 0 10px;
        overflow-wrap: anywhere;
        font-size: clamp(38px, 6vw, 52px);
        font-weight: 650;
        font-variant-numeric: tabular-nums;
        letter-spacing: -.025em;
        line-height: 1.05;
      }
      .dsu-hero-meta {
        color: var(--dsw-alias-label-secondary);
        font-size: 12px;
        line-height: 1.5;
      }
      .dsu-hero-side {
        display: flex;
        min-width: 0;
        align-items: flex-end;
        flex-direction: column;
        gap: 8px;
      }
      .dsu-gauge {
        display: grid;
        width: 112px;
        height: 112px;
        place-items: center;
        border-radius: 50%;
        background: conic-gradient(
          var(--dsw-alias-state-success-primary) var(--dsu-gauge-angle),
          var(--dsw-alias-bg-layer-2) 0
        );
      }
      .dsu-gauge-inner {
        display: flex;
        width: 88px;
        height: 88px;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 2px;
        border-radius: 50%;
        background: var(--dsw-alias-bg-layer-1);
      }
      .dsu-gauge-value {
        font-size: 20px;
        font-weight: 650;
        font-variant-numeric: tabular-nums;
        letter-spacing: -.01em;
        line-height: 1.2;
      }
      .dsu-gauge-label {
        max-width: 72px;
        color: var(--dsw-alias-label-secondary);
        font-size: 10px;
        line-height: 1.3;
        text-align: center;
      }
      .dsu-gauge-hint {
        max-width: 180px;
        color: var(--dsw-alias-label-secondary);
        font-size: 11px;
        line-height: 1.45;
        text-align: right;
      }
      .dsu-dot {
        width: 8px;
        height: 8px;
        flex: none;
        border-radius: 2px;
      }
      .dsu-stats {
        display: grid;
        grid-column: 2;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 28px;
      }
      .dsu-stat {
        min-width: 0;
        padding: 15px 16px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 12px;
        background: var(--dsw-alias-bg-layer-1);
      }
      .dsu-stat-head {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--dsw-alias-label-secondary);
        font-size: 12px;
      }
      .dsu-stat-value {
        margin-top: 9px;
        overflow-wrap: anywhere;
        font-size: 20px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        line-height: 1.25;
      }
      .dsu-stat-hint {
        margin-top: 4px;
        color: var(--dsw-alias-label-secondary);
        font-size: 11px;
        line-height: 1.45;
        opacity: .82;
      }
      .dsu-billing {
        margin-bottom: 28px;
        padding: 22px 24px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 16px;
        background: var(--dsw-alias-bg-layer-1);
      }
      .dsu-billing-head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px 20px;
        margin-bottom: 12px;
      }
      .dsu-billing-heading {
        display: flex;
        min-width: 0;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 2px 10px;
      }
      .dsu-billing-title { margin: 0; font-size: 15px; font-weight: 600; }
      .dsu-billing-sub {
        max-width: 650px;
        margin: 0;
        color: var(--dsw-alias-label-secondary);
        font-size: 11.5px;
        line-height: 1.5;
      }
      .dsu-billing-side {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 14px;
      }
      .dsu-billing-money {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px 16px;
      }
      .dsu-billing-amount {
        overflow-wrap: anywhere;
        font-size: clamp(20px, 2.6vw, 26px);
        font-weight: 650;
        font-variant-numeric: tabular-nums;
        letter-spacing: -.02em;
        line-height: 1.1;
      }
      .dsu-billing-range {
        flex: none;
        margin-left: auto;
        padding: 4px 9px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 999px;
        color: var(--dsw-alias-label-secondary);
        font-size: 11px;
        line-height: 1.4;
        white-space: nowrap;
      }
      .dsu-billing-loading {
        padding: 12px 0 4px;
        color: var(--dsw-alias-label-secondary);
        font-size: 12.5px;
      }
      .dsu-billing-stats { display: flex; flex-wrap: wrap; gap: 4px 16px; }
      .dsu-billing-stat { display: inline-flex; align-items: baseline; gap: 5px; }
      .dsu-billing-stat span {
        color: var(--dsw-alias-label-secondary);
        font-size: 11px;
        line-height: 1.4;
      }
      .dsu-billing-stat strong {
        font-size: 12.5px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        line-height: 1.4;
      }
      .dsu-billing-plot + .dsu-billing-group-head {
        margin-top: 18px;
        padding-top: 16px;
        border-top: 1px solid var(--dsw-alias-border-l1);
      }
      .dsu-billing-group-head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px 16px;
      }
      .dsu-billing-group-title { margin: 0; font-size: 13px; font-weight: 600; }
      .dsu-billing-plot { position: relative; }
      .dsu-billing-legend {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px 16px;
        color: var(--dsw-alias-label-secondary);
        font-size: 11px;
      }
      .dsu-billing-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .dsu-billing-legend-swatch {
        width: 9px;
        height: 9px;
        flex: none;
        border-radius: 2px;
      }
      .dsu-billing-legend-swatch.is-hit { background: var(--dsw-alias-state-success-primary); }
      .dsu-billing-legend-swatch.is-miss { background: var(--dsw-alias-state-business-primary); }
      .dsu-billing-legend-swatch.is-out { background: var(--dsw-alias-state-warn-primary); }
      .dsu-billing-legend-swatch.is-cost { background: var(--dsw-alias-state-error-primary); }
      .dsu-billing-legend-swatch.is-avg {
        width: 14px;
        height: 0;
        border-radius: 0;
        border-top: 2px dashed color-mix(in srgb, var(--dsw-alias-label-secondary) 60%, transparent);
      }
      .dsu-billing-legend-swatch.is-rate {
        width: 14px;
        height: 0;
        border-top: 2px solid var(--dsw-alias-label-secondary);
        border-radius: 0;
      }
      .dsu-billing-trend {
        position: relative;
        display: flex;
        height: 146px;
        align-items: flex-end;
        gap: 2px;
        margin-top: 8px;
      }
      .dsu-billing-slot {
        display: flex;
        height: 100%;
        min-width: 2px;
        flex: 1;
        align-items: flex-end;
        justify-content: center;
        border-radius: 4px;
      }
      @media (hover: hover) {
        .dsu-billing-slot:hover {
          background: color-mix(in srgb, var(--dsw-alias-brand-primary) 7%, transparent);
        }
      }
      .dsu-billing-slot.is-active {
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 7%, transparent);
      }
      .dsu-billing-bar {
        display: flex;
        width: 60%;
        min-height: 3px;
        overflow: hidden;
        flex-direction: column;
        border-radius: 3px 3px 0 0;
      }
      .dsu-billing-bar.is-idle {
        background: var(--dsw-alias-label-secondary);
        opacity: .16;
      }
      .dsu-billing-seg { width: 100%; }
      .dsu-billing-seg.is-hit { background: var(--dsw-alias-state-success-primary); }
      .dsu-billing-seg.is-miss { background: var(--dsw-alias-state-business-primary); }
      .dsu-billing-seg.is-out { background: var(--dsw-alias-state-warn-primary); }
      .dsu-billing-rate {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
        pointer-events: none;
      }
      .dsu-billing-rate-mid {
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        border-top: 1px dashed var(--dsw-alias-border-l2);
        pointer-events: none;
      }
      .dsu-billing-rate-dot {
        position: absolute;
        width: 5px;
        height: 5px;
        margin: -2.5px 0 0 -2.5px;
        border-radius: 50%;
        background: var(--dsw-alias-label-secondary);
        box-shadow: 0 0 0 1.5px var(--dsw-alias-bg-layer-1);
        pointer-events: none;
      }
      .dsu-billing-scale {
        position: absolute;
        top: 3px;
        padding: 1px 5px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 5px;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-secondary);
        font-size: 10px;
        line-height: 1.45;
        white-space: nowrap;
        pointer-events: none;
      }
      .dsu-billing-scale.is-left { left: 3px; }
      .dsu-billing-scale.is-right { right: 3px; }
      .dsu-billing-spend {
        position: relative;
        display: flex;
        height: 110px;
        align-items: flex-end;
        gap: 2px;
        margin-top: 8px;
      }
      .dsu-billing-avg {
        position: absolute;
        left: 0;
        right: 0;
        border-top: 1px dashed color-mix(in srgb, var(--dsw-alias-label-secondary) 60%, transparent);
        pointer-events: none;
      }
      /*
       * Spend bars take the error red: brand-primary flips to near-white in
       * the dark theme, and a white fill inside the plot reads as a break.
       */
      .dsu-billing-cost-bar {
        flex: none;
        width: 60%;
        min-width: 2px;
        border-radius: 2px 2px 0 0;
        background: var(--dsw-alias-state-error-primary);
      }
      .dsu-billing-axis {
        display: flex;
        gap: 2px;
        margin-top: 5px;
        padding-top: 5px;
        border-top: 1px solid var(--dsw-alias-border-l2);
      }
      .dsu-billing-tick {
        flex: 1;
        min-width: 2px;
        overflow: hidden;
        color: var(--dsw-alias-label-secondary);
        font-size: 11px;
        line-height: 1.3;
        text-align: center;
        white-space: nowrap;
      }
      .dsu-billing-tick.is-quarter {
        color: var(--dsw-alias-label-primary);
        font-weight: 600;
      }
      .dsu-billing-tick.is-active {
        color: var(--dsw-alias-label-primary);
        font-weight: 600;
      }
      .dsu-billing-tip {
        position: absolute;
        bottom: calc(100% + 8px);
        transform: translateX(-50%);
        z-index: 5;
        pointer-events: none;
        padding: 7px 10px;
        border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 8px;
        background: var(--dsw-alias-bg-layer-1);
        box-shadow: 0 4px 14px rgba(15, 17, 21, .14);
        color: var(--dsw-alias-label-primary);
        font-size: 11.5px;
        line-height: 1.55;
        white-space: nowrap;
      }
      .dsu-billing-tip.is-inside {
        top: 6px;
        bottom: auto;
      }
      .dsu-billing-tip-time {
        margin-bottom: 2px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      .dsu-billing-tip-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        color: var(--dsw-alias-label-secondary);
        font-variant-numeric: tabular-nums;
      }
      .dsu-billing-tip-row strong { color: var(--dsw-alias-label-primary); font-weight: 600; }
      .dsu-billing-note {
        margin: 10px 0 0;
        color: var(--dsw-alias-label-secondary);
        font-size: 11.5px;
        line-height: 1.5;
      }
      .dsu-billing-empty-title { font-size: 13px; font-weight: 600; }
      .dsu-balance-config { margin-top: 16px; }
      .dsu-balance-config .dsu-card-head { margin-bottom: 10px; }
      .dsu-balance-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px 16px;
      }
      .dsu-balance-field { display: flex; min-width: 0; flex-direction: column; gap: 4px; }
      .dsu-balance-field label {
        color: var(--dsw-alias-label-secondary);
        font-size: 11px;
      }
      .dsu-balance-field input,
      .dsu-balance-field select {
        height: 30px;
        padding: 0 8px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 8px;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-primary);
        font: inherit;
        font-size: 11.5px;
        outline: none;
      }
      .dsu-balance-field input:focus,
      .dsu-balance-field select:focus {
        border-color: var(--dsw-alias-brand-primary);
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 1px;
      }
      .dsu-balance-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
      }
      .dsu-balance-button {
        padding: 5px 11px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 8px;
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-primary);
        cursor: pointer;
        font: inherit;
        font-size: 11.5px;
      }
      .dsu-balance-button:disabled { cursor: default; opacity: .55; }
      .dsu-balance-status {
        color: var(--dsw-alias-label-secondary);
        font-size: 11px;
      }
      .dsu-balance-status.is-error { color: var(--dsw-alias-state-error-primary); }
      @media (max-width: 760px) {
        .dsu-balance-grid { grid-template-columns: minmax(0, 1fr); }
      }
      .dsu-billing-empty-body {
        max-width: 560px;
        margin: 5px 0 0;
        color: var(--dsw-alias-label-secondary);
        font-size: 12px;
        line-height: 1.55;
      }
      .dsu-billing-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
      .dsu-billing-action {
        padding: 5px 10px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 8px;
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-primary);
        cursor: pointer;
        font: inherit;
        font-size: 11.5px;
        line-height: 1.4;
        text-decoration: none;
        white-space: nowrap;
      }
      @media (hover: hover) {
        .dsu-billing-action:hover {
          border-color: var(--dsw-alias-border-l2);
          background: var(--dsw-alias-bg-layer-1);
        }
      }
      .dsu-billing-action:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 1px;
      }
      .dsu-card {
        margin-bottom: 28px;
        padding: 22px 24px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 16px;
        background: var(--dsw-alias-bg-layer-1);
      }
      .dsu-card-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 16px;
      }
      .dsu-card-title { margin: 0 0 5px; font-size: 15px; font-weight: 600; }
      .dsu-card-sub {
        margin: 0;
        color: var(--dsw-alias-label-secondary);
        font-size: 11.5px;
        line-height: 1.5;
      }
      .dsu-view-toggle {
        display: inline-flex;
        flex: none;
        align-items: center;
        gap: 2px;
        padding: 2px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 9px;
        background: var(--dsw-alias-bg-layer-2);
      }
      .dsu-view-btn {
        padding: 4px 8px;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        cursor: pointer;
        font: inherit;
        font-size: 11.5px;
        line-height: 1.4;
        white-space: nowrap;
      }
      @media (hover: hover) {
        .dsu-view-btn:hover {
          color: var(--dsw-alias-label-primary);
          background: var(--dsw-alias-bg-layer-1);
        }
      }
      .dsu-view-btn:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 1px;
      }
      .dsu-view-btn[aria-pressed="true"] {
        background: var(--dsw-alias-bg-layer-1);
        box-shadow: 0 1px 2px color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent);
        color: var(--dsw-alias-label-primary);
        font-weight: 600;
      }
      .dsu-chart-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 9px 18px;
        margin-bottom: 16px;
      }
      .dsu-chart-legend-item {
        display: flex;
        align-items: center;
        gap: 7px;
        color: var(--dsw-alias-label-secondary);
        font-size: 11.5px;
      }
      .dsu-chart-scroll { overflow-x: auto; overflow-y: hidden; }
      .dsu-chart-plot {
        display: grid;
        gap: 12px;
        height: 190px;
        align-items: end;
        padding: 0 4px;
      }
      .dsu-chart-cell {
        display: flex;
        height: 100%;
        min-width: 0;
        align-items: flex-end;
        justify-content: center;
      }
      .dsu-chart-bar {
        display: flex;
        width: min(64px, 86%);
        min-height: 3px;
        overflow: hidden;
        flex-direction: column-reverse;
        border-radius: 7px 7px 2px 2px;
        background: var(--dsw-alias-bg-layer-2);
      }
      .dsu-chart-seg { width: 100%; min-height: 0; }
      .dsu-chart-labels {
        display: grid;
        gap: 12px;
        padding: 8px 4px 0;
      }
      .dsu-chart-label { min-width: 0; text-align: center; }
      .dsu-chart-label-name {
        display: block;
        overflow: hidden;
        color: var(--dsw-alias-label-secondary);
        font-size: 10.5px;
        line-height: 1.4;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dsu-chart-label-value {
        display: block;
        margin-top: 2px;
        color: var(--dsw-alias-label-primary);
        font-size: 11px;
        font-variant-numeric: tabular-nums;
        line-height: 1.4;
      }
      .dsu-chart-empty {
        padding: 36px 16px;
        border: 1px dashed var(--dsw-alias-border-l2);
        border-radius: 12px;
        color: var(--dsw-alias-label-secondary);
        font-size: 12.5px;
        text-align: center;
      }
      .dsu-section-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 12px;
      }
      .dsu-section-title { margin: 0; font-size: 15px; font-weight: 600; }
      .dsu-section-count {
        display: block;
        margin-top: 4px;
        color: var(--dsw-alias-label-secondary);
        font-size: 12px;
      }
      .dsu-list-tools { display: flex; min-width: 0; align-items: center; gap: 10px; }
      .dsu-search-input {
        width: 190px;
        height: 30px;
        padding: 0 10px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 8px;
        outline: none;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-primary);
        font: inherit;
        font-size: 12px;
      }
      .dsu-search-input::placeholder { color: var(--dsw-alias-label-secondary); }
      .dsu-search-input:focus {
        border-color: var(--dsw-alias-brand-primary);
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 1px;
      }
      .dsu-table {
        overflow: hidden;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 14px;
        background: var(--dsw-alias-bg-layer-1);
      }
      .dsu-head-row, .dsu-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 96px 88px 80px 96px 108px;
        gap: 16px;
        align-items: center;
        padding: 12px 18px;
      }
      .dsu-head-row {
        border-bottom: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-secondary);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: .045em;
        text-transform: uppercase;
      }
      .dsu-head-num { text-align: right; }
      .dsu-row + .dsu-row { border-top: 1px solid var(--dsw-alias-border-l1); }
      .dsu-row:hover { background: var(--dsw-alias-bg-layer-2); }
      .dsu-session { min-width: 0; }
      .dsu-session-title-line { display: flex; min-width: 0; align-items: center; gap: 8px; }
      .dsu-session-name {
        overflow: hidden;
        color: var(--dsw-alias-label-primary);
        font-size: 13.5px;
        font-weight: 550;
        line-height: 1.4;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dsu-tag {
        flex: none;
        padding: 1px 6px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 999px;
        color: var(--dsw-alias-label-secondary);
        font-size: 10px;
        line-height: 1.5;
      }
      .dsu-tag.current {
        border-color: var(--dsw-alias-brand-primary);
        color: var(--dsw-alias-brand-primary);
      }
      .dsu-session-meta {
        margin-top: 4px;
        overflow: hidden;
        color: var(--dsw-alias-label-secondary);
        font-size: 11.5px;
        line-height: 1.4;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dsu-num {
        overflow: hidden;
        color: var(--dsw-alias-label-secondary);
        font-size: 12.5px;
        font-variant-numeric: tabular-nums;
        text-align: right;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dsu-num.total { color: var(--dsw-alias-label-primary); font-size: 13px; font-weight: 600; }
      .dsu-when {
        overflow: hidden;
        color: var(--dsw-alias-label-secondary);
        font-size: 11.5px;
        font-variant-numeric: tabular-nums;
        text-align: right;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dsu-mobile-breakdown { display: none; }
      .dsu-empty {
        padding: 46px 24px;
        border: 1px dashed var(--dsw-alias-border-l2);
        border-radius: 14px;
        background: var(--dsw-alias-bg-layer-1);
        text-align: center;
      }
      .dsu-empty-icon { color: var(--dsw-alias-label-secondary); opacity: .72; }
      .dsu-empty-title { margin: 12px 0 0; font-size: 14px; font-weight: 600; }
      .dsu-empty-body {
        max-width: 380px;
        margin: 6px auto 0;
        color: var(--dsw-alias-label-secondary);
        font-size: 12.5px;
        line-height: 1.55;
      }
      .dsu-loading {
        padding: 40px 20px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 14px;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-secondary);
        font-size: 13px;
        text-align: center;
      }
      .dsu-note {
        margin: 12px 2px 0;
        color: var(--dsw-alias-label-secondary);
        font-size: 11.5px;
        line-height: 1.6;
      }
      /*
       * Light theme: bg-base, bg-layer-1 and bg-layer-2 are all the same
       * white and border-l1 is only 4% black, so the blocks visually merge.
       * Tint the canvas, firm up the block edges and even out the rhythm;
       * the dark theme keeps the original alias tokens.
       */
      .dsu-page { background: var(--dsw-static-neutral-bluish-55, #f5f7fa); }
      .dsu-hero,
      .dsu-stat,
      .dsu-billing,
      .dsu-card,
      .dsu-table {
        border-color: rgba(15, 17, 21, .1);
        box-shadow: 0 1px 2px rgba(15, 17, 21, .05);
      }
      .dsu-range,
      .dsu-unit,
      .dsu-icon-btn,
      .dsu-live,
      .dsu-date-input,
      .dsu-search-input,
      .dsu-view-toggle { border-color: rgba(15, 17, 21, .12); }
      .dsu-range,
      .dsu-unit,
      .dsu-view-toggle { background: rgba(15, 17, 21, .05); }
      body[data-ds-dark-theme] .dsu-page { background: var(--dsw-alias-bg-base); }
      body[data-ds-dark-theme] .dsu-range,
      body[data-ds-dark-theme] .dsu-unit { background: var(--dsw-alias-bg-layer-1); }
      body[data-ds-dark-theme] .dsu-range-btn:hover,
      body[data-ds-dark-theme] .dsu-unit-btn:hover { background: var(--dsw-alias-bg-layer-2); }
      body[data-ds-dark-theme] .dsu-hero,
      body[data-ds-dark-theme] .dsu-stat,
      body[data-ds-dark-theme] .dsu-billing,
      body[data-ds-dark-theme] .dsu-card,
      body[data-ds-dark-theme] .dsu-table {
        border-color: var(--dsw-alias-border-l1);
        box-shadow: none;
      }
      body[data-ds-dark-theme] .dsu-range,
      body[data-ds-dark-theme] .dsu-unit,
      body[data-ds-dark-theme] .dsu-icon-btn,
      body[data-ds-dark-theme] .dsu-live,
      body[data-ds-dark-theme] .dsu-date-input,
      body[data-ds-dark-theme] .dsu-search-input,
      body[data-ds-dark-theme] .dsu-view-toggle { border-color: var(--dsw-alias-border-l1); }
      @media (max-width: 980px) {
        .dsu-shell { grid-template-columns: minmax(0, 1fr); }
        .dsu-hero,
        .dsu-stats { grid-column: 1 / -1; }
        .dsu-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      }
      @media (max-width: 860px) {
        .dsu-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .dsu-hero { grid-template-columns: 1fr; gap: 24px; }
        .dsu-hero-side { align-items: flex-start; }
        .dsu-gauge-hint { max-width: none; text-align: left; }
      }
      @media (max-width: 760px) {
        .dsu-shell { padding: calc(var(--dsh-frame-top-clearance, 0px) + 24px) 18px 40px; }
        .dsu-header { flex-wrap: wrap; margin-bottom: 22px; }
        .dsu-header-tools { flex-direction: row; align-items: center; }
        .dsu-live { display: none; }
        .dsu-toolbar { align-items: flex-start; flex-direction: column; }
        .dsu-scope-note { order: 2; }
        .dsu-range { max-width: 100%; }
        .dsu-custom-range { width: 100%; }
        .dsu-date-field { flex: 1; min-width: 0; }
        .dsu-date-input { width: 100%; }
        .dsu-date-hint { width: 100%; }
        .dsu-hero { padding: 20px; }
        .dsu-billing { padding: 18px; }
        .dsu-billing-head { flex-direction: column; gap: 10px; }
        .dsu-billing-stats { gap: 4px 18px; }
        .dsu-card { padding: 18px; }
        .dsu-card-head { flex-direction: column; gap: 12px; }
        .dsu-view-toggle { align-self: flex-start; }
        .dsu-section-head { flex-direction: column; gap: 10px; }
        .dsu-list-tools { width: 100%; }
        .dsu-search-input { width: 100%; }
        .dsu-chart-plot { height: 160px; gap: 8px; }
        .dsu-chart-labels { gap: 8px; }
        .dsu-chart-bar { width: min(48px, 84%); }
        .dsu-head-row { display: none; }
        .dsu-row { grid-template-columns: minmax(0, 1fr) auto; gap: 8px; padding: 14px 16px; }
        .dsu-cell-cache, .dsu-cell-input, .dsu-cell-output, .dsu-cell-last { display: none; }
        .dsu-cell-total { grid-row: 1; grid-column: 2; align-self: start; }
        .dsu-session { grid-row: 1; grid-column: 1; }
        .dsu-mobile-breakdown {
          display: block;
          margin-top: 5px;
          color: var(--dsw-alias-label-secondary);
          font-size: 11px;
          line-height: 1.45;
        }
      }
    `;

    /** Stable selector: the panel follows the complete Sessions list snapshot. */
    const SELECT_ALL = (snapshot) => snapshot;

    /**
     * The global Token usage page: a profile summary plus a per-session
     * breakdown, all derived from the live Sessions list projection.
     * @param props - slot standard hook plus the locale seat.
     * @returns the page element.
     */
    function TokenUsagePanel(props) {
      const t = typeof props.t === 'function'
        ? props.t
        : typeof props.translate === 'function' ? props.translate : (key) => key;
      const [unit, setUnit] = React.useState(() => readUnitPreference(
        props.defaultUnit === 'wan' ? 'wan' : 'metric'
      ));
      React.useEffect(() => {
        saveUnitPreference(unit);
      }, [unit]);
      const [range, setRange] = React.useState('today');
      const [customStart, setCustomStart] = React.useState(() => toDateInput(new Date()));
      const [customEnd, setCustomEnd] = React.useState(() => toDateInput(new Date()));
      const [chartMode, setChartMode] = React.useState('session');
      const [query, setQuery] = React.useState('');
      const [refreshing, setRefreshing] = React.useState(false);
      const [billing, setBilling] = React.useState({
        status: 'idle',
        data: null,
        code: null,
        usageUrl: null
      });
      const [billingNonce, setBillingNonce] = React.useState(0);
      const [billingTip, setBillingTip] = React.useState(null);
      const billingRetryRef = React.useRef(0);
      const todayDay = startOfLocalDay(new Date());
      const todayValue = toDateInput(todayDay);
      const rangeBounds = React.useMemo(() => {
        const today = startOfLocalDay(new Date());
        if (range === '7d') {
          return { start: addLocalDays(today, -6), end: addLocalDays(today, 1) };
        }
        if (range === '30d') {
          return { start: addLocalDays(today, -29), end: addLocalDays(today, 1) };
        }
        if (range === 'today') {
          return { start: today, end: addLocalDays(today, 1) };
        }
        let start = parseDateInput(customStart) ?? today;
        if (start > today) start = today;
        let end = parseDateInput(customEnd) ?? start;
        if (end < start) end = start;
        const maxEnd = addLocalDays(start, MAX_RANGE_DAYS - 1);
        if (end > maxEnd) end = maxEnd;
        if (end > today) end = today;
        return { start, end: addLocalDays(end, 1) };
      }, [range, customStart, customEnd]);
      const rangeStartMs = rangeBounds.start.getTime();
      const rangeEndMs = rangeBounds.end.getTime();
      const selectedStartDate = toDateInput(rangeBounds.start);
      const selectedEndDate = toDateInput(addLocalDays(rangeBounds.end, -1));
      const selectedDateLabel = selectedStartDate === selectedEndDate
        ? selectedStartDate
        : `${selectedStartDate} – ${selectedEndDate}`;
      const customStartDay = startOfLocalDay(parseDateInput(customStart) ?? new Date());
      const customMaxDay = addLocalDays(customStartDay, MAX_RANGE_DAYS - 1);
      const customEndMax = toDateInput(customMaxDay > todayDay ? todayDay : customMaxDay);
      React.useEffect(() => {
        let active = true;
        let retryTimer;
        const rangeKey = usageKey(selectedStartDate, selectedEndDate);
        const scheduleRetry = () => {
          if (!active || billingRetryRef.current >= 2) return;
          billingRetryRef.current += 1;
          retryTimer = setTimeout(() => {
            if (active) setBillingNonce((value) => value + 1);
          }, 1500);
        };
        // Mirrors publishSidebarToday: a transient failure keeps the last figure
        // on both halves, while an auth failure clears both.
        const holdsLastFigure = (next) => next.status === 'error'
          && next.code !== 'not-signed-in' && next.code !== 'unauthorized';
        const apply = (payload, initial) => {
          if (!active) return;
          if (payload.ok === true && payload.data !== null && typeof payload.data === 'object') {
            billingRetryRef.current = 0;
            setBilling(billingStateFrom(payload));
            return;
          }
          const next = billingStateFrom(payload);
          if (!initial) {
            // A background poll must not blank a working panel while the badge
            // keeps its figure on screen.
            setBilling((current) => (current.status === 'ready' && holdsLastFigure(next) ? current : next));
            return;
          }
          setBilling(next);
          if (next.code !== 'not-signed-in' && next.code !== 'unauthorized') scheduleRetry();
        };
        const adopt = () => {
          if (!active) return;
          const entry = usageStore.entries.get(rangeKey);
          if (entry === undefined) return;
          const next = billingStateFrom(entry.payload);
          setBilling((current) => (current.status === 'ready' && holdsLastFigure(next) ? current : next));
        };
        const pull = (initial) => {
          if (initial) setBilling({ status: 'loading', data: null, code: null, usageUrl: null });
          fetchUsage(selectedStartDate, selectedEndDate)
            .then((payload) => apply(payload, initial))
            .catch(() => {
              if (!active || !initial) return;
              setBilling({ status: 'error', data: null, code: 'network', usageUrl: null });
              scheduleRetry();
            });
        };
        setBillingTip(null);
        const cached = usageStore.entries.get(rangeKey);
        const usable = cached !== undefined && cached.payload?.ok === true
          && Date.now() - cached.at < USAGE_TTL_MS;
        if (usable) {
          billingRetryRef.current = 0;
          setBilling(billingStateFrom(cached.payload));
        } else {
          pull(true);
        }
        const unsubscribe = subscribeUsage(adopt);
        // The badge polls on its own; polling here keeps the panel fresh even
        // if that half lives in another document or loses its subscription.
        const poll = window.setInterval(() => {
          if (active) pull(false);
        }, 60000);
        return () => {
          active = false;
          clearTimeout(retryTimer);
          window.clearInterval(poll);
          unsubscribe();
        };
      }, [selectedStartDate, selectedEndDate, billingNonce]);
      const list = props.useSessions(SELECT_ALL);
      const data = React.useMemo(() => summarize(list), [list]);
      const attempted = React.useRef(new Set());
      const [hydrating, setHydrating] = React.useState(false);
      const pending = React.useMemo(() => {
        const byId = list?.byId;
        if (byId === null || typeof byId !== 'object' || attempted.current.size >= HYDRATE_LIMIT) return [];
        return Object.values(byId)
          .filter((row) => row.blank !== true
            && row.origin !== 'subagent'
            && row.formatStatus !== 'migration-required'
            && row.projectionValues?.tokenUsage === undefined
            && !attempted.current.has(row.id))
          .sort((left, right) => (right.updatedAt ?? 0) - (left.updatedAt ?? 0))
          .slice(0, HYDRATE_WAVE);
      }, [list]);
      React.useEffect(() => {
        const refresh = props.refreshProjections;
        if (pending.length === 0 || typeof refresh !== 'function') {
          setHydrating(false);
          return undefined;
        }
        let active = true;
        setHydrating(true);
        const requests = pending.map((row) => {
          attempted.current.add(row.id);
          return Promise.resolve().then(() => refresh(row.id)).catch(() => undefined);
        });
        Promise.all(requests).then(() => {
          if (active) setHydrating(false);
        });
        return () => {
          active = false;
        };
      }, [pending, props.refreshProjections]);
      const rangeOptions = RANGE_DEFS.map((definition) => ({
        id: definition.id,
        label: t(`range.${definition.id}`)
      }));
      const rangeRows = React.useMemo(() => data.rows.filter((row) =>
        row.updatedAt >= rangeStartMs && row.updatedAt < rangeEndMs
      ), [data.rows, rangeStartMs, rangeEndMs]);
      const normalizedQuery = query.trim().toLocaleLowerCase();
      const viewRows = React.useMemo(() => {
        if (normalizedQuery === '') return rangeRows;
        return rangeRows.filter((row) =>
          `${row.title} ${row.meta} ${row.cwd}`.toLocaleLowerCase().includes(normalizedQuery)
        );
      }, [rangeRows, normalizedQuery]);
      const aggregate = React.useMemo(() => sumRows(viewRows), [viewRows]);
      const groups = React.useMemo(() => groupRows(viewRows, chartMode, t), [viewRows, chartMode, t]);
      const total = aggregate.totals;
      const chartMax = groups.length > 0 ? Math.max(...groups.map((group) => group.usage.total), 1) : 1;
      const chartMinWidth = Math.max(groups.length * 58, 320);
      const loading = data.rows.length === 0 && data.phase === 'pending';
      const visibleRows = viewRows.slice(0, SESSION_LIMIT);
      const segments = [
        { key: 'input', label: t('stats.input'), value: total.uncachedInputTokens, color: 'var(--dsw-alias-state-business-primary)' },
        { key: 'output', label: t('stats.output'), value: total.outputTokens, color: 'var(--dsw-alias-state-warn-primary)' },
        { key: 'cacheRead', label: t('stats.cacheRead'), value: total.cacheReadTokens, color: 'var(--dsw-alias-state-success-primary)' },
        { key: 'cacheWrite', label: t('stats.cacheWrite'), value: total.cacheWriteTokens, color: 'var(--dsw-alias-state-idle-primary)' }
      ];
      const chartSegments = [
        segments[2],
        segments[0],
        segments[3],
        segments[1]
      ];
      const unitOptions = [
        { id: 'exact', label: t('unit.exact'), hint: t('unit.exact.hint') },
        { id: 'metric', label: t('unit.metric'), hint: t('unit.metric.hint') },
        { id: 'wan', label: t('unit.wan'), hint: t('unit.wan.hint') }
      ];
      const chartModes = [
        { id: 'session', label: t('chart.session') },
        { id: 'workspace', label: t('chart.workspace') }
      ];
      const chartSubtitle = t('chart.subtitle', {
        mode: chartMode === 'workspace' ? t('chart.workspace') : t('chart.session')
      });
      const billingData = billing.data;
      const billingItems = Array.isArray(billingData?.items) ? billingData.items : [];
      /*
       * The Platform picks the bucket width for the requested window: one day
       * comes back hourly, a longer window comes back daily. Expand the hourly
       * series to all 24 slots so empty hours stay visible instead of the strip
       * collapsing into a few scattered bars.
       */
      const billingBucket = String(billingData?.bucket ?? '');
      const billingIsHourly = billingItems.length > 0
        && (billingBucket === '3600'
          || billingBucket === '1h'
          || billingBucket === 'hour'
          || billingBucket === 'hourly'
          || (selectedStartDate === selectedEndDate
            && /^\d{4}-\d{2}-\d{2} \d{2}:00$/.test(String(billingItems[0]?.time ?? ''))));
      const billingSeries = billingIsHourly && selectedStartDate === selectedEndDate
        ? (() => {
          const byTime = new Map(billingItems.map((item) => [String(item.time), item]));
          const blank = () => ({
            time: '',
            promptCacheHit: 0,
            promptCacheMiss: 0,
            completion: 0,
            requests: 0,
            cost: 0
          });
          return Array.from({ length: 24 }, (_unused, hour) => {
            const label = `${selectedStartDate} ${String(hour).padStart(2, '0')}:00`;
            return { ...blank(), time: label, ...(byTime.get(label) ?? {}) };
          });
        })()
        : billingItems;
      const billingTokenTotal = (item) => (item.promptCacheHit ?? 0)
        + (item.promptCacheMiss ?? 0)
        + (item.completion ?? 0);
      const billingPeak = billingSeries.reduce((peak, item) =>
        item.cost > peak.cost ? item : peak, { cost: 0, time: '' });
      const billingAverage = billingSeries.length > 0 ? billingData.totals.cost / billingSeries.length : 0;
      /*
       * The Platform's own token total for the selected range: the exact
       * figure the sidebar badge reports for today, so the account's real
       * consumption can be read beside the local session totals above.
       */
      const billingPlatformTokens = billingData === null || billingData.totals === undefined
        ? 0
        : nonNegative(billingData.totals.promptCacheHit)
          + nonNegative(billingData.totals.promptCacheMiss)
          + nonNegative(billingData.totals.completion);
      /*
       * The header reads the Platform's own numbers whenever they are
       * available, because the sidebar badge shows exactly that figure. The
       * local session projection stays as the fallback for a signed-out
       * profile, where the Platform half cannot answer at all.
       */
      const accountTotalsReady = billing.status === 'ready'
        && billingData !== null && billingData.totals !== undefined;
      const panelTotals = accountTotalsReady
        ? {
          total: billingPlatformTokens,
          uncachedInputTokens: nonNegative(billingData.totals.promptCacheMiss),
          outputTokens: nonNegative(billingData.totals.completion),
          cacheReadTokens: nonNegative(billingData.totals.promptCacheHit),
          cacheWriteTokens: 0
        }
        : total;
      const panelHitRate = accountTotalsReady
        ? (() => {
          const hit = nonNegative(billingData.totals.promptCacheHit);
          const miss = nonNegative(billingData.totals.promptCacheMiss);
          return hit + miss > 0 ? hit / (hit + miss) : 0;
        })()
        : aggregate.cacheHit;
      /*
       * Account figures arrive a moment after the panel opens. Until they do,
       * the header shows a dash rather than the local lifetime figure, so it
       * never displays a number the sidebar would contradict.
       */
      const panelPending = !accountTotalsReady
        && (billing.status === 'idle' || billing.status === 'loading');
      const gaugeAngle = `${(panelPending ? 0 : panelHitRate) * 360}deg`;
      const billingMaxCost = Math.max(...billingSeries.map((item) => item.cost), 0.0001);
      const billingMaxTotal = Math.max(...billingSeries.map(billingTokenTotal), 0.0001);
      const billingAvgTop = Math.min(100, Math.max(0, (1 - billingAverage / billingMaxCost) * 100));
      const billingCostRunning = [];
      let billingRunningCost = 0;
      for (const item of billingSeries) {
        billingRunningCost += item.cost;
        billingCostRunning.push(billingRunningCost);
      }
      const billingMoneyTotal = billingCostRunning.length > 0
        ? billingCostRunning[billingCostRunning.length - 1]
        : 0;
      const billingTickStep = Math.max(1, Math.ceil(billingSeries.length / 6));
      const billingTicks = billingSeries.map((item, index) => {
        if (billingIsHourly) {
          if (billingSeries.length === 24) return String(item.time).slice(11, 13);
          return index % 6 === 0 ? String(item.time).slice(5, 13) : '';
        }
        if (index !== 0 && index !== billingSeries.length - 1 && index % billingTickStep !== 0) return '';
        return String(item.time).slice(5);
      });
      const billingRangeLabel = selectedDateLabel;
      const billingTipItem = billingTip === null ? null : billingSeries[billingTip.index] ?? null;
      const billingTipTokens = billingTipItem === null ? 0 : billingTokenTotal(billingTipItem);
      const billingTipRate = billingTipItem === null
        ? null
        : (() => {
          const hit = billingTipItem.promptCacheHit ?? 0;
          const denom = hit + (billingTipItem.promptCacheMiss ?? 0);
          return denom > 0 ? hit / denom : null;
        })();
      const billingTipLeft = billingTip === null
        ? 0
        : Math.min(92, Math.max(8, ((billingTip.index + 0.5) / Math.max(1, billingSeries.length)) * 100));
      const billingTickQuarter = billingTicks.map((tick, index) => billingIsHourly
        ? (billingSeries.length === 24 ? Number(tick) % 6 === 0 : index % 6 === 0)
        : (index === 0 || index === billingSeries.length - 1));
      /*
       * Hit-rate polyline: buckets without any prompt tokens are skipped so the
       * line breaks instead of pretending a 0% rate for an empty hour. Adjacent
       * marks form one segment; a lone mark still gets a dot.
       */
      const billingRateMarks = [];
      billingSeries.forEach((item, index) => {
        const hit = item.promptCacheHit ?? 0;
        const denom = hit + (item.promptCacheMiss ?? 0);
        if (denom <= 0) return;
        billingRateMarks.push({
          index,
          x: ((index + 0.5) / Math.max(1, billingSeries.length)) * 100,
          y: (1 - hit / denom) * 100
        });
      });
      const billingRateSegments = [];
      let billingRateRun = [];
      for (const mark of billingRateMarks) {
        if (billingRateRun.length > 0
          && mark.index !== billingRateRun[billingRateRun.length - 1].index + 1) {
          if (billingRateRun.length >= 2) billingRateSegments.push(billingRateRun);
          billingRateRun = [];
        }
        billingRateRun.push(mark);
      }
      if (billingRateRun.length >= 2) billingRateSegments.push(billingRateRun);
      const emptyFiltered = data.rows.length > 0 && viewRows.length === 0;
      const emptyForQuery = emptyFiltered && normalizedQuery !== '';
      const refresh = async () => {
        if (refreshing || typeof props.refreshProjections !== 'function') return;
        setRefreshing(true);
        billingRetryRef.current = 0;
        setBillingNonce((value) => value + 1);
        window.dispatchEvent(new Event('dsh-token-usage:refresh'));
        try {
          const targets = viewRows.slice(0, 40);
          await Promise.allSettled(targets.map((row) =>
            Promise.resolve().then(() => props.refreshProjections(row.id))
          ));
        } finally {
          setRefreshing(false);
        }
      };
      const handleCustomStart = (value) => {
        billingRetryRef.current = 0;
        const today = startOfLocalDay(new Date());
        let start = parseDateInput(value) ?? today;
        if (start > today) start = today;
        setCustomStart(toDateInput(start));
        let end = parseDateInput(customEnd) ?? start;
        if (end < start) end = start;
        const maxEnd = addLocalDays(start, MAX_RANGE_DAYS - 1);
        if (end > maxEnd) end = maxEnd;
        if (end > today) end = today;
        setCustomEnd(toDateInput(end));
      };
      const handleCustomEnd = (value) => {
        billingRetryRef.current = 0;
        const today = startOfLocalDay(new Date());
        let start = parseDateInput(customStart) ?? today;
        if (start > today) start = today;
        let end = parseDateInput(value) ?? start;
        if (end < start) end = start;
        const maxEnd = addLocalDays(start, MAX_RANGE_DAYS - 1);
        if (end > maxEnd) end = maxEnd;
        if (end > today) end = today;
        setCustomEnd(toDateInput(end));
      };

      return h('div', { className: 'dsu-page' },
        h('style', null, CSS),
        h('main', { className: 'dsu-shell' },
          h('header', { className: 'dsu-header' },
            h('div', { className: 'dsu-title-wrap' },
              h('div', { className: 'dsu-mark', 'aria-hidden': 'true' }, h(BarMark)),
              h('div', null,
                h('div', { className: 'dsu-eyebrow' }, t('page.eyebrow')),
                h('h1', { className: 'dsu-title', id: 'dsu-title' }, t('page.title')),
                h('p', { className: 'dsu-subtitle' }, t('page.subtitle'))
              )
            ),
            h('div', { className: 'dsu-header-tools' },
              h('div', {
                className: 'dsu-unit',
                role: 'group',
                'aria-label': t('unit.label')
              },
                h('span', { className: 'dsu-unit-label' }, t('unit.label')),
                unitOptions.map((option) => h('button', {
                  key: option.id,
                  type: 'button',
                  className: 'dsu-unit-btn',
                  'aria-pressed': unit === option.id,
                  title: option.hint,
                  onClick: () => setUnit(option.id)
                }, option.label))
              ),
              h('div', { className: 'dsu-header-actions' },
                h('button', {
                  type: 'button',
                  className: `dsu-icon-btn${refreshing ? ' refreshing' : ''}`,
                  onClick: refresh,
                  disabled: refreshing,
                  'aria-label': t('refresh'),
                  title: t('refresh')
                },
                  h('svg', {
                    viewBox: '0 0 20 20',
                    width: 15,
                    height: 15,
                    fill: 'none',
                    'aria-hidden': 'true'
                  },
                    h('path', {
                      d: 'M16 4.5v4h-4',
                      stroke: 'currentColor',
                      strokeWidth: 1.7,
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round'
                    }),
                    h('path', {
                      d: 'M15.8 8.3A6 6 0 1 0 16 12',
                      stroke: 'currentColor',
                      strokeWidth: 1.7,
                      strokeLinecap: 'round'
                    })
                  )
                ),
                h('div', { className: 'dsu-live', role: 'status' },
                  h('span', { className: 'dsu-live-dot', 'aria-hidden': 'true' }),
                  t('live')
                )
              )
            )
          ),
          h('div', { className: 'dsu-toolbar' },
            h('div', {
              className: 'dsu-range',
              role: 'group',
              'aria-label': t('range.label')
            },
              rangeOptions.map((option) => h('button', {
                key: option.id,
                type: 'button',
                className: 'dsu-range-btn',
                'aria-pressed': range === option.id,
                onClick: () => {
                  billingRetryRef.current = 0;
                  setRange(option.id);
                }
              }, option.label))
            ),
            range === 'custom'
              ? h('div', { className: 'dsu-custom-range' },
                h('label', { className: 'dsu-date-field' },
                  h('span', null, t('range.startDate')),
                  h('input', {
                    type: 'date',
                    className: 'dsu-date-input',
                    value: customStart,
                    max: todayValue,
                    'aria-label': t('range.startDate'),
                    onChange: (event) => handleCustomStart(event.target.value)
                  })
                ),
                h('span', { className: 'dsu-date-sep', 'aria-hidden': 'true' }, '–'),
                h('label', { className: 'dsu-date-field' },
                  h('span', null, t('range.endDate')),
                  h('input', {
                    type: 'date',
                    className: 'dsu-date-input',
                    value: customEnd,
                    min: customStart,
                    max: customEndMax,
                    'aria-label': t('range.endDate'),
                    onChange: (event) => handleCustomEnd(event.target.value)
                  })
                ),
                h('span', { className: 'dsu-date-hint' }, t('range.maxDays'))
              )
              : null,
            h('div', { className: 'dsu-scope-note' }, t('range.note'))
          ),
          h('section', { className: 'dsu-hero', 'aria-label': t('page.title') },
            h('div', { className: 'dsu-hero-main' },
              h('div', { className: 'dsu-hero-label' }, t('hero.total')),
              h('div', {
                className: 'dsu-hero-value',
                title: panelPending ? '' : formatNumber(panelTotals.total)
              }, panelPending ? '—' : formatTokens(panelTotals.total, unit)),
              h('div', { className: 'dsu-hero-meta' },
                panelPending
                  ? t('billing.loading')
                  : accountTotalsReady
                    ? t('hero.accountMeta')
                    : viewRows.length > 0
                      ? t('hero.meta', { sessions: viewRows.length })
                      : data.rows.length > 0 ? t('chart.empty') : t('hero.empty')
              )
            ),
            h('div', { className: 'dsu-hero-side' },
              h('div', {
                className: 'dsu-gauge',
                style: { '--dsu-gauge-angle': gaugeAngle },
                role: 'img',
                'aria-label': `${t('hero.cacheHit')}: ${formatPercent(panelHitRate)}`
              },
                h('div', { className: 'dsu-gauge-inner' },
                  h('div', { className: 'dsu-gauge-value' },
                    panelPending ? '—' : formatPercent(panelHitRate)),
                  h('div', { className: 'dsu-gauge-label' }, t('hero.cacheHit'))
                )
              ),
              h('div', { className: 'dsu-gauge-hint' }, t('hero.cacheHint'))
            )
          ),
          h('section', { className: 'dsu-stats', 'aria-label': t('page.title') },
            h(StatCard, {
              label: t('stats.input'),
              value: panelPending ? null : panelTotals.uncachedInputTokens,
              hint: t('stats.input.hint'),
              color: 'var(--dsw-alias-state-business-primary)',
              unit
            }),
            h(StatCard, {
              label: t('stats.output'),
              value: panelPending ? null : panelTotals.outputTokens,
              hint: t('stats.output.hint'),
              color: 'var(--dsw-alias-state-warn-primary)',
              unit
            }),
            h(StatCard, {
              label: t('stats.cacheRead'),
              value: panelPending ? null : panelTotals.cacheReadTokens,
              hint: t('stats.cacheRead.hint'),
              color: 'var(--dsw-alias-state-success-primary)',
              unit
            }),
            h(StatCard, {
              label: t('stats.cacheWrite'),
              value: panelPending ? null : panelTotals.cacheWriteTokens,
              hint: accountTotalsReady ? t('stats.cacheWrite.platformHint') : t('stats.cacheWrite.hint'),
              color: 'var(--dsw-alias-state-idle-primary)',
              unit
            })
          ),
          h('section', { className: 'dsu-billing', 'aria-labelledby': 'dsu-billing-title' },
            h('div', { className: 'dsu-billing-head' },
              h('div', { className: 'dsu-billing-heading' },
                h('h2', { className: 'dsu-billing-title', id: 'dsu-billing-title' }, t('billing.title')),
                h('p', { className: 'dsu-billing-sub' }, t('billing.subtitle'))
              ),
              h('div', { className: 'dsu-billing-side' },
                billing.status === 'ready' && billingData !== null
                  ? h('div', { className: 'dsu-billing-money' },
                    h('div', { className: 'dsu-billing-amount' },
                      formatMoney(billingData.totals.cost, billingData.currency)
                    ),
                    h('div', { className: 'dsu-billing-stats' },
                      h('div', { className: 'dsu-billing-stat' },
                        h('span', null, billingIsHourly ? t('billing.averageHour') : t('billing.average')),
                        h('strong', null, formatMoney(billingAverage, billingData.currency))
                      ),
                      h('div', { className: 'dsu-billing-stat' },
                        h('span', null, billingIsHourly ? t('billing.peakHour') : t('billing.peak')),
                        h('strong', null,
                          billingPeak.cost > 0
                            ? `${billingIsHourly ? `${String(billingPeak.time).slice(11, 16)} · ` : ''}${formatMoney(billingPeak.cost, billingData.currency)}`
                            : '—'
                        )
                      ),
                      h('div', { className: 'dsu-billing-stat' },
                        h('span', null, t('billing.requests')),
                        h('strong', null, formatNumber(billingData.totals.requests))
                      )
                    )
                  )
                  : null,
                billingRangeLabel !== ''
                  ? h('span', { className: 'dsu-billing-range' },
                    billingData === null
                      ? billingRangeLabel
                      : `${billingRangeLabel} · ${billingIsHourly ? t('billing.hourly') : t('billing.daily')}`
                  )
                  : null
              )
            ),
            billing.status === 'idle' || billing.status === 'loading'
              ? h('div', { className: 'dsu-billing-loading', role: 'status' }, t('billing.loading'))
              : billing.status === 'signed-out'
                ? h('div', { className: 'dsu-billing-empty' },
                  h('div', { className: 'dsu-billing-empty-title' }, t('billing.notSignedIn')),
                  h('p', { className: 'dsu-billing-empty-body' }, t('billing.notSignedInBody')),
                  h('div', { className: 'dsu-billing-actions' },
                    h('a', {
                      className: 'dsu-billing-action',
                      href: billing.usageUrl || 'https://platform.deepseek.com/usage',
                      target: '_blank',
                      rel: 'noreferrer'
                    }, t('billing.openUsage')),
                    h('button', {
                      type: 'button',
                      className: 'dsu-billing-action',
                      onClick: () => setBillingNonce((value) => value + 1)
                    }, t('billing.retry'))
                  )
                )
                : billing.status === 'ready' && billingData !== null
                  ? h('div', null,
                    billingSeries.length > 0
                      ? h('div', null,
                        h('div', { className: 'dsu-billing-group-head' },
                          h('h3', { className: 'dsu-billing-group-title' }, t('billing.tokenTitle')),
                          h('div', { className: 'dsu-billing-legend', 'aria-hidden': 'true' },
                            [
                              ['is-hit', 'billing.legendHit'],
                              ['is-miss', 'billing.legendMiss'],
                              ['is-out', 'billing.legendOut'],
                              ['is-rate', 'billing.legendRate']
                            ].map(([kind, key]) => h('span', {
                              key: kind,
                              className: 'dsu-billing-legend-item'
                            },
                              h('span', { className: `dsu-billing-legend-swatch ${kind}`, 'aria-hidden': 'true' }),
                              t(key)
                            ))
                          )
                        ),
                        h('div', {
                          className: 'dsu-billing-plot',
                          onMouseLeave: () => setBillingTip(null)
                        },
                          h('div', { className: 'dsu-billing-trend', 'aria-hidden': 'true' },
                            billingSeries.map((item, index) => {
                              const hit = item.promptCacheHit ?? 0;
                              const miss = item.promptCacheMiss ?? 0;
                              const out = item.completion ?? 0;
                              const totalTokens = hit + miss + out;
                              return h('div', {
                                key: item.time,
                                className: `dsu-billing-slot${billingTip !== null && billingTip.index === index ? ' is-active' : ''}`,
                                onMouseEnter: () => setBillingTip({ index, source: 'token' })
                              },
                                h('div', {
                                  className: `dsu-billing-bar${totalTokens > 0 ? '' : ' is-idle'}`,
                                  style: { height: `${(totalTokens / billingMaxTotal) * 100}%` }
                                },
                                  totalTokens > 0
                                    ? [
                                      h('div', {
                                        key: 'out',
                                        className: 'dsu-billing-seg is-out',
                                        style: { height: `${(out / totalTokens) * 100}%` }
                                      }),
                                      h('div', {
                                        key: 'miss',
                                        className: 'dsu-billing-seg is-miss',
                                        style: { height: `${(miss / totalTokens) * 100}%` }
                                      }),
                                      h('div', {
                                        key: 'hit',
                                        className: 'dsu-billing-seg is-hit',
                                        style: { height: `${(hit / totalTokens) * 100}%` }
                                      })
                                    ]
                                    : null
                                )
                              );
                            }),
                            h('div', { className: 'dsu-billing-rate-mid', 'aria-hidden': 'true' }),
                            billingRateSegments.map((segment, segmentIndex) => h('svg', {
                              key: `rate-${segmentIndex}`,
                              className: 'dsu-billing-rate',
                              viewBox: '0 0 100 100',
                              preserveAspectRatio: 'none',
                              'aria-hidden': 'true'
                            },
                              h('polyline', {
                                points: segment.map((mark) => `${mark.x},${mark.y}`).join(' '),
                                fill: 'none',
                                stroke: 'var(--dsw-alias-label-secondary)',
                                strokeWidth: 1.5,
                                strokeLinecap: 'round',
                                strokeLinejoin: 'round',
                                vectorEffect: 'non-scaling-stroke'
                              })
                            )),
                            billingRateMarks.map((mark) => h('div', {
                              key: `rate-dot-${mark.index}`,
                              className: 'dsu-billing-rate-dot',
                              style: { left: `${mark.x}%`, top: `${mark.y}%` }
                            })),
                            h('span', { className: 'dsu-billing-scale is-left', 'aria-hidden': 'true' },
                              `${t('billing.scalePeak')} ${formatTokens(billingMaxTotal, unit)}`
                            ),
                            h('span', { className: 'dsu-billing-scale is-right', 'aria-hidden': 'true' }, '100%')
                          ),
                          h('div', { className: 'dsu-billing-axis', 'aria-hidden': 'true' },
                            billingTicks.map((tick, index) => h('span', {
                              key: String(index),
                              className: `dsu-billing-tick${billingTickQuarter[index] ? ' is-quarter' : ''}${billingTip !== null && billingTip.index === index ? ' is-active' : ''}`
                            }, tick))
                          ),
                          billingTipItem !== null && billingTip.source === 'token'
                            ? h('div', {
                              className: 'dsu-billing-tip',
                              role: 'tooltip',
                              style: { left: `${billingTipLeft}%` }
                            },
                              h('div', { className: 'dsu-billing-tip-time' }, billingTipItem.time),
                              h('div', { className: 'dsu-billing-tip-row' },
                                h('span', null, t('billing.totalTokens')),
                                h('strong', null, formatTokens(billingTipTokens, unit))
                              ),
                              h('div', { className: 'dsu-billing-tip-row' },
                                h('span', null, t('billing.legendHit')),
                                h('strong', null, formatTokens(billingTipItem.promptCacheHit ?? 0, unit))
                              ),
                              h('div', { className: 'dsu-billing-tip-row' },
                                h('span', null, t('billing.legendMiss')),
                                h('strong', null, formatTokens(billingTipItem.promptCacheMiss ?? 0, unit))
                              ),
                              h('div', { className: 'dsu-billing-tip-row' },
                                h('span', null, t('billing.legendRate')),
                                h('strong', null, billingTipRate === null ? '—' : formatRate(billingTipRate))
                              )
                            )
                            : null
                        ),
                        h('div', { className: 'dsu-billing-group-head' },
                          h('h3', { className: 'dsu-billing-group-title' }, t('billing.moneyTitle')),
                          h('div', { className: 'dsu-billing-legend', 'aria-hidden': 'true' },
                            [
                              ['is-cost', 'billing.legendCost'],
                              ['is-avg', 'billing.legendAvg']
                            ].map(([kind, key]) => h('span', {
                              key: kind,
                              className: 'dsu-billing-legend-item'
                            },
                              h('span', { className: `dsu-billing-legend-swatch ${kind}`, 'aria-hidden': 'true' }),
                              t(key)
                            ))
                          )
                        ),
                        h('div', {
                          className: 'dsu-billing-plot',
                          onMouseLeave: () => setBillingTip(null)
                        },
                          h('div', { className: 'dsu-billing-spend', 'aria-hidden': 'true' },
                            billingSeries.map((item, index) => h('div', {
                              key: item.time,
                              className: `dsu-billing-slot${billingTip !== null && billingTip.index === index ? ' is-active' : ''}`,
                              onMouseEnter: () => setBillingTip({ index, source: 'money' })
                            },
                              h('div', {
                                className: 'dsu-billing-cost-bar',
                                style: {
                                  height: `${(item.cost / billingMaxCost) * 100}%`,
                                  minHeight: item.cost > 0 ? '3px' : '0'
                                }
                              })
                            )),
                            h('div', {
                              className: 'dsu-billing-avg',
                              'aria-hidden': 'true',
                              style: { top: `${billingAvgTop}%` }
                            })
                          ),
                          h('div', { className: 'dsu-billing-axis', 'aria-hidden': 'true' },
                            billingTicks.map((tick, index) => h('span', {
                              key: String(index),
                              className: `dsu-billing-tick${billingTickQuarter[index] ? ' is-quarter' : ''}${billingTip !== null && billingTip.index === index ? ' is-active' : ''}`
                            }, tick))
                          ),
                          billingTipItem !== null && billingTip.source === 'money'
                            ? h('div', {
                              className: 'dsu-billing-tip is-inside',
                              role: 'tooltip',
                              style: { left: `${billingTipLeft}%` }
                            },
                              h('div', { className: 'dsu-billing-tip-time' }, billingTipItem.time),
                              h('div', { className: 'dsu-billing-tip-row' },
                                h('span', null, t('billing.legendCost')),
                                h('strong', null, formatMoney(billingTipItem.cost, billingData.currency))
                              ),
                              h('div', { className: 'dsu-billing-tip-row' },
                                h('span', null, t('billing.cumulative')),
                                h('strong', null, formatMoney(billingCostRunning[billingTip.index] ?? 0, billingData.currency))
                              ),
                              h('div', { className: 'dsu-billing-tip-row' },
                                h('span', null, t('billing.requests')),
                                h('strong', null, formatNumber(billingTipItem.requests ?? 0))
                              ),
                              h('div', { className: 'dsu-billing-tip-row' },
                                h('span', null, t('billing.share')),
                                h('strong', null,
                                  billingMoneyTotal > 0
                                    ? `${((billingTipItem.cost / billingMoneyTotal) * 100).toFixed(2)}%`
                                    : '—'
                                )
                              )
                            )
                            : null
                        )
                      )
                      : null,
                    billingSeries.length === 0
                      ? h('p', { className: 'dsu-billing-note' }, t('billing.noUsage'))
                      : null
                  )
                  : h('div', { className: 'dsu-billing-empty' },
                    h('div', { className: 'dsu-billing-empty-title' }, t('billing.error')),
                    h('p', { className: 'dsu-billing-empty-body' },
                      billing.code === 'unauthorized' ? t('billing.unauthorized') : t('billing.errorBody')
                    ),
                    h('div', { className: 'dsu-billing-actions' },
                      h('button', {
                        type: 'button',
                        className: 'dsu-billing-action',
                        onClick: () => setBillingNonce((value) => value + 1)
                      }, t('billing.retry')),
                      h('a', {
                        className: 'dsu-billing-action',
                        href: billing.usageUrl || 'https://platform.deepseek.com/usage',
                        target: '_blank',
                        rel: 'noreferrer'
                      }, t('billing.openUsage'))
                    ),
                    h('p', { className: 'dsu-billing-note' },
                      `${t('billing.errorCode')}: ${billing.code || 'unknown'}`
                    )
                  )
          ),
          h(BalanceConfigPanel, { translate: t }),
          h('section', { className: 'dsu-card', 'aria-labelledby': 'dsu-chart-title' },
            h('div', { className: 'dsu-card-head' },
              h('div', null,
                h('h2', { className: 'dsu-card-title', id: 'dsu-chart-title' }, t('chart.title')),
                h('p', { className: 'dsu-card-sub' }, chartSubtitle)
              ),
              h('div', {
                className: 'dsu-view-toggle',
                role: 'group',
                'aria-label': t('chart.groupBy')
              },
                chartModes.map((mode) => h('button', {
                  key: mode.id,
                  type: 'button',
                  className: 'dsu-view-btn',
                  'aria-pressed': chartMode === mode.id,
                  onClick: () => setChartMode(mode.id)
                }, mode.label))
              )
            ),
            groups.length === 0
              ? h('div', { className: 'dsu-chart-empty' }, t('chart.empty'))
              : h('div', null,
                h('div', { className: 'dsu-chart-legend' },
                  chartSegments.map((segment) => h('div', {
                    key: segment.key,
                    className: 'dsu-chart-legend-item'
                  },
                    h('span', { className: 'dsu-dot', style: { background: segment.color }, 'aria-hidden': 'true' }),
                    h('span', null, segment.label)
                  ))
                ),
                h('div', { className: 'dsu-chart-scroll' },
                  h('div', { style: { minWidth: `${chartMinWidth}px` } },
                    h('div', {
                      className: 'dsu-chart-plot',
                      style: { gridTemplateColumns: `repeat(${Math.max(groups.length, 1)}, minmax(0, 1fr))` }
                    },
                      groups.map((group) => {
                        const values = {
                          cacheRead: group.usage.cacheReadTokens,
                          input: group.usage.uncachedInputTokens,
                          cacheWrite: group.usage.cacheWriteTokens,
                          output: group.usage.outputTokens
                        };
                        return h('div', {
                          key: group.key,
                          className: 'dsu-chart-cell',
                          title: `${group.label} · ${formatNumber(group.usage.total)}`
                        },
                          h('div', {
                            className: 'dsu-chart-bar',
                            style: { height: `${Math.max(2, (group.usage.total / chartMax) * 100)}%` }
                          },
                            chartSegments
                              .filter((segment) => values[segment.key] > 0)
                              .map((segment) => h('div', {
                                key: segment.key,
                                className: 'dsu-chart-seg',
                                style: {
                                  height: `${(values[segment.key] / group.usage.total) * 100}%`,
                                  background: segment.color
                                }
                              }))
                          )
                        );
                      })
                    ),
                    h('div', {
                      className: 'dsu-chart-labels',
                      style: { gridTemplateColumns: `repeat(${Math.max(groups.length, 1)}, minmax(0, 1fr))` }
                    },
                      groups.map((group) => h('div', {
                        key: group.key,
                        className: 'dsu-chart-label',
                        title: group.label
                      },
                        h('span', { className: 'dsu-chart-label-name' }, group.label),
                        h('span', { className: 'dsu-chart-label-value' }, formatTokens(group.usage.total, unit))
                      ))
                    )
                  )
                )
              ),
            groups.some((group) => group.key === '__other__')
              ? h('p', { className: 'dsu-note' }, t('chart.note'))
              : null
          ),
          h('section', { className: 'dsu-section', 'aria-labelledby': 'dsu-sessions-title' },
            h('div', { className: 'dsu-section-head' },
              h('div', null,
                h('h2', { className: 'dsu-section-title', id: 'dsu-sessions-title' }, t('list.title')),
                h('span', { className: 'dsu-section-count' },
                  t('list.count', { n: viewRows.length }),
                  hydrating ? ` · ${t('hydrating')}` : ''
                )
              ),
              h('div', { className: 'dsu-list-tools' },
                h('input', {
                  type: 'search',
                  className: 'dsu-search-input',
                  value: query,
                  placeholder: t('search.placeholder'),
                  'aria-label': t('search.aria'),
                  spellCheck: false,
                  onChange: (event) => setQuery(event.target.value)
                })
              )
            ),
            loading
              ? h('div', { className: 'dsu-loading', role: 'status' }, t('loading'))
              : data.rows.length === 0
                ? h(EmptyState, { title: t('empty.title'), body: t('empty.body') })
                : emptyFiltered
                  ? h(EmptyState, {
                    title: emptyForQuery ? t('empty.noMatches') : t('empty.filtered'),
                    body: emptyForQuery ? t('empty.noMatchesBody') : t('empty.filteredBody')
                  })
                  : h('div', { className: 'dsu-table', role: 'table', 'aria-label': t('list.title') },
                    h('div', { className: 'dsu-head-row', role: 'row' },
                      h('span', { role: 'columnheader' }, t('list.session')),
                      h('span', { className: 'dsu-head-num', role: 'columnheader' }, t('list.cache')),
                      h('span', { className: 'dsu-head-num', role: 'columnheader' }, t('list.input')),
                      h('span', { className: 'dsu-head-num', role: 'columnheader' }, t('list.output')),
                      h('span', { className: 'dsu-head-num', role: 'columnheader' }, t('list.total')),
                      h('span', { className: 'dsu-head-num', role: 'columnheader' }, t('list.lastActive'))
                    ),
                    visibleRows.map((row) => h(SessionRow, { key: row.id, row, t, unit }))
                  ),
            viewRows.length > SESSION_LIMIT
              ? h('p', { className: 'dsu-note' }, t('list.limit', { n: SESSION_LIMIT }))
              : null,
            h('p', { className: 'dsu-note' }, t('note'))
          )
        )
      );
    }

/**
 * Bottom-right whale companion: a rotating mascot beside a small readout.
 *
 * "Remaining" is read from the Platform's own balance endpoint through the
 * Host bridge, so it is never a locally invented number. Today's spend and
 * token total come from the shared usage store's today window, which keeps
 * them identical to the sidebar badge.
 */

/** Two mascot frames, each a transparent WebP encoded inline. */
const WHALE_FRAMES = [
  'data:image/webp;base64,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',
  'data:image/webp;base64,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'
];

/** Rotate the mascot on this cadence. */
const WHALE_FRAME_MS = 4000;


/** Styles for the corner widget; scoped under its own class names. */
const WHALE_CORNER_CSS = `
  .dsu-whale {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 1000;
    width: 116px;
    pointer-events: auto;
    font-family: inherit;
    color: var(--dsw-alias-label-primary);
  }
  .dsu-whale-art {
    position: relative;
    flex: none;
    width: 116px;
    user-select: none;
  }
  .dsu-whale-img {
    display: block;
    width: 116px;
    height: auto;
    transition: opacity .45s ease;
    -webkit-mask-image: linear-gradient(to bottom, #000 82%, transparent 99%);
    mask-image: linear-gradient(to bottom, #000 82%, transparent 99%);
  }
  .dsu-whale-q {
    position: absolute;
    left: -9px;
    top: -11px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #1e40af;
    color: #fff;
    font: 700 15px/24px Georgia, "Times New Roman", serif;
    text-align: center;
    box-shadow: 0 2px 8px rgba(15, 17, 21, .28);
  }
  /* The bubble rests on the mascot's head, offset to the upper left. */
  .dsu-whale-bubble {
    position: absolute;
    left: -34px;
    bottom: 104px;
    box-sizing: border-box;
    width: 132px;
    padding: 8px 11px 9px;
    border: 1px solid var(--dsw-alias-border-l2);
    border-radius: 14px;
    background: var(--dsw-alias-bg-layer-1);
    box-shadow: 0 8px 24px rgba(15, 17, 21, .16);
  }
  .dsu-whale-tail {
    position: absolute;
    right: 34px;
    bottom: -6px;
    width: 11px;
    height: 11px;
    border-right: 1px solid var(--dsw-alias-border-l2);
    border-bottom: 1px solid var(--dsw-alias-border-l2);
    border-radius: 0 0 3px 0;
    background: var(--dsw-alias-bg-layer-1);
    transform: rotate(45deg);
  }
  /* One grid for the whole readout: the figure column is right-aligned and
     the label column is sized to its widest entry, so every figure ends on
     one edge and every label starts on another. */
  .dsu-whale-grid {
    display: grid;
    grid-template-columns: 1fr max-content;
    align-items: baseline;
    column-gap: 11px;
    row-gap: 3px;
  }
  .dsu-whale-divider {
    grid-column: 1 / -1;
    height: 1px;
    margin: 3px 0;
    background: var(--dsw-alias-border-l1);
  }
  .dsu-whale-hero-value {
    font-size: 20px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: -.03em;
    line-height: 1.1;
    text-align: right;
    white-space: nowrap;
  }
  .dsu-whale-hero-value.is-negative {
    color: var(--dsw-alias-state-error-primary);
  }
  .dsu-whale-hero-value.is-pending {
    color: var(--dsw-alias-label-secondary);
  }
  .dsu-whale-value {
    color: var(--dsw-alias-label-primary);
    font-size: 11.5px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    text-align: right;
    white-space: nowrap;
  }
  .dsu-whale-value.is-pending {
    color: var(--dsw-alias-label-secondary);
  }
  .dsu-whale-label {
    color: var(--dsw-alias-label-secondary);
    font-size: 10px;
    line-height: 1.2;
    white-space: nowrap;
  }
  @media (max-width: 640px) {
    .dsu-whale { width: 84px; }
    .dsu-whale-art, .dsu-whale-img { width: 84px; }
    .dsu-whale-bubble { width: 122px; padding: 7px 10px 8px; left: -30px; bottom: 74px; }
    .dsu-whale-hero-value { font-size: 17px; }
    .dsu-whale-value { font-size: 11px; }
  }
`;

/**
 * Ask the Host for the signed-in account's remaining balance.
 * @returns the balance record.
 * @throws when the route reports a failure or an unusable amount.
 */
async function fetchBalance() {
  const response = await fetch(BILLING_ROUTE, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'content-type': 'application/json',
      'x-dsh-usage-client': '1'
    },
    body: JSON.stringify({
      action: 'balance',
      tz: -new Date().getTimezoneOffset() * 60
    })
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch (_error) {
    payload = null;
  }
  if (payload === null || typeof payload !== 'object' || payload.ok !== true) {
    throw new Error('balance-unavailable');
  }
  const total = payload.data === undefined ? Number.NaN : payload.data.total;
  if (!(typeof total === 'number' && Number.isFinite(total))) {
    throw new Error('balance-unavailable');
  }
  return {
    total,
    currency: typeof payload.data.currency === 'string' ? payload.data.currency : ''
  };
}

/**
 * Configuration for how the remaining balance is read.
 *
 * The default is DeepSeek's documented endpoint, authenticated with the key
 * DSH already stores. Because operators may front the account differently,
 * the endpoint, field path, currency, and key are all editable, and the
 * diagnose action reports exactly what the Host saw.
 * @param props - carries the bound translate function.
 * @returns the configuration card.
 */
function BalanceConfigPanel(props) {
  const t = typeof props.translate === 'function' ? props.translate : (key) => key;
  const [config, setConfig] = React.useState(null);
  const [draft, setDraft] = React.useState(null);
  const [busy, setBusy] = React.useState('');
  const [status, setStatus] = React.useState(null);

  const post = async (action, extra) => {
    const response = await fetch(BILLING_ROUTE, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'content-type': 'application/json',
        'x-dsh-usage-client': '1'
      },
      body: JSON.stringify({
        action,
        tz: -new Date().getTimezoneOffset() * 60,
        ...extra
      })
    });
    let payload = null;
    try {
      payload = await response.json();
    } catch (_error) {
      payload = null;
    }
    if (payload === null || typeof payload !== 'object') {
      throw new Error('bad-response');
    }
    return payload;
  };

  React.useEffect(() => {
    let active = true;
    post('balanceConfig', {})
      .then((payload) => {
        if (!active) return;
        if (payload.ok === true && payload.data?.config !== undefined) {
          setConfig(payload.data.config);
          setDraft(payload.data.config);
        } else {
          // Older Host halves reject unknown actions; say so instead of
          // spinning forever on a request that can never succeed.
          setStatus({ text: t('balance.hostTooOld'), error: true });
          setDraft({
            mode: 'official',
            url: 'https://api.deepseek.com/user/balance',
            field: 'balance_infos.0.total_balance',
            currency: 'CNY',
            apiKey: ''
          });
        }
      })
      .catch(() => {
        if (!active) return;
        setStatus({ text: t('balance.hostUnreachable'), error: true });
      });
    return () => {
      active = false;
    };
  }, []);

  const patch = (key, value) => {
    setDraft((current) => (current === null ? current : { ...current, [key]: value }));
  };

  const save = async () => {
    if (draft === null) return;
    setBusy('save');
    setStatus(null);
    try {
      const payload = await post('balanceSave', { config: draft });
      if (payload.ok === true && payload.data?.config !== undefined) {
        setConfig(payload.data.config);
        setDraft(payload.data.config);
        setStatus({ text: t('balance.saved'), error: false });
      } else {
        setStatus({ text: t('balance.saveFailed'), error: true });
      }
    } catch (_error) {
      setStatus({ text: t('balance.saveFailed'), error: true });
    } finally {
      setBusy('');
    }
  };

  const diagnose = async () => {
    setBusy('diagnose');
    setStatus(null);
    try {
      const payload = await post('balanceDiagnose', {});
      const data = payload.ok === true ? payload.data : null;
      if (data !== null && data.ok === true) {
        const shown = data.balance === undefined
          ? '—'
          : `${data.balance.currency} ${data.balance.total}`;
        setStatus({ text: t('balance.diagnoseOk', { value: shown, url: data.url }), error: false });
      } else if (data !== null) {
        setStatus({ text: t('balance.diagnoseFail', { code: data.error || 'unknown' }), error: true });
      } else {
        setStatus({ text: t('balance.diagnoseFail', { code: payload.code || 'unknown' }), error: true });
      }
    } catch (_error) {
      setStatus({ text: t('balance.diagnoseFail', { code: 'bad-response' }), error: true });
    } finally {
      setBusy('');
    }
  };

  const head = h('div', { className: 'dsu-card-head' },
    h('div', null,
      h('h2', { className: 'dsu-card-title' }, t('balance.title')),
      h('p', { className: 'dsu-card-sub' }, t('balance.subtitle'))
    ),
    h('div', { className: 'dsu-balance-actions' },
      h('button', {
        type: 'button',
        className: 'dsu-balance-button',
        onClick: diagnose,
        disabled: busy !== '' || draft === null
      }, busy === 'diagnose' ? t('balance.diagnosing') : t('balance.diagnose')),
      h('button', {
        type: 'button',
        className: 'dsu-balance-button',
        onClick: save,
        disabled: busy !== '' || draft === null
      }, busy === 'save' ? t('balance.saving') : t('balance.save'))
    )
  );

  if (draft === null) {
    return h('section', { className: 'dsu-card dsu-balance-config' }, head,
      h('p', { className: 'dsu-note' }, t('balance.loading'))
    );
  }

  const field = (key, labelKey, placeholderKey, options) => h('div', { className: 'dsu-balance-field' },
    h('label', { htmlFor: `dsu-balance-${key}` }, t(labelKey)),
    options === undefined
      ? h('input', {
        id: `dsu-balance-${key}`,
        type: 'text',
        value: draft[key],
        placeholder: placeholderKey === undefined ? '' : t(placeholderKey),
        onChange: (event) => patch(key, event.target.value)
      })
      : h('select', {
        id: `dsu-balance-${key}`,
        value: draft[key],
        onChange: (event) => patch(key, event.target.value)
      }, options.map((option) => h('option', { key: option, value: option }, t(`balance.mode.${option}`))))
  );

  return h('section', { className: 'dsu-card dsu-balance-config' },
    head,
    h('div', { className: 'dsu-balance-grid' },
      field('mode', 'balance.mode', undefined, ['official', 'custom']),
      field('currency', 'balance.currency', 'balance.placeholder.currency'),
      field('url', 'balance.url', 'balance.placeholder.url'),
      field('field', 'balance.field', 'balance.placeholder.field'),
      field('apiKey', 'balance.apiKey', 'balance.placeholder.apiKey')
    ),
    status !== null
      ? h('p', { className: `dsu-balance-status${status.error ? ' is-error' : ''}` }, status.text)
      : null,
    h('p', { className: 'dsu-note' },
      config !== null && config.url !== ''
        ? t('balance.current', { url: config.url, field: config.field })
        : t('balance.currentEmpty')
    )
  );
}

/**
 * Track the composer card's bottom-right corner.
 *
 * The mascot should sit beside the input box and follow it as the composer
 * resizes. The card is only present on the chat panel and may mount after
 * this widget, so a ResizeObserver plus a body-level MutationObserver keep
 * the measurement fresh; the value is quantized so unrelated reflows do not
 * cause re-renders.
 * @returns the measured corner, or null when no composer is on screen.
 */
function useComposerBounds() {
  const [bounds, setBounds] = React.useState(null);

  React.useEffect(() => {
    let frame = 0;
    let lastKey = '';

    const findComposer = () => document.querySelector(
      '[data-composer-card], [data-composer], [contenteditable="true"], textarea'
    );

    const measure = () => {
      frame = 0;
      const element = findComposer();
      if (element === null) {
        if (lastKey !== '') {
          lastKey = '';
          setBounds(null);
        }
        return;
      }
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const right = Math.round(rect.right);
      const top = Math.round(rect.top);
      const offset = Math.round(window.innerHeight - rect.bottom);
      const key = `${right}:${offset}:${top}:${Math.round(window.innerWidth)}`;
      if (key === lastKey) return;
      lastKey = key;
      setBounds({
        right,
        top,
        offset,
        height: Math.round(rect.height),
        viewport: window.innerWidth,
        viewportHeight: window.innerHeight
      });
    };

    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    const resize = new ResizeObserver(schedule);
    const attach = () => {
      const element = findComposer();
      if (element !== null) resize.observe(element);
    };
    attach();

    const mutation = new MutationObserver(() => {
      attach();
      schedule();
    });
    mutation.observe(document.body, { childList: true, subtree: true });

    schedule();
    window.addEventListener('resize', schedule);
    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return bounds;
}

/**
 * The corner companion itself.
 * @param props - carries the bound translate function.
 * @returns the widget element.
 */
function WhaleCorner(props) {
  const t = typeof props.translate === 'function' ? props.translate : (key) => key;
  const [frame, setFrame] = React.useState(0);
  const [today, setToday] = React.useState(null);
  const [balance, setBalance] = React.useState(null);
  const composer = useComposerBounds();

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setFrame((value) => (value + 1) % WHALE_FRAMES.length);
    }, WHALE_FRAME_MS);
    return () => window.clearInterval(timer);
  }, []);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      const day = toDateInput(new Date());
      try {
        const payload = await fetchUsage(day, day);
        if (!active) return;
        const totals = payload?.ok === true ? payload.data?.totals : null;
        if (totals === null || totals === undefined) {
          setToday(null);
          return;
        }
        setToday({
          tokens: nonNegative(totals.promptCacheHit)
            + nonNegative(totals.promptCacheMiss)
            + nonNegative(totals.completion),
          cost: nonNegative(totals.cost),
          currency: typeof payload.data.currency === 'string' ? payload.data.currency : ''
        });
      } catch (_error) {
        // Keep the last figure; the panel reports the detailed failure.
      }
    };
    load();
    const timer = window.setInterval(load, 60000);
    const unsubscribe = subscribeUsage(load);
    return () => {
      active = false;
      window.clearInterval(timer);
      unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const value = await fetchBalance();
        if (active) setBalance(value);
      } catch (_error) {
        if (active) setBalance(null);
      }
    };
    load();
    const timer = window.setInterval(load, 60000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const spent = today === null ? null : today.cost;
  const remaining = balance === null ? null : balance.total;
  const currency = balance !== null && balance.currency !== ''
    ? balance.currency
    : (today === null ? '' : today.currency);
  const money = (value) => formatMoney(value, currency);

  // Never cover the input box. The bubble overhangs the mascot by 34px, so
  // line the bubble's left edge up with the composer's right edge plus a small
  // gap instead of aligning the mascot itself. When the viewport leaves too
  // little room on that side, stand above the composer instead; only fall back
  // to the plain corner when no composer is on screen at all.
  const BUBBLE_OVERHANG = 34;
  const EDGE_GAP = 6;
  const MASCOT_CLEARANCE = BUBBLE_OVERHANG + EDGE_GAP + 116 + 8;
  let placement = null;
  if (composer !== null) {
    if (composer.viewport - composer.right >= MASCOT_CLEARANCE) {
      placement = {
        left: `${composer.right + BUBBLE_OVERHANG + EDGE_GAP}px`,
        right: 'auto',
        bottom: `${composer.offset}px`
      };
    } else {
      placement = {
        left: 'auto',
        right: '20px',
        bottom: `${composer.offset + composer.height + 10}px`
      };
    }
  }

  return h('div', { className: 'dsu-whale', style: placement },
    h('style', null, WHALE_CORNER_CSS),
    h('div', { className: 'dsu-whale-art' },
      h('img', {
        className: 'dsu-whale-img',
        src: WHALE_FRAMES[frame],
        alt: '',
        'aria-hidden': 'true'
      })
    ),
    h('div', { className: 'dsu-whale-bubble' },
      h('span', { className: 'dsu-whale-q', 'aria-hidden': 'true' }, '?'),
      h('div', { className: 'dsu-whale-tail', 'aria-hidden': 'true' }),
      h('div', { className: 'dsu-whale-grid' },
        h('span', {
          className: `dsu-whale-hero-value${remaining === null ? ' is-pending' : ''}${remaining !== null && remaining < 0 ? ' is-negative' : ''}`
        }, remaining === null ? '—' : money(remaining)),
        h('span', { className: 'dsu-whale-label' }, t('whale.remaining')),
        h('span', { className: 'dsu-whale-divider', 'aria-hidden': 'true' }),
        h('span', {
          className: `dsu-whale-value${spent === null ? ' is-pending' : ''}`
        }, spent === null ? '—' : money(spent)),
        h('span', { className: 'dsu-whale-label' }, t('whale.todayCost')),
        h('span', {
          className: `dsu-whale-value${today === null ? ' is-pending' : ''}`
        }, today === null ? '—' : formatTokens(today.tokens, 'wan')),
        h('span', { className: 'dsu-whale-label' }, t('whale.todayTokens'))
      )
    )
  );
}

    function apply(ctx) {
      ctx.effect(
        () => ctx.locale.register(NS, { en, zh }),
        'dsh-token-usage: dictionaries'
      );
      const t = ctx.locale.bind(NS);
      const defaultUnit = ctx.locale.getSnapshot().active.startsWith('zh') ? 'wan' : 'metric';

      ctx.effect(() => {
        if (typeof document === 'undefined' || document.head === null) return undefined;
        const style = document.createElement('style');
        style.dataset.plugin = '@local/dsh-token-usage';
        style.dataset.pluginCss = '@local/dsh-token-usage/sidebar-badge';
        style.textContent = SIDEBAR_BADGE_CSS;
        document.head.appendChild(style);
        return () => {
          style.remove();
        };
      }, 'dsh-token-usage: sidebar badge style');

      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 5,
        label: () => t('panel.label'),
        locale: NS
      }, SidebarUsageBadge));

      ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'whale-corner',
        locale: NS,
        inject: () => ({ translate: t })
      }, WhaleCorner));

      ctx.slots.inject('main', () => ctx.slots.register({
        name: 'main',
        key: PANEL_ID,
        locale: NS,
        inject: () => ({
          translate: t,
          defaultUnit,
          refreshProjections: (sessionId) => ctx.sessions.refreshProjections(sessionId)
        })
      }, TokenUsagePanel));
    }

    return {
      inject: ['slots', 'locale', 'sessions'],
      apply
    };
  }
});
