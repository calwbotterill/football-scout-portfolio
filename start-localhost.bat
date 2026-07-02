@echo off
cd /d "%~dp0"
echo Starting local server at http://127.0.0.1:5173
node dev-server.mjs
pause
