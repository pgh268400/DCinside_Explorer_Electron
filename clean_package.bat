@echo off
@REM 패키지 의존성 꼬였을 때 실행
rmdir /s /q node_modules 2>nul
rmdir /s /q package-lock.json 2>nul
rmdir /s /q dist 2>nul
rmdir /s /q dist_electron 2>nul
npm install
