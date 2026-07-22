const logger = {
  info: (msg) => console.log(`[INFO] [${new Date().toLocaleTimeString()}] ${msg}`),
  warn: (msg) => console.log(`[WARN] [${new Date().toLocaleTimeString()}] ${msg}`),
  error: (msg, err) => console.error(`[ERROR] [${new Date().toLocaleTimeString()}] ${msg}`, err || '')
};

module.exports = logger;
