import { app } from "electron";
app.commandLine.appendSwitch("js-flags", "--max-old-space-size=16384");

console.log("preload.ts 실행됨");
