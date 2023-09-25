/* eslint-disable prettier/prettier */

// main / renderer 간 통신을 위한 타입 정의

import { CreateOption, Search } from "./dcinside";

interface DCWebRequest {
  id: string;
  repeat_cnt: number;
  keyword: string;
  search_type: Search;
  option: CreateOption;
}

export { DCWebRequest };
