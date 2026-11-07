# DSH Token usage

A DeepSeek Harness Web plugin with a left-sidebar entry and a live Token usage panel.

## What it shows

- Total tokens across every session in the current profile, with a cache-hit gauge.
- Uncached input, output, cache read, and cache write counts.
- A unit switch for exact counts, K/M/B, and 万/亿; the choice is remembered in the browser.
- Date filters for today, 7 days, 30 days, and a custom date range (up to 30 days); defaults to today.
- A stacked usage chart grouped by session or workspace, with the remaining groups folded into “Other”.
- A searchable per-session breakdown with cache, uncached input, output, totals, and last activity.
- A refresh control that re-reads the latest usage projections.
- An account-wide **billed spend** card from the signed-in DeepSeek Platform account, with a daily/hourly trend for the exact selected date range.

The date filter filters **sessions by their last activity time** and shows each matching session's cumulative token totals. DSH's list projection carries whole-session usage rather than per-request timestamps, so the chart deliberately aggregates by session/workspace instead of inventing a daily time series.

The data comes from the `tokenUsage` session projection supplied by `@deepseek-ai/dsh-token-meter`. The token panel follows the live Session control stream, so counts update as model requests settle; it does not poll or make model/provider calls.

The spend card is different: it asks the Host half to read the signed-in DeepSeek Platform session and the platform's private usage/cost endpoints. It is **account-wide** and includes calls outside this profile. The Host returns only aggregated spend rows to the browser; the account token never reaches the Client. The spend request uses the same start/end dates as the filter and is limited to 30 days. If the account is signed out, the card says so instead of showing a fabricated estimate. The private endpoint has no stability guarantee; a failure leaves the card in an error state without affecting the local token charts.

## Install

The bundle is installed in the active DSH profile with:

```text
plugin_manager install_bundle @local/dsh-token-usage (absolute package directory)
```

The installed bundle survives restarts. Remove it from the Plugins page or with `plugin_manager remove_bundle`.

## Notes

- This panel reads local DSH session logs for its token charts. The spend card additionally queries `platform.deepseek.com` through the signed-in DSH account; it never asks for or stores a separate platform `userToken` in this plugin.
- The spend bridge is a loopback-only Host route restricted to local origins and a custom client header. It returns aggregates only, never the account credential.
- Token counts are provider-reported where the session log records usage, not a billing statement. The spend card is the Platform's billed amount for its own account-wide window.
- A forked session inherits a copied history, so its usage can overlap with the source session. The panel sums durable session logs and therefore may count that inherited history again.
- Sessions without a recorded usage sample are omitted from the breakdown and contribute nothing to the totals.
