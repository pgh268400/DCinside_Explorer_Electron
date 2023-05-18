<!-- eslint-disable prettier/prettier -->
<!-- 백그라운드에서 돌리는 서버에서 실제로 화면 렌더링을 담당하는 클라이언트 부분 -->
<template>
  <v-app>
    <!-- 상단바(앱바) -->
    <div style="user-select: none">
      <v-app-bar
        app
        color="#3B4890"
        id="appbar"
        dark
        @mousedown="start_drag"
        @mousemove="drag"
        @mouseup="end_drag"
        @mouseleave="end_drag"
      >
        <v-app-bar-nav-icon
          @click="isOpenMenu = !isOpenMenu"
        ></v-app-bar-nav-icon>
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
            <v-combobox
              :items="combo_box.items"
              v-model="combo_box.selected_item"
            ></v-combobox>
          </v-col>
          <v-col cols="auto" style="width: 110px">
            <v-text-field label="반복 횟수" v-model="repeat_cnt"></v-text-field>
          </v-col>
          <v-col cols="2">
            <v-text-field label="갤러리 ID" v-model="gallary_id"></v-text-field>
          </v-col>
          <v-col cols="5">
            <v-text-field
              label="검색어"
              v-model="keyword"
              :spellcheck="false"
              @keypress="search_keypress"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-btn
              color="#3B4890"
              dark
              class="mt-2"
              @click="search_btn"
              :loading="isLoading"
            >
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <div v-if="isLoading">
          <v-progress-linear color="primary" :value="progress" :height="25">
            <template v-slot:default="{ value }">
              <strong style="color: white">{{ Math.ceil(value) }}%</strong>
            </template>
          </v-progress-linear>
        </div>
        <!-- <template>
          <v-lazy
            min-height="100"
            :options="{ threshold: 0.25 }"
            :style="{ width: '100%' }"
            transition="fade-transition"
            :value="false"
          >
            <v-data-table
              v-if="data_table.items"
              calculate-widths
              class="items-table-container"
              dense
              disable-filtering
              :headers="data_table.headers"
              :items="data_table.items"
              :mobile-breakpoint="0"
            >
            </v-data-table>
          </v-lazy>
        </template> -->
        <v-data-table
          :footer-props="{
            'items-per-page-text': '페이지 당 보여질 갯수',
            pageText: '{0}-{1} of {2}',
          }"
          :headers="data_table.headers"
          :items="data_table.items"
        >
          <template v-slot:[`item.gall_num`]="{ value }">
            <u>
              <a @click="open_link(gallary_id, value)">
                {{ value }}
              </a>
            </u>
          </template>
          <template slot="no-data"> 데이터가 존재하지 않습니다. </template>
        </v-data-table>
      </v-container>
    </v-main>
    <!-- 다이얼 로그 -->
    <v-dialog v-model="isOpenMenu" width="500px" class="rounded-0">
      <v-card>
        <v-toolbar density="compact" color="#3B4890" dense>
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
                value="100"
                height="auto"
              ></v-text-field>
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
                  v-on="on"
                >
                  <v-icon dark>mdi-help-circle</v-icon>
                </v-btn>
              </template>
              <span
                >최대 병렬 처리 횟수를 조정하면 10000개씩 검색하는 디시 검색
                속도를 늘릴 수 있습니다. 예를 들어서 30으로 설정한 경우
                10000개의 글을 동시에 30개 단위로 검색합니다. <br />즉,
                300000개의 글을 한꺼번에 조회하게 되며 이 값을 늘리면 탐색
                속도는 빨라지지만 그만큼 디시에서 일시적 IP차단을 당할 확률이
                높아집니다. 기본값은 100이며
                <u>100 이상 올리는 것은 권장하지 않습니다.</u></span
              >
            </v-tooltip>
          </v-list-item>

          <v-divider></v-divider>
          <v-subheader>유저 설정</v-subheader>
          <v-list-item>
            <v-list-item-action>
              <v-checkbox></v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title
                >검색 시 기존 검색 결과 초기화</v-list-item-title
              >
              <v-list-item-subtitle
                >검색하면 기존에 검색한 결과를 지우고 새로
                검색합니다</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
        </div>
        <v-card-actions class="justify-center">
          <v-btn variant="text" @click="isOpenMenu = false">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script lang="ts">
import { app, ipcRenderer, remote, shell } from "electron";
import Vue from "vue";
import { Article } from "./types/dcinside";
import { DCWebRequest } from "./types/ipc";
import fs from "fs";

