@echo off
setlocal
title VisionInspect Docker Starter

echo ========================================================
echo   KHOI DONG VISIONINSPECT BANG DOCKER COMPOSE
echo ========================================================
echo.

echo Dang don dep cac cong 3000 va 8000 bi ket (neu co)...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
	taskkill /F /PID %%p >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
	taskkill /F /PID %%p >nul 2>&1
)

echo.
echo Dang tien hanh Build va Run tat ca 4 services...
echo (Bao gom: Frontend, Backend, Redis, Training Worker)
echo.

docker compose up --build

echo.
echo Da dung tat ca cac services Docker!
pause
