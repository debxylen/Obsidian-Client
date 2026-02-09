# Obsidian Backend

This is the backend server for Obsidian Client, providing a bridge to ChatGPT's internal API and a CORS proxy.

## What it does
- **Turnstile Handling**: Handles the Cloudflare, Turnstile, and Sentinel proof-of-work tokens.
- **Client Mimicry**: Mimics the HTTP headers and request characteristics used by the official chatgpt.com client.
- **CORS Proxy**: Allows the frontend to bypass browser cross-origin restrictions.
- **Streaming Responses**: Server-Sent Events (SSE) support for real-time message updates.

## How to Run

### Option 1: One-Click Launch (Recommended)
- **Windows**: Double-click `run.bat`.
- **Linux/macOS**: Run `chmod +x run.sh && ./run.sh`.

This will automatically:
1. Create a virtual environment (`venv`).
2. Install all necessary dependencies.
3. Start the server on `http://localhost:8000`.

### Option 2: Manual Installation
1. Install Python 3.10+ (recommended: 3.12.4).
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   python main.py
   ```

## Configuration
You can customize the host and port by creating a `.env` file (copied from `.env.example` automatically):
```env
HOST=0.0.0.0
PORT=8000
```
