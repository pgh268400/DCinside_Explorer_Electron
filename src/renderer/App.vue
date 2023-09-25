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
        <!-- 검색 중에만 프로그래스바, 설명 표시 -->
        <div v-if="search_btn.is_loading">
          <v-progress-linear
            color="primary"
            :value="progress_value"
            :height="25">
            <template v-slot:default="{ value }">
              <strong style="color: white">{{ value }}%</strong>
            </template>
          </v-progress-linear>
          <div class="text-center" style="font-size: 0.875rem">
            {{ loading_text_data }}
          </div>
        </div>
        <v-text-field
          v-model="filter_text"
          append-icon="mdi-magnify"
          label="전체 필터링"
          single-line
          hide-details
          style="margin-bottom: 2px"
          @input="onFilterTextChange"></v-text-field>
        <template>
          <ag-grid-vue
            style="height: 537px"
            class="ag-theme-material"
            :defaultColDef="ag_grid_vue.default_columns_def"
            :columnDefs="ag_grid_vue.columns"
            :rowData="ag_grid_vue.rows"
            :pagination="ag_grid_vue.ispagination"
            :localeText="ag_grid_vue.locale_text"
            :suppressPaginationPanel="true"
            :paginationPageSize="ag_grid_vue.pagination_size"
            @grid-ready="onGridReady"
            @grid-size-changed="onGridSizeChanged"
            @pagination-changed="onPaginationChanged"
            suppressBrowserResizeObserver="true"
            :cacheQuickFilter="true"></ag-grid-vue>
        </template>

        <v-row class="pagination-bar" align="center" justify="end">
          <v-col cols="auto">
            <div style="height: 25px" class="no-drag">
              페이지 당 보여질 갯수
            </div>
          </v-col>
          <v-col cols="auto" style="width: 80px">
            <v-select
              v-model="page_select_box.selected_item"
              :items="page_select_box.items"
              class="custom-select"
              @change="onPageSizeChange"
              :menu-props="{ top: true, offsetY: true }"></v-select>
          </v-col>
          <v-col cols="auto" v-if="ag_grid_vue.total_page" class="no-drag">
            {{ ag_grid_vue.start_page_idx }} - {{ ag_grid_vue.end_page_idx }} /
            {{ ag_grid_vue.total_item_cnt }}
          </v-col>
          <v-col cols="auto">
            <v-btn icon @click="first_page" :disabled="is_first_page">
              <v-icon>mdi-page-first</v-icon>
            </v-btn>
            <v-btn icon @click="prev_page" :disabled="is_first_page">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <span v-if="ag_grid_vue.total_page" class="no-drag">
              총
              <b>{{ ag_grid_vue.total_page }}</b>
              페이지 중
              <b>{{ ag_grid_vue.current_page }}</b>
              페이지
            </span>

            <v-btn
              icon
              @click="next_page"
              :disabled="is_last_page && !search_btn.is_loading">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
            <v-btn
              icon
              @click="last_page"
              :disabled="is_last_page && !search_btn.is_loading">
              <v-icon>mdi-page-last</v-icon>
            </v-btn>
          </v-col>
        </v-row>
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
                v-model="
                  settings.user_preferences.auto_save_result
                "></v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>자동 저장 활성화</v-list-item-title>
              <v-list-item-subtitle>
                최근 검색 기록을 자동 저장합니다
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </div>
        <v-card-actions class="justify-center">
          <v-btn variant="text" @click="submit_settings">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- About 다이얼 로그 -->
    <v-dialog v-model="is_open_about" width="550px">
      <v-card>
        <v-toolbar density="compact" :color="theme_color" dense>
          <v-toolbar-title>
            <span style="color: white">About</span>
          </v-toolbar-title>
        </v-toolbar>
        <div class="pa-4 text-center">
          <v-subheader class="justify-center">
            디시인사이드 초고속 글 검색기
          </v-subheader>
          <v-list-item class="justify-center">
            <img
              src="https://i.redd.it/dgg8lowfznd61.jpg"
              alt="https://avatars.githubusercontent.com/u/31213158?v=4"
              width="400"
              height="400" />
          </v-list-item>
          <v-list-item>
            <v-list-item-content class="pb-0">
              <v-list-item-title class="font-weight-bold">
                <a @click="open_about_link" style="text-decoration: underline">
                  Copyright 2023. File(pgh268400)
                  <br />
                  ALL RIGHTS RESERVED.
                </a>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </div>
      </v-card>
    </v-dialog>

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
import { ipcRenderer, remote } from "electron";
import Vue from "vue";
import { Article } from "../types/dcinside";
import { DCWebRequest } from "../types/ipc";
import fs from "fs";
import { AGGridVueArticle, DrawerAction, SaveData } from "../types/view";
import { AgGridVue } from "ag-grid-vue";
import CustomLinkRenderer from "./components/CustomLinkRenderer.vue";
import { ColumnApi, GridApi, GridReadyEvent } from "ag-grid-community";
import { Nullable } from "../types/default";
import AG_GRID_LOCALE_EN from "./locales/locale.en";
import { shell } from "electron";

