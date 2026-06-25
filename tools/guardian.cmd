@echo off
chcp 65001 >nul
title Release Flow Guardian - Remote Core Launcher
setlocal enabledelayedexpansion

REM ============================================================
REM Release Flow Guardian - Remote Core Launcher
REM Fica dentro do projeto consumidor: projeto\tools\guardian.cmd
REM Baixa o core global fora do projeto e executa usando --project.
REM ============================================================

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%\..") do set "PROJECT_DIR=%%~fI"

if not defined RFG_CORE_REPO set "RFG_CORE_REPO=https://github.com/LeonelIntegrationXpert/release-flow-guardian-core.git"
if not defined RFG_CORE_REF set "RFG_CORE_REF=main"
if not defined RFG_CACHE_ROOT set "RFG_CACHE_ROOT=%LOCALAPPDATA%\ReleaseFlowGuardian\core"
set "CORE_CACHE_DIR=%RFG_CACHE_ROOT%\%RFG_CORE_REF%"
set "GUARDIAN_JS=%CORE_CACHE_DIR%\bin\guardian.js"

if not exist "%PROJECT_DIR%\api.raml" (
    echo.
    echo [ERRO] Nao encontrei api.raml no projeto:
    echo %PROJECT_DIR%
    echo.
    echo Este CMD precisa ficar em:
    echo projeto\tools\guardian.cmd
    echo.
    pause
    exit /b 1
)

:MENU
cls
echo ============================================================
echo        RELEASE FLOW GUARDIAN - REMOTE CORE
echo ============================================================
echo.
echo Projeto.....: %PROJECT_DIR%
echo Core repo...: %RFG_CORE_REPO%
echo Core ref....: %RFG_CORE_REF%
echo Cache.......: %CORE_CACHE_DIR%
echo.
echo [1] Baixar/atualizar core
echo [2] Validar projeto
echo [3] Rodar preflight completo
echo [4] Abrir console local
echo [5] Gerar report HTML
echo [6] Limpar cache do core
echo [7] Git status do projeto
echo [8] Mostrar informacoes do ambiente
echo [9] Gerar pacote Exchange local
echo [0] Sair
echo.
set /p OP=Escolha uma opcao: 

if "%OP%"=="1" goto UPDATE_CORE
if "%OP%"=="2" goto VALIDATE
if "%OP%"=="3" goto PREFLIGHT
if "%OP%"=="4" goto CONSOLE
if "%OP%"=="5" goto REPORT
if "%OP%"=="6" goto CLEAR_CACHE
if "%OP%"=="7" goto GITSTATUS
if "%OP%"=="8" goto INFO
if "%OP%"=="9" goto PACKAGE_EXCHANGE
if "%OP%"=="0" exit /b 0

goto MENU

:CHECK_TOOLS
where git >nul 2>nul
if errorlevel 1 (
    echo.
    echo [ERRO] Git nao encontrado no PATH.
    echo Instale o Git ou abra um terminal com Git disponivel.
    echo.
    pause
    exit /b 1
)
where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo [ERRO] Node.js nao encontrado no PATH.
    echo Instale Node.js 20+.
    echo.
    pause
    exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
    echo.
    echo [ERRO] npm nao encontrado no PATH.
    echo.
    pause
    exit /b 1
)
exit /b 0

:ENSURE_CORE
call :CHECK_TOOLS
if exist "%CORE_CACHE_DIR%\.git" (
    echo.
    echo Atualizando core em cache...
    cd /d "%CORE_CACHE_DIR%"
    git fetch --tags origin
    git checkout "%RFG_CORE_REF%"
    git reset --hard "origin/%RFG_CORE_REF%"
    if errorlevel 1 git reset --hard "%RFG_CORE_REF%"
) else (
    echo.
    echo Baixando core global...
    if not exist "%RFG_CACHE_ROOT%" mkdir "%RFG_CACHE_ROOT%"
    git clone --depth 1 --branch "%RFG_CORE_REF%" "%RFG_CORE_REPO%" "%CORE_CACHE_DIR%"
)