export default Vue.extend({
  name: "App",

  data() {
    return {
      title: "DCInside Explorer",
      combo_box: {
        items: ["제목+내용", "제목", "내용", "글쓴이", "댓글"],
        selected_item: "",
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
        items: [] as Article[],
      },
      isLoading: false,
      data_table_loading: false,
      repeat_cnt: "0",
      gallary_id: "",
      keyword: "",
      progress: 0,
      // ====
      dragging: false,
      offsetX: 0,
      offsetY: 0,
      startX: 0,
      startY: 0,
      // ====
      isOpenMenu: false,
    };
  },
  // 처음 실행시 실행되는 함수
  async mounted() {
    this.combo_box.selected_item = this.combo_box.items[0]; // 첫 번째 아이템으로 기본값 설정

    try {
      const data = await fs.promises.readFile("data.json", "utf-8");
      const parsedData = JSON.parse(data);
      this.repeat_cnt = parsedData.repeat_cnt;
      this.gallary_id = parsedData.gallary_id;
      this.keyword = parsedData.keyword;
      console.log("Data loaded successfully");
    } catch (err) {
      console.error(err);
    }
  },

  // 종료 직전에 실행되는 함수
  async beforeDestroy() {
    // 종료 직전에 프로그램의 입력 데이터를 저장한다.
    const data = {
      // isLoading: this.isLoading,
      repeat_cnt: this.repeat_cnt,
      gallary_id: this.gallary_id,
      keyword: this.keyword,
    };

    try {
      await fs.promises.writeFile("data.json", JSON.stringify(data));
      console.log(data, "Data saved successfully");
    } catch (err) {
      console.error(err);
    }
  },

  methods: {
    search_keypress(e: any) {
      if (e.keyCode === 13) {
        e.preventDefault(); // Ensure it is only this code that runs
        this.search_btn();
        // alert("Enter was pressed was presses");
      }
    },
    start_drag(e: any) {
      if (e.button === 0) {
        this.dragging = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
      }
    },
    drag(e: any) {
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
      const dict: any = {
        "제목+내용": "search_subject_memo",
        제목: "search_subject",
        내용: "search_memo",
        글쓴이: "search_name",
        댓글: "search_comment",
      };
      return dict[selected_items];
    },
    toggle_drawer() {
      // 왼쪽에 위치한 네비게이션 열기/닫기
      console.log("toggle_drawer");
      // console.log(this.combobox.items);
      // this.combobox.selected_item = this.combobox.items[1];
    },
    minimize_window() {
      // 현재 창 최소화
      const window = remote.getCurrentWindow();
      window.minimize();
    },
    close_window() {
      // // 현재 창 종료
      // const window = remote.getCurrentWindow();
      // window.close();
      // app.exit(0);
      ipcRenderer.send("close-me");
    },
    async search_btn() {
      // 여기서 그냥 웹 요청 보내면 CORS가 걸려서 ipc로 백그라운드 node.js 서버에서
      // 웹 요청을 보내고 응답을 받아서 화면에 렌더링하는 방식으로 구현해야 함

      // 검색 버튼 누르면 기존 검색 결과 초기화
      this.data_table.items = [];

      this.isLoading = true;

      // 웹 요청 보내기
      ipcRenderer.send("web-request", {
        id: this.gallary_id,
        repeat_cnt: parseInt(this.repeat_cnt),
        keyword: this.keyword,
        search_type: this.string_to_query(this.combo_box.selected_item),
      } as DCWebRequest);

      console.log({
        id: this.gallary_id,
        repeat_cnt: parseInt(this.repeat_cnt),
        keyword: this.keyword,
        search_type: this.string_to_query(this.combo_box.selected_item),
      });

      // 백그라운드 서버로부터 응답 받기
      ipcRenderer.on("web-request-response", (event, result: Article[][]) => {
        console.log(result.length);
        const items: Article[] = [];

        console.time("배열 삽입 시간 : ");
        for (let article of result) {
          if (article.length > 0) {
            for (let item of article) {
              items.push({
                gall_num: item.gall_num,
                gall_tit: item.gall_tit,
                reply_num: item.reply_num,
                gall_writer: item.gall_writer,
                gall_count: item.gall_count,
                gall_recommend: item.gall_recommend,
                gall_date: item.gall_date,
              });
            }
          }
        }
        console.timeEnd("배열 삽입 시간 : ");

        // 데이터 바인딩
        this.data_table.items = items;
        // console.log(this.data_table.items);

        this.isLoading = false;
      });

      ipcRenderer.on("web-request-progress", (event, progress: number) => {
        this.progress = progress;
      });
    },
  },
});
</script>

<style scoped>
.v-dialog {
  border-radius: 0px;
}

.v-sheet.v-card {
  border-radius: 0px;
}
</style>
