#!/bin/bash
cd "$(dirname "$0")"

echo "Checking for Python..."
if ! command -v python3 &> /dev/null
then
    echo "Python3 could not be found."
    exit 1
fi

echo "Setting up Virtual Environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

echo "Activating Virtual Environment..."
source venv/bin/activate

echo "Installing Dependencies..."
python3 -m pip install -r requirements.txt

if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

echo "Starting Backend Server..."
python3 main.py
