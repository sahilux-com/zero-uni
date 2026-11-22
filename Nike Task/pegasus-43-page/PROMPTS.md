# Prompts

The two prompts given to Claude Code for the checks and the launch.

## Slow 4G phone trace

```text
Use Chrome DevTools MCP to record a performance trace of the Pegasus 43 shoe
page at http://localhost:3211/ as a slow phone. Do not judge the size grid from
a desktop trace or an unthrottled trace.

Before recording, set the browser up to match "Web Platform Slow 4G Mobile
Check Profile.yaml":
- Viewport 375 x 812 CSS px, 3x pixel density, mobile on.
- Network: Slow 4G (150 ms round trip, 1638.4 Kbps).
- CPU: 4x slowdown.

Then record a trace that reloads the page and runs until it is fully loaded.

Read speed-budget.json in the app folder and check the trace against its three
values:
1. performance_score_min: 90
2. size_grid_shift_px_max: 0
3. size_button_min_px: 44

Watch these five elements by their data-testid:
- size-grid: the position of its top edge from first paint to fully loaded.
- size-button and size-button-sold-out: the width and height of every button.
- main-photo: whether it is the largest thing drawn on the first screen, and
  whether its space is reserved before it arrives.
- price: whether the text or its font arrives late.

Hand back:
- Whether the size grid moved, by how many px, and at what time in the load.
- For every layout shift in the trace: which element moved, which element
  caused it, and when.
- The largest-content element and how long it took to appear.
- The smallest width and height among all size buttons, sold-out ones included.
- Whether all five data-testid elements were found.
- A pass or fail against each of the three budget values.

If anything moves the size grid, name the cause and propose the fix, but do not
change any code until I say so.
```

## Vercel launch and Lighthouse

```text
Put the Pegasus 43 phone shoe page live on Vercel and check it with mobile
Lighthouse.

1. Stock. Read "Pegasus Size and Stock Snapshot, 8 December 2026.json" and
   replace data/sizes.json in pegasus-43-page with it. Tell me the state of all
   26 sizes: in stock, low stock or sold out. All 26 must stay on the page;
   sold-out sizes stay in place, greyed out and untappable.
2. Before deploying, build the app and run the local checks. Stop and tell me
   if either fails.
3. Commit and push to the main branch of the zero-uni repo on GitHub. Vercel is
   connected to that repo with the Root Directory set to
   "Nike Task/pegasus-43-page", so the push starts the deploy. Wait for it to
   finish, confirm it succeeded, and give me the public live address.
4. Run Lighthouse on the live Vercel address, not localhost, using the settings
   in "Web Platform Slow 4G Mobile Check Profile.yaml": mobile, 375 x 812 at 3x,
   Slow 4G (150 ms round trip, 1638.4 Kbps), 4x CPU slowdown.
5. Check the live page against speed-budget.json: performance_score_min 90,
   size_grid_shift_px_max 0, size_button_min_px 44.

Hand back the live address and GitHub repo link, a table of all 26 sizes with
their stock state, the Lighthouse score and layout shift on the live page, a
pass or fail against each budget value, and anything changed, not done or
failed, with the reason. Do not change speed-budget.json or the check profile
to make a check pass.
```
