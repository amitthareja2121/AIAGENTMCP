param(
    [Parameter(Mandatory=$true)]
    [string]$TS,
    [Parameter(Mandatory=$false)]
    [string]$TC = "ALL"
)

# Normalise Suite number
$tsNum    = $TS -replace 'TS-', ''
$tsPadded = $tsNum.PadLeft(3,'0')
$tsLabel  = "TS-$tsPadded"
$tsDir    = "tests/$tsLabel"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  AI AGENT MCP  --  PIPELINE START"        -ForegroundColor Cyan
Write-Host "  Suite: $tsLabel"                          -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Validate suite folder exists
if (-not (Test-Path $tsDir)) {
    Write-Host "[ERROR] Suite folder not found: $tsDir" -ForegroundColor Red
    exit 1
}

# Resolve TC list
if ($TC -eq "ALL") {
    $specFiles = Get-ChildItem "$tsDir/TC-*.spec.ts" -ErrorAction SilentlyContinue
    if (-not $specFiles) { Write-Host "[ERROR] No TC specs found in $tsDir" -ForegroundColor Red; exit 1 }
    $tcList = $specFiles | ForEach-Object {
        $n = ($_.Name -replace 'TC-','') -replace '\.spec\.ts',''
        "TC-$($n.PadLeft(3,'0'))"
    } | Sort-Object
} else {
    $tcList = $TC -split ',' | ForEach-Object {
        $n = $_.Trim() -replace 'TC-', ''
        "TC-$($n.PadLeft(3,'0'))"
    }
}

$dateStr   = Get-Date -Format "yyyy-MM-dd"
$allLabel  = "$tsLabel+" + ($tcList -join "+")

Write-Host "  Session: $allLabel" -ForegroundColor Cyan
Write-Host ""

# Validate all spec files
foreach ($tcLabel in $tcList) {
    if (-not (Test-Path "$tsDir/$tcLabel.spec.ts")) {
        Write-Host "[ERROR] Spec not found: $tsDir/$tcLabel.spec.ts" -ForegroundColor Red; exit 1
    }
}
Write-Host "  [OK] Step 0 -- All spec files validated." -ForegroundColor Green

# Carry forward history from last full report into allure-results/history
if (Test-Path "allure-report-full\history") {
    Copy-Item "allure-report-full\history" "allure-results\history" -Recurse -Force
}

# Clean allure-results (preserve categories, executor, history)
Get-ChildItem "allure-results" | Where-Object { $_.Name -notin @("categories.json","executor.json","history") } | Remove-Item -Recurse -Force
Write-Host "  [OK] Step 1 -- allure-results cleaned for fresh session." -ForegroundColor Green

# Refresh executor.json
$buildOrder   = [long](Get-Date -Format "yyyyMMddHHmm")
$executorJson = '{"name":"Local Demo Machine","type":"local","url":"http://localhost","buildOrder":' + $buildOrder + ',"buildName":"' + $tsLabel + ' | E2E Demo Run","buildUrl":"http://localhost","reportName":"AI Agent MCP E2E Test Report","reportUrl":"http://127.0.0.1"}'
$executorJson | Set-Content "allure-results\executor.json" -Encoding UTF8
Write-Host "  [OK] Step 2 -- Executor metadata refreshed (build: $buildOrder)." -ForegroundColor Green

# Write environment.properties for the Environment widget
@"
Suite=$tsLabel
Browser=Chromium
Mode=Headed
BaseUrl=https://practicesoftwaretesting.com
Framework=Playwright
Language=TypeScript
Date=$dateStr
"@ | Set-Content "allure-results\environment.properties" -Encoding UTF8
Write-Host "  [OK] Step 3 -- Environment properties written." -ForegroundColor Green

# Run each TC
$overallPassed = 0; $overallFailed = 0

foreach ($tcLabel in $tcList) {
    $tcPadded = $tcLabel -replace 'TC-', ''
    Write-Host ""
    Write-Host "------------------------------------------" -ForegroundColor DarkCyan
    Write-Host "  RUNNING: $tsLabel / $tcLabel (headed Chromium)" -ForegroundColor DarkCyan
    Write-Host "------------------------------------------" -ForegroundColor DarkCyan
    Write-Host ""

    & cmd.exe /c "npx playwright test $tsDir/$tcLabel.spec.ts --headed --project=chromium"
    $exitCode = $LASTEXITCODE
    $status   = if ($exitCode -eq 0) { "Passed" } else { "Failed" }
    $color    = if ($status -eq "Passed") { "Green" } else { "Red" }

    if ($status -eq "Passed") { $overallPassed++ } else { $overallFailed++ }

    Write-Host ""
    Write-Host "  [OK] $tsLabel/$tcLabel finished: $status" -ForegroundColor $color

    python update_excel_summary.py --id $tcPadded --status $status --suite "$tsLabel"
    Write-Host "  [OK] Excel updated for $tsLabel/$tcLabel." -ForegroundColor Green
}

# Generate Allure report
Write-Host ""
Write-Host "------------------------------------------" -ForegroundColor DarkCyan
Write-Host "  GENERATING ALLURE REPORT"                -ForegroundColor DarkCyan
Write-Host "------------------------------------------" -ForegroundColor DarkCyan

$archiveFolder = "C:\Users\1000528\files_claude\AllureReports"
if (-not (Test-Path $archiveFolder)) { New-Item -ItemType Directory -Path $archiveFolder | Out-Null }

& cmd.exe /c "npx allure generate allure-results --clean -o allure-report-full"
Write-Host "  [OK] Full report generated (history extracted)." -ForegroundColor Green

# Persist history for the next run's trend graphs
if (Test-Path "allure-report-full\history") {
    if (-not (Test-Path "allure-results\history")) { New-Item -ItemType Directory -Path "allure-results\history" | Out-Null }
    Copy-Item "allure-report-full\history\*" "allure-results\history\" -Recurse -Force
    Write-Host "  [OK] History persisted for next run." -ForegroundColor Green
}

# Generate portable single-file archive (now includes history in allure-results)
& cmd.exe /c "npx allure generate allure-results --single-file --clean -o allure-report"
# Derive next run counter for today + this suite
$existingRuns = Get-ChildItem $archiveFolder -Filter "Execution_Report_${dateStr}_${tsLabel}_Run-*.html" -ErrorAction SilentlyContinue
$runId = if ($existingRuns) {
    ($existingRuns | ForEach-Object {
        [int]($_.Name -replace ".*Run-(\d+)\.html", '$1')
    } | Measure-Object -Maximum).Maximum + 1
} else { 1 }
$runStr = $runId.ToString().PadLeft(3, '0')
$allReportPath = Join-Path $archiveFolder "Execution_Report_${dateStr}_${tsLabel}_Run-${runStr}.html"
Copy-Item "allure-report\index.html" $allReportPath -Force
Write-Host "  [OK] Report saved -> $allReportPath" -ForegroundColor Green

# Final summary
$sessionColor = if ($overallFailed -eq 0) { "Green" } else { "Red" }
Write-Host ""
Write-Host "==========================================" -ForegroundColor $sessionColor
Write-Host "  PIPELINE COMPLETE: $tsLabel"             -ForegroundColor $sessionColor
Write-Host "  Passed: $overallPassed  Failed: $overallFailed" -ForegroundColor $sessionColor
Write-Host "==========================================" -ForegroundColor $sessionColor
Write-Host ""

Start-Process $allReportPath
