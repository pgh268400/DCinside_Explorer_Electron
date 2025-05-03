<!-- eslint-disable prettier/prettier -->
<!-- 백그라운드에서 돌리는 서버에서 실제로 화면 렌더링을 담당하는 클라이언트 부분 -->
<template>
  <v-app>
    <!-- 상단바(앱바) -->
    <div style="user-select: none">
      <v-app-bar app :color="theme_color" id="appbar" dark class="yes-drag">
        <v-app-bar-nav-icon
          @click="open_drawer"
          class="no-drag"></v-app-bar-nav-icon>
        <v-toolbar-title class="pl-1">{{ title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="minimize_window" class="no-drag">
          <v-icon>mdi-window-minimize</v-icon>
        </v-btn>
        <v-btn icon @click="close_window" class="no-drag">
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
            <v-text-field label="갤러리 ID" v-model="gallery_id"></v-text-field>
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
          :is_manual_save_loading="save_button.is_loading"
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
                <b>
                  기본값 : {{ settings.program_entire_settings.max_parallel }}
                </b>
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
                <b>기본값 : {{ settings.auto_save.max_auto_save }}</b>
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
      v-on:delete:article="delete_article"
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
import { ipcRenderer, IpcRendererEvent } from "electron";
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
import path from "path";

export default Vue.extend({
  name: "App",
  data() {
    return {
      title: "DCInside Explorer", // 프로그램 창 타이틀에 사용하는 변수
      theme_color: "#3B4890", // 프로그램 테마 색상

      base_folder_location: "./dc_config", // 프로그램 설정 파일이 저장될 폴더 이름
      select_box: {
        items: ["제목+내용", "제목", "내용", "글쓴이", "댓글"],
        selected_item: "",
      },
      gallery_id: "",
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

      /*
        RAM 상에서 저장될 자동 / 수동 저장 데이터
        원래는 불러올때마다 파일(디스크)에서 불러왔지만 그러면
        속도저하가 커서 프로그램 첫 시작시에만 디스크 불러와 해당 변수(RAM) 에 저장해두고,
        이후에 불러올때는 해당 변수(RAM)에서 보여주는 방식으로 변경.
        저장시엔 변수에 저장된 데이터를 디스크에 저장.
        OS에 흔히 쓰이는 버퍼 기법.
      */
      save_data: {
        auto_save: [] as SaveArticleData[],
        manual_save: [] as SaveArticleData[],
      },

      table_rows: [] as AGGridVueArticle[],

      // 검색 버튼의 로딩 상태를 나타내는 변수
      search_btn: {
        is_loading: false,
      },

      // 수동 저장 버튼의 로딩 상태를 나타내는 변수
      save_button: {
        is_loading: false,
      },
      data_table_loading: false,
      repeat_cnt: 0,

      keyword: "",
      progress_value: "",
      loading_text_data: "",

      // =========================================================================
      is_open_settings: false, // 설정창 다이얼로그
      is_open_about: false, // 정보 다이얼로그
      is_open_drawer: false, // 왼쪽위 석삼자 네비게이션 서랍
      is_open_load: false, // 불러오기 다이얼로그
      is_open_save_data: false, // 불러오기 안의 자동 저장 목록 다이얼로그
      // =========================================================================

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
    this.initialize_ui(); // UI 설정 저장 파일 없으면 생성 & 있으면 로드
    // await this.load_article_db(); // SQLite 글 데이터 로드
  },

  // 종료 직전에 실행되는 함수
  async beforeDestroy() {
    // 검색중에 강제 종료하면 파일에 저장하지 않는다. (버그 방지용)
    if (this.search_btn.is_loading) {
      return;
    }
    await this.save_ui_data();
  },

  methods: {
    // 가장 초기에 UI 설정 파일을 준비하기 위해 호출되는 함수(mounted에서 사용)
    async initialize_ui() {
      // 파일이 없으면 우선적으로 생성
      await this.make_settings_file(this.setting_file_location, {
        // v-select는 첫 번째 아이템으로 기본값 설정
        search_type: this.select_box.items[0],
        repeat_cnt: this.repeat_cnt,
        gallery_id: this.gallery_id,
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
        },
      });

      // 설정 파일을 불러오고 UI에 반영한다
      try {
        const data = await fs.promises.readFile(
          this.setting_file_location,
          "utf-8"
        );
        const parsed_data: SaveData = JSON.parse(data);

        this.repeat_cnt = parsed_data.repeat_cnt;
        this.gallery_id = parsed_data.gallery_id;
        this.keyword = parsed_data.keyword;
        this.select_box.selected_item = parsed_data.search_type;
        this.settings = parsed_data.settings;

        console.log("설정 파일을 성공적으로 불러왔습니다.");
      } catch (e) {
        console.log("설정 파일을 불러오는 중 오류가 발생했습니다.", e);
      }
    },

    async delete_article(obj: any) {
      // console.log(obj);
      // // 삭제 버튼을 연타하면 오류가 발생하므로 연타를 못하게 바로 데이터 상에서 날려버린다.
      // if (obj.type === "manual") {
      //   this.save_data.manual_save.splice(obj.index, 1); // RAM 상에서도 삭제
      // } else {
      //   this.save_data.auto_save.splice(obj.index, 1); // RAM 상에서도 삭제
      // }
      // try {
      //   const data = await fs.promises.readFile(
      //     this.setting_file_location,
      //     "utf-8"
      //   );
      //   const parsed_data: SaveData = JSON.parse(data);
      //   if (!parsed_data.auto_save)
      //     throw new Error("오류 : auto_save 데이터가 존재하지 않습니다");
      //   if (!parsed_data.manual_save)
      //     throw new Error("오류 : manual_save 데이터가 존재하지 않습니다");
      //   // 인덱스에 해당하는 데이터 삭제
      //   // 자바스크립트에서 splice는 원본 배열을 수정한다.
      //   if (obj.type === "manual") {
      //     parsed_data.manual_save.splice(obj.index, 1);
      //   } else {
      //     parsed_data.auto_save.splice(obj.index, 1);
      //   }
      //   // 파일에 쓰기
      //   const json_data = JSON.stringify(parsed_data, null, 2); // 데이터를 JSON 문자열로 변환하고 가독성을 위해 두 번째 매개변수로 null, 2를 전달
      //   await fs.promises.writeFile(
      //     this.setting_file_location,
      //     json_data,
      //     "utf-8"
      //   ); // 파일에 JSON 데이터 쓰기
      // } catch (error: any) {
      //   console.log(error);
      // }
    },

    // 초기 파일이 없으면 생성하는 함수
    async make_settings_file(
      safe_file_location: string, // 일반적으로 ./폴더명/세팅 파일명.json 형태로 들어온다.
      save_obj_data: SaveData
    ) {
      // 디렉토리 경로를 추출
      const dir = path.dirname(safe_file_location);

      try {
        // 디렉토리가 존재하지 않으면 설정 폴더를 우선 생성
        await fs.promises.mkdir(dir, { recursive: true });
      } catch (e: any) {
        console.error("설정 디렉토리 생성 중 오류 발생:", e);
      }

      // 설정 폴더 안에 설정 파일이 없다면 생성한다.
      try {
        // 파일이 이미 존재하는지 확인
        // 이 access 함수는 파일이 존재하지 않으면 ENOENT 예외를 발생시키고, 이미 있다면 아무 일을 하지 않는다.
        await fs.promises.access(safe_file_location, fs.constants.F_OK);
      } catch (_) {
        // 존재하지 않을 경우 생성
        try {
          const json_data = JSON.stringify(save_obj_data, null, 2);
          await fs.promises.writeFile(safe_file_location, json_data, "utf-8");
          console.log("초기 설정 파일이 존재하지 않아 새로 생성하였습니다.");
        } catch (e: any) {
          console.error("설정 파일 생성 중 오류 발생:", e);
        }
      }
    },

    // IPC를 통한 글 DB 데이터 불러오기
    async load_article_db() {
      try {
        const rows = await ipcRenderer.invoke("db-load-sessions");
        // 세션별 그룹핑
        const groups: Record<number, SaveArticleData> = {};
        this.save_data.auto_save = [];
        this.save_data.manual_save = [];
        rows.forEach((r: any) => {
          if (!groups[r.session_id]) {
            groups[r.session_id] = {
              user_input: {
                search_type: r.search_type,
                repeat_cnt: r.repeat_cnt,
                gallery_id: r.gallery_id,
                keyword: r.keyword,
              },
              article_data: [],
            };
            if (r.is_manual)
              this.save_data.manual_save.push(groups[r.session_id]);
            else this.save_data.auto_save.push(groups[r.session_id]);
          }
          groups[r.session_id].article_data.push({
            번호: r.번호,
            제목: r.제목,
            댓글수: r.댓글수,
            작성자: r.작성자,
            조회수: r.조회수,
            추천: r.추천,
            작성일: r.작성일,
          });
        });
      } catch (e) {
        console.error("[load_sessions] IPC 오류", e);
      }
    },

    /*
      해당 함수는 수동 저장 버튼을 누를 때마다 호출된다.
      참고로 버튼을 연타하니깐 race condition 인지 몰라도
      Json.Parse 부분에서 오류가 발생해서 버튼을 연타하지 못하도록 변경했다.
      (수동 저장이 다 이루어지기 전까진 버튼이 로딩 상태로 변함)
    */
    async save_manual_data() {
      //   try {
      //     this.save_button.is_loading = true; // 버튼을 로딩 상태로 변경
      //     // 먼저 설정 파일을 불러온다
      //     const data = await fs.promises.readFile(
      //       this.setting_file_location,
      //       "utf-8"
      //     );
      //     // data를 json으로 파싱한다
      //     const parsed_data: SaveData = JSON.parse(data);
      //     if (!parsed_data.manual_save) {
      //       parsed_data.manual_save = [];
      //     }
      //     // 현재 검색한 내용을 기록한다.
      //     parsed_data.manual_save.push({
      //       user_input: {
      //         search_type: this.select_box.selected_item,
      //         repeat_cnt: this.repeat_cnt,
      //         gallery_id: this.gallery_id,
      //         keyword: this.keyword,
      //       },
      //       article_data: this.table_rows,
      //     });
      //     // 수동 저장 데이터를 RAM(data())에도 저장한다 (불러오기 만을 위한 용도)
      //     this.save_data.manual_save = parsed_data.manual_save;
      //     // parsed_data 객체를 JSON 문자열로 변환
      //     const json_data = JSON.stringify(parsed_data, null, 2);
      //     try {
      //       // JSON 데이터를 파일에 씁니다.
      //       await fs.promises.writeFile(this.setting_file_location, json_data);
      //       console.log(
      //         "[수동 저장] 검색 데이터가 파일에 성공적으로 저장되었습니다."
      //       );
      //     } catch (error) {
      //       console.error(
      //         "[수동 저장] 데이터를 저장하는 중 오류가 발생했습니다.",
      //         error
      //       );
      //     }
      //   } catch (error: any) {
      //     console.log(error);
      //   } finally {
      //     this.save_button.is_loading = false; // 버튼을 로딩 상태에서 해제
      //     this.$toast("저장이 완료되었습니다", {
      //       position: "bottom-center",
      //       timeout: 718,
      //       closeOnClick: true,
      //       pauseOnFocusLoss: true,
      //       pauseOnHover: false,
      //       draggable: true,
      //       draggablePercent: 0.6,
      //       showCloseButtonOnHover: true,
      //       hideProgressBar: true,
      //       closeButton: "button",
      //       icon: true,
      //       rtl: false,
      //     } as any);
      //   }
    },

    async save_ui_data() {
      // 종료 직전에 프로그램의 입력 데이터를 저장한다.
      const data: SaveData = {
        search_type: this.select_box.selected_item,
        repeat_cnt: this.repeat_cnt,
        gallery_id: this.gallery_id,
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
      };

      try {
        await fs.promises.writeFile(
          this.setting_file_location,
          // 들여쓰기까지 포함해 깔끔하게 저장
          JSON.stringify(data, null, 2)
        );
        console.log(data, "UI 데이터 저장이 완료되었습니다.");
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
        // 버튼이 로딩중이면 키 이벤트를 즉시 무시한다. (연타 방지)
        if (this.search_btn.is_loading) return;
        e.preventDefault(); // Ensure it is only this code that runs
        this.search_btn_click();
        // alert("Enter was pressed was presses");
      }
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
      ipcRenderer.send(IPCChannel.MINIMIZE_ME);
    },
    close_window() {
      // 확실한 종료 보장을 위해 일렉트론 백그라운드 서버와 IPC 통신으로 종료 요청
      ipcRenderer.send(IPCChannel.CLOSE_ME);
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
        id: this.gallery_id,
        repeat_cnt: this.repeat_cnt,
        keyword: this.keyword,
        search_type: this.string_to_query(this.select_box.selected_item),
        option: {
          requests_limit: this.settings.program_entire_settings.max_parallel,
        },
      } as DCWebRequest);

      // 디버깅용 출력
      console.log({
        id: this.gallery_id,
        repeat_cnt: this.repeat_cnt,
        keyword: this.keyword,
        search_type: this.string_to_query(this.select_box.selected_item),
      });

      /*
        주의 : 아래 IPC 응답을 받기 위해 리스너 함수를 ipcRenderer.on() 이 아닌 반드시 .once() 로 등록해야 한다
          .on() 으로 등록 시 계속해서 IPC 요청에 대한 응답 함수를 '누적' 해서 더하는 형태로 작동하기에 응답 한 번 처리 후 자동 해제되는 once() 를 사용해야 한다.
        지금까지 .on() 의 동작을 잘못 이해해서 검색이 매번 이루어질때마다 응답 함수가 반복 호출되고 있는 끔찍한 일이 일어나고 있었던 것... ㅜㅜㅜ
      */
      // 백그라운드 서버로부터 응답 받기
      ipcRenderer.once(IPCChannel.WEB_RESPONSE, this.web_response_callback);

      /*
        백그라운드 서버로부터 진행 상황 받기
        이 경우엔 전달 값이 계속해서 연속적으로 들어오므로, on() 으로 계속해서 받는 Logic은 유지하되,
        버튼을 누르면 on()이 계속 호출되어 누적되므로 누적을 제거하는 코드까지 포함해야 한다.
      */
      ipcRenderer.removeAllListeners(IPCChannel.WEB_REQUEST_PROGRESS);
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
      const total_count = result.flat().length;
      console.log(`검색 결과 : ${total_count}개`);

      console.time("배열 준비 시간 : "); // ==============================

      // 중첩 배열 평탄화 및 AGGridVueArticle 형태로 변환
      const items: AGGridVueArticle[] = result.flat().map((item) => ({
        번호: item.gall_num,
        제목: item.gall_tit,
        댓글수: item.reply_num,
        작성자: item.gall_writer,
        조회수: item.gall_count,
        추천: item.gall_recommend,
        작성일: item.gall_date,
      }));

      console.timeEnd("배열 준비 시간 : "); // ==============================

      // 데이터 바인딩 (표에 데이터 반영)
      this.table_rows = items;

      // 버튼 로딩 완료 반영
      this.search_btn.is_loading = false;

      /*
        vuex 데이터에 갤러리 id 반영
        검색이 완료된 후 vuex에 반영해야 유저가 검색 성공 이후에 갤러리 id를 바꿔도
        프로그램이 망가지지 않음 - 링크 열기
      */
      this.vuex_gallery_id = this.gallery_id;

      // 만약에 자동 저장이 켜져있으면서 저장할 내용이 있으면 DB에 글을 저장
      if (this.settings.auto_save.auto_save_result && items.length > 0) {
        const clean_articles = JSON.parse(JSON.stringify(items));

        // 저장할 데이터 형태
        const payload = {
          isManual: 0, // SQLite엔 Boolean 타입이 없기에 반드시 0 = false, 1 = true 로 바꿔서 제공할 것
          meta: {
            search_type: this.select_box.selected_item,
            repeat_cnt: this.repeat_cnt,
            gallery_id: this.gallery_id,
            keyword: this.keyword,
          },
          articles: clean_articles,
        };

        const res = await ipcRenderer.invoke("db-save-search-log", payload);

        if (res.success) {
          console.log("[자동 저장] DB에 글 저장 완료");
        } else {
          console.error("[자동 저장] DB에 글 저장 실패:", res.error);
        }
      }
    },
  },

  computed: {
    /*
      base_folder_location 변수를 참조해 사용하려면
      data() 안에서 바로 사용하면 안된다.
      data 안에 있는 값을 서로 사용하려면 data 객체가 완전히 초기화 되고 나서 사용해야 한다.
      computed 안에서 사용시 data 항목이 모두 초기화된 후에 계산된 값을 얻을 수 있기에 문제 해결이 가능하다.

      또한 return type string 을 명시적으로 지정해줘야 오류가 안난다.

      TypeScript는 Vue의 computed 속성 안에서 this의 타입을 자동으로 추론하지 못할 때가 있습니다.
      특히, Vue의 data 함수 안에서 정의된 속성들을 참조할 때 이런 문제가 발생할 수 있습니다.
      TypeScript는 this가 무엇을 가리키는지 정확히 알 수 있어야 하는데,
      Vue의 컴포넌트 내부에서는 this가 굉장히 유연하게 사용되기 때문에 TypeScript가 정확히 추론하기 어려울 때가 있습니다.
      이런 경우에는 개발자가 명시적으로 타입을 지정해 주어야 합니다.

      by GPT4o : 정확한 내용은 검증이 필요.
    */
    setting_file_location(): string {
      return `${this.base_folder_location}/settings.json`;
    },

    // Vuex 데이터 추가
    vuex_gallery_id: {
      get(): string {
        return this.$store.getters.get_gallery_id;
      },
      set(value: string) {
        this.$store.commit("set_gallery_id", value);
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
/*
  드래그 옵션, 일렉트론의 frame : false 와 조합해야만 유효하며,
  드래그 될 대상에는 웹킷 drag 옵션을 줘야 그것으로 창을 옮길 수 있고
  버튼 같은 상호 작용 요소엔 no-drag를 줘야 클릭이 정상적으로 된다.
*/
.yes-drag {
  -webkit-app-region: drag;
}

.no-drag {
  -webkit-app-region: no-drag;
}

/* 카드 뾰족하게 */
.v-sheet.v-card {
  border-radius: 0px;
}
</style>
