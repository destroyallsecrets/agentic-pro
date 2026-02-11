---
description: Standardized workflow for launching dev environments on Windows Host with real-time monitoring.
---

# Windows Development & Monitoring Workflow

Use this workflow to ensure Next.js or other web development environments are launched natively on the Windows host rather than isolated Docker containers. This enables direct browser access and terminal visibility.

## 1. Environment Initialization (Host-Side)
// turbo
Run the following PowerShell block to ensure dependencies are installed on the host:
```powershell
cd "[PROJECT_PATH]";
npm install --legacy-peer-deps;
```

## 2. Launching the Dev Server (External Terminal)
// turbo
To keep the server running and visible to the user, launch it in a separate CMD window:
```powershell
Start-Process cmd.exe -ArgumentList '/k', 'cd /d [PROJECT_PATH] && npm run dev -- -p [PORT]'
```

## 3. Automated Monitoring (Chrome)
// turbo
Once the server is listening, automatically open the local endpoint:
```powershell
Start-Process chrome "http://localhost:[PORT]"
```

## 4. Port Verification
To verify the host is correctly listening:
```powershell
Get-NetTCPConnection -LocalPort [PORT] -State Listen
```

## Implementation Notes:
- **Path Translation:** Always use absolute Windows paths (e.g., `C:\Users\...`).
- **Terminal Persistence-X:** Using `/k` in CMD ensures the window stays open even if the process errors, allowing for real-time debugging by the user.
- **Resource Management:** Ensure previous PIDs on the same port are cleared using `Stop-Process` if a port conflict occurs.
