const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('Login E2E Tests', function () {
  let driver;
  // Next.js basePath is '/PDD-Testing', so the default URL has /PDD-Testing
  const baseUrl = process.env.TEST_URL || 'http://localhost:3000/PDD-Testing';

  before(async function () {
    let options = new chrome.Options();
    if (process.env.CI || process.env.HEADLESS) {
      options.addArguments('--headless');
      options.addArguments('--no-sandbox');
      options.addArguments('--disable-dev-shm-usage');
      options.addArguments('--disable-gpu');
    }
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('should successfully log in as admin and redirect', async function () {
    console.log(`Navigating to ${baseUrl}/login/`);
    await driver.get(`${baseUrl}/login/`);

    // Wait for the email input to be visible and enter credentials
    const emailInput = await driver.wait(until.elementLocated(By.id('email')), 8000);
    await emailInput.sendKeys('admin@gsmat.com');

    // Enter password
    const passwordInput = await driver.findElement(By.id('password'));
    await passwordInput.sendKeys('password123');

    // Click the Medical Cross CAPTCHA button (option 1)
    const captchaButton = await driver.findElement(By.id('captcha-option-1'));
    await captchaButton.click();

    // Click submit button
    const loginButton = await driver.findElement(By.id('login-button'));
    await loginButton.click();

    // Wait until the URL changes to include '/admin' dashboard route
    console.log('Credentials submitted, waiting for redirection to admin dashboard...');
    await driver.wait(until.urlContains('/admin'), 12000);

    // Verify current URL has redirected
    const currentUrl = await driver.getCurrentUrl();
    console.log(`Successfully redirected to: ${currentUrl}`);
    assert.ok(currentUrl.includes('/admin'), `Expected URL to include /admin but got ${currentUrl}`);
  });
});
