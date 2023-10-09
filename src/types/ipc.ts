/* eslint-disable prettier/prettier */

// main - renderer 간 통신을 위한 타입 정의

import { CreateOption, Search } from "./dcinside";

interface DCWebRequest {
  id: string;
  repeat_cnt: number;
  keyword: string;
  search_type: Search;
  option: CreateOption;
}

// ipc 통신간 사용하는 문자열 이름
enum IPCChannel {
  WEB_REQUEST = "web-request",
  WEB_RESPONSE = "web-response",
  WEB_REQUEST_PROGRESS = "web-request-progress",
  CLOSE_ME = "close-me",
  OPEN_LINK = "open-link",
  SET_REQUEST_LIMIT = "set-request-limit",
  GET_GALLERY_TEXT_NAME_REQ = "get-gallery-text-name-req",
  GET_GALLERY_TEXT_NAME_RES = "get-gallery-text-name-res",
}

export { DCWebRequest, IPCChannel };