if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao baixar ou atualizar o core.
    echo Verifique acesso ao GitHub e autenticacao do Git.
    echo.
    pause
    exit /b 1
)

cd /d "%CORE_CACHE_DIR%"
call npm install --package-lock=false --no-audit --no-fund
if errorlevel 1 (
    echo.
    echo [ERRO] Falha no npm install do core.
    echo.
    pause
    exit /b 1
)

if not exist "%GUARDIAN_JS%" (
    echo.
    echo [ERRO] Core baixado, mas nao encontrei:
    echo %GUARDIAN_JS%
    echo.
    pause
    exit /b 1
)
exit /b 0

:UPDATE_CORE
cls
echo ============================================================
echo Baixar/atualizar core
echo ============================================================
call :ENSURE_CORE
echo.
echo Core pronto.
echo.
pause
goto MENU

:VALIDATE
cls
echo ============================================================
echo Validando projeto
echo ============================================================
call :ENSURE_CORE
cd /d "%PROJECT_DIR%"
node "%GUARDIAN_JS%" validate --project "%PROJECT_DIR%"
echo.
pause
goto MENU

:PREFLIGHT
cls
echo ============================================================
echo Rodando preflight completo
echo ============================================================
call :ENSURE_CORE
cd /d "%PROJECT_DIR%"
node "%GUARDIAN_JS%" preflight --project "%PROJECT_DIR%"
echo.
pause
goto MENU

:CONSOLE
cls
echo ============================================================
echo Abrindo Guardian Console
echo ============================================================
call :ENSURE_CORE
echo.
echo URL:
echo http://127.0.0.1:3030
echo.
echo Para parar o servidor, use CTRL + C.
echo.
cd /d "%PROJECT_DIR%"
start http://127.0.0.1:3030
node "%GUARDIAN_JS%" console --project "%PROJECT_DIR%"
pause
goto MENU

:REPORT
cls
echo ============================================================
echo Gerando report HTML
echo ============================================================
call :ENSURE_CORE
cd /d "%PROJECT_DIR%"
node "%GUARDIAN_JS%" report:html --project "%PROJECT_DIR%"
echo.
echo Report esperado:
echo %PROJECT_DIR%\dist\release-flow-guardian-report.html
echo.
if exist "%PROJECT_DIR%\dist\release-flow-guardian-report.html" (
    start "" "%PROJECT_DIR%\dist\release-flow-guardian-report.html"
)
pause
goto MENU

:PACKAGE_EXCHANGE
cls
echo ============================================================
echo Gerando pacote Exchange local
echo ============================================================
call :ENSURE_CORE
cd /d "%PROJECT_DIR%"
node "%GUARDIAN_JS%" package:exchange --project "%PROJECT_DIR%"
echo.
pause
goto MENU

:CLEAR_CACHE
cls
echo ============================================================
echo Limpando cache do core
echo ============================================================
if exist "%CORE_CACHE_DIR%" (
    rmdir /s /q "%CORE_CACHE_DIR%"
    echo Cache removido:
    echo %CORE_CACHE_DIR%
) else (
    echo Cache nao existe.
)
echo.
pause
goto MENU

:GITSTATUS
cls
echo ============================================================
echo Git status do projeto
echo ============================================================
cd /d "%PROJECT_DIR%"
git status
echo.
pause
goto MENU

:INFO
cls
echo ============================================================
echo Ambiente
echo ============================================================
echo Projeto.....: %PROJECT_DIR%
echo Core repo...: %RFG_CORE_REPO%
echo Core ref....: %RFG_CORE_REF%
echo Cache.......: %CORE_CACHE_DIR%
echo Guardian....: %GUARDIAN_JS%
echo.
echo Node:
node --version
echo.
echo npm:
npm --version
echo.
echo Git:
git --version
echo.
pause
goto MENU
