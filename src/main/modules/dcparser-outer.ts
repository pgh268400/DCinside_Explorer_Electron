/*
  C# CLI 프로그램으로 별도 구현된 성능 좋은 검색기로 검색 코드 대체
  IPC 통신은 Node.js (부모 프로세스) -> C# (자식 프로세스) 생성 형태로 이루어지며
  stdout, stderr 스트림 파이프를 이용해 통신한다.
*/
import { spawn, exec as origin_exec } from "child_process"; // child_process 모듈에서 spawn, exec 함수 가져온다
import * as path from "path"; // path 모듈을 path 이름으로 불러온다
import { promises as fs } from "fs"; // fs/promises 모듈을 fs 이름으로 불러온다
import { readdir } from "fs/promises";
import { promisify } from "util";

const exec = promisify(origin_exec);

// C# 프로젝트 폴더 절대 경로
const csharp_root_path = "C:/Users/pgh268400/source/repos/DCParserCLI";

// C# 실행 파일 절대 경로
// 주의 : 실행 파일은 Release 모드로 컴파일 된것만 사용해야 한다.
const csharp_cli_path =
  "C:/Users/pgh268400/source/repos/DCParserCLI/bin/Release/net8.0/DCParserCLI.exe";

// 결과를 파일에 저장 할 지 여부
const is_save_result = false;

// 자동 빌드 여부
const is_auto_build = false;

// 파서 입력 인터페이스 정의
export interface InputParams {
  gallery_id: string;
  keyword: string;
  repeat_count: number;
  search_type: string;
}

// 파서 옵션 인터페이스 정의
export interface Options {
  requests_limit: number;
  retry_count: number;
  base_delay: number;
  jitter: number;
}

// 콜백 함수 타입 정의
export type ProgressCallback = (percentage: string, message: string) => void;

// timestamp 유틸 함수 정의
function make_time_stamp(): string {
  return new Date()
    .toISOString() // "2025-06-22T15:14:16.482Z"
    .split(".")[0] // "2025-06-22T15:14:16"
    .replace(/-/g, "") // "20250622T15:14:16"
    .replace("T", "_") // "20250622_15:14:16"
    .replace(/:/g, ""); // "20250622_151416"
}

/**
 * 파싱 결과를 JSON 파일로 저장한다
 * @param result - 저장할 결과 배열
 * @param gallery_id - 갤러리 ID
 * @param keyword - 검색 키워드
 */
async function save_result_to_json(
  result: any[],
  gallery_id: string,
  keyword: string
): Promise<void> {
  try {
    const timestamp = make_time_stamp();
    const filename = `${gallery_id}_${keyword}_${timestamp}.json`;
    const directory_path = path.join(csharp_root_path, "json_files");
    const file_path = path.join(directory_path, filename);

    await fs.mkdir(directory_path, { recursive: true });
    await fs.writeFile(file_path, JSON.stringify(result, null, 2), "utf-8");
    console.log(`[Node.js] 결과를 ${file_path}에 저장했습니다`);
  } catch (error) {
    console.error("[Node.js] JSON 파일 저장에 실패했습니다:", error);
  }
}

/**
 * C# 파서 프로세스를 실행하고 결과 처리하는 메인 함수
 */
