import { ipcMain, shell } from "electron";
import { IPCChannel, DCWebRequest } from "@/types/ipc";
import { DCAsyncParser } from "../modules/dcparser";

// 파싱 객체를 ipcMain 에서 전역적으로 사용할 수 있도록 한다.
let parser: DCAsyncParser;

// 디시인사이드 웹 처리 관련 IPC 핸들러 등록 함수
export function register_dcinside_handlers() {
  // 웹 요청 처리 (검색)
  ipcMain.on(IPCChannel.Web.REQUEST, async (event, arg: DCWebRequest) => {
    const { id, repeat_cnt, keyword, search_type, option } = arg;
    try {
      parser = await DCAsyncParser.create(id, option);
      const result = await parser.search(
        search_type,
        keyword,
        repeat_cnt,
        (progress: string, status: string) => {
          event.sender.send(IPCChannel.Web.REQUEST_PROGRESS, progress, status);
        }
      );

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
        parser = await DCAsyncParser.create(gallery_id);
        const g_type = parser.get_garllery_type();
        const url = `https://gall.dcinside.com/${g_type}board/view/?id=${gallery_id}&no=${no}`;
        shell.openExternal(url);
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
    IPCChannel.Gallery.GET_TEXT_NAME,
    async (_event, id_obj: Record<string, null>) => {
      // 요청 타입
      const result: Record<string, string> = {};
      for (const id of Object.keys(id_obj)) {
        const parser = await DCAsyncParser.create(id); // 파서 생성
        result[id] = await parser.get_gallery_text_name(); // 텍스트명 조회
      }
      console.log("[Main] 데이터 준비 완료 : ", id_obj);

      return result; // 응답 반환
    }
  );
}
