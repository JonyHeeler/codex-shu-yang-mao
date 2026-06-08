@echo off
setlocal

cd /d "%~dp0"
title Codex 数羊毛

echo.
echo Codex 数羊毛 Quick Start
echo =================================

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Please install Node.js 22 or newer first.
  echo https://nodejs.org/
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Please reinstall Node.js with npm enabled.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 goto failed
)

if not exist "dist\main\main\main.js" (
  echo Building desktop app...
  call npm run build
  if errorlevel 1 goto failed
)

echo Starting desktop window...
call npm start
if errorlevel 1 goto failed

exit /b 0

:failed
echo.
echo Startup failed. Please check the messages above.
pause
exit /b 1
