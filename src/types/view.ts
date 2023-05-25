// data.json 저장시 사용할 인터페이스 타입 정의

interface SaveData {
  search_type: string;
  repeat_cnt: number;
  gallary_id: string;
  keyword: string;
  settings: Settings;
}

interface Settings {
  program_entire_settings: {
    max_parallel: number;
  };
  user_preferences: {
    clear_data_on_search: boolean;
  };
}

export { SaveData };
