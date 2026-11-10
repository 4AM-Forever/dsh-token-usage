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
      'chart.subtitle': 'Stacked token composition · {mode}.',
      'chart.empty': 'No usage in this view',
      'chart.groupBy': 'Group by',
      'chart.session': 'By session',
      'chart.workspace': 'By workspace',
      'chart.other': 'Other',
      'chart.note': 'Top 8 groups; smaller groups are combined into Other.',
      'workspace.none': 'Ungrouped',
      'billing.title': 'Platform account spend',
      'billing.subtitle': 'Account-wide, including calls outside this profile.',
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
      'chart.subtitle': 'Token 构成 · {mode}。',
      'chart.empty': '当前视图暂无用量',
      'chart.groupBy': '分组方式',
      'chart.session': '按会话',
      'chart.workspace': '按工作区',
      'chart.other': '其他',
      'chart.note': '显示前 8 组，其余合并为“其他”。',
      'workspace.none': '未分组',
      'billing.title': '平台账户费用',
      'billing.subtitle': '账户全量，包含 DSH 之外的调用。',
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

    /**
     * The sidebar glyph plus a compact, highlighted today summary appended to
     * the host-owned panel label. The row has no trailing slot, so a static
     * scoped stylesheet reads one root CSS variable that this component updates.
     * The values come from the same platform account usage as the spend card.
     * @param props - requested glyph size.
     * @returns the host-compatible icon.
     */
    function SidebarUsageBadge({ size }) {
      const [summary, setSummary] = React.useState(null);
      React.useEffect(() => {
        const controller = new AbortController();
        let active = true;
        const load = async () => {
          const today = toDateInput(new Date());
          try {
            const response = await fetch(BILLING_ROUTE, {
              method: 'POST',
              credentials: 'same-origin',
              headers: {
                'content-type': 'application/json',
                'x-dsh-usage-client': '1'
              },
              body: JSON.stringify({
                action: 'usage',
                start: today,
                end: today,
                tz: -new Date().getTimezoneOffset() * 60
              }),
              signal: controller.signal
            });
            let payload = null;
            try {
              payload = await response.json();
            } catch (_error) {
              payload = null;
            }
            if (!active || payload === null || typeof payload !== 'object') return;
            if (payload.ok === true && payload.data?.totals) {
              const totals = payload.data.totals;
              const tokens = nonNegative(totals.promptCacheHit)
                + nonNegative(totals.promptCacheMiss)
                + nonNegative(totals.completion);
              setSummary({
                tokens,
                cost: nonNegative(totals.cost),
                currency: typeof payload.data.currency === 'string' ? payload.data.currency : ''
              });
              return;
            }
            if (payload.code === 'not-signed-in' || payload.code === 'unauthorized') {
              setSummary(null);
            }
          } catch (_error) {
            // Keep the last known value; the main panel reports the detailed failure.
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
          window.clearInterval(timer);
          controller.abort();
          document.removeEventListener('visibilitychange', onVisibility);
          window.removeEventListener('dsh-token-usage:refresh', onRefresh);
        };
      }, []);
      React.useEffect(() => {
        const root = document.documentElement;
        if (summary === null) {
          root.style.removeProperty('--dsh-token-usage-sidebar-today');
          return undefined;
        }
        root.style.setProperty('--dsh-token-usage-sidebar-today', JSON.stringify(
          ` ${formatCompactTokens(summary.tokens)} · ${formatCost2(summary.cost, summary.currency)}`
        ));
        return () => {
          root.style.removeProperty('--dsh-token-usage-sidebar-today');
        };
      }, [summary]);
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
      return h('div', { className: 'dsu-stat' },
        h('div', { className: 'dsu-stat-head' },
          h('span', { className: 'dsu-dot', style: { background: color }, 'aria-hidden': 'true' }),
          h('span', null, label)
        ),
        h('div', { className: 'dsu-stat-value', title: formatNumber(value) }, formatTokens(value, unit)),
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
      .dsu-billing-plot { position: relative; }
      .dsu-billing-legend {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px 16px;
        margin-top: 14px;
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
      .dsu-billing-legend-swatch.is-cost { background: var(--dsw-alias-brand-primary); }
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
        width: 100%;
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
      .dsu-billing-cost {
        display: flex;
        height: 26px;
        align-items: flex-end;
        gap: 2px;
        margin-top: 6px;
        padding-top: 5px;
        border-top: 1px solid var(--dsw-alias-border-l1);
      }
      .dsu-billing-cost-bar {
        flex: 1;
        min-width: 2px;
        border-radius: 2px 2px 0 0;
        background: var(--dsw-alias-brand-primary);
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
        const controller = new AbortController();
        let active = true;
        let retryTimer;
        const scheduleRetry = () => {
          if (!active || billingRetryRef.current >= 2) return;
          billingRetryRef.current += 1;
          retryTimer = setTimeout(() => {
            if (active) setBillingNonce((value) => value + 1);
          }, 1500);
        };
        setBillingTip(null);
        setBilling({ status: 'loading', data: null, code: null, usageUrl: null });
        fetch(BILLING_ROUTE, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'content-type': 'application/json',
            'x-dsh-usage-client': '1'
          },
          body: JSON.stringify({
            action: 'usage',
            start: selectedStartDate,
            end: selectedEndDate,
            tz: -new Date().getTimezoneOffset() * 60
          }),
          signal: controller.signal
        }).then(async (response) => {
          let payload = null;
          try {
            payload = await response.json();
          } catch (_error) {
            payload = null;
          }
          if (payload === null || typeof payload !== 'object') {
            throw new Error('billing route failed');
          }
          return payload;
        }).then((payload) => {
          if (!active) return;
          if (payload.ok === true && payload.data !== null && typeof payload.data === 'object') {
            billingRetryRef.current = 0;
            setBilling({
              status: 'ready',
              data: payload.data,
              code: null,
              usageUrl: typeof payload.usageUrl === 'string' ? payload.usageUrl : null
            });
            return;
          }
          const code = typeof payload.code === 'string' ? payload.code : 'internal';
          setBilling({
            status: code === 'not-signed-in' ? 'signed-out' : 'error',
            data: null,
            code,
            usageUrl: typeof payload.usageUrl === 'string' ? payload.usageUrl : null
          });
          if (code !== 'not-signed-in' && code !== 'unauthorized') scheduleRetry();
        }).catch((error) => {
          if (!active || error?.name === 'AbortError') return;
          setBilling({ status: 'error', data: null, code: 'network', usageUrl: null });
          scheduleRetry();
        });
        return () => {
          active = false;
          clearTimeout(retryTimer);
          controller.abort();
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
        { key: 'input', label: t('stats.input'), value: total.uncachedInputTokens, color: 'var(--dsw-alias-brand-primary)' },
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
      const gaugeAngle = `${aggregate.cacheHit * 360}deg`;
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
      const billingMaxCost = Math.max(...billingSeries.map((item) => item.cost), 0.0001);
      const billingMaxTotal = Math.max(...billingSeries.map(billingTokenTotal), 0.0001);
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
                title: formatNumber(total.total)
              }, formatTokens(total.total, unit)),
              h('div', { className: 'dsu-hero-meta' },
                viewRows.length > 0
                  ? t('hero.meta', { sessions: viewRows.length })
                  : data.rows.length > 0 ? t('chart.empty') : t('hero.empty')
              )
            ),
            h('div', { className: 'dsu-hero-side' },
              h('div', {
                className: 'dsu-gauge',
                style: { '--dsu-gauge-angle': gaugeAngle },
                role: 'img',
                'aria-label': `${t('hero.cacheHit')}: ${formatPercent(aggregate.cacheHit)}`
              },
                h('div', { className: 'dsu-gauge-inner' },
                  h('div', { className: 'dsu-gauge-value' }, formatPercent(aggregate.cacheHit)),
                  h('div', { className: 'dsu-gauge-label' }, t('hero.cacheHit'))
                )
              ),
              h('div', { className: 'dsu-gauge-hint' }, t('hero.cacheHint'))
            )
          ),
          h('section', { className: 'dsu-stats', 'aria-label': t('page.title') },
            h(StatCard, {
              label: t('stats.input'),
              value: total.uncachedInputTokens,
              hint: t('stats.input.hint'),
              color: 'var(--dsw-alias-brand-primary)',
              unit
            }),
            h(StatCard, {
              label: t('stats.output'),
              value: total.outputTokens,
              hint: t('stats.output.hint'),
              color: 'var(--dsw-alias-state-warn-primary)',
              unit
            }),
            h(StatCard, {
              label: t('stats.cacheRead'),
              value: total.cacheReadTokens,
              hint: t('stats.cacheRead.hint'),
              color: 'var(--dsw-alias-state-success-primary)',
              unit
            }),
            h(StatCard, {
              label: t('stats.cacheWrite'),
              value: total.cacheWriteTokens,
              hint: t('stats.cacheWrite.hint'),
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
                        h('div', { className: 'dsu-billing-legend', 'aria-hidden': 'true' },
                          [
                            ['is-hit', 'billing.legendHit'],
                            ['is-miss', 'billing.legendMiss'],
                            ['is-out', 'billing.legendOut'],
                            ['is-rate', 'billing.legendRate'],
                            ['is-cost', 'billing.legendCost']
                          ].map(([kind, key]) => h('span', {
                            key: kind,
                            className: 'dsu-billing-legend-item'
                          },
                            h('span', { className: `dsu-billing-legend-swatch ${kind}`, 'aria-hidden': 'true' }),
                            t(key)
                          ))
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
                                onMouseEnter: () => setBillingTip({ index })
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
                          h('div', { className: 'dsu-billing-cost', 'aria-hidden': 'true' },
                            billingSeries.map((item, index) => h('div', {
                              key: item.time,
                              className: `dsu-billing-slot${billingTip !== null && billingTip.index === index ? ' is-active' : ''}`,
                              onMouseEnter: () => setBillingTip({ index })
                            },
                              h('div', {
                                className: 'dsu-billing-cost-bar',
                                style: { height: `${(item.cost / billingMaxCost) * 100}%` }
                              })
                            ))
                          ),
                          h('div', { className: 'dsu-billing-axis', 'aria-hidden': 'true' },
                            billingTicks.map((tick, index) => h('span', {
                              key: String(index),
                              className: `dsu-billing-tick${billingTickQuarter[index] ? ' is-quarter' : ''}${billingTip !== null && billingTip.index === index ? ' is-active' : ''}`
                            }, tick))
                          ),
                          billingTipItem !== null
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
                              ),
                              h('div', { className: 'dsu-billing-tip-row' },
                                h('span', null, t('billing.legendCost')),
                                h('strong', null, formatMoney(billingTipItem.cost, billingData.currency))
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
