const { By, until } = require('selenium-webdriver');

class LoginPage {
  constructor(driver, baseUrl) {
    this.driver = driver;
    this.url = `${baseUrl}/login/`;
    
    // Selectors
    this.emailInput = By.id('email');
    this.passwordInput = By.id('password');
    this.captchaOption1 = By.id('captcha-option-1'); // Medical Cross ➕
    this.loginButton = By.id('login-button');
    this.errorMessage = By.xpath("//div[contains(@class, 'text-red-400') or contains(@class, 'bg-red-500')]");
  }

  async navigate() {
    await this.driver.get(this.url);
    await this.driver.wait(until.elementLocated(this.emailInput), 10000);
  }

  async login(username, password) {
    const emailEl = await this.driver.findElement(this.emailInput);
    await emailEl.clear();
    await emailEl.sendKeys(username);

    const passwordEl = await this.driver.findElement(this.passwordInput);
    await passwordEl.clear();
    await passwordEl.sendKeys(password);

    const captchaEl = await this.driver.findElement(this.captchaOption1);
    await captchaEl.click();

    const submitEl = await this.driver.findElement(this.loginButton);
    await submitEl.click();
  }

  async getError() {
    try {
      const errEl = await this.driver.wait(until.elementLocated(this.errorMessage), 8000);
      const text = await errEl.getText();
      console.log(`[DEBUG] Found error text: "${text}"`);
      return text;
    } catch (e) {
      console.log(`[DEBUG] getError failed with:`, e.message);
      return '';
    }
  }
}

module.exports = LoginPage;
