@echo off
title AKTIPAN RUNNER
color 0A

echo ====================================================================
echo                 MENJALANKAN APLIKASI AKTIPAN
echo ====================================================================
echo.

:: Tambahkan Node.js Laragon ke PATH secara otomatis
set "PATH=C:\laragon\bin\nodejs\node-v22;%PATH%"

echo [1/2] Menyiapkan Backend Server (be_aktipan-main) di Port 5000...
start "AKTIPAN BACKEND (Port 5000)" cmd /k "cd /d "%~dp0be_aktipan-main" && set PATH=C:\laragon\bin\nodejs\node-v22;%%PATH%% && if not exist node_modules (echo Sedang install paket backend... && npm install) && echo Menjalankan backend... && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Menyiapkan Frontend (fe_aktipan-main) di Port 3000...
start "AKTIPAN FRONTEND (Port 3000)" cmd /k "cd /d "%~dp0fe_aktipan-main" && set PATH=C:\laragon\bin\nodejs\node-v22;%%PATH%% && if not exist node_modules (echo Sedang install paket frontend... && npm install) && echo Menjalankan frontend... && npm run dev"

echo.
echo ====================================================================
echo  SUKSES! Server Backend dan Frontend sedang dimulai.
echo.
echo  Silakan buka Google Chrome lalu ketik:
echo  >>> http://localhost:3000
echo.
echo  Akun Admin: admin@aktipan.com  ^|  Password: admin123
echo ====================================================================
echo.
pause
