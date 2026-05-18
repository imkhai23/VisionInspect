@echo off
setlocal
title VisionInspect Starter

set "ROOT=%~dp0"
set "BACKEND_DIR=%ROOT%backend"
set "FRONTEND_DIR=%ROOT%frontend"
set "VENV_ACTIVATE=%ROOT%.venv\Scripts\activate.bat"

if not exist "%VENV_ACTIVATE%" (
    echo Khong tim thay .venv o "%ROOT%".
    echo Hay tao virtual environment truoc khi chay file nay.
    pause
    exit /b 1
)

if not exist "%BACKEND_DIR%\app\main.py" (
    echo Khong tim thay backend tai "%BACKEND_DIR%".
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%\package.json" (
    echo Khong tim thay frontend tai "%FRONTEND_DIR%".
    pause
    exit /b 1
)

for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%p >nul 2>&1
)

echo Dang khoi dong VisionInspect...

echo [1/2] Dang chay Backend (Port 8000)...
start "Backend Server" cmd /k "cd /d ""%BACKEND_DIR%"" && call ""%VENV_ACTIVATE%"" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

echo [2/2] Dang chay Frontend (Port 3000)...
start "Frontend UI" cmd /k "cd /d ""%FRONTEND_DIR%"" && npm run dev -- --port 3000"

echo.
echo Tat ca dich vu dang duoc khoi dong!
echo - Backend: http://127.0.0.1:8000
echo - Frontend: http://localhost:3000
echo.
echo Luu y: Khong tat 2 cua so Terminal vua hien len.
pause
