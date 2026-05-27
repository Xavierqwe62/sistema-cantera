@echo off
REM ============================================================================
REM Canteras Renacimiento - Database Setup Script
REM ============================================================================
REM This batch file creates the database directory and runs the Node.js setup

REM First, create the database directory
mkdir "C:\Users\Xavier\para proyectos web\proyecto\backend\database" 2>nul

REM Now run the Node.js initialization script
cd /d "C:\Users\Xavier\para proyectos web\proyecto"
node init-database.js

if %errorlevel% neq 0 (
    echo.
    echo ✗ Database setup failed!
    pause
    exit /b 1
) else (
    echo.
    echo ✓ Database setup completed successfully!
    echo   Files created in: C:\Users\Xavier\para proyectos web\proyecto\backend\database\
    pause
)
