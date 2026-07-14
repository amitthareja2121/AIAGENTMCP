@echo off
set "REPORT=C:\Users\1000528\AIAgentMCP\allure-report\index.html"
if not exist "%REPORT%" (
    echo [ERROR] Report not found. Run the pipeline first.
    pause
    exit /b 1
)
echo Opening Allure Report...
rundll32 url.dll,FileProtocolHandler "%REPORT%"
