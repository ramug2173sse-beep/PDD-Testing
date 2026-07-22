const path = require('path');

const config = {
  baseUrl: process.env.BASE_URL || process.env.TEST_URL || 'https://ramug2173sse-beep.github.io/PDD-Testing',
  headless: process.env.HEADLESS !== 'false', // Default to headless
  browser: process.env.BROWSER || 'chrome',
  timeout: parseInt(process.env.TIMEOUT || '10000', 10),
  reportsDir: path.join(__dirname, '../reports'),
  screenshotsDir: path.join(__dirname, '../screenshots'),
  logsDir: path.join(__dirname, '../logs'),
  resultsFile: path.join(__dirname, '../reports/execution-results.json')
};

module.exports = config;
