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
import path from "path";

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
      // 안전을 위해 nodeIntegration 비활성화
      nodeIntegration: true,
      // contextIsolation: true로 설정 => preload만 창과 통신
      contextIsolation: false,

      // preload 스크립트 경로 지정
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

  // 종료 요청 처리
  ipcMain.on(IPCChannel.CLOSE_ME, (event, arg) => {
    // 크롬 개발자 도구가 열려있으면 닫고 종료해줘야 함. 아니면 종료가 안됨.
    if (win.webContents.isDevToolsOpened()) {
      win.webContents.closeDevTools();
    }
    app.quit();
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
  app.commandLine.appendSwitch("--max-old-space-size", "4096"); // 4GB heap size

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

  // 갤러리 ID 클릭 시 해당 갤러리 페이지 여는 IPC
  ipcMain.on(
    IPCChannel.OPEN_LINK,
    async (event, gallery_id: string, no: string) => {
      if (parser) {
        const g_type = parser.get_garllery_type();
        const url = `https://gall.dcinside.com/${g_type}board/view/?id=${gallery_id}&no=${no}`;
        shell.openExternal(url);
      } else {
        // parser 가 존재하지 않으면 검색을 하지 않은 상태에서 저장해둔 목록의 링크를 클릭했다는 것.
        // parser 을 생성하고 해당 링크를 열어주도록 한다.
        parser = await DCAsyncParser.create(gallery_id);
        const g_type = parser.get_garllery_type();
        const url = `https://gall.dcinside.com/${g_type}board/view/?id=${gallery_id}&no=${no}`;
        shell.openExternal(url);
      }
    }
  );

  // 갤러리 텍스트 명 처리
  //  { "lies_of_p" : null } 이런식으로 렌더러에서 데이터를 보내 IPC 요청하면
  // { "lies_of_p" : "P의 거짓 마이너 갤러리" } 이런식으로 메인 프로세스에서 응답해야 한다.
  ipcMain.on(
    IPCChannel.GET_GALLERY_TEXT_NAME_REQ,
    async (event, id_dict: any) => {
      for (const [id, val] of Object.entries(id_dict)) {
        parser = await DCAsyncParser.create(id);
        id_dict[id] = await parser.get_gallery_text_name();
      }
      console.log("데이터 준비 완료", id_dict);
      event.sender.send(IPCChannel.GET_GALLERY_TEXT_NAME_RES, id_dict);
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
