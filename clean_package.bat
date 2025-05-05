@echo off
; 패키지 의존성 꼬였을 때 실행
rmdir /s /q node_modules
rmdir /s /q package-lock.json
rmdir /s /q dist
rmdir /s /q dist_electron
npm install
