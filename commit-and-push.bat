@echo off
setlocal EnableExtensions

pushd "%~dp0" || (
  echo Could not open the script folder.
  echo.
  pause
  exit /b 1
)

rem ============================================================
rem  Commit And Push Template
rem  Edit this section for your project.
rem ============================================================
set "DEFAULT_COMMIT_MESSAGE=Update followback-checker"
set "VALIDATION_1=npm.cmd run lint"
set "VALIDATION_2=npm.cmd run test"
set "VALIDATION_3=npm.cmd run build"
rem ============================================================

echo.
echo ========================================
echo  Commit And Push
echo ========================================
echo.

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo This folder is not inside a Git repository.
  goto :fail
)

set "HAS_CHANGES=0"
for /f "delims=" %%A in ('git status --porcelain') do set "HAS_CHANGES=1"

if "%HAS_CHANGES%"=="0" (
  echo No changes detected.
  goto :success
)

echo Changes detected:
git status --short
echo.

set "COMMIT_MESSAGE="
set /p "COMMIT_MESSAGE=Commit message [%DEFAULT_COMMIT_MESSAGE%]: "
if "%COMMIT_MESSAGE%"=="" set "COMMIT_MESSAGE=%DEFAULT_COMMIT_MESSAGE%"

if not "%VALIDATION_1%"=="" (
  echo.
  echo Running: %VALIDATION_1%
  call %VALIDATION_1%
  if errorlevel 1 (
    echo.
    echo Validation failed. Commit and push were cancelled.
    goto :fail
  )
)

if not "%VALIDATION_2%"=="" (
  echo.
  echo Running: %VALIDATION_2%
  call %VALIDATION_2%
  if errorlevel 1 (
    echo.
    echo Validation failed. Commit and push were cancelled.
    goto :fail
  )
)

if not "%VALIDATION_3%"=="" (
  echo.
  echo Running: %VALIDATION_3%
  call %VALIDATION_3%
  if errorlevel 1 (
    echo.
    echo Validation failed. Commit and push were cancelled.
    goto :fail
  )
)

echo.
echo Staging changes...
git add -A
if errorlevel 1 (
  echo.
  echo Staging failed. Commit and push were cancelled.
  goto :fail
)

echo.
echo Creating commit...
git commit -m "%COMMIT_MESSAGE%"
if errorlevel 1 (
  echo.
  echo Commit failed. Push was cancelled.
  goto :fail
)

echo.
echo Pushing to the configured upstream...
git push
if errorlevel 1 (
  echo.
  echo Push failed. Your commit may still exist locally.
  goto :fail
)

echo.
echo Commit and push complete.
goto :success

:fail
echo.
echo Script finished with an issue.
echo.
popd
pause
exit /b 1

:success
echo.
popd
pause
exit /b 0
