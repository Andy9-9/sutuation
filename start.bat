@echo off
REM ====================================================================
REM KHỞI CHẠY HỆ THỐNG ĐỒNG BỘ THỜI GIAN THỰC SỬ TUATION (WINDOWS)
REM ====================================================================

title SITUATION Realtime Sync Server
cd /d "%~dp0"

echo ================================================================
echo    🚀 KHOI DONG HE THONG LICH SU SU TUATION (REALTIME SYNC)
echo ================================================================

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [LOI] Chua cai dat Node.js. Vui long tai va cai dat tu: https://nodejs.org
    pause
    exit /b 1
)

start "" http://localhost:8080/
node sync_server.js
pause
