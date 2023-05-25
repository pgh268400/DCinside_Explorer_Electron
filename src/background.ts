"use strict";

import { app, protocol, BrowserWindow, ipcMain, shell } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import { DCWebRequest } from "./types/ipc";

const isDevelopment = process.env.NODE_ENV !== "production";

const width = 1275 + 400;

const height = 800;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: width,
    height: height,
    // 윈도우 타이틀 바 지우기 (윈도우 창 테두리 지우기)
    frame: false,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env
      //   .ELECTRON_NODE_INTEGRATION as unknown as boolean,
      // contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
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
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

import fs from "fs";
import { DCAsyncParser } from "./modules/dcparser";

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e: any) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();

  // 파싱 객체를 ipcMain 에서 전역적으로 사용할 수 있도록 한다.
  let parser: DCAsyncParser;

  // 웹 요청 처리
  ipcMain.on("web-request", async (event, arg: DCWebRequest) => {
    const { id, repeat_cnt, keyword, search_type } = arg;
    try {
      // const parser = await DCAsyncParser.create(id);
      parser = await DCAsyncParser.create(id);
      const result = await parser.search(
        search_type,
        keyword,
        repeat_cnt,
        (progress: number) => {
          event.sender.send("web-request-progress", progress);
        }
      );

      // await fs.promises.writeFile("result.json", JSON.stringify(result));
      event.sender.send("web-request-response", result);
    } catch (e: any) {
      console.error(e);
      event.sender.send("web-request-response", []);
    }
  });

  ipcMain.on("close-me", (event, arg) => {
    app.quit();
  });

  ipcMain.on("open-link", async (event, gallary_id: string, no: string) => {
    if (parser) {
      const g_type = parser.get_garllery_type();
      const url = `https://gall.dcinside.com/${g_type}board/view/?id=${gallary_id}&no=${no}`;
      shell.openExternal(url);
    }
  });
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
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
