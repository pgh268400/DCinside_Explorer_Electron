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
import { DCAsyncParser } from "./modules/dcparser";
import { DCWebRequest, IPCChannel } from "@/types/ipc";

const isDevelopment = process.env.NODE_ENV !== "production";

const width = 1275 + 400;

const height = 840;

// 메모리 제한 조정
// const mem_limit = 8192;
// app.commandLine.appendSwitch("js-flags", `--max-old-space-size=${mem_limit}`);

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
      // contextIsolation: !(process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean,
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
  //     const gallary_id = match[1]; // "habj"
  //     console.log(gallary_id);
  //   }
  // });

  // 창 포커싱 풀렸을 때 이벤트
  // win.on("blur", () => {
  //   console.log("window blur");
  // });
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

  // 웹 요청 처리 (검색)
  ipcMain.on(IPCChannel.WEB_REQUEST, async (event, arg: DCWebRequest) => {
    const { id, repeat_cnt, keyword, search_type, option } = arg;
    try {
      // const parser = await DCAsyncParser.create(id);
      // 검색 버튼을 누를때마다 객체를 새로 생성하여 검색한다.
      // 객체 생성 & 초기화 시점 = 검색 버튼을 누를때
      parser = await DCAsyncParser.create(id, option);
      const result = await parser.search(
        search_type,
        keyword,
        repeat_cnt,
        (progress: string, status: string) => {
          event.sender.send(IPCChannel.WEB_REQUEST_PROGRESS, progress, status);
        }
      );

      // await fs.promises.writeFile("result.json", JSON.stringify(result));
      event.sender.send(IPCChannel.WEB_RESPONSE, result);
    } catch (e: any) {
      console.error(e);
      event.sender.send(IPCChannel.WEB_RESPONSE, []);
    }
  });

  // 종료 요청 처리
  ipcMain.on(IPCChannel.CLOSE_ME, (event, arg) => {
    app.quit();
  });

  // 갤러리 ID 클릭 시 해당 갤러리 페이지 여는 IPC
  ipcMain.on(
    IPCChannel.OPEN_LINK,
    async (event, gallary_id: string, no: string) => {
      if (parser) {
        const g_type = parser.get_garllery_type();
        const url = `https://gall.dcinside.com/${g_type}board/view/?id=${gallary_id}&no=${no}`;
        shell.openExternal(url);
      }
    }
  );
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
