const { By, until } = require('selenium-webdriver');

class DashboardPage {
  constructor(driver) {
    this.driver = driver;
    this.logoutBtn = By.xpath("//button[@content-desc='Logout'] | //button[contains(text(), 'Logout')]");
    this.welcomeText = By.xpath("//*[contains(text(), 'Hi, John')] | //*[contains(text(), 'Hi, Admin') or contains(text(), 'System Administrator')]");
    this.bedsTab = By.xpath("//*[contains(text(), 'Beds Board')] | //*[@content-desc='Beds Board']");
    this.predictTab = By.xpath("//*[contains(text(), 'AI Predict')] | //*[@content-desc='AI Predict']");
    this.bookingsTab = By.xpath("//*[contains(text(), 'Bookings')] | //*[@content-desc='Bookings']");
    this.reportsTab = By.xpath("//*[contains(text(), 'Reports')] | //*[@content-desc='Reports']");
  }

  async verifyWelcome() {
    const welEl = await this.driver.wait(until.elementLocated(this.welcomeText), 10000);
    return await welEl.isDisplayed();
  }

  async logout() {
    const btn = await this.driver.wait(until.elementLocated(this.logoutBtn), 8000);
    await btn.click();
  }

  async navigateToBeds() {
    const el = await this.driver.findElement(this.bedsTab);
    await el.click();
  }

  async navigateToPredict() {
    const el = await this.driver.findElement(this.predictTab);
    await el.click();
  }

  async navigateToBookings() {
    const el = await this.driver.findElement(this.bookingsTab);
    await el.click();
  }

  async navigateToReports() {
    const el = await this.driver.findElement(this.reportsTab);
    await el.click();
  }
}

module.exports = DashboardPage;
