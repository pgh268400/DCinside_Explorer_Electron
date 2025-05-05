// 일렉트론 백그라운드 프로세스 (핵심 메인 프로세스)
"use strict";

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  shell,
  clipboard,
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import path from "path";
import { register_database_handlers } from "./ipc/database";
import { register_filesystem_handlers } from "./ipc/filesystem";
import { register_dcinside_handlers } from "./ipc/dcinside";
import { IPCChannel } from "@/types/ipc";

// 개발 모드 / 배포 모드 검사용 변수
const is_development = process.env.NODE_ENV !== "production";

const width = 1275 + 400;

const height = 840;

// Vue 2 Legacy DevTools의 Web Store ID
const LEGACY_VUE2_DEVTOOLS_ID = "iaajmlceplecbljialhhkmedjlpdblhp";

// 스키마는 반드시 app이 ready 되기 전에 등록되어야 한다.
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    // 가로 & 세로 크기
    width: width,
    height: height,

    // 창의 최소 크기를 정해서 UI가 깨지지 않도록 한다
    minWidth: 800,
    minHeight: 780,

    // 윈도우 타이틀 바 지우기 (윈도우 창 테두리 지우기)
    frame: false,

    webPreferences: {
      /*
        이 옵션이 있어야 __dirname이 제대로 동작해서 preload를 load 할 수 있다.
        보안을 위해 sandbox가 기본 true로 설정되어 __dirname이 동작하지 않던 것으로,
        일단 임시방편으로 이걸 활성화 하자.
      */
      sandbox: false,

      /*
        안전을 위해선 보안 권고 사항이 nodeIntegration : false, contextIsolation : true 이나
        그렇게 설정하면 현재 Electron 구버전으로 작업된 코드를 새로운 Electron 버전으로 마이그레이션 하는 과정에
        문제가 많이 발생해 그냥 true / false로 임시 조치하였다.
      */
      nodeIntegration: true,
      contextIsolation: false,

      // preload 스크립트 경로 지정, sandbox : false여야만 preload가 제대로 로드된다.
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // 메뉴바 숨기기
  win.setMenuBarVisibility(false);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  // win 변수가 필요한 IPC 등록 =========================
  // 종료 요청 처리
  ipcMain.on(IPCChannel.Window.CLOSE_ME, () => {
    app.quit();
  });

  // 창 최소화 요청 처리
  ipcMain.on(IPCChannel.Window.MINIMIZE_ME, () => {
    win.minimize();
  });

  // 창 포커싱 됐을때 이벤트
  // win.on("focus", () => {
  //   // 포커싱 되면 현재 클립보드의 값을 가져온다.
  //   const clipboard_text = clipboard.readText();
  //   console.log(clipboard_text);

  //   // 클립보드에 갤러리 주소가 있는지 확인하고, id를 추출한다.
  //   // (\w+) = 단어 추출 (숫자, 영문, _)
  //   const pattern = /https:\/\/gall\.dcinside\.com\/.+\/.+\/?\?id=(\w+)/;

  //   const match = clipboard_text.match(pattern);

  //   if (match) {
  //     const gallery_id = match[1]; // "habj"
  //     console.log(gallery_id);
  //   }
  // });

  // 창 포커싱 풀렸을 때 이벤트
  // win.on("blur", () => {
  //   console.log("window blur");
  // });
  // ===================================================
}

// 모든 창이 닫혔을 때 앱 종료
app.on("window-all-closed", () => {
  // macOS에서는 보통 사용자가 Cmd + Q를 눌러 명시적으로 종료하기 전까지
  // 애플리케이션과 메뉴 바가 계속 활성화된 상태로 유지된다
  if (process.platform !== "darwin") {
    app.quit(); // macOS가 아닌 경우, 앱을 종료한다
  }
});

app.on("activate", () => {
  // macOS에서는 Dock 아이콘을 클릭했을 때,
  // 열려 있는 창이 없다면 새 창을 다시 생성하는 것이 일반적인 동작이다.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

/*
  이 메서드는 Electron이 초기화를 모두 마치고
  브라우저 창을 생성할 준비가 되었을 때 호출된다.
  일부 API는 이 이벤트 이후에만 사용할 수 있다.
*/
app.on("ready", async () => {
  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Vue Devtools Legacy 버전 설치 - Vue2를 사용중이기 때문
  //   try {
  //     await installExtension(LEGACY_VUE2_DEVTOOLS_ID);
  //   } catch (e: any) {
  //     console.error("❌ Vue DevTools 설치 실패:", e.toString());
  //   }
  // }
  createWindow(); // 이 아래에 IPC 핸들러 등록
});

// DB CRUD 관련 IPC 핸들러 등록
register_database_handlers();

// UI 파일 저장 / 불러오기 관련 IPC 핸들러 등록
register_filesystem_handlers();

// 디시인사이드 웹 처리 관련 IPC 핸들러 등록
register_dcinside_handlers();

// Exit cleanly on request from parent process in development mode.
if (is_development) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
