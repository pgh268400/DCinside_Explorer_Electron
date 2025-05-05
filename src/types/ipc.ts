// Main Process <-> Renderer 간 IPC 통신을 위한 타입 정의
import { CreateOption, Search } from "./dcinside";

// IPC 통신간 사용하는 문자열 이름을 상수로 선언 - 유지보수에 간편
export const IPCChannel = {
  // 메인 검색 기능, 디시 검색시 웹 통신 관련
  Web: {
    REQUEST: "web-request",
    RESPONSE: "web-response",
    REQUEST_PROGRESS: "web-request-progress",
    SET_REQUEST_LIMIT: "set-request-limit",
  },
  // 갤러리 id로 갤러리 이름 가져오는 웹 통신
  Gallery: {
    GET_TEXT_NAME_REQ: "get-gallery-text-name-req",
    GET_TEXT_NAME_RES: "get-gallery-text-name-res",
  },
  // 일렉트론 메인 창 닫기 / 최소화 버튼
  Window: {
    CLOSE_ME: "close-me",
    MINIMIZE_ME: "minimize-me",
  },
  Link: {
    OPEN_LINK: "open-link",
  },
  // 검색 결과 DB 저장, 불러오기, 삭제 등
  DB: {
    SAVE_ARTICLE_SEARCH_LOG: "db-save-search-log",
    LOAD_ARTICLE_SEARCH_LOG: "db-load-search-logs",
  },
} as const;

interface DCWebRequest {
  id: string;
  repeat_cnt: number;
  keyword: string;
  search_type: Search;
  option: CreateOption;
}

export { DCWebRequest };
