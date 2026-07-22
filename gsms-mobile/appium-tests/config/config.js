const path = require('path');

const config = {
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.APPIUM_DEVICE_NAME || 'Android Emulator',
    'appium:platformVersion': process.env.APPIUM_PLATFORM_VERSION || '13.0',
    'appium:app': process.env.APPIUM_APK_PATH || path.join(__dirname, '../../app/build/outputs/apk/debug/app-debug.apk'),
    'appium:appPackage': 'com.example.gsmsmobile',
    'appium:appActivity': 'com.example.gsmsmobile.MainActivity',
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:newCommandTimeout': 120
  },
  reportsDir: path.join(__dirname, '../reports'),
  screenshotsDir: path.join(__dirname, '../screenshots'),
  logsDir: path.join(__dirname, '../logs'),
  resultsFile: path.join(__dirname, '../reports/execution-results.json')
};

module.exports = config;
