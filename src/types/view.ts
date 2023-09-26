// data.json 저장시 사용할 인터페이스 타입 정의
// 추가로 Vue 렌더러에서 사용할 타입 정의

// 유저가 입력하는 상단의 4개 입력 폼
interface UserInput {
  search_type: string;
  repeat_cnt: number;
  gallary_id: string;
  keyword: string;
}

// 글 자동 저장 / 일반 저장으로 사용할 데이터 타입 정의
interface SaveArticleData {
  user_input: UserInput;
  article_data: AGGridVueArticle[];
}

// json 파일에 저장할 데이터 타입 정의
interface SaveData extends UserInput {
  settings: Settings;
  auto_save?: SaveArticleData[];
}

// 설정 다이얼로그 저장시 사용할 인터페이스 타입 정의
interface Settings {
  program_entire_settings: {
    max_parallel: number;
  };
  user_preferences: {
    clear_data_on_search: boolean;
  };
  auto_save: {
    auto_save_result: boolean;
    max_auto_save: number;
  };
}

// AGGridVue 에 출력할 데이터 타입 정의

interface AGGridVueArticle {
  번호: number;
  제목: string;
  댓글수: number;
  작성자: string;
  조회수: number;
  추천: number;
  작성일: string;
}

// Drawer 에서 요소 클릭시 구분을 위해 사용할 enum 정의
enum DrawerAction {
  Settings = "settings",
  Load = "load",
  About = "about",
}

export { SaveArticleData, Settings, SaveData, DrawerAction, AGGridVueArticle };
