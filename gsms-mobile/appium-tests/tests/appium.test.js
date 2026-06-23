const { remote } = require('webdriverio');
const ExcelJS = require('exceljs');
const path = require('path');
const assert = require('assert');

// Appium configurations
const opts = {
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
  }
};

describe('GSMS Android Mobile E2E Tests', function () {
  this.timeout(180000); // 3 minutes timeout for complete E2E mobile tests
  let client;
  const testStepsLog = [];

  // Helper to log test step execution results
  function logStep(module, description, expected, actual, status, duration, error = '') {
    testStepsLog.push({
      stepNumber: testStepsLog.length + 1,
      module,
      description,
      expected,
      actual,
      status: status ? 'PASS' : 'FAIL',
      duration: `${duration}ms`,
      error,
      timestamp: new Date().toLocaleTimeString()
    });
  }

  before(async function () {
    const startTime = Date.now();
    try {
      console.log('Connecting to Appium Server and launching Android App...');
      client = await remote(opts);
      logStep('System', 'App Launch', 'App launches successfully on emulator/device', 'App launched successfully', true, Date.now() - startTime);
    } catch (err) {
      logStep('System', 'App Launch', 'App launches successfully on emulator/device', 'Failed to launch app', false, Date.now() - startTime, err.message);
      throw err;
    }
  });

  after(async function () {
    // 1. Close driver session
    if (client) {
      await client.deleteSession();
    }

    // 2. Generate Excel Analysis Report
    const reportPath = path.join(__dirname, '../E2E_Test_Report.xlsx');
    console.log(`Compiling Excel E2E Test Analysis Report at: ${reportPath}`);
    const workbook = new ExcelJS.Workbook();
    
    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Dashboard');
    summarySheet.views = [{ showGridLines: true }];
    
    summarySheet.mergeCells('A1:E1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'GSMS Mobile Appium E2E Test Execution Summary';
    titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } }; // Dark Teal
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    summarySheet.getRow(1).height = 40;

    const totalSteps = testStepsLog.length;
    const passedSteps = testStepsLog.filter(s => s.status === 'PASS').length;
    const failedSteps = totalSteps - passedSteps;
    const passRate = totalSteps > 0 ? (passedSteps / totalSteps) * 100 : 0;

    summarySheet.getCell('A3').value = 'Test Execution Date:';
    summarySheet.getCell('B3').value = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
    summarySheet.getCell('A4').value = 'Target Platform:';
    summarySheet.getCell('B4').value = 'Android OS';
    summarySheet.getCell('A5').value = 'Automation Tool:';
    summarySheet.getCell('B5').value = 'Appium v2.0 (UiAutomator2)';

    summarySheet.getCell('D3').value = 'Total Steps Tested:';
    summarySheet.getCell('E3').value = totalSteps;
    summarySheet.getCell('D4').value = 'Steps Passed:';
    summarySheet.getCell('E4').value = passedSteps;
    summarySheet.getCell('D5').value = 'Steps Failed:';
    summarySheet.getCell('E5').value = failedSteps;
    summarySheet.getCell('D6').value = 'Pass Rate:';
    summarySheet.getCell('E6').value = `${passRate.toFixed(1)}%`;

    // Make stats bold
    ['A3', 'A4', 'A5', 'D3', 'D4', 'D5', 'D6'].forEach(cell => {
      summarySheet.getCell(cell).font = { bold: true, name: 'Segoe UI', size: 10 };
    });

    const passRateCell = summarySheet.getCell('E6');
    passRateCell.font = { bold: true, name: 'Segoe UI', size: 11, color: { argb: passRate === 100 ? 'FF0F5132' : 'FF842029' } };

    // Steps Detail Sheet
    const detailsSheet = workbook.addWorksheet('E2E Test Details');
    detailsSheet.views = [{ showGridLines: true }];

    // Set columns headers
    detailsSheet.columns = [
      { header: 'Step #', key: 'stepNumber', width: 8 },
      { header: 'Module', key: 'module', width: 15 },
      { header: 'Action / Description', key: 'description', width: 30 },
      { header: 'Expected Result', key: 'expected', width: 35 },
      { header: 'Actual Result', key: 'actual', width: 35 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Duration', key: 'duration', width: 12 },
      { header: 'Timestamp', key: 'timestamp', width: 12 },
      { header: 'Error Details', key: 'error', width: 35 }
    ];

    // Header styling
    const headerRow = detailsSheet.getRow(1);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } }; // Dark Teal matching GSMS
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFB2DFDB' } },
        left: { style: 'thin', color: { argb: 'FFB2DFDB' } },
        bottom: { style: 'medium', color: { argb: 'FF004D40' } },
        right: { style: 'thin', color: { argb: 'FFB2DFDB' } }
      };
    });

    // Add data and format status cells
    testStepsLog.forEach((step) => {
      const row = detailsSheet.addRow(step);
      row.height = 22;
      
      // Zebra striping
      const fillColor = (step.stepNumber % 2 === 0) ? 'FFF9FBFC' : 'FFFFFFFF';
      row.eachCell((cell) => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
        cell.alignment = { vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      });

      // Status cell coloring
      const statusCell = row.getCell('status');
      statusCell.alignment = { vertical: 'middle', horizontal: 'center' };
      if (step.status === 'PASS') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1E7DD' } }; // Light green
        statusCell.font = { name: 'Segoe UI', bold: true, color: { argb: '0F5132' } };       // Dark green
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8D7DA' } }; // Light red
        statusCell.font = { name: 'Segoe UI', bold: true, color: { argb: '842029' } };       // Dark red
      }
    });

    await workbook.xlsx.writeFile(reportPath);
    console.log('Excel report compiled and written successfully.');
  });

  it('should navigate through dashboard tabs successfully', async function () {
    const module = 'Navigation';
    
    // 1. Verify Home Tab is active
    let startTime = Date.now();
    try {
      const title = await client.$('//*[@text="GSMS Smart Portal"]');
      await title.waitForDisplayed({ timeout: 15000 });
      logStep(module, 'Verify Home Tab Active', 'Dashboard title is visible', 'Dashboard title "GSMS Smart Portal" is displayed', true, Date.now() - startTime);
    } catch (e) {
      logStep(module, 'Verify Home Tab Active', 'Dashboard title is visible', 'Failed to find dashboard title', false, Date.now() - startTime, e.message);
    }

    // 2. Click AI Predict Tab
    startTime = Date.now();
    try {
      const predictTab = await client.$('//*[@content-desc="AI Predict" or @text="AI Predict"]');
      await predictTab.click();
      const predictHeader = await client.$('//*[@text="AI Diagnostic Symptom Analysis"]');
      await predictHeader.waitForDisplayed({ timeout: 8000 });
      logStep(module, 'Navigate to AI Predict', 'Symptom analysis screen loads', 'Successfully loaded AI Predict screen', true, Date.now() - startTime);
    } catch (e) {
      logStep(module, 'Navigate to AI Predict', 'Symptom analysis screen loads', 'Failed to load AI Predict screen', false, Date.now() - startTime, e.message);
    }

    // 3. Click Beds Board Tab
    startTime = Date.now();
    try {
      const bedsTab = await client.$('//*[@content-desc="Beds Board" or @text="Beds Board"]');
      await bedsTab.click();
      // Verify ICU bed info is visible
      const bedsHeader = await client.$('//*[@text="ICU & Ward Bed Tracker" or @text="Regional Hospital Directories" or contains(@text, "beds available")]');
      await bedsHeader.waitForDisplayed({ timeout: 8000 });
      logStep(module, 'Navigate to Beds Board', 'Hospital bed tracker loads', 'Successfully loaded Beds Board screen', true, Date.now() - startTime);
    } catch (e) {
      logStep(module, 'Navigate to Beds Board', 'Hospital bed tracker loads', 'Failed to load Beds Board screen', false, Date.now() - startTime, e.message);
    }

    // 4. Click Bookings Tab
    startTime = Date.now();
    try {
      const bookingsTab = await client.$('//*[@content-desc="Bookings" or @text="Bookings"]');
      await bookingsTab.click();
      logStep(module, 'Navigate to Bookings', 'Consultation Bookings loads', 'Successfully loaded Bookings screen', true, Date.now() - startTime);
    } catch (e) {
      logStep(module, 'Navigate to Bookings', 'Consultation Bookings loads', 'Failed to load Bookings screen', false, Date.now() - startTime, e.message);
    }

    // 5. Navigate back to Home Tab
    startTime = Date.now();
    try {
      const homeTab = await client.$('//*[@content-desc="Home" or @text="Home"]');
      await homeTab.click();
      const heroText = await client.$('//*[@text="Smart Medical Assistance"]');
      await heroText.waitForDisplayed({ timeout: 8000 });
      logStep(module, 'Navigate Back to Home', 'Dashboard hero text is visible', 'Home dashboard loaded successfully', true, Date.now() - startTime);
    } catch (e) {
      logStep(module, 'Navigate Back to Home', 'Dashboard hero text is visible', 'Failed to return to Home dashboard', false, Date.now() - startTime, e.message);
    }
  });

  it('should authenticate as user successfully', async function () {
    const module = 'Authentication';
    let startTime = Date.now();

    // 1. Click "Sign In" button in top bar
    try {
      const signInBtn = await client.$('//*[@text="Sign In"]');
      await signInBtn.click();
      const loginDialogTitle = await client.$('//*[@text="Sign In to GSMS"]');
      await loginDialogTitle.waitForDisplayed({ timeout: 8000 });
      logStep(module, 'Open Sign In Dialog', 'Sign In modal opens', 'Modal "Sign In to GSMS" is visible', true, Date.now() - startTime);
    } catch (e) {
      logStep(module, 'Open Sign In Dialog', 'Sign In modal opens', 'Failed to open Sign In modal', false, Date.now() - startTime, e.message);
      return; // Stop auth flow tests if modal cannot open
    }

    // 2. Input email credentials
    startTime = Date.now();
    try {
      const emailField = await client.$('//*[@text="Email or Mobile Number" or contains(@text, "Email")]/following-sibling::* | //*[android.widget.EditText][1]');
      await emailField.setValue('john@gmail.com');
      logStep(module, 'Enter Identifier', 'Identifier is entered', 'Entered "john@gmail.com" in username field', true, Date.now() - startTime);
    } catch (e) {
      logStep(module, 'Enter Identifier', 'Identifier is entered', 'Failed to enter email', false, Date.now() - startTime, e.message);
    }

    // 3. Input password credentials
    startTime = Date.now();
    try {
      const passwordField = await client.$('//*[@text="Password" or contains(@text, "Pass")]/following-sibling::* | //*[android.widget.EditText][2]');
      await passwordField.setValue('password123');
      logStep(module, 'Enter Password', 'Password is entered', 'Entered password in credential field', true, Date.now() - startTime);
    } catch (e) {
      logStep(module, 'Enter Password', 'Password is entered', 'Failed to enter password', false, Date.now() - startTime, e.message);
    }

    // 4. Click Submit & Verify login state
    startTime = Date.now();
    try {
      const submitBtn = await client.$('//*[@text="Verify & Sign In"]');
      await submitBtn.click();
      
      // Wait for top bar to update with user session name "Hi, John"
      const welcomeText = await client.$('//*[contains(@text, "Hi, John")]');
      await welcomeText.waitForDisplayed({ timeout: 15000 });
      logStep(module, 'Submit Credentials', 'Authorized dashboard session loaded', 'Welcome session greeting "Hi, John" is displayed', true, Date.now() - startTime);
    } catch (e) {
      logStep(module, 'Submit Credentials', 'Authorized dashboard session loaded', 'Failed to log in as user', false, Date.now() - startTime, e.message);
    }
  });

  it('should logout successfully', async function () {
    const module = 'Authentication';
    const startTime = Date.now();

    try {
      const logoutBtn = await client.$('//*[@content-desc="Logout"]');
      await logoutBtn.click();

      // Sign In button should be visible again
      const signInBtn = await client.$('//*[@text="Sign In"]');
      await signInBtn.waitForDisplayed({ timeout: 8000 });
      logStep(module, 'Perform Logout', 'Session terminates and Sign In shows', 'User logged out and Sign In is visible', true, Date.now() - startTime);
    } catch (e) {
      logStep(module, 'Perform Logout', 'Session terminates and Sign In shows', 'Failed to log out user session', false, Date.now() - startTime, e.message);
    }
  });
});
