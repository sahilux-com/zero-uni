Live page: https://pegasus-43-page-three.vercel.app/

# Nike Pegasus 43 phone launch page

A phone-first product page built with Next.js and Tailwind CSS, deployed on Vercel.

<img src="docs/live-phone-screenshot.webp" alt="The live page on a phone with size M 7 selected" width="300">

## How it works

- All 26 sizes sit in a fixed-height grid, 5 per row. Sold-out sizes stay in place, greyed out.
- Stock is read from `data/sizes.json` at build time, so the grid is complete on first paint.
- Every part above the grid has a set height, so the grid never moves while the page loads.

## Checks

Measured on the live page as a phone on Slow 4G with a 4x slower CPU.

| Check | Result | Budget |
| :- | :- | :- |
| Lighthouse performance | 98 | 90 or more |
| Size grid movement | 0px | 0px |
| Smallest size button side | 48px | 44px or more |

[Lighthouse report](docs/lighthouse-live.report.html) · [Budget](speed-budget.json) · [Notes](NOTES.md) · [Prompts](PROMPTS.md)

## Run locally

```bash
npm install
npm run build
npm run start -- -p 3211
```

`npm run check:lighthouse` runs Lighthouse CI. `npm run check:grid` checks grid movement and button sizes on port 3211; add `-- <url>` to check another address, such as the live page.

Photos, copy and reviews are placeholders.
