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

# Live launch notes

Launched on 22 Nov 2026. Live page: https://pegasus-43-page-three.vercel.app/

## Stock on the live page

`data/sizes.json` is the "Pegasus Size and Stock Snapshot, 8 December 2026".

| State | Count | Sizes (Men's) |
|---|---|---|
| In stock | 10 | 5.5, 6.5, 7, 7.5, 8, 9.5, 10.5, 11, 12, 12.5 |
| Low stock | 7 | 3.5, 4, 5, 8.5, 13, 13.5, 14.5 |
| Sold out | 9 | 4.5, 6, 9, 10, 11.5, 14, 15, 15.5, 16 |

Fourteen sizes changed state since the launch-day list. The live HTML was checked
after deploy: 17 `size-button`, 9 `size-button-sold-out`, and the sold-out and
low-stock sizes match the table above.

## Vercel deploy

- Project `pegasus-43-page`, connected to the `zero-uni` GitHub repo, Root
  Directory `Nike Task/pegasus-43-page`. A push to `main` deploys.
- The first four deploys built but were rejected with "A Serverless Function has
  an invalid name ... must not contain any space", because the path includes the
  folder `Nike Task`.
- A `next.config.ts` change (rooting the build at the app folder) did not fix it
  and was undone.
- Fix: the Vercel project setting "Include files outside the Root Directory in
  the Build Step" was turned off. The next deploy succeeded.
- Use the `pegasus-43-page-three.vercel.app` address. The
  `...-cenu6699s-projects.vercel.app` address asks for a Vercel login.

## Lighthouse on the live page

One mobile run against the live address with the check profile's settings
(375 x 812 at 3x, Slow 4G simulate, 4x CPU slowdown). Report:
`docs/lighthouse-live.report.html`.

| Key | Budget | Measured on live | Result |
|---|---|---|---|
| `performance_score_min` | 90 | 98 | Pass |
| `size_grid_shift_px_max` | 0 | CLS 0 for the whole page | Pass |
| `size_button_min_px` | 44 | 48 px smaller side (measured locally, same code) | Pass |

FCP 1.2 s, LCP 1.5 s, TBT 160 ms, Speed Index 1.5 s.

Not done on the live page: the frame-by-frame size grid trace and a button
re-measure. Both were done locally on the same code (see above).

Screenshot of the live page on a phone: `docs/live-phone-screenshot.webp`.

## Launch prompt

> Put the Pegasus 43 phone shoe page live on Vercel and check it with mobile
> Lighthouse.
>
> 1. Stock. Read "Pegasus Size and Stock Snapshot, 8 December 2026.json" and
>    replace data/sizes.json in pegasus-43-page with it. Tell me the state of all
>    26 sizes: in stock, low stock or sold out. All 26 must stay on the page;
>    sold-out sizes stay in place, greyed out and untappable.
> 2. Before deploying, build the app and run the local checks. Stop and tell me
>    if either fails.
> 3. Commit and push to the main branch of the zero-uni repo on GitHub. Vercel is
>    connected to that repo with the Root Directory set to
>    "Nike Task/pegasus-43-page", so the push starts the deploy. Wait for it to
>    finish, confirm it succeeded, and give me the public live address.
> 4. Run Lighthouse on the live Vercel address, not localhost, using the settings
>    in "Web Platform Slow 4G Mobile Check Profile.yaml": mobile, 375 x 812 at 3x,
>    Slow 4G (150 ms round trip, 1638.4 Kbps), 4x CPU slowdown.
> 5. Check the live page against speed-budget.json: performance_score_min 90,
>    size_grid_shift_px_max 0, size_button_min_px 44.
>
> Hand back the live address and GitHub repo link, a table of all 26 sizes with
> their stock state, the Lighthouse score and layout shift on the live page, a
> pass or fail against each budget value, and anything changed, not done or
> failed, with the reason. Do not change speed-budget.json or the check profile
> to make a check pass.
