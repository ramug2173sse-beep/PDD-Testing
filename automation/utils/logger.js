const fs = require('fs');
const path = require('path');
const config = require('../config/config');

// Ensure directory exists
if (!fs.existsSync(config.logsDir)) {
  fs.mkdirSync(config.logsDir, { recursive: true });
}

const logFile = path.join(config.logsDir, 'automation.log');

// Clear log file at startup
fs.writeFileSync(logFile, '');

const logger = {
  info: (msg) => {
    const logMsg = `[INFO] [${new Date().toLocaleTimeString()}] ${msg}`;
    console.log(logMsg);
    fs.appendFileSync(logFile, logMsg + '\n');
  },
  error: (msg, err = null) => {
    let logMsg = `[ERROR] [${new Date().toLocaleTimeString()}] ${msg}`;
    if (err) logMsg += ` | Error: ${err.message || err}\n${err.stack || ''}`;
    console.error(logMsg);
    fs.appendFileSync(logFile, logMsg + '\n');
  },
  warn: (msg) => {
    const logMsg = `[WARN] [${new Date().toLocaleTimeString()}] ${msg}`;
    console.warn(logMsg);
    fs.appendFileSync(logFile, logMsg + '\n');
  }
};

module.exports = logger;
