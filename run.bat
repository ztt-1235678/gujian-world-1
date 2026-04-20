@echo off
chcp 65001 >nul
echo ==========================================
echo   正在启动 古建智境 (方案 B：部署模式)
echo ==========================================

:: 获取脚本当前所在目录
set PROJECT_ROOT=%~dp0
cd /d "%PROJECT_ROOT%"

:: 1. 强制关闭可能占用的旧进程
taskkill /f /t /im node.exe >nul 2>&1

:: 2. 启动后端服务 (它现在同时负责网页显示)
echo [1/2] 正在启动后端服务器...
cd backend
:: 确保进入了有 package.json 的 backend 目录
start "GUJIAN_SERVER" cmd /k "npm start"

:: 3. 等待后端初始化完成
echo [2/2] 等待系统就绪...
timeout /t 6

:: 4. 自动打开浏览器
:: 如果你的后端 index.js 改成了 5000，这里就写 5000
start http://localhost:5000

echo.
echo ==========================================
echo   启动完成！请保持黑色窗口不要关闭。
echo ==========================================
pause