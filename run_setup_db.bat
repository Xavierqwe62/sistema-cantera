@echo off
REM Run database setup script
cd /d "C:\Users\Xavier\para proyectos web\proyecto"
node setup_db.js
if %errorlevel% equ 0 (
    echo.
    echo ✓ Setup complete!
    echo.
    pause
) else (
    echo.
    echo ✗ Setup failed
    echo.
    pause
)
