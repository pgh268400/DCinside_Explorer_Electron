import { app, BrowserWindow, ipcMain } from "electron";
import { IPCChannel } from "@/types/ipc";

export function register_window_handlers(win: BrowserWindow) {
  // 종료 요청 처리
  ipcMain.on(IPCChannel.Window.CLOSE_ME, () => {
    app.quit();
  });

  // 창 최소화 요청 처리
  ipcMain.on(IPCChannel.Window.MINIMIZE_ME, () => {
    win.minimize();
  });

  // // 창 포커싱 됐을때 이벤트
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
