@echo off
REM Startup script for AI Chatbot (Windows)

setlocal enabledelayedexpansion

echo ===============================================================
echo   ## AI Chatbot - Startup Script (Windows)
echo ===============================================================
echo.

REM Get the directory of this script
set SCRIPT_DIR=%~dp0
set PROJECT_DIR=%SCRIPT_DIR%..
set CHATBOT_DIR=%SCRIPT_DIR%
set VENV_DIR=%PROJECT_DIR%\chatbot_env

echo Project Directory: %PROJECT_DIR%
echo Chatbot Directory: %CHATBOT_DIR%
echo Virtual Env: %VENV_DIR%
echo.

REM Check if virtual environment exists
if not exist "%VENV_DIR%" (
    echo Creating virtual environment...
    python -m venv "%VENV_DIR%"
    echo Virtual environment created
)

REM Activate virtual environment
echo Activating virtual environment...
call "%VENV_DIR%\Scripts\activate.bat"
echo Virtual environment activated

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip setuptools wheel >nul 2>&1
echo Pip upgraded

REM Check and install requirements
echo Checking dependencies...
if exist "%CHATBOT_DIR%\requirements.txt" (
    pip install -r "%CHATBOT_DIR%\requirements.txt" >nul 2>&1
    echo Dependencies installed from requirements.txt
) else (
    echo Installing core dependencies...
    pip install flask flask-cors transformers torch >nul 2>&1
    echo Core dependencies installed
)

echo.
echo ===============================================================
echo    ## Starting Chatbot...
echo ===============================================================
echo.
echo Opening http://127.0.0.1:5000 in your browser...
echo.
echo Press Ctrl+C to stop the server
echo.

REM Change to chatbot directory and run app
cd /d "%CHATBOT_DIR%"
python app.py

pause
