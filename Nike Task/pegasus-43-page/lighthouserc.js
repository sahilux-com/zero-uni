// Lighthouse CI config. The settings block is copied from
// "Web Platform Slow 4G Mobile Check Profile.yaml" (lighthouse_settings).
// The pass mark comes from speed-budget.json.
const budget = require("./speed-budget.json");

const PORT = 3211;

module.exports = {
  ci: {
    collect: {
      startServerCommand: `npm run start -- -p ${PORT}`,
      startServerReadyPattern: "Ready",
      url: [`http://localhost:${PORT}/`],
      numberOfRuns: 3,
      settings: {
        formFactor: "mobile",
        throttlingMethod: "simulate",
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          requestLatencyMs: 562.5,
          downloadThroughputKbps: 1474.56,
          uploadThroughputKbps: 675,
          cpuSlowdownMultiplier: 4,
        },
        screenEmulation: {
          width: 375,
          height: 812,
          deviceScaleFactor: 3,
          mobile: true,
          disabled: false,
        },
        chromeFlags: "--headless=new",
      },
    },
    assert: {
      assertions: {
        "categories:performance": [
          "error",
          { minScore: budget.performance_score_min / 100 },
        ],
        // The size grid may not move at all, so the whole page may not shift either.
        "cumulative-layout-shift": ["error", { maxNumericValue: 0 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./lighthouse-report",
    },
  },
};
