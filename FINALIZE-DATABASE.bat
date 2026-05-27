@echo off
REM ============================================================================
REM Canteras Renacimiento - Finalize Database Setup
REM ============================================================================
REM Move the generated SQL files to the backend/database directory

setlocal enabledelayedexpansion
cd /d "C:\Users\Xavier\para proyectos web\proyecto"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  Finalizing Database Setup                                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Create the backend/database directory
echo [1/3] Creating database directory...
mkdir "backend\database" 2>nul
if exist "backend\database" (
    echo ✓ Directory created: backend\database
) else (
    echo ✗ Failed to create directory
    pause
    exit /b 1
)

REM Copy schema.sql
echo [2/3] Copying schema.sql...
if exist "schema.sql" (
    copy /Y "schema.sql" "backend\database\schema.sql" >nul
    echo ✓ Copied: schema.sql
) else (
    echo ✗ source file not found: schema.sql
    pause
    exit /b 1
)

REM Copy seed.sql
echo [3/3] Copying seed.sql...
if exist "seed.sql" (
    copy /Y "seed.sql" "backend\database\seed.sql" >nul
    echo ✓ Copied: seed.sql
) else (
    echo ✗ source file not found: seed.sql
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════
echo ✓ Database setup finalized successfully!
echo.
echo Location: backend\database\
echo.
echo Files:
echo   ✓ schema.sql  - 12 tables with complete structure
echo   ✓ seed.sql    - Sample data for testing
echo ════════════════════════════════════════════════════════════
echo.
echo Next steps:
echo   1. Create the MySQL database using: mysql < backend/database/schema.sql
echo   2. Populate sample data using: mysql < backend/database/seed.sql
echo   3. Or use MySQL Workbench to import these files directly
echo.
pause
