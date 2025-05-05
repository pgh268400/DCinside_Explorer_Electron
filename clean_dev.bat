@echo off
rmdir /s /q dist
rmdir /s /q dist_electron
npm run electron:serve
