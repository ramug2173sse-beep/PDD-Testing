# GSMS Android Appium E2E Tests Setup Guide

This sub-project contains the Appium End-to-End (E2E) testing framework for the GSMS Android Mobile Application. The test suite automatically navigates the application, tests user authentication, and compiles a color-coded, professional Excel analysis report.

---

## 📂 Project Structure

```text
gsms-mobile/appium-tests/
│
├── tests/
│   └── appium.test.js     # Primary Appium test suite utilizing WebdriverIO & Mocha
├── E2E_Test_Report.xlsx   # Generated Excel test execution report (auto-created on test run)
├── package.json           # Declarations of dependencies (webdriverio, exceljs, mocha)
└── README.md              # Setup and execution guide (this file)
```

---

## 🛠️ Prerequisites

Before executing the tests, make sure you have the following installed on your system:

1. **Node.js** (v18 or higher)
2. **Android SDK & Platform Tools** (ensure `adb` is in your environment PATH)
3. **Appium Server**:
   ```bash
   npm install -g appium
   ```
4. **Appium UiAutomator2 Driver**:
   ```bash
   appium driver install uiautomator2
   ```

---

## 🚀 Running the Tests

Follow these step-by-step instructions to compile your APK, boot your emulator, and run the tests:

### Step 1: Compile the Android Debug APK
Compile the Android project into a debug package by running the following command from the `gsms-mobile/` root directory:
- **Windows**:
  ```powershell
  ./gradlew.bat assembleDebug
  ```
- **macOS/Linux**:
  ```bash
  ./gradlew assembleDebug
  ```
This builds and outputs the APK at `gsms-mobile/app/build/outputs/apk/debug/app-debug.apk`.

### Step 2: Start an Android Emulator
Start your target Android Emulator (e.g. from Android Studio Device Manager) or connect a physical Android device via USB with USB Debugging enabled. Ensure your device is connected by running:
```bash
adb devices
```

### Step 3: Install Test Dependencies
Navigate to the `appium-tests` directory and install the necessary E2E automation packages:
```bash
cd gsms-mobile/appium-tests
npm install
```

### Step 4: Start the Appium Server
Open a new terminal window and launch the Appium server:
```bash
appium
```
*Note: Make sure Appium runs on `http://127.0.0.1:4723`.*

### Step 5: Execute Appium E2E Tests
In your test terminal, execute the test script:
```bash
npm test
```
The framework will:
1. Boot Chrome Driver & connect to your emulator.
2. Launch the GSMS Smart Portal app.
3. Test dashboard tab transitions.
4. Perform clinical patient authentication (`john@gmail.com` / `password123`).
5. Perform a patient session logout.
6. Automatically compile all test results into `E2E_Test_Report.xlsx` in the `appium-tests/` root folder.

---

## 📊 Viewing the Excel Analysis Report

Upon test completion, open `E2E_Test_Report.xlsx` using Microsoft Excel, LibreOffice Calc, or Google Sheets. The spreadsheet is split into two sheets:
1. **Dashboard**: High-level execution metrics (Execution Time, Platform, Total Steps, Passed, Failed, Pass Rate with colors).
2. **E2E Test Details**: Step-by-step logs featuring step descriptions, durations, module classifications, status metrics (Teal headers, Green for PASS, Red for FAIL), and detailed error reports in case of failures.
