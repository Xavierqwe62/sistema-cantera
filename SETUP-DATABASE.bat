@echo off
REM ============================================================================
REM Canteras Renacimiento - Complete Database Setup
REM ============================================================================
REM This batch file initializes the database directory and SQL files

setlocal enabledelayedexpansion
cd /d "C:\Users\Xavier\para proyectos web\proyecto"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  Canteras Renacimiento - Database Initialization           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Try Python first (more widely available)
echo [1/2] Attempting to run with Python...
python init-database.py
if %errorlevel% equ 0 goto success

REM Fall back to Node.js
echo.
echo [2/2] Python not available, trying Node.js...
node init-database.js
if %errorlevel% equ 0 goto success

REM Both failed
echo.
echo ✗ Database setup failed!
echo.
echo Please ensure Python or Node.js is installed and try again.
echo.
pause
exit /b 1

:success
echo.
echo ════════════════════════════════════════════════════════════
echo ✓ Database setup completed successfully!
echo.
echo Location: C:\Users\Xavier\para proyectos web\proyecto\backend\database\
echo.
echo Files created:
echo   ✓ schema.sql  - 12 tables with complete structure
echo   ✓ seed.sql    - Sample data for testing
echo ════════════════════════════════════════════════════════════
echo.
pause
