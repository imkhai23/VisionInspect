@echo off
title VisionInspect Starter
echo Dang khoi dong VisionInspect...

:: Khoi dong Backend
echo [1/2] Dang chay Backend (Port 8000)...
start "Backend Server" cmd /k "cd /d D:\VisionInspect\backend && .\venv\Scripts\activate && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

:: Khoi dong Frontend
echo [2/2] Dang chay Frontend (Port 3000)...
start "Frontend UI" cmd /k "cd /d D:\VisionInspect\frontend && npm run dev"

echo.
echo Tat ca dich vu dang duoc khoi dong!
echo - Backend: http://127.0.0.1:8000
echo - Frontend: http://localhost:3000
echo.
echo Luu y: Khong tat 2 cua so Terminal vua hien len.
pause
