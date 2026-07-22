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
    console.log('[Reports] Starting generation of Excel, HTML, and JSON E2E test reports...');
    
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

    // 4. Generate GitHub Actions Markdown Summary
    const summaryMdPath = path.join(config.reportsDir, 'Summary/summary.md');
    const summaryMarkdown = generateMarkdownSummary(config.baseUrl, totalCount, passedCount, failedCount, skippedCount, passRate, durationStr, failedList);
    fs.writeFileSync(summaryMdPath, summaryMarkdown);
    
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
  // Styles configuration
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

  // Style Headers helper
  const styleHeader = (sheet) => {
    const row = sheet.getRow(1);
    row.height = 26;
    row.eachCell(cell => {
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: tealHeaderColor } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
  };

  // 1. Populate Sheet 1: Executed Test Cases
  results.forEach((r, idx) => {
    const row = execSheet.addRow({
      id: r.id,
      module: r.module,
      name: r.name,
      status: r.status,
      duration: `${r.duration}ms`,
      priority: r.priority
    });
    row.height = 20;
    
    // Color status
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

  // 2. Populate Sheet 2: Passed Tests
  passedList.forEach(r => {
    passedSheet.addRow({ id: r.id, module: r.module, name: r.name, priority: r.priority });
  });

  // 3. Populate Sheet 3: Failed Tests
  failedList.forEach(r => {
    failedSheet.addRow({ id: r.id, module: r.module, name: r.name, priority: r.priority, error: r.error });
  });

  // 4. Populate Sheet 4: Skipped Tests
  skippedList.forEach(r => {
    skippedSheet.addRow({ id: r.id, module: r.module, name: r.name, priority: r.priority });
  });

  // 5. Populate Sheet 5: Execution Metrics
  metricsSheet.addRow({ metric: 'Execution Timestamp', value: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString() });
  metricsSheet.addRow({ metric: 'Target Live Environment', value: config.baseUrl });
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

  // 6. Populate Sheet 6: Defect Summary
  failedList.forEach((r, idx) => {
    defectSheet.addRow({
      defectId: `DEF-${String(idx + 1).padStart(3, '0')}`,
      testId: r.id,
      module: r.module,
      error: r.error
    });
  });

  // Apply headers to all workbook sheets
  [execSheet, passedSheet, failedSheet, skippedSheet, metricsSheet, defectSheet].forEach(sheet => {
    styleHeader(sheet);
    // Align columns
    sheet.eachRow((row, rowNum) => {
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      if (['Executed Test Cases', 'Passed Tests', 'Failed Tests', 'Skipped Tests'].includes(sheet.name)) {
        row.getCell('priority').alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  });

  await workbook.xlsx.writeFile(reportPath);

  // --- REPORT 2: Failed_Test_Cases.xlsx ---
  const failedWb = new ExcelJS.Workbook();
  const fOnlySheet = failedWb.addWorksheet('Failed Cases');
  fOnlySheet.views = [{ showGridLines: true }];
  fOnlySheet.columns = failedSheet.columns;
  failedList.forEach(r => {
    fOnlySheet.addRow({ id: r.id, module: r.module, name: r.name, priority: r.priority, error: r.error });
  });
  styleHeader(fOnlySheet);
  await failedWb.xlsx.writeFile(path.join(config.reportsDir, 'Excel/Failed_Test_Cases.xlsx'));

  // --- REPORT 3: Passed_Test_Cases.xlsx ---
  const passedWb = new ExcelJS.Workbook();
  const pOnlySheet = passedWb.addWorksheet('Passed Cases');
  pOnlySheet.views = [{ showGridLines: true }];
  pOnlySheet.columns = passedSheet.columns;
  passedList.forEach(r => {
    pOnlySheet.addRow({ id: r.id, module: r.module, name: r.name, priority: r.priority });
  });
  styleHeader(pOnlySheet);
  await passedWb.xlsx.writeFile(path.join(config.reportsDir, 'Excel/Passed_Test_Cases.xlsx'));

  // --- REPORT 4: Summary_Report.xlsx ---
  const summaryWb = new ExcelJS.Workbook();
  const summaryGridSheet = summaryWb.addWorksheet('Metrics Dashboard');
  summaryGridSheet.views = [{ showGridLines: true }];
  summaryGridSheet.columns = metricsSheet.columns;
  
  metricsSheet.eachRow(row => {
    summaryGridSheet.addRow({ metric: row.getCell(1).value, value: row.getCell(2).value });
  });
  styleHeader(summaryGridSheet);
  await summaryWb.xlsx.writeFile(path.join(config.reportsDir, 'Excel/Summary_Report.xlsx'));
}

// ----------------------------------------------------
// HTML COMPILATION FUNCTIONS
// ----------------------------------------------------
function compileHtmlReports(results, total, passed, failed, skipped, passRate, duration) {
  const cssStyles = `
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0b1329; color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; background: #0f172a; padding: 30px; border-radius: 16px; border: 1px border #1e293b; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { color: #ffffff; text-align: center; font-size: 28px; font-weight: 800; margin-top: 0; }
    h2 { color: #38bdf8; border-bottom: 2px solid #1e293b; padding-bottom: 8px; margin-top: 30px; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin: 30px 0; }
    .card { background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; text-align: center; }
    .card .val { font-size: 32px; font-weight: 800; color: #ffffff; margin-top: 5px; }
    .card.pass .val { color: #4ade80; }
    .card.fail .val { color: #f87171; }
    .card.rate .val { color: #38bdf8; }
    .card.skip .val { color: #fbbf24; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #0f172a; border-radius: 8px; overflow: hidden; }
    th { background: #0f766e; color: white; text-align: left; padding: 12px 15px; font-size: 13px; font-weight: bold; }
    td { padding: 12px 15px; font-size: 13px; border-bottom: 1px solid #1e293b; color: #cbd5e1; }
    tr:nth-child(even) { background-color: #1e293b; }
    .status { font-weight: bold; padding: 4px 8px; border-radius: 6px; font-size: 11px; text-align: center; display: inline-block; }
    .status.pass { background: rgba(74, 222, 128, 0.15); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.3); }
    .status.fail { background: rgba(248, 113, 113, 0.15); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.3); }
    .status.skip { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); }
  `;

  // HTML Report 1: dashboard.html
  const dashboardHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>E2E Automation Dashboard</title>
      <style>${cssStyles}</style>
    </head>
    <body>
      <div class="container">
        <h1>GSMS Live E2E Automation Dashboard</h1>
        <div style="text-align: center; font-size: 13px; color: #94a3b8;">
          Environment: <a href="${config.baseUrl}" target="_blank" style="color: #38bdf8; text-decoration: none;">${config.baseUrl}</a> | Tested: ${new Date().toLocaleString()}
        </div>
        
        <div class="metrics">
          <div class="card">Total Cases<div class="val">${total}</div></div>
          <div class="card pass">Passed<div class="val">${passed}</div></div>
          <div class="card fail">Failed<div class="val">${failed}</div></div>
          <div class="card skip">Skipped<div class="val">${skipped}</div></div>
          <div class="card rate">Pass Rate<div class="val">${passRate.toFixed(1)}%</div></div>
          <div class="card">Duration<div class="val">${duration}</div></div>
        </div>

        <h2>Failed Cases Details</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 10%;">ID</th>
              <th style="width: 15%;">Module</th>
              <th style="width: 40%;">Test Case Name</th>
              <th style="width: 35%;">Failure Reason</th>
            </tr>
          </thead>
          <tbody>
            ${results.filter(r => r.status === 'FAIL').map(r => `
              <tr>
                <td style="font-weight: bold; color: #f87171;">${r.id}</td>
                <td>${r.module}</td>
                <td>${r.name}</td>
                <td style="color: #fca5a5; font-family: monospace; font-size: 11px;">${r.error}</td>
              </tr>
            `).join('') || '<tr><td colspan="4" style="text-align: center; color: #4ade80; font-weight: bold; padding: 20px;">✓ All test cases executed and passed successfully!</td></tr>'}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
  fs.writeFileSync(path.join(config.reportsDir, 'HTML/dashboard.html'), dashboardHtml);

  // HTML Report 2: execution-report.html (Full logs)
  const reportHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Complete E2E Execution Report</title>
      <style>${cssStyles}</style>
    </head>
    <body>
      <div class="container">
        <h1>GSMS Complete E2E Execution Report</h1>
        <div style="text-align: center; font-size: 13px; color: #94a3b8;">
          Environment: <a href="${config.baseUrl}" target="_blank" style="color: #38bdf8; text-decoration: none;">${config.baseUrl}</a> | Tested: ${new Date().toLocaleString()}
        </div>

        <div class="metrics">
          <div class="card">Total<div class="val">${total}</div></div>
          <div class="card pass">Passed<div class="val">${passed}</div></div>
          <div class="card fail">Failed<div class="val">${failed}</div></div>
          <div class="card rate">Pass Rate<div class="val">${passRate.toFixed(1)}%</div></div>
        </div>

        <h2>Detailed Execution logs</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 8%;">ID</th>
              <th style="width: 15%;">Module</th>
              <th style="width: 35%;">Test Name</th>
              <th style="width: 10%; text-align: center;">Status</th>
              <th style="width: 10%; text-align: center;">Time</th>
              <th style="width: 22%;">Result Log</th>
            </tr>
          </thead>
          <tbody>
            ${results.map(r => `
              <tr>
                <td style="font-weight: bold;">${r.id}</td>
                <td>${r.module}</td>
                <td>${r.name}</td>
                <td style="text-align: center;">
                  <span class="status ${r.status.toLowerCase()}">${r.status}</span>
                </td>
                <td style="text-align: center;">${r.duration}ms</td>
                <td style="font-size: 12px; color: ${r.status === 'FAIL' ? '#fca5a5' : '#94a3b8'}">${r.actual || r.error || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
  fs.writeFileSync(path.join(config.reportsDir, 'HTML/execution-report.html'), reportHtml);
}

// ----------------------------------------------------
// MARKDOWN SUMMARY GENERATION
// ----------------------------------------------------
function generateMarkdownSummary(url, total, passed, failed, skipped, passRate, duration, failedList) {
  const buildStatus = failed === 0 ? '🟢 PASS' : '🔴 FAIL';
  const deployStatus = '🟢 PASS'; // Resolved in wait step

  // Compile module statistics
  const modules = [...new Set(failedList.map(f => f.module))];
  const moduleStatsMarkdown = modules.length > 0
    ? modules.map(m => `- **${m}**: ${failedList.filter(f => f.module === m).length} failures`).join('\n')
    : 'No failures across any modules.';

  const failRows = failedList.slice(0, 10).map(f => 
    `| ${f.id} | ${f.module} | ${f.name} | \`${f.error.substring(0, 80)}\` |`
  ).join('\n');

  return `
# Live GitHub Pages E2E Execution Summary

- **Deployment URL**: [${url}](${url})
- **Execution Date**: ${new Date().toUTCString()}
- **Build Status**: ${buildStatus}
- **Deployment Status**: ${deployStatus}

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

${failed > 0 ? `
## 🚨 Failed Modules & Trace Logs

${moduleStatsMarkdown}

### Failure Sample Details (Max 10)

| Test ID | Module | Test Case Name | Failure Reason |
| :--- | :--- | :--- | :--- |
${failRows}
` : '## 🟢 All Modules Passed successfully!'}

---

## 📦 Generated Artifacts

- ✓ **Excel Reports**: \`Automation_Test_Report.xlsx\`, \`Failed_Test_Cases.xlsx\`, \`Passed_Test_Cases.xlsx\`, \`Summary_Report.xlsx\`
- ✓ **HTML Dashboards**: \`execution-report.html\`, \`dashboard.html\`
- ✓ **Screenshots & Fail Logs**: Under \`screenshots/\` and \`logs/\`
`;
}

module.exports = reportGenerator;
