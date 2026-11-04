@echo off
set "PROJECT_ROOT=%~dp0.."
cd /d "%PROJECT_ROOT%"

where node >nul 2>nul
if %errorlevel% equ 0 (
    node "%PROJECT_ROOT%\scripts\start_backend.js"
) else (
    cd /d "%PROJECT_ROOT%\backend"
    if exist "%PROJECT_ROOT%\backend\target\hospitrack-backend-1.0.0.jar" (
        java -jar "%PROJECT_ROOT%\backend\target\hospitrack-backend-1.0.0.jar"
    ) else (
        call mvnw.cmd spring-boot:run
    )
)
