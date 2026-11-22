# Notes

Live page: https://pegasus-43-page-three.vercel.app/

## Budget results

| Key in `speed-budget.json` | Budget | Local | Live |
| :- | :- | :- | :- |
| `performance_score_min` | 90 | 99, 98, 98 | 98 |
| `size_grid_shift_px_max` | 0 | 0px | 0px |
| `size_button_min_px` | 44 | 48px | 48px |

All runs used a 375 x 812 phone at 3x, Slow 4G and a 4x CPU slowdown.

## Size grid check on the live page

`node scripts/check-size-grid.mjs https://pegasus-43-page-three.vercel.app/` loads the live address in Chrome under real Slow 4G and CPU throttling.

- The grid's top edge stayed at 567px from first paint to fully loaded: 0px of movement.
- Layout shift for the whole page was 0.
- All 26 buttons were measured: 17 tappable and 9 sold out. The smallest side is 48px.
- All five watched `data-testid` elements were found.

## Slow 4G trace

Recorded locally with Chrome DevTools MCP under real throttling.

- The size grid's top edge stayed at 567px from first paint to fully loaded.
- The trace has no layout shifts.
- The main photo is the largest content and is drawn in the first paint.
- Every size button is 62.2 x 48px, sold-out ones included.

## Why the grid does not move

- **Photo:** the gallery is a fixed square and the image has a set width and height.
- **Font:** Inter loads with a size-matched fallback, so text does not reflow.
- **Name and price:** rendered in the first HTML, inside a block with a fixed 88px height.
- **Grid:** fixed at 328px, with all 26 buttons built in from the stock file.
- **Low stock line:** its 20px is always reserved.

## Stock on the live page

From the 8 December 2026 snapshot.

| State | Count | Men's sizes |
| :- | :- | :- |
| In stock | 10 | 5.5, 6.5, 7, 7.5, 8, 9.5, 10.5, 11, 12, 12.5 |
| Low stock | 7 | 3.5, 4, 5, 8.5, 13, 13.5, 14.5 |
| Sold out | 9 | 4.5, 6, 9, 10, 11.5, 14, 15, 15.5, 16 |

## Deploy

Vercel builds from the `main` branch with Root Directory `Nike Task/pegasus-43-page`. The first deploys failed because the folder name contains a space. Turning off "Include files outside the Root Directory in the Build Step" in the Vercel project fixed it.

## Limits

- Stock is read at build time, so a stock change needs a redeploy.
- The name and price block is a fixed height, so a longer product name would be clipped.
- Photos, copy and reviews are placeholders.
