@echo off
@REM 개발 시 이 bat 실행
rmdir /s /q dist 2>nul
rmdir /s /q dist_electron 2>nul
npm run electron:serve
