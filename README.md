# DSH Token 用量 / DSH Token Usage

左侧栏新增 **Token 用量** 入口：按日期筛选本机 Token 分析，并显示 DeepSeek 平台账户全量费用卡片。

A DeepSeek Harness Web plugin that adds a **Token usage** entry to the left sidebar: date-filtered local token analytics plus an account-wide DeepSeek Platform spend card.

[中文](#中文) | [English](#english)

---

## 中文

### 功能

- 左侧栏新增 **Token 用量** 入口和独立面板。
- **日期筛选**：今天、7 天、30 天、指定开始/结束日期。自定义范围最多 30 天，默认查询今天。
- **总览**：总 Token、未缓存输入、输出、缓存读取、缓存写入和缓存命中率。
- **单位切换**：精确、K/M/B、万；选择会保存在浏览器中。主面板的万模式固定显示万，不自动切亿；整数部分达到四位时使用千分号，例如 `115,144.8万`。
- **堆叠用量图**：按会话或工作区聚合；前 8 组之外合并为“其他”。
- **可搜索的会话明细**：缓存、未缓存输入、输出、合计 Token、最近活动。
- **侧边栏今日摘要**：在“Token 用量”入口文字后显示今日账户 Token 用量（万/亿，超过千万自动切换为亿，两位小数）和今日费用（元，两位小数），使用更小的高亮绿色字体。
- **平台账户费用卡片**：显示当前登录的 DeepSeek 平台账户全量费用；金额跟随同一日期筛选，并提供按日/小时的费用趋势。
- **实时更新与刷新**：本地 Token 跟随 Session 控制流更新；刷新按钮会重新读取投影和账户费用。

### 数据口径

本地 Token 图表和表格读取 `@deepseek-ai/dsh-token-meter` 的 `tokenUsage` 会话投影。日期筛选按**会话最近活动时间**筛选；每行显示该会话的累计 Token，而不是按天拆分后的 Token。

费用卡片与本地 Token 总量分开统计：Host 读取当前登录的 DeepSeek 平台账户，返回**账户全量计费金额**，可能包含 DSH 之外的调用。费用使用与筛选完全相同的开始/结束日期。平台私有按 Key 用量接口最多接受 30 天，因此界面不会请求更宽的范围。账户未登录或私有接口变化时，费用卡片会显示错误状态，不会伪造估算金额。

侧边栏今日摘要始终使用平台账户的**今天**数据，不跟随主面板的日期筛选；它每 60 秒刷新一次，打开主面板时也可通过刷新按钮立即更新。Token 以万/亿为单位（超过千万自动切换为亿），费用以元为单位，均保留两位小数。摘要只在侧边栏展开时显示；折叠成图标栏时只显示图标。

Fork 会话会继承复制过来的历史，因此本地统计可能重复计入继承部分的用量。

### 环境要求

- DeepSeek Harness Web GUI。
- 显示费用需要已登录 DeepSeek 账户；本地 Token 面板不依赖账户登录。
- 费用桥接只接受本机请求，请通过 `localhost` 或 `127.0.0.1` 打开 GUI。

### 安装

```bash
git clone https://github.com/4AM-Forever/dsh-token-usage.git
```

在 DSH 的插件管理器中，用绝对包路径把克隆目录安装为当前 profile 的 bundle：

```text
plugin_manager install_bundle <dsh-token-usage 的绝对路径>
```

包名是 `@local/dsh-token-usage`，侧栏入口和主面板 id 都是 `token-usage`。无需构建：`client.js` 是浏览器模块，`index.js` 是 Host 半。安装后刷新页面即可。

### 安全说明

- DeepSeek 账户令牌只保留在 Host 进程中，不会返回给前端。
- 费用桥接只接受本机回环请求、本机来源和专用客户端请求头，只返回聚合费用数据。
- 插件不单独保存平台 `userToken`，使用 DSH 已持有的账户会话。

### 仓库标签

`dsh-plugin` · `deepseek-harness` · `dsh` · `dsh-bundle` · `token-usage` · `usage-dashboard` · `cordis-plugin`

在 GitHub 搜索 `dsh-plugin` 标签即可找到此插件。

---

## English

### Features

- **Sidebar entry** with a dedicated Token usage panel.
- **Date filters** for Today, 7 days, 30 days, and a custom start/end range. Custom ranges are capped at 30 days; the default is Today.
- **Overview** of total tokens, uncached input, output, cache read, cache write, and cache-hit rate.
- **Unit switch** for exact counts, K/M/B, or 万. The choice is remembered in the browser. The main panel's 万 mode stays in 万 and never switches to 亿; whole parts of four or more digits use thousands separators, for example `115,144.8万`.
- **Stacked usage chart** grouped by session or workspace; groups after the top eight are folded into “Other”.
- **Searchable session table** with cache, uncached input, output, total tokens, and last activity.
- **Sidebar today summary**: today's account token usage in 万 or 亿 (automatically switches to 亿 above ten million) and today's spend in yuan, both with two decimals, appended to the “Token usage” entry in a smaller highlighted green style.
- **Account-wide spend card** for the signed-in DeepSeek Platform account. The spend amount follows the same date filter and shows a daily/hourly cost trend.
- **Live updates and refresh**: local token counts follow the Session control stream; the refresh control re-reads projections and account spend.

### Data and semantics

The local token charts and table read the `tokenUsage` session projection from `@deepseek-ai/dsh-token-meter`. The selected dates filter **sessions by last activity time**; each row shows that session's cumulative token totals, not a per-day token split.

The spend card is separate from the local token totals. It queries the signed-in DeepSeek Platform account through the Host and returns **account-wide billed spend**, which may include calls outside DSH. It uses the exact selected start/end dates. The private platform by-key endpoint accepts at most 30 days, so the UI never requests a wider window. If the account is signed out or the private endpoint changes, the card reports an error instead of showing a fabricated estimate.

The sidebar summary always uses the Platform account's **today** totals and does not follow the main panel's date filter. It refreshes every 60 seconds and also updates immediately when the panel refresh button is used. Token usage is shown in 万 or 亿 (automatically switching to 亿 above ten million), and spend in yuan, both with two decimals. The summary appears when the sidebar is expanded; the collapsed rail shows only the icon.

A forked session inherits copied history, so local totals may include inherited usage more than once.

### Requirements

- DeepSeek Harness Web GUI.
- A signed-in DeepSeek account for the spend card. The local token panel works without it.
- The GUI must be opened through `localhost` or `127.0.0.1` for the loopback-only spend bridge.

### Install

```bash
git clone https://github.com/4AM-Forever/dsh-token-usage.git
```

Install the cloned directory as a bundle in the active DSH profile with Plugin Manager, using the absolute package path:

```text
plugin_manager install_bundle <absolute-path-to-dsh-token-usage>
```

The package name is `@local/dsh-token-usage`; the sidebar entry and main panel use the id `token-usage`. No build step is required: `client.js` is the browser module and `index.js` is the Host half. Refresh the page after installation.

### Security

- The DeepSeek account token stays in the Host process and is never returned to the Client.
- The spend bridge is loopback-only, accepts local origins plus a dedicated client header, and returns aggregated spend rows only.
- The plugin does not store a separate platform `userToken`; it uses the account session already held by DSH.

### Repository tags

`dsh-plugin` · `deepseek-harness` · `dsh` · `dsh-bundle` · `token-usage` · `usage-dashboard` · `cordis-plugin`

Search GitHub for the `dsh-plugin` topic to find this plugin.
