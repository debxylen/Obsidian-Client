@echo off
setlocal
cd /d %~dp0

echo Checking for Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH.
    pause
    exit /b 1
)

echo Setting up Virtual Environment...
if not exist venv (
    python -m venv venv
)

echo Activating Virtual Environment...
call venv\Scripts\activate

echo Installing Dependencies...
python -m pip install -r requirements.txt

if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
)

echo Starting Backend Server...
python main.py

pause
