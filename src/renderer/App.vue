<!-- eslint-disable prettier/prettier -->
<!-- 백그라운드에서 돌리는 서버에서 실제로 화면 렌더링을 담당하는 클라이언트 부분 -->
<template>
  <v-app>
    <!-- 상단바(앱바) -->
    <div style="user-select: none">
      <v-app-bar
        app
        :color="theme_color"
        id="appbar"
        dark
        @mousedown="start_drag"
        @mousemove="drag"
        @mouseup="end_drag"
        @mouseleave="end_drag">
        <v-app-bar-nav-icon @click="open_drawer"></v-app-bar-nav-icon>
        <v-toolbar-title class="pl-1">{{ title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="minimize_window">
          <v-icon>mdi-window-minimize</v-icon>
        </v-btn>
        <v-btn icon @click="close_window">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-app-bar>
    </div>
    <!-- 본문 -->
    <v-main>
      <v-container>
        <!-- 상단 유저 입력 메뉴 -->
        <v-row>
          <v-col cols="2">
            <v-select
              :items="select_box.items"
              v-model="select_box.selected_item"
              :menu-props="{ offsetY: true }"></v-select>
          </v-col>
          <v-col cols="auto" style="width: 110px">
            <v-text-field
              label="반복 횟수"
              v-model.number="repeat_cnt"
              type="number"
              hide-spin-buttons></v-text-field>
          </v-col>
          <v-col cols="2">
            <v-text-field label="갤러리 ID" v-model="gallary_id"></v-text-field>
          </v-col>
          <v-col cols="5">
            <v-text-field
              label="검색어"
              v-model="keyword"
              :spellcheck="false"
              @keypress="search_keypress"></v-text-field>
          </v-col>
          <v-col>
            <v-btn
              :color="theme_color"
              dark
              class="mt-2"
              @click="search_btn_click"
              :loading="search_btn.is_loading">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <!-- 메인 테이블 (전체) -->
        <main-table
          :rows_data="table_rows"
          :loading_text_data="loading_text_data"
          :progress_value="progress_value"
          :is_loading="search_btn.is_loading"
          @manual_save="save_manual_data"></main-table>
      </v-container>
    </v-main>
    <!-- 설정 다이얼 로그 -->
    <v-dialog v-model="is_open_settings" width="500px">
      <v-card>
        <v-toolbar density="compact" :color="theme_color" dense>
          <v-toolbar-title>
            <span style="color: white">Settings</span>
          </v-toolbar-title>
        </v-toolbar>
        <div class="pa-2">
          <v-subheader>프로그램 전체 동작 설정</v-subheader>
          <v-list-item>
            <v-list-item-content class="pb-0">
              <v-text-field
                label="최대 병렬 처리 횟수"
                outlined
                clearable
                v-model.number="settings.program_entire_settings.max_parallel"
                height="auto"
                type="number"
                hide-spin-buttons></v-text-field>
            </v-list-item-content>
            <v-tooltip right :max-width="404">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  fab
                  small
                  color="primary"
                  class="ma-2 mb-7"
                  elevation="0"
                  v-bind="attrs"
                  v-on="on">
                  <v-icon dark>mdi-help-circle</v-icon>
                </v-btn>
              </template>
              <span>
                최대 병렬 처리 횟수를 조정하면 10000개씩 검색하는 디시 검색
                속도를 늘릴 수 있습니다. 예를 들어서 30으로 설정한 경우
                10000개의 글을 동시에 30개 단위로 검색합니다.
                <br />
                즉, 300000개의 글을 한꺼번에 조회하게 되며 이 값을 늘리면 탐색
                속도는 빨라지지만 그만큼 디시에서 일시적 IP차단을 당할 확률이
                높아집니다.
                <u>100 이상 올리는 것은 권장하지 않습니다.</u>
                <br />
                <b>기본값 : 100</b>
              </span>
            </v-tooltip>
          </v-list-item>
          <v-divider></v-divider>
          <v-subheader>유저 설정</v-subheader>
          <v-list-item>
            <v-list-item-action>
              <v-checkbox
                v-model="
                  settings.user_preferences.clear_data_on_search
                "></v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                검색 시 기존 검색 결과 초기화
              </v-list-item-title>
              <v-list-item-subtitle>
                검색하면 기존에 검색한 결과를 지우고 새로 검색합니다
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
          <v-subheader>자동 저장</v-subheader>
          <v-list-item>
            <v-list-item-action>
              <v-checkbox
                v-model="settings.auto_save.auto_save_result"></v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>자동 저장 활성화</v-list-item-title>
              <v-list-item-subtitle>
                최근 검색 기록을 자동 저장합니다
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content class="pb-0">
              <v-text-field
                label="최대 자동 저장 횟수"
                outlined
                clearable
                v-model.number="settings.auto_save.max_auto_save"
                height="auto"
                type="number"
                hide-spin-buttons
                :disabled="!settings.auto_save.auto_save_result"></v-text-field>
            </v-list-item-content>
            <v-tooltip right :max-width="404">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  fab
                  small
                  color="primary"
                  class="ma-2 mb-7"
                  elevation="0"
                  v-bind="attrs"
                  v-on="on">
                  <v-icon dark>mdi-help-circle</v-icon>
                </v-btn>
              </template>
              <span>
                자동 저장 시 최대 저장 횟수를 조정합니다. 예를 들어서 10으로
                설정한 경우 검색할때마다 최근 10번의 검색 기록을 저장합니다.
                아주 큰 값을 입력하면 무한정 저장하게 할 수 있으나 용량도 무한히
                늘어날 수 있으니 주의해야 합니다.
                <br />
                <b>기본값 : 10</b>
              </span>
            </v-tooltip>
          </v-list-item>
        </div>
        <v-card-actions class="justify-center">
          <v-btn variant="text" @click="submit_settings">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- About 다이얼 로그 -->
    <about-dialog
      :color="theme_color"
      :is_open_dialog="is_open_about"
      v-on:update:value="is_open_about = $event" />

    <!-- 불러오기 다이얼 로그 -->
    <load-interface
      :is_open_dialog="is_open_load"
      v-on:update:value="is_open_load = $event"
      :color="theme_color"
      :auto_save_data="save_data.auto_save"
      :manual_save_data="save_data.manual_save"></load-interface>

    <!-- 왼쪽 네비게이션 서랍 (Drawer) -->
    <v-navigation-drawer v-model="is_open_drawer" absolute temporary>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6 font-weight-bold">
            디시인사이드 글 검색기
          </v-list-item-title>
          <v-list-item-subtitle>written by pgh268400</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-list dense nav>
        <v-list-item
          v-for="item in drawer_items"
          :key="item.title"
          link
          @click="drawer_item_click(item.action)">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <!-- 폰트 class 로 조정 -->
            <v-list-item-title class="font-weight-regular">
              {{ item.title }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-app>
</template>

<script lang="ts">
import { ipcRenderer, IpcRendererEvent, remote } from "electron";
import Vue from "vue";
import { Article } from "../types/dcinside";
import { DCWebRequest, IPCChannel } from "../types/ipc";
import fs from "fs";
import {
  AGGridVueArticle,
  DrawerAction,
  SaveArticleData,
  SaveData,
  Settings,
} from "../types/view";
import { Nullable } from "../types/default";
import MainTable from "./components/MainTable.vue";
import AboutDialog from "./components/AboutDialog.vue";
import LoadInterface from "./components/LoadInterface.vue";

export default Vue.extend({
  name: "App",
  data() {
    return {
      title: "DCInside Explorer",
      theme_color: "#3B4890", // 프로그램 테마 색상
      save_file_location: "dc_data.json", // 프로그램 설정 파일 이름
      select_box: {
        items: ["제목+내용", "제목", "내용", "글쓴이", "댓글"],
        selected_item: "",
      },
      auto_save_data: [] as SaveArticleData[],
      drawer_items: [
        {
          title: "설정",
          icon: "mdi-cog",
          action: DrawerAction.Settings,
        },
        {
          title: "불러오기",
          icon: "mdi-file",
          action: DrawerAction.Load,
        },
        {
          title: "정보",
          icon: "mdi-help-box",
          action: DrawerAction.About,
        },
      ],
      selected_auto_save_data: null as Nullable<SaveArticleData>,

      // RAM 상에서 저장될 자동 / 수동 저장 데이터
      // 원래는 불러올때마다 파일에서 불러왔지만 그러면
      // 속도저하가 커서 불러올때는 RAM에서 보여주고, 저장은 파일에 저장하는 방식으로 변경
      save_data: {
        auto_save: [] as SaveArticleData[],
        manual_save: [] as SaveArticleData[],
      },

      table_rows: [] as AGGridVueArticle[],

      search_btn: {
        is_loading: false,
      },
      data_table_loading: false,
      repeat_cnt: 0,

      keyword: "",
      progress_value: "",
      loading_text_data: "",

      // =========================================================================
      dragging: false,
      offsetX: 0,
      offsetY: 0,
      startX: 0,
      startY: 0,
      // =========================================================================
      is_open_settings: false, // 설정창 다이얼로그
      is_open_about: false, // 정보 다이얼로그
      is_open_drawer: false, // 왼쪽위 석삼자 네비게이션 서랍
      is_open_load: false, // 불러오기 다이얼로그
      is_open_save_data: false, // 불러오기 안의 자동 저장 목록 다이얼로그
      filter_text: "",
      settings: {
        program_entire_settings: {
          max_parallel: 100,
        },
        user_preferences: {
          clear_data_on_search: true,
        },
        auto_save: {
          auto_save_result: true,
          max_auto_save: 10,
        },
      } as Settings,
    };
  },
  components: {
    MainTable,
    AboutDialog,
    LoadInterface,
  },

  // 처음 실행시 실행되는 함수
  async mounted() {
    // 초기 파일이 없으면 생성하는 함수 호출
    await this.make_settings_file(this.save_file_location, {
      // v-select는 첫 번째 아이템으로 기본값 설정
      search_type: this.select_box.items[0],
      repeat_cnt: this.repeat_cnt,
      gallary_id: this.gallary_id,
      keyword: this.keyword,
      settings: {
        program_entire_settings: {
          max_parallel: this.settings.program_entire_settings.max_parallel,
        },
        user_preferences: {
          clear_data_on_search:
            this.settings.user_preferences.clear_data_on_search,
        },
        auto_save: {
          auto_save_result: this.settings.auto_save.auto_save_result,
          max_auto_save: this.settings.auto_save.max_auto_save,
        },
      } as Settings,
      auto_save: [],
      manual_save: [],
    } as SaveData);

    // 설정 파일을 불러오고 UI에 반영한다
    try {
      const data = await fs.promises.readFile(this.save_file_location, "utf-8");
      const parsed_data: SaveData = JSON.parse(data);

      this.repeat_cnt = parsed_data.repeat_cnt;
      this.gallary_id = parsed_data.gallary_id;
      this.keyword = parsed_data.keyword;
      this.select_box.selected_item = parsed_data.search_type;
      this.settings = parsed_data.settings;

      // 설정 파일을 불러오면서 저장 데이터도 반영한다
      // (위에서 auto_save, manual_save는 없으면 무조건 생성하므로 null이 될 수 없다.)
      this.save_data.auto_save = parsed_data.auto_save as SaveArticleData[];
      this.save_data.manual_save = parsed_data.manual_save as SaveArticleData[];

      console.log("설정 파일을 성공적으로 불러왔습니다.");
    } catch (err) {
      console.error(err);
    }
  },

  // 종료 직전에 실행되는 함수
  async beforeDestroy() {
    await this.save_data_on_disk();
  },

  methods: {
    // 초기 파일이 없으면 생성하는 함수
    async make_settings_file(
      safe_file_location: string,
      save_obj_data: SaveData
    ) {
      // 설정 파일이 없다면 생성한다.
      if (!fs.existsSync(safe_file_location)) {
        try {
          await fs.promises.writeFile(
            safe_file_location,
            JSON.stringify(save_obj_data, null, 2)
          );
          console.log("초기 설정 파일이 존재하지 않아 생성했습니다.");
        } catch (err) {
          console.error(err);
        }
      }
    },
    async save_manual_data() {
      // 먼저 설정 파일을 불러온다
      const data = (
        await fs.promises.readFile(this.save_file_location)
      ).toString();

      // data를 json으로 파싱한다
      const parsed_data: SaveData = JSON.parse(data);

      if (!parsed_data.manual_save) {
        parsed_data.manual_save = [];
      }

      // 현재 검색한 내용을 기록한다.
      parsed_data.manual_save.push({
        user_input: {
          search_type: this.select_box.selected_item,
          repeat_cnt: this.repeat_cnt,
          gallary_id: this.gallary_id,
          keyword: this.keyword,
        },
        article_data: this.table_rows,
      });

      // 수동 저장 데이터를 RAM(data())에도 저장한다 (불러오기 만을 위한 용도)
      this.save_data.manual_save = parsed_data.manual_save;

      // parsed_data 객체를 JSON 문자열로 변환
      const json_data = JSON.stringify(parsed_data, null, 2);

      try {
        // JSON 데이터를 파일에 씁니다.
        await fs.promises.writeFile(this.save_file_location, json_data);
        console.log(
          "[수동 저장] 검색 데이터가 파일에 성공적으로 저장되었습니다."
        );
      } catch (error) {
        console.error(
          "[수동 저장] 데이터를 저장하는 중 오류가 발생했습니다.",
          error
        );
      }
    },

    async save_data_on_disk() {
      // 종료 직전에 프로그램의 입력 데이터를 저장한다.
      // 현재 dc_data.json 에 저장된 데이터를 불러온다.
      let auto_article_data: SaveArticleData[] = [];
      const current_data = await fs.promises.readFile("dc_data.json", "utf-8");
      const parsed_data: SaveData = JSON.parse(current_data);
      if (parsed_data.auto_save && parsed_data.auto_save.length !== 0) {
        auto_article_data = parsed_data.auto_save;
      }

      let manual_article_data: SaveArticleData[] = [];
      if (parsed_data.manual_save && parsed_data.manual_save.length !== 0) {
        manual_article_data = parsed_data.manual_save;
      }

      const data: SaveData = {
        search_type: this.select_box.selected_item,
        repeat_cnt: this.repeat_cnt,
        gallary_id: this.gallary_id,
        keyword: this.keyword,
        settings: {
          program_entire_settings: {
            max_parallel: this.settings.program_entire_settings.max_parallel,
          },
          user_preferences: {
            clear_data_on_search:
              this.settings.user_preferences.clear_data_on_search,
          },
          auto_save: {
            auto_save_result: this.settings.auto_save.auto_save_result,
            max_auto_save: this.settings.auto_save.max_auto_save,
          },
        } as Settings,
        auto_save: auto_article_data,
        manual_save: manual_article_data,
      };

      try {
        await fs.promises.writeFile(
          this.save_file_location,
          // 들여쓰기까지 포함해 깔끔하게 저장
          JSON.stringify(data, null, 2)
        );
        console.log(data, "Data saved successfully");
      } catch (err) {
        console.error(err);
      }
    },
    click_auto_save_item(article: SaveArticleData) {
      this.selected_auto_save_data = article;
      this.is_open_save_data = !this.is_open_save_data;
    },

    // 왼쪽 네비게이션 서랍 메뉴 클릭 시 실행되는 함수
    async drawer_item_click(action: DrawerAction) {
      // console.log(action);
      if (action === DrawerAction.Settings) {
        this.is_open_settings = true;
      } else if (action === DrawerAction.Load) {
        this.is_open_load = true;
      } else if (action === DrawerAction.About) {
        this.is_open_about = true;
      }

      // 아이템을 누르면 왼쪽의 네비게이션 서랍은 닫힌다.
      this.is_open_drawer = false;
    },
    // 왼쪽 위 석삼자 누를 시 실행되는 함수
    open_drawer() {
      this.is_open_drawer = !this.is_open_drawer;
    },
    // 설정 파일 확인 버튼 누를 시 실행되는 함수
    submit_settings() {
      // dialog 닫기
      this.is_open_settings = false;
    },
    search_keypress(e: KeyboardEvent) {
      if (e.key === "Enter") {
        e.preventDefault(); // Ensure it is only this code that runs
        this.search_btn_click();
        // alert("Enter was pressed was presses");
      }
    },
    start_drag(e: MouseEvent) {
      if (e.button === 0) {
        this.dragging = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
      }
    },
    drag(e: MouseEvent) {
      if (this.dragging) {
        const x = e.clientX - this.startX;
        const y = e.clientY - this.startY;
        this.offsetX = x;
        this.offsetY = y;
        if (this.offsetX || this.offsetY) {
          // this.$refs.appBar.$el.style.transform = `translate(${x}px, ${y}px)`;
          const window = remote.getCurrentWindow();
          // eslint-disable-next-line prettier/prettier
          window.setPosition(
            window.getPosition()[0] + x,
            window.getPosition()[1] + y
          );
        }
      }
    },
    end_drag() {
      this.dragging = false;
    },
    string_to_query(selected_items: string): string {
      const query_match_ui: any = {
        "제목+내용": "search_subject_memo",
        제목: "search_subject",
        내용: "search_memo",
        글쓴이: "search_name",
        댓글: "search_comment",
      };
      return query_match_ui[selected_items];
    },
    minimize_window() {
      // 현재 창 최소화
      const window = remote.getCurrentWindow();
      window.minimize();
    },
    close_window() {
      // 현재 창 종료
      // const window = remote.getCurrentWindow();
      // window.close();
      // app.exit(0);
      // 확실한 종료 보장을 위해 일렉트론 백그라운드 서버와 IPC 통신으로 종료 요청
      ipcRenderer.send("close-me");
    },

    // 검색 버튼 누를 시 실행되는 함수
    async search_btn_click() {
      // 여기서 그냥 웹 요청 보내면 CORS가 걸려서 ipc로 백그라운드 node.js 서버에서
      // 웹 요청을 보내고 응답을 받아서 화면에 렌더링하는 방식으로 구현해야 함

      // 검색 버튼 누르면 기존 검색 결과 초기화
      if (this.settings.user_preferences.clear_data_on_search)
        this.table_rows = [];

      // 버튼에 로딩 상태 반영
      this.search_btn.is_loading = true;

      // 웹 요청 보내기
      ipcRenderer.send(IPCChannel.WEB_REQUEST, {
        id: this.gallary_id,
        repeat_cnt: this.repeat_cnt,
        keyword: this.keyword,
        search_type: this.string_to_query(this.select_box.selected_item),
        option: {
          requests_limit: this.settings.program_entire_settings.max_parallel,
        },
      } as DCWebRequest);

      console.log({
        id: this.gallary_id,
        repeat_cnt: this.repeat_cnt,
        keyword: this.keyword,
        search_type: this.string_to_query(this.select_box.selected_item),
      });

      // 백그라운드 서버로부터 응답 받기
      ipcRenderer.on(IPCChannel.WEB_RESPONSE, this.web_response_callback);

      // 백그라운드 서버로부터 진행 상황 받기 (실제로는 콜백함수가 2번 실행되어 전달됨)
      ipcRenderer.on(
        IPCChannel.WEB_REQUEST_PROGRESS,
        (event, progress: string, status: string) => {
          this.progress_value = progress;
          this.loading_text_data = status;
        }
      );
    },

    // 웹 응답 받아 처리하는 콜백 함수
    async web_response_callback(event: IpcRendererEvent, result: Article[][]) {
      console.log(result.length);
      const items: AGGridVueArticle[] = [];

      console.time("배열 삽입 시간 : ");
      for (let article of result) {
        if (article.length > 0) {
          for (let item of article) {
            items.push({
              번호: item.gall_num,
              제목: item.gall_tit,
              댓글수: item.reply_num,
              작성자: item.gall_writer,
              조회수: item.gall_count,
              추천: item.gall_recommend,
              작성일: item.gall_date,
            });
          }
        }
      }

      console.timeEnd("배열 삽입 시간 : ");
      this.table_rows = items; //데이터 바인딩 (표 반영)

      // 버튼 로딩 완료 반영
      this.search_btn.is_loading = false;

      // 만약에 자동 저장이 켜져있으면 내용을 파일에 저장
      if (this.settings.auto_save.auto_save_result) {
        // 먼저 설정 파일을 불러온다
        const data = (
          await fs.promises.readFile(this.save_file_location)
        ).toString();

        // data를 json으로 파싱한다
        const parsed_data: SaveData = JSON.parse(data);

        // auto_save 값이 없으면 빈 배열을 추가한다.
        if (!parsed_data.auto_save) {
          parsed_data.auto_save = [];
        }

        const limit = this.settings.auto_save.max_auto_save; // 자동 저장 갯수 제한

        // 저장하려는 데이터 내용이 비었으면 자동 저장하지 않는다.
        if (items.length === 0) return;

        // 갯수 제한에 걸리면 맨 뒷 요소를 제거함 (추가는 뒤에다가 계속함)
        if (parsed_data.auto_save.length >= limit) {
          parsed_data.auto_save.pop();
        }

        // 현재 검색한 내용을 auto_save에 기록한다.
        parsed_data.auto_save.push({
          user_input: {
            search_type: this.select_box.selected_item,
            repeat_cnt: this.repeat_cnt,
            gallary_id: this.gallary_id,
            keyword: this.keyword,
          },
          article_data: items,
        });

        // 자동 저장 데이터를 RAM(data())에도 저장한다 (불러오기 만을 위한 용도)
        this.save_data.auto_save = parsed_data.auto_save;

        // parsed_data 객체를 JSON 문자열로 변환
        const json_data = JSON.stringify(parsed_data, null, 2);

        try {
          // JSON 데이터를 파일에 씁니다.
          await fs.promises.writeFile(this.save_file_location, json_data);
          console.log(
            "[자동 저장] 검색 데이터가 파일에 성공적으로 저장되었습니다."
          );
        } catch (error) {
          console.error(
            "[자동 저장] 데이터를 저장하는 중 오류가 발생했습니다.",
            error
          );
        }
      }
    },
  },
  computed: {
    // Vuex 데이터 추가
    gallary_id: {
      get() {
        return this.$store.getters.get_gallary_id;
      },
      set(value) {
        this.$store.commit("set_gallary_id", value);
      },
    },
  },
  watch: {
    /*
    // max_parallel 이 object 안에 들어가 있으므로
    // 프로퍼티 내부의 중첩된 값 변경을 감지하려면 Deep Watcher (깊은 감시자)를 사용해야 함
    // https://jodong.tistory.com/9
    "settings.program_entire_settings.max_parallel": {
      deep: true,
      handler(new_val: string, old_val: string) {
        console.log("max_parallel", new_val);
      },
    },
    */
  },
});
</script>

<style scoped>
.v-sheet.v-card {
  border-radius: 0px;
}
</style>
