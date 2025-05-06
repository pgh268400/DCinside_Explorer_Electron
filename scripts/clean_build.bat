@echo off
@REM 빌드 시 이 파일 실행
rmdir /s /q ..\dist
rmdir /s /q ..\dist_electron
npm run electron:build 