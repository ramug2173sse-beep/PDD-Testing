const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const config = require('../config/config');

// Ensure directories exist
[
  config.reportsDir,
  config.screenshotsDir,
  config.logsDir,
  path.join(config.reportsDir, 'Excel'),
  path.join(config.reportsDir, 'HTML'),
  path.join(config.reportsDir, 'JSON'),
  path.join(config.reportsDir, 'Summary')
].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const reportGenerator = {
  generate: async (results, testCases) => {
    console.log('[Reports] Starting generation of Excel, HTML, and JSON Mobile Appium test reports...');
    
    // Complete results compilation
    const executedResults = testCases.map(tc => {
      // Find matching dynamic run result
      const run = results.find(r => r.id === tc.id) || {
        status: 'SKIPPED',
        duration: 0,
        actual: 'Skipped during E2E regression run.',
        error: ''
      };
      
      return {
        ...tc,
        status: run.status,
        duration: run.duration,
        actual: run.actual,
        error: run.error,
        screenshot: run.screenshot || ''
      };
    });

    const passedList = executedResults.filter(r => r.status === 'PASS');
    const failedList = executedResults.filter(r => r.status === 'FAIL');
    const skippedList = executedResults.filter(r => r.status === 'SKIPPED');
    const totalCount = executedResults.length;
    const passedCount = passedList.length;
    const failedCount = failedList.length;
    const skippedCount = skippedList.length;
    const passRate = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;
    
    // Calculate durations
    const totalDuration = executedResults.reduce((acc, r) => acc + r.duration, 0);
    const durationStr = `${(totalDuration / 1000).toFixed(1)}s`;

    // 1. Write JSON Report
    const resultsJsonPath = path.join(config.reportsDir, 'JSON/execution-results.json');
    fs.writeFileSync(resultsJsonPath, JSON.stringify({
      summary: {
        total: totalCount,
        passed: passedCount,
        failed: failedCount,
        skipped: skippedCount,
        passRate: `${passRate.toFixed(2)}%`,
        duration: durationStr,
        timestamp: new Date().toISOString()
      },
      results: executedResults
    }, null, 2));

    // 2. Compile Excel Reports
    await compileExcelReports(executedResults, passedList, failedList, skippedList, totalCount, passedCount, failedCount, skippedCount, passRate, durationStr);

    // 3. Compile HTML Reports
    compileHtmlReports(executedResults, totalCount, passedCount, failedCount, skippedCount, passRate, durationStr);

    // 4. Generate Markdown Summary
    const summaryMdPath = path.join(config.reportsDir, 'Summary/summary.md');
    const summaryMarkdown = generateMarkdownSummary(totalCount, passedCount, failedCount, skippedCount, passRate, durationStr, failedList);
    fs.writeFileSync(summaryMdPath, summaryMarkdown);
    
    // 5. Also copy/save the core report to the parent appium-tests folder as E2E_Test_Report.xlsx
    const coreReportPath = path.join(config.reportsDir, 'Excel/Automation_Test_Report.xlsx');
    const rootReportPath = path.join(__dirname, '../../E2E_Test_Report.xlsx');
    const appiumTestReportPath = path.join(__dirname, '../E2E_Test_Report.xlsx');
    
    try {
      fs.copyFileSync(coreReportPath, appiumTestReportPath);
      console.log(`[Reports] Copied main report to: ${appiumTestReportPath}`);
      fs.copyFileSync(coreReportPath, rootReportPath);
      console.log(`[Reports] Copied main report to root: ${rootReportPath}`);
    } catch (e) {
      console.error('[Reports] Failed to copy core report to root/parent folders', e);
    }

    console.log('[Reports] Excel, HTML, and JSON E2E test reports generated successfully.');
    return {
      passPercentage: passRate,
      failedCount: failedCount
    };
  }
};

