@echo off
set "PATH=C:\Users\madur\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;C:\Users\madur\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback;%PATH%"
echo ===================================================
echo Starting Reachr Development Server...
echo Once started, open your browser at: http://localhost:3000
echo Press Ctrl + C to stop the server anytime.
echo ===================================================
call pnpm run dev
pause
