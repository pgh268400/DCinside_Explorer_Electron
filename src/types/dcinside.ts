// 사용할 타입 정의
enum Gallary {
  Default = "",
  Miner = "mgallery/",
  Mini = "mini/",
}

enum Search {
  TITLE_PLUS_CONTENT = "search_subject_memo",
  TITLE = "search_subject",
  CONTENT = "search_memo",
  WRITER = "search_name",
  COMMENT = "search_comment",
}

interface Page {
  pos: number;
  start_page: number;
  last_page: number;
}

interface Article {
  gall_num: number;
  gall_tit: string;
  gall_writer: string;
  gall_date: string;
  gall_count: number;
  gall_recommend: number;
  reply_num: number;
}

export { Gallary, Search, Page, Article };