// ----------------------------------------------------
// EXCEL COMPILATION FUNCTIONS
// ----------------------------------------------------
async function compileExcelReports(results, passedList, failedList, skippedList, total, passed, failed, skipped, passRate, duration) {
  const tealHeaderColor = 'FF0F766E';
  const greenStatusColor = 'FFD1E7DD';
  const redStatusColor = 'FFF8D7DA';
  const yellowStatusColor = 'FFFFF3CD';

  // --- REPORT 1: Automation_Test_Report.xlsx (The Core Report) ---
  const reportPath = path.join(config.reportsDir, 'Excel/Automation_Test_Report.xlsx');
  const workbook = new ExcelJS.Workbook();

  // Sheet 1: Executed Test Cases
  const execSheet = workbook.addWorksheet('Executed Test Cases');
  execSheet.views = [{ showGridLines: true }];
  execSheet.columns = [
    { header: 'Test ID', key: 'id', width: 12 },
    { header: 'Module', key: 'module', width: 22 },
    { header: 'Test Name', key: 'name', width: 45 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Execution Time', key: 'duration', width: 18 },
    { header: 'Priority', key: 'priority', width: 15 }
  ];

  // Sheet 2: Passed Tests
  const passedSheet = workbook.addWorksheet('Passed Tests');
  passedSheet.views = [{ showGridLines: true }];
  passedSheet.columns = [
    { header: 'Test ID', key: 'id', width: 12 },
    { header: 'Module', key: 'module', width: 22 },
    { header: 'Test Name', key: 'name', width: 45 },
    { header: 'Priority', key: 'priority', width: 15 }
  ];

  // Sheet 3: Failed Tests
  const failedSheet = workbook.addWorksheet('Failed Tests');
  failedSheet.views = [{ showGridLines: true }];
  failedSheet.columns = [
    { header: 'Test ID', key: 'id', width: 12 },
    { header: 'Module', key: 'module', width: 22 },
    { header: 'Test Name', key: 'name', width: 45 },
    { header: 'Priority', key: 'priority', width: 15 },
    { header: 'Failure Reason', key: 'error', width: 50 }
  ];

  // Sheet 4: Skipped Tests
  const skippedSheet = workbook.addWorksheet('Skipped Tests');
  skippedSheet.views = [{ showGridLines: true }];
  skippedSheet.columns = [
    { header: 'Test ID', key: 'id', width: 12 },
    { header: 'Module', key: 'module', width: 22 },
    { header: 'Test Name', key: 'name', width: 45 },
    { header: 'Priority', key: 'priority', width: 15 }
  ];

  // Sheet 5: Execution Metrics
  const metricsSheet = workbook.addWorksheet('Execution Metrics');
  metricsSheet.views = [{ showGridLines: true }];
  metricsSheet.columns = [
    { header: 'Metric Category', key: 'metric', width: 25 },
    { header: 'Value', key: 'value', width: 20 }
  ];

  // Sheet 6: Defect Summary
  const defectSheet = workbook.addWorksheet('Defect Summary');
  defectSheet.views = [{ showGridLines: true }];
  defectSheet.columns = [
    { header: 'Defect ID', key: 'defectId', width: 15 },
    { header: 'Test ID', key: 'testId', width: 15 },
    { header: 'Module', key: 'module', width: 22 },
    { header: 'Failure Detail Reason', key: 'error', width: 50 }
  ];

  // Style Headers
  const styleHeader = (sheet) => {
    const row = sheet.getRow(1);
    row.height = 26;
    row.eachCell(cell => {
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: tealHeaderColor } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
  };

  // Populate Executed Test Cases
  results.forEach((r) => {
    const row = execSheet.addRow({
      id: r.id,
      module: r.module,
      name: r.name,
      status: r.status,
      duration: `${r.duration}ms`,
      priority: r.priority
    });
    row.height = 20;
    
    const statusCell = row.getCell('status');
    statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
    if (r.status === 'PASS') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: greenStatusColor } };
      statusCell.font = { name: 'Segoe UI', bold: true, color: { argb: '0F5132' } };
    } else if (r.status === 'FAIL') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: redStatusColor } };
      statusCell.font = { name: 'Segoe UI', bold: true, color: { argb: '842029' } };
    } else {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: yellowStatusColor } };
      statusCell.font = { name: 'Segoe UI', bold: true, color: { argb: '664D03' } };
    }
  });

  passedList.forEach(r => {
    passedSheet.addRow({ id: r.id, module: r.module, name: r.name, priority: r.priority });
  });

  failedList.forEach(r => {
    failedSheet.addRow({ id: r.id, module: r.module, name: r.name, priority: r.priority, error: r.error });
  });

  skippedList.forEach(r => {
    skippedSheet.addRow({ id: r.id, module: r.module, name: r.name, priority: r.priority });
  });

  metricsSheet.addRow({ metric: 'Execution Timestamp', value: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString() });
  metricsSheet.addRow({ metric: 'Target Platform', value: 'Android OS' });
  metricsSheet.addRow({ metric: 'Total Executable Cases', value: total });
  metricsSheet.addRow({ metric: 'Passed Cases Count', value: passed });
  metricsSheet.addRow({ metric: 'Failed Cases Count', value: failed });
  metricsSheet.addRow({ metric: 'Skipped Cases Count', value: skipped });
  metricsSheet.addRow({ metric: 'E2E Suite Pass Percentage', value: `${passRate.toFixed(2)}%` });
  metricsSheet.addRow({ metric: 'Total Suite Duration', value: duration });
  
  metricsSheet.eachRow((row, rowNum) => {
    if (rowNum > 1) {
      row.getCell('metric').font = { bold: true, name: 'Segoe UI', size: 10 };
      if (rowNum === 7) {
        row.getCell('value').font = { bold: true, name: 'Segoe UI', size: 11, color: { argb: passRate >= 95 ? 'FF0F5132' : 'FF842029' } };
      }
    }
  });

  failedList.forEach((r, idx) => {
    defectSheet.addRow({
      defectId: `DEF-${String(idx + 1).padStart(3, '0')}`,
      testId: r.id,
      module: r.module,
      error: r.error
    });
  });

  [execSheet, passedSheet, failedSheet, skippedSheet, metricsSheet, defectSheet].forEach(sheet => {
    styleHeader(sheet);
    sheet.eachRow((row, rowNum) => {
      if (rowNum > 1) {
        row.eachCell(cell => {
          if (cell.font && cell.font.name !== 'Segoe UI') {
            cell.font = { name: 'Segoe UI', size: 9 };
          }
        });
      }
    });
  });

  await workbook.xlsx.writeFile(reportPath);

  // --- REPORT 2: Summary_Report.xlsx ---
  const summaryPath = path.join(config.reportsDir, 'Excel/Summary_Report.xlsx');
  const sumBook = new ExcelJS.Workbook();
  const sumSheet = sumBook.addWorksheet('Summary');
  sumSheet.views = [{ showGridLines: true }];
  sumSheet.columns = [
    { header: 'Execution Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 25 }
  ];
  styleHeader(sumSheet);
  sumSheet.addRow({ metric: 'Timestamp', value: new Date().toISOString() });
  sumSheet.addRow({ metric: 'Platform', value: 'Android OS (UiAutomator2)' });
  sumSheet.addRow({ metric: 'Total Scenarios', value: total });
  sumSheet.addRow({ metric: 'Passed Scenarios', value: passed });
  sumSheet.addRow({ metric: 'Failed Scenarios', value: failed });
  sumSheet.addRow({ metric: 'Success Ratio', value: `${passRate.toFixed(2)}%` });
  sumSheet.addRow({ metric: 'Total Duration', value: duration });
  await sumBook.xlsx.writeFile(summaryPath);

  // --- REPORT 3: Passed_Test_Cases.xlsx ---
  const passedBook = new ExcelJS.Workbook();
  const passS = passedBook.addWorksheet('Passed');
  passS.views = [{ showGridLines: true }];
  passS.columns = [
    { header: 'Test ID', key: 'id', width: 12 },
    { header: 'Module', key: 'module', width: 22 },
    { header: 'Name', key: 'name', width: 45 }
  ];
  styleHeader(passS);
  passedList.forEach(r => passS.addRow({ id: r.id, module: r.module, name: r.name }));
  await passedBook.xlsx.writeFile(path.join(config.reportsDir, 'Excel/Passed_Test_Cases.xlsx'));

  // --- REPORT 4: Failed_Test_Cases.xlsx ---
  const failedBook = new ExcelJS.Workbook();
  const failS = failedBook.addWorksheet('Failed');
  failS.views = [{ showGridLines: true }];
  failS.columns = [
    { header: 'Test ID', key: 'id', width: 12 },
    { header: 'Module', key: 'module', width: 22 },
    { header: 'Name', key: 'name', width: 45 },
    { header: 'Error', key: 'error', width: 50 }
  ];
  styleHeader(failS);
  failedList.forEach(r => failS.addRow({ id: r.id, module: r.module, name: r.name, error: r.error }));
  await failedBook.xlsx.writeFile(path.join(config.reportsDir, 'Excel/Failed_Test_Cases.xlsx'));
}