export default Vue.extend({
  name: "App",
  data() {
    return {
      title: "DCInside Explorer",
      theme_color: "#3B4890", // 프로그램 테마 색상
      save_file_name: "dc_data.json", // 프로그램 설정 파일 이름
      select_box: {
        items: ["제목+내용", "제목", "내용", "글쓴이", "댓글"],
        selected_item: "",
      },
      page_select_box: {
        items: ["10", "20", "30", "40", "50", "모두"],
        selected_item: "",
      },

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
        { title: "About", icon: "mdi-help-box", action: DrawerAction.About },
      ],

      ag_grid_vue: {
        // ag_grid_vue 의 모든 Column 에 기본 적용되는 옵션
        default_columns_def: {
          sortable: true,
          resizable: true,
          cellStyle: { fontSize: "0.875rem" },
          lockVisible: true, // 열 삭제 기능 제거
          // wrapText: true,
          // autoHeight: true,
        },
        columns: [
          {
            field: "번호",
            width: 95,
            cellRenderer: "CustomLinkRenderer",
            cellRendererParams: "",
            // filter: "agNumberColumnFilter",
          },
          { field: "제목", flex: 1, filter: "agTextColumnFilter" },
          {
            field: "댓글수",
            width: 70,
            // filter: "agNumberColumnFilter"
          },
          {
            field: "작성자",
            width: 100,
            // filter: "agTextColumnFilter"
          },
          {
            field: "작성일",
            width: 70,
            // filter: "agTextColumnFilter"
          },
          {
            field: "조회수",
            width: 70,
            // filter: "agNumberColumnFilter"
          },
          { field: "추천", width: 80, filter: "agNumberColumnFilter" },
        ],
        rows: [
          // { 열1: "값1", 열2: "값2", 열3: 값3 },
        ] as AGGridVueArticle[],
        locale_text: AG_GRID_LOCALE_EN,
        grid_api: null as Nullable<GridApi>,
        grid_column_api: null as Nullable<ColumnApi>,
        current_page: null as Nullable<number>,
        total_page: null as Nullable<number>,
        start_page_idx: null as Nullable<number>,
        end_page_idx: null as Nullable<number>,
        total_item_cnt: null as Nullable<number>,
        pagination_size: 10,
        ispagination: true,
      },

      data_table: {
        headers: [
          { text: "번호", value: "gall_num" },
          { text: "제목", value: "gall_tit" },
          { text: "댓글수", value: "reply_num" },
          { text: "작성자", value: "gall_writer" },
          { text: "작성일", value: "gall_date" },
          { text: "조회수", value: "gall_count" },
          { text: "추천", value: "gall_recommend" },
        ],
        items: [
          // {
          //   gall_num: 99999999,
          //   gall_tit: "1234567890123456789012345678901234567890",
          //   gall_writer: "ㅇㅇㅇㅇㅇㅇ",
          //   gall_date: "23/05/15",
          //   gall_count: 9999,
          //   gall_recommend: 9999,
          //   reply_num: 9999,
          // },
        ] as Article[],
      },

      search_btn: {
        is_loading: false,
      },
      data_table_loading: false,
      repeat_cnt: 0,

      keyword: "",
      progress_value: 0,
      loading_text_data: "",
      // ====
      dragging: false,
      offsetX: 0,
      offsetY: 0,
      startX: 0,
      startY: 0,
      // ====
      is_open_settings: false,
      is_open_about: false,
      is_open_drawer: false,
      filter_text: "",
      settings: {
        program_entire_settings: {
          max_parallel: 100,
        },
        user_preferences: {
          clear_data_on_search: true,
          auto_save_result: true,
        },
      },
    };
  },
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    CustomLinkRenderer,
  },

  // 처음 실행시 실행되는 함수
  async mounted() {
    // 첫 번째 아이템으로 기본값 설정 (v-select)
    this.select_box.selected_item = this.select_box.items[0];
    this.page_select_box.selected_item = this.page_select_box.items[0];

    try {
      const data = await fs.promises.readFile(this.save_file_name, "utf-8");
      const parsed_data: SaveData = JSON.parse(data);
      this.repeat_cnt = parsed_data.repeat_cnt;
      this.gallary_id = parsed_data.gallary_id;
      this.keyword = parsed_data.keyword;
      this.select_box.selected_item = parsed_data.search_type;
      this.settings = parsed_data.settings;
      console.log("Data loaded successfully");
    } catch (err) {
      console.error(err);
    }
  },

  // 종료 직전에 실행되는 함수
  async beforeDestroy() {
    // 종료 직전에 프로그램의 입력 데이터를 저장한다.
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
          auto_save_result: this.settings.user_preferences.auto_save_result,
        },
      },
    };

    try {
      await fs.promises.writeFile(
        this.save_file_name,
        // 들여쓰기까지 포함해 깔끔하게 저장
        JSON.stringify(data, null, 2)
      );
      console.log(data, "Data saved successfully");
    } catch (err) {
      console.error(err);
    }
  },

  methods: {
    open_about_link() {
      shell.openExternal("https://github.com/pgh268400");
    },
    // 왼쪽 네비게이션 서랍 메뉴 클릭 시 실행되는 함수
    drawer_item_click(action: DrawerAction) {
      // console.log(action);
      if (action === DrawerAction.Settings) {
        this.is_open_settings = true;
      } else if (action === DrawerAction.Load) {
        //
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
    onFilterTextChange() {
      if (this.ag_grid_vue.grid_api) {
        setTimeout(() => {
          this.ag_grid_vue.grid_api?.setQuickFilter(this.filter_text);
        }, 0);
      }
    },
    onPageSizeChange() {
      if (this.page_select_box.selected_item != "모두") {
        this.ag_grid_vue.ispagination = true;
        this.ag_grid_vue.pagination_size = parseInt(
          this.page_select_box.selected_item
        );
      } else {
        this.ag_grid_vue.ispagination = false;
      }
    },
    onPaginationChanged() {
      if (this.ag_grid_vue.grid_api) {
        // 현재 페이지가 0이 아닐때만 렌더링
        this.ag_grid_vue.current_page =
          this.ag_grid_vue.grid_api.paginationGetCurrentPage() + 1;
        this.ag_grid_vue.total_page =
          this.ag_grid_vue.grid_api.paginationGetTotalPages();

        this.ag_grid_vue.total_item_cnt =
          this.ag_grid_vue.grid_api.getDisplayedRowCount();

        const row_count = this.ag_grid_vue.total_item_cnt;
        const last_grid_idx = row_count - 1;
        const current_page = this.ag_grid_vue.current_page;
        const page_size = this.ag_grid_vue.grid_api.paginationGetPageSize();
        let start_page_idx = (current_page - 1) * page_size;
        let end_page_idx = current_page * page_size - 1;

        if (end_page_idx > last_grid_idx) {
          end_page_idx = last_grid_idx;
        }

        this.ag_grid_vue.start_page_idx = start_page_idx + 1;
        this.ag_grid_vue.end_page_idx = end_page_idx + 1;
      }
    },
    first_page() {
      this.ag_grid_vue.grid_api?.paginationGoToFirstPage();
    },
    last_page() {
      this.ag_grid_vue.grid_api?.paginationGoToLastPage();
    },
    prev_page() {
      this.ag_grid_vue.grid_api?.paginationGoToPreviousPage();
    },
    next_page() {
      this.ag_grid_vue.grid_api?.paginationGoToNextPage();
    },
    onGridSizeChanged(params: any) {
      // params.api.sizeColumnsToFit();
    },
    onGridReady(params: GridReadyEvent) {
      // console.log("ready");
      this.ag_grid_vue.grid_api = params.api;
      this.ag_grid_vue.grid_column_api = params.columnApi;

      // params.api.sizeColumnsToFit(); // 열 너비 자동 조절
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
    open_link(gallary_id: string, no: string) {
      // 링크 클릭시 해당 게시글로 크롬 브라우저 실행해 이동
      // ipc 이용하여 일렉트론 서버와 통신
      ipcRenderer.send("open-link", gallary_id, no);
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
    async search_btn_click() {
      // 여기서 그냥 웹 요청 보내면 CORS가 걸려서 ipc로 백그라운드 node.js 서버에서
      // 웹 요청을 보내고 응답을 받아서 화면에 렌더링하는 방식으로 구현해야 함

      // 검색 버튼 누르면 기존 검색 결과 초기화
      if (this.settings.user_preferences.clear_data_on_search) {
        // this.data_table.items = [];
        this.ag_grid_vue.rows = [];
      }

      this.search_btn.is_loading = true;

      console.log(typeof this.repeat_cnt);

      // 웹 요청 보내기
      ipcRenderer.send("web-request", {
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
      ipcRenderer.on("web-request-response", (event, result: Article[][]) => {
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

        // 데이터 바인딩
        // this.data_table.items = items;
        this.ag_grid_vue.rows = items;
        // console.log(this.data_table.items);

        // 만약에 자동 저장이 켜져있으면 내용을 파일에 저장
        if (this.settings.user_preferences.auto_save_result) {
          // 먼저 설정 파일을 불러온다
        }

        this.search_btn.is_loading = false;
      });

      ipcRenderer.on(
        "web-request-progress",
        (event, progress: number, status: string) => {
          this.progress_value = progress;
          this.loading_text_data = status;
        }
      );
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
    is_first_page() {
      if (
        this.ag_grid_vue.current_page === 1 &&
        this.ag_grid_vue.start_page_idx === 1
      ) {
        return true;
      } else {
        return false;
      }
    },
    is_last_page() {
      if (
        this.ag_grid_vue.current_page === this.ag_grid_vue.total_page &&
        this.ag_grid_vue.end_page_idx === this.ag_grid_vue.total_item_cnt
      ) {
        return true;
      } else {
        return false;
      }
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

<style lang="scss">
@import "~ag-grid-community/styles/ag-grid.css";
// @import "~ag-grid-community/styles/ag-theme-alpine.css";
@import "~ag-grid-community/styles/ag-theme-material.css";
</style>

<style scoped>
.v-sheet.v-card {
  border-radius: 0px;
}

.ag-theme-material {
  --ag-cell-horizontal-padding: 16px;
  border-bottom: none;
}

.pagination-bar {
  font-size: 0.75rem;
  margin-top: -25px;
  justify-content: flex-end;
}

.custom-select {
  font-size: 0.75rem;
}

.no-drag {
  user-select: none;
}
</style>
