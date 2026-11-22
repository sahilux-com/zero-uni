# Pegasus 43 phone page: Slow 4G trace notes

Checked on 22 Nov 2026 against `speed-budget.json` and the Web Platform Slow 4G
Mobile Check Profile.

## How the trace was recorded

- Tool: Chrome DevTools MCP, `performance_start_trace` with reload, cache
  bypassed, auto-stopped once the page was fully loaded (load event ≈ 2.45 s).
- Phone: 375 × 812 CSS px viewport, 3x pixel density, mobile and touch on
  (confirmed inside the page: `innerWidth` 375, `innerHeight` 812, `devicePixelRatio` 3).
- Network: DevTools "Slow 4G" preset, 562.5 ms latency and 1474.56 Kbps down.
  These are the profile's `requestLatencyMs` and `downloadThroughputKbps`, which
  are the 150 ms / 1638.4 Kbps simulator values scaled for a real slowed browser.
- CPU: 4x slowdown.
- No desktop or unthrottled trace was used to judge the size grid.

## Trace findings

| Question | Result |
|---|---|
| Did the size grid move? | No, 0 px. Its top edge was 567 px from first paint (1851 ms) to fully loaded. A second load under the same throttling that sampled every animation frame also read 567 px the whole way. |
| Layout shifts | None. The trace has 0 `LayoutShift` events and CLS is 0.00. |
| Largest content | `main-photo` (`/images/pegasus-43-1.svg`, 375 × 375 at y = 56), drawn at 1851 ms, the same frame as first paint. |
| `main-photo` space reserved? | Yes. The gallery is a fixed square (`aspect-square w-full`) and the `<img>` has `width={375} height={375}`. |
| `price` late? | The `$140` text is in the server HTML, so it is there at first paint. The Inter font finishes at 2113 ms, after first paint, so the price first draws in the size-matched "Inter Fallback" font and then swaps. No shift results. |
| Smallest size button | 62.2 px wide × 48 px tall. All 22 in-stock / low-stock buttons and all 4 sold-out buttons (3.5, 10, 15.5, 16) are the same size. |
| Watched elements found | All five: size-grid ×1, size-button ×22, size-button-sold-out ×4, main-photo ×1, price ×1. |

## Budget check

| Key | Budget | Measured | Result |
|---|---|---|---|
| `performance_score_min` | 90 | 99, 98, 98 (three Lighthouse mobile runs, profile's simulate settings) | Pass |
| `size_grid_shift_px_max` | 0 | 0 px | Pass |
| `size_button_min_px` | 44 | 48 px (smaller side) | Pass |

Lighthouse runs: FCP 0.8 s, LCP 2.3 s, TBT 20–100 ms, CLS 0. The repo's own check
(`npm run check:grid`) also passes with the same numbers.

## Fixes

Nothing moved the size grid, so no code fix was needed. The code changes in this
repo only add the five `data-testid` attributes the check reads, plus the check
tooling (`speed-budget.json`, `lighthouserc.js`, `scripts/check-size-grid.mjs`).

These parts of the existing layout already stop each late element from pushing
the grid down:

- **Main photo (late image):** the gallery holds a fixed 375 px square, and the
  image carries `width` / `height`, so its space is reserved before it downloads.
- **Inter font (late font for price and name):** `next/font` uses
  `display: "swap"` with a size-matched backup font. The name/price block is also
  a fixed `h-[88px] overflow-hidden`, so a small text height change cannot reach
  the grid.
- **Grid and low-stock line:** the grid is a fixed `h-[328px]` and the low-stock
  line always reserves its 20 px.

Watch-out: because the name/price block is fixed at 88 px, a longer shoe name or
colorway that wraps will be clipped rather than move the grid. Check the copy if
it changes.

## Key prompt

> Use Chrome DevTools MCP to record a performance trace of the Pegasus 43 shoe
> page at http://localhost:3211/ as a slow phone. Do not judge the size grid from
> a desktop trace or an unthrottled trace.
>
> Before recording, set the browser up to match "Web Platform Slow 4G Mobile
> Check Profile.yaml":
> - Viewport 375 x 812 CSS px, 3x pixel density, mobile on.
> - Network: Slow 4G (150 ms round trip, 1638.4 Kbps).
> - CPU: 4x slowdown.
>
> Then record a trace that reloads the page and runs until it is fully loaded.
>
> Read speed-budget.json in the app folder and check the trace against its three
> values:
> 1. performance_score_min: 90
> 2. size_grid_shift_px_max: 0
> 3. size_button_min_px: 44
>
> Watch these five elements by their data-testid:
> - size-grid: the position of its top edge from first paint to fully loaded.
> - size-button and size-button-sold-out: the width and height of every button.
> - main-photo: whether it is the largest thing drawn on the first screen, and
>   whether its space is reserved before it arrives.
> - price: whether the text or its font arrives late.
>
> Hand back:
> - Whether the size grid moved, by how many px, and at what time in the load.
> - For every layout shift in the trace: which element moved, which element
>   caused it, and when.
> - The largest-content element and how long it took to appear.
> - The smallest width and height among all size buttons, sold-out ones included.
> - Whether all five data-testid elements were found.
> - A pass or fail against each of the three budget values.
>
> If anything moves the size grid, name the cause and propose the fix, but do not
> change any code until I say so.
