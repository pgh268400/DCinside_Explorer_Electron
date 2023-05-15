/* eslint-disable prettier/prettier */
import { Search } from "../../../Lab/JavaScript/DCParser/type";

interface DCWebRequest {
  id: string;
  repeat_cnt: number;
  keyword: string;
  search_type: Search;
}

export { DCWebRequest };
