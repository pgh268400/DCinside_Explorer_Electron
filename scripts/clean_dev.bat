@echo off
@REM 개발 시 이 bat 실행
rmdir /s /q ..\dist
rmdir /s /q ..\dist_electron
npm run electron:serve 