// ----------------------------------------------------
// HTML COMPILATION FUNCTIONS
// ----------------------------------------------------
function compileHtmlReports(results, total, passed, failed, skipped, passRate, duration) {
  const htmlTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>GSMS Mobile E2E Automation Dashboard</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: #f8fafc; color: #1e293b; }
    h1 { color: #0f766e; margin-bottom: 20px; text-align: center; }
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px; }
    .card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
    .card .val { font-size: 24px; font-weight: bold; margin-top: 5px; color: #0f766e; }
    .card.pass .val { color: #15803d; }
    .card.fail .val { color: #b91c1c; }
    .table-container { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 15px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #0f766e; color: white; padding: 10px; font-weight: 600; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    tr:nth-child(even) td { background: #f8fafc; }
    .status-badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
    .status-badge.pass { background: #d1e7dd; color: #0f5132; }
    .status-badge.fail { background: #f8d7da; color: #842029; }
    .status-badge.skip { background: #fff3cd; color: #664d03; }
  </style>
</head>
<body>
  <h1>GSMS Mobile Appium E2E Automation Dashboard</h1>
  <div class="summary-cards">
    <div class="card"><div>Total Tests</div><div class="val">${total}</div></div>
    <div class="card pass"><div>Passed</div><div class="val">${passed}</div></div>
    <div class="card fail"><div>Failed</div><div class="val">${failed}</div></div>
    <div class="card"><div>Skipped</div><div class="val">${skipped}</div></div>
    <div class="card pass"><div>Pass Rate</div><div class="val">${passRate.toFixed(2)}%</div></div>
    <div class="card"><div>Duration</div><div class="val">${duration}</div></div>
  </div>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Test ID</th>
          <th>Module</th>
          <th>Test Name</th>
          <th>Status</th>
          <th>Duration</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        \${tableRows}
      </tbody>
    </table>
  </div>
</body>
</html>`;

  const rowsHtml = results.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.module}</td>
      <td>${r.name}</td>
      <td><span class="status-badge ${r.status.toLowerCase()}">${r.status}</span></td>
      <td>${r.duration}ms</td>
      <td>${r.priority}</td>
    </tr>
  `).join('');

  const completedHtml = htmlTemplate.replace('${tableRows}', rowsHtml);

  fs.writeFileSync(path.join(config.reportsDir, 'HTML/dashboard.html'), completedHtml);
  fs.writeFileSync(path.join(config.reportsDir, 'HTML/execution-report.html'), completedHtml);
}

// ----------------------------------------------------
// MARKDOWN COMPILATION
// ----------------------------------------------------
function generateMarkdownSummary(total, passed, failed, skipped, passRate, duration, failedList) {
  let summary = `# Android Appium E2E Execution Summary
 
- **Platform**: Android OS (UiAutomator2)
- **Execution Date**: ${new Date().toUTCString()}
- **Build Status**: ${failed === 0 ? '🟢 PASS' : '🔴 FAIL'}
- **Deployment Status**: 🟢 PASS
 
---
 
## 📈 Test Metrics Dashboard
 
| Metric Category | Count / Value |
| :--- | :--- |
| **Total Test Cases** | ${total} |
| **Passed Cases** | ${passed} |
| **Failed Cases** | ${failed} |
| **Skipped Cases** | ${skipped} |
| **Pass Percentage** | **${passRate.toFixed(2)}%** |
| **Execution Duration** | ${duration} |
 
---
`;

  if (failed === 0) {
    summary += `\n## 🟢 All Modules Passed successfully!\n`;
  } else {
    summary += `\n## 🔴 Failed Test Cases:\n\n| Test ID | Module | Test Name | Error |\n| :--- | :--- | :--- | :--- |\n`;
    failedList.forEach(f => {
      summary += `| ${f.id} | ${f.module} | ${f.name} | ${f.error} |\n`;
    });
  }

  summary += `\n---
 
## 📦 Generated Artifacts
 
- ✓ **Excel Reports**: \`Automation_Test_Report.xlsx\`, \`Failed_Test_Cases.xlsx\`, \`Passed_Test_Cases.xlsx\`, \`Summary_Report.xlsx\`
- ✓ **HTML Dashboards**: \`execution-report.html\`, \`dashboard.html\`
- ✓ **Screenshots & Fail Logs**: Under \`screenshots/\` and \`logs/\`
`;

  return summary;
}

module.exports = reportGenerator;
