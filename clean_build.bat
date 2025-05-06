@echo off
@REM 빌드 시 이 파일 실행
rmdir /s /q dist 2>nul
rmdir /s /q dist_electron 2>nul
npm run electron:build
