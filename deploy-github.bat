@echo off
echo ========================================
echo    DEPLOY SU GITHUB - WEBNOVIS
echo ========================================
echo.

REM Controlla se Git è installato
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRORE] Git non trovato!
    echo.
    echo Installa Git da: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo [OK] Git trovato: 
git --version
echo.

REM Chiedi username GitHub
set /p GITHUB_USER="Inserisci il tuo username GitHub: "
if "%GITHUB_USER%"=="" (
    echo [ERRORE] Username non inserito!
    pause
    exit /b 1
)

REM Chiedi nome repository
set /p REPO_NAME="Inserisci il nome del repository (default: webnovis-site): "
if "%REPO_NAME%"=="" set REPO_NAME=webnovis-site

echo.
echo ========================================
echo    CONFIGURAZIONE
echo ========================================
echo Username GitHub: %GITHUB_USER%
echo Nome Repository: %REPO_NAME%
echo URL: https://github.com/%GITHUB_USER%/%REPO_NAME%
echo.
echo Assicurati di aver creato il repository su GitHub!
echo Vai su: https://github.com/new
echo.
pause

echo.
echo ========================================
echo    INIZIALIZZAZIONE GIT
echo ========================================
echo.

REM Controlla se Git è già inizializzato
if exist ".git\" (
    echo [INFO] Repository Git già inizializzato
    echo.
) else (
    echo [INFO] Inizializzazione repository Git...
    git init
    echo.
)

REM Aggiungi tutti i file
echo [INFO] Aggiunta file al commit...
git add .
echo.

REM Commit
echo [INFO] Creazione commit...
git commit -m "Deploy WebNovis website"
echo.

REM Rinomina branch in main
echo [INFO] Rinomina branch in main...
git branch -M main
echo.

REM Aggiungi remote (se non esiste)
git remote remove origin 2>nul
echo [INFO] Aggiunta remote origin...
git remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git
echo.

echo ========================================
echo    PUSH SU GITHUB
echo ========================================
echo.
echo [INFO] Push su GitHub...
echo.
echo Ti verrà chiesto di autenticarti con GitHub.
echo Usa il tuo username e Personal Access Token.
echo.
echo Come ottenere il token:
echo 1. Vai su https://github.com/settings/tokens
echo 2. Generate new token (classic)
echo 3. Seleziona 'repo' scope
echo 4. Copia il token e usalo come password
echo.
pause

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo    DEPLOY COMPLETATO!
    echo ========================================
    echo.
    echo [OK] Codice pushato su GitHub!
    echo.
    echo PROSSIMI PASSI:
    echo.
    echo 1. Vai su: https://github.com/%GITHUB_USER%/%REPO_NAME%
    echo 2. Clicca su Settings
    echo 3. Clicca su Pages (sidebar sinistra)
    echo 4. Source: Deploy from a branch
    echo 5. Branch: main, Folder: / (root)
    echo 6. Clicca Save
    echo.
    echo Il tuo sito sarà disponibile su:
    echo https://%GITHUB_USER%.github.io/%REPO_NAME%/
    echo.
    echo Per collegare un dominio personalizzato:
    echo - Leggi DEPLOY-GITHUB.md sezione "Collega Dominio"
    echo.
) else (
    echo.
    echo [ERRORE] Push fallito!
    echo.
    echo Possibili cause:
    echo - Repository non creato su GitHub
    echo - Credenziali errate
    echo - Problemi di connessione
    echo.
    echo Verifica e riprova.
    echo.
)

pause
