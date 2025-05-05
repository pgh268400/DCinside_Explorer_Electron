import { ipcMain } from "electron";
import { IPCChannel } from "@/types/ipc";
import fs from "fs";
import path from "path";

// 파일 시스템 관련 IPC 핸들러 등록 함수
export function register_filesystem_handlers() {
  // 설정 파일 저장 핸들러
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

  // 설정 파일 초기화 및 로드 핸들러
  ipcMain.handle(
    IPCChannel.FileSystem.INITIALIZE_SETTINGS,
    async (_event, file_path: string, default_data: any) => {
      try {
        // 디렉토리 경로를 추출
        const dir = path.dirname(file_path);

        // 디렉토리가 존재하지 않으면 설정 폴더를 우선 생성
        await fs.promises.mkdir(dir, { recursive: true });

        // 파일을 (새로 / 다시) 생성해야 하는지 여부, 기본값은 false
        let should_create_file = false;

        // 파일이 이미 존재하는지 확인
        try {
          // access 함수 = 파일이 존재하지 않으면 ENOENT예외 발생하여 catch로 강제 이동되고, 아니면 그냥 무시되고 다음 Line 실행
          await fs.promises.access(file_path, fs.constants.F_OK);

          // 파일이 존재하면 내용을 읽어서 확인
          const file_content = await fs.promises.readFile(file_path, "utf-8");
          const trimmed_content = file_content.trim();

          // 파일에 아무것도 안적혀 있거나 공백만 있는 경우
          if (!trimmed_content) {
            console.log("설정 파일이 비어있어 기본값으로 초기화합니다.");
            should_create_file = true; // 파일 재생성 필요
          } else {
            try {
              // JSON 파싱 시도
              JSON.parse(trimmed_content);
            } catch (e) {
              // JSON 파싱 실패 시 파일 재생성 필요
              console.log(
                "설정 파일이 유효하지 않은 JSON 형식이어서 기본값으로 초기화합니다."
              );
              should_create_file = true;
            }
          }
        } catch (_) {
          // 파일이 존재하지 않는 경우 당연히 생성 필요
          console.log("초기 설정 파일이 존재하지 않아 새로 생성합니다.");
          should_create_file = true;
        }

        // 파일을 생성하거나 재생성해야 하는 경우
        if (should_create_file) {
          const json_data = JSON.stringify(default_data, null, 2);
          await fs.promises.writeFile(file_path, json_data, "utf-8");
          return { success: true, data: default_data };
        }

        // 여기까지 왔으면 파일이 제대로 생성 및 처리 됐다고 볼 수 있다.
        // 이제 파일 내용을 읽어서 렌더러에 전달
        const data = await fs.promises.readFile(file_path, "utf-8");
        return { success: true, data: JSON.parse(data) };
      } catch (error: any) {
        console.error("[File System] 초기화 중 오류 발생:", error);
        return { success: false, error: error.message };
      }
    }
  );
}
