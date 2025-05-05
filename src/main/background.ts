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
import {
  get_all_logs,
  get_full_logs,
  load_search_logs,
  save_search_log,
  delete_search_log,
} from "./modules/database";
import fs from "fs";

const isDevelopment = process.env.NODE_ENV !== "production";

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
  // ===================================================

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
  createWindow();

  // 파싱 객체를 ipcMain 에서 전역적으로 사용할 수 있도록 한다.
  let parser: DCAsyncParser;

  // 웹 요청 처리 (검색)
  ipcMain.on(IPCChannel.Web.REQUEST, async (event, arg: DCWebRequest) => {
    const { id, repeat_cnt, keyword, search_type, option } = arg;
    try {
      // const parser = await DCAsyncParser.create(id);
      // 검색 버튼을 누를때마다 객체를 새로 생성하여 검색한다.
      // 객체 생성 & 초기화 시점 : 검색 버튼을 누를때
      parser = await DCAsyncParser.create(id, option);
      const result = await parser.search(
        search_type,
        keyword,
        repeat_cnt,
        (progress: string, status: string) => {
          event.sender.send(IPCChannel.Web.REQUEST_PROGRESS, progress, status);
        }
      );

      // await fs.promises.writeFile("result.json", JSON.stringify(result));
      event.sender.send(IPCChannel.Web.RESPONSE, result);
    } catch (e: any) {
      console.error(e);
      event.sender.send(IPCChannel.Web.RESPONSE, []);
    }
  });

  // 갤러리 ID 클릭 시 해당 갤러리 페이지 여는 IPC
  ipcMain.on(
    IPCChannel.Link.OPEN_LINK,
    async (_event, gallery_id: string, no: string) => {
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

  // 파일 시스템 관련 IPC 핸들러
  ipcMain.handle(
    IPCChannel.FileSystem.SAVE_SETTINGS,
    async (_event, file_path: string, data: any) => {
      try {
        // 들어온 데이터를 그대로 들어온 경로에 저장
        const json_data = JSON.stringify(data, null, 2);
        await fs.promises.writeFile(file_path, json_data, "utf-8");
        return { success: true };
      } catch (error: any) {
        console.error("[File System] 오류 발생:", error);
        return { success: false, error: error.message };
      }
    }
  );

  /*
    갤러리 텍스트명 조회 IPC 처리
    ex)
    -  렌더러 요청: { "lies_of_p": null }
    -  메인 프로세스 응답: { "lies_of_p": "P의 거짓 마이너 갤러리" }
  */
  ipcMain.handle(
    IPCChannel.Gallery.GET_TEXT_NAME, // 채널 등록
    async (_event, id_dict: Record<string, null>) => {
      // 요청 타입
      const result: Record<string, string> = {};
      for (const id of Object.keys(id_dict)) {
        const parser = await DCAsyncParser.create(id); // 파서 생성
        result[id] = await parser.get_gallery_text_name(); // 텍스트명 조회
      }
      console.log("[Main] 데이터 준비 완료 : ", id_dict);

      return result; // 응답 반환
    }
  );
});

// IPC 핸들러 등록
ipcMain.handle(
  IPCChannel.DB.SAVE_ARTICLE_SEARCH_LOG,
  async (_event, { mode, user_input, article_data }) => {
    try {
      await save_search_log(article_data.items, user_input, mode);
      return { success: true };
    } catch (err: any) {
      console.error("[db-save-search-log] 오류 발생:", err);
      return { success: false, error: err.message };
    }
  }
);

ipcMain.handle(
  IPCChannel.DB.LOAD_ARTICLE_SEARCH_LOG,
  async (_event, load_mode) => {
    if (load_mode === "all") {
      // ── auto / manual 각각 원본 배열 조회 ────────────────────
      const auto_logs = await get_full_logs("auto");
      const manual_logs = await get_full_logs("manual");

      // 원하는 형태로 객체 묶어서 반환
      return {
        auto_save: auto_logs, // 자동 저장 로그 배열
        manual_save: manual_logs, // 수동 저장 로그 배열
      };
    }

    // 단일 모드(flatten) 조회는 그대로 유지
    return await load_search_logs(load_mode);
  }
);

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
