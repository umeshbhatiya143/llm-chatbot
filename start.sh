#!/bin/bash
# Startup script for AI Chatbot

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     🤖 AI Chatbot - Startup Script               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CHATBOT_DIR="$SCRIPT_DIR"
VENV_DIR="$PROJECT_DIR/chatbot_env"

echo "Project Directory: $PROJECT_DIR"
echo "Chatbot Directory: $CHATBOT_DIR"
echo "Virtual Env: $VENV_DIR"
echo ""

# Check if virtual environment exists
if [ ! -d "$VENV_DIR" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv "$VENV_DIR"
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source "$VENV_DIR/bin/activate"
echo -e "${GREEN}✓ Virtual environment activated${NC}"

# Upgrade pip
echo -e "${YELLOW}Upgrading pip...${NC}"
pip install --upgrade pip setuptools wheel > /dev/null 2>&1
echo -e "${GREEN}✓ Pip upgraded${NC}"

# Check and install requirements
echo -e "${YELLOW}Checking dependencies...${NC}"
if [ -f "$CHATBOT_DIR/requirements.txt" ]; then
    pip install -r "$CHATBOT_DIR/requirements.txt" > /dev/null 2>&1
    echo -e "${GREEN}✓ Dependencies installed from requirements.txt${NC}"
else
    echo -e "${YELLOW}Installing core dependencies...${NC}"
    pip install flask flask-cors transformers torch > /dev/null 2>&1
    echo -e "${GREEN}✓ Core dependencies installed${NC}"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           🚀 Starting Chatbot...                  ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Opening http://127.0.0.1:5000 in your browser...${NC}"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Change to chatbot directory and run app
cd "$CHATBOT_DIR"
python app.py