function run_parser_process(
  input_params: InputParams,
  options: Options,
  on_progress: ProgressCallback
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const base_args = {
      "--gallery-id": input_params.gallery_id,
      "--search-type": input_params.search_type,
      "--keyword": input_params.keyword,
      "--repeat-count": input_params.repeat_count.toString(),
      "--requests-limit": options.requests_limit.toString(),
      "--retry-count": options.retry_count.toString(),
      "--base-delay": options.base_delay.toString(),
      "--jitter": options.jitter.toString(),
    };

    // Object.entries()와 flat()을 이용해서 [key, value, key, value, ...]로 만듦
    const args = Object.entries(base_args).flat(); // C# CLI 프로그램에 실제로 넘길 인자

    console.log(
      `\n[Node.js] C# 프로세스를 다음 경로에서 실행합니다: ${csharp_cli_path}`
    ); // C# 실행 경로 로그 출력
    console.log(`[Node.js] C# Args: ${args.join(" ")}`); // C# 실행 인자 로그 출력

    // spawn으로 C# 프로세스를 실행한다
    const csharp_process = spawn(csharp_cli_path, args);

    let final_json_data = ""; // stdout 데이터 저장할 final_json_data 초기화
    let error_data = ""; // stderr 에러 메시지 저장할 error_data 초기화

    // stdout에서 들어오는 데이터를 처리한다
    csharp_process.stdout.on("data", (data) => {
      final_json_data += data.toString(); // 들어온 data를 문자열로 변환해 final_json_data에 누적한다
    });

    // stderr에서 진행률과 에러 로그를 처리한다
    csharp_process.stderr.on("data", (data) => {
      const message = data.toString().trim(); // data를 문자열로 변환하고 trim 한다
      const lines = message.split(/\r?\n/).filter((line: any) => line); // 줄 단위로 분리하고 빈 줄 제거한다
      for (const line of lines) {
        // 각 줄에 대해 반복 처리한다
        try {
          const progress_info = JSON.parse(line); // JSON 파싱으로 progress_info 객체 생성
          if (progress_info.type === "progress") {
            // 진행률 타입이면 메시지와 진행률 로그 넘기기
            on_progress(
              parseFloat(progress_info.percentage).toFixed(2), // 무조건 소수점 2자리로 고정 12.3 -> 12.30
              progress_info.message
            );
          } else if (progress_info.type === "error") {
            console.error(`[C# FATAL ERROR] ${progress_info.message}`); // 에러 타입이면 치명적 에러 로그 출력
            error_data += `${progress_info.message}\n`; // error_data에 에러 메시지 누적
          }
        } catch {
          console.log(`[C# Log] ${line}`); // JSON 파싱 실패 시 일반 로그로 처리
        }
      }
    });

    // C# 프로세스 종료 이벤트를 처리한다
    csharp_process.on("close", (code) => {
      console.log(`[Node.js] C# 프로세스가 code ${code}로 종료되었습니다`); // 종료 코드 로그 출력

      if (code === 0 && final_json_data) {
        try {
          const result = JSON.parse(final_json_data); // final_json_data를 JSON으로 파싱
          console.log("[Node.js] 최종 JSON 파싱에 성공했습니다"); // 파싱 성공 메시지 출력
          console.log(`총 ${result.length}개의 항목을 찾았습니다`); // 결과 항목 개수 로그 출력

          if (is_save_result)
            save_result_to_json(
              result,
              input_params.gallery_id,
              input_params.keyword
            ); // 결과를 JSON 파일로 저장하는 함수 호출
          resolve(result);
        } catch (e) {
          const error_message = `[Node.js] C# stdout에서 JSON 파싱에 실패했습니다: ${e}`;
          console.error(error_message); // 파싱 실패 시 에러 로그 출력
          reject(new Error(error_message));
        }
      } else if (code !== 0) {
        const error_message = `[Node.js] C# 프로세스가 에러 코드 ${code}로 종료되었습니다. stderr: ${error_data}`;
        console.error(error_message); // exit code가 0이 아니면 에러 로그 출력
        reject(new Error(error_message));
      } else {
        // code === 0 이고 데이터가 없는 경우 (오류 아님)
        resolve([]);
      }
    });

    // 프로세스 실행 자체 실패 이벤트를 처리한다
    csharp_process.on("error", (err) => {
      console.error("[Node.js] C# 프로세스 실행에 실패했습니다.", err); // 프로세스 시작 실패 로그 출력
      reject(err);
    });
  });
}

// --- 코드 시작부 ---
export async function parse_with_csharp(
  input_params: InputParams,
  options: Options,
  on_progress: ProgressCallback
): Promise<any[]> {
  if (is_auto_build) {
    let files: string[];
    try {
      files = await readdir(csharp_root_path);
    } catch (e) {
      console.error("[Node.js] C# 프로젝트 폴더를 읽는 데 실패했습니다:", e);
      return run_parser_process(input_params, options, on_progress);
    }

    // .sln, .csproj 둘 다 존재하는지 확인
    const has_both = [".sln", ".csproj"].every((ext) =>
      files.some((f) => f.endsWith(ext))
    );

    if (has_both) {
      console.log(
        `[Node.js] Release 모드로 C# 프로젝트를 빌드합니다: ${csharp_root_path}`
      );
      try {
        const { stdout, stderr } = await exec("dotnet build -c Release", {
          cwd: csharp_root_path,
        });
        console.log("[Node.js] C# 프로젝트 빌드에 성공했습니다");
        console.log(stdout);
        if (stderr) console.error(stderr);
      } catch (error: any) {
        console.error(`[Node.js] C# 빌드에 실패했습니다: ${error.message}`);
        if (error.stderr) console.error(error.stderr);
        if (error.stdout) console.error(error.stdout);
      }
    } else {
      console.log(
        "[Node.js] sln 파일과 csproj 파일이 모두 존재하지 않아 빌드를 건너뜁니다."
      );
    }
  }

  return run_parser_process(input_params, options, on_progress);
}

// 아래에서 모듈 단위 테스트 수행 가능 ==========================================
// 파이썬의 if __name__ == "__main__": 와 같은 역할
if (require.main === module) {
  const input_params: InputParams = {
    gallery_id: "bg3",
    keyword: "레이젤",
    repeat_count: 10,
    search_type: "TITLE_PLUS_CONTENT",
  };

  const options: Options = {
    requests_limit: 100, // 동시에 처리할 최대 요청 수
    retry_count: 5, // Polly 재시도 최대 횟수
    base_delay: 300, // Polly 재시도 시작 지연(ms)
    jitter: 250, // Polly 재시도 지터(랜덤 딜레이, ms)
  };

  (async () => {
    try {
      const result = await parse_with_csharp(
        input_params,
        options,
        (percentage, message) => {
          // \r을 사용하여 현재 줄에 덮어쓰기
          process.stdout.write(`[Progress] ${message} - ${percentage}%\r`);
        }
      );
      console.log("\n\n[Node.js] 최종 결과 =====================");
      console.log(result);
      console.log("=======================================");
    } catch (e) {
      console.error("\n\n[Node.js] 스크립트 실행 중 오류 발생:", e);
    }
  })();
}
