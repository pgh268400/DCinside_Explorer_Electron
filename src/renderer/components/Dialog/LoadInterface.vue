<template>
  <div>
    <!-- 로드 인터페이스 다이얼로그 -->
    <v-dialog v-model="sync_is_open_dialog" width="500px">
      <v-card>
        <!-- 다이얼로그 상단 툴바 -->
        <v-toolbar density="compact" :color="color" dense>
          <v-toolbar-title>
            <span style="color: white" class="no-drag">Load Interface</span>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <!-- 닫기 버튼 -->
          <v-btn icon @click="sync_is_open_dialog = false" class="no-drag">
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <div class="pa-4">
          <!-- 탭 메뉴 -->
          <v-tabs v-model="active_tab" left>
            <v-tab>자동 저장</v-tab>
            <v-tab>수동 저장</v-tab>
          </v-tabs>

          <!-- 탭 컨텐츠 영역 -->
          <v-tabs-items v-model="active_tab">
            <!-- 자동 저장 탭 -->
            <v-tab-item>
              <v-container class="py-4">
                <!-- 자동 저장 데이터가 없을 때 표시되는 알림 -->
                <v-list-item v-if="auto_save_data.length === 0">
                  <v-list-item-content>
                    <v-alert color="blue" type="info">
                      자동 저장된 데이터가 존재하지 않습니다.
                    </v-alert>
                  </v-list-item-content>
                </v-list-item>

                <!-- 자동 저장된 데이터 목록 -->
                <v-card
                  v-for="(article, index) in auto_save_data"
                  :key="index"
                  shaped
                  elevation="3"
                  class="mb-4"
                  @click="click_auto_save_item(article)"
                  @mousedown.right="mouse_right(article)">
                  <v-list-item>
                    <v-list-item-content>
                      <!-- 갤러리 정보 표시 영역 -->
                      <v-list-item-title
                        class="text-h6"
                        style="
                          display: flex;
                          justify-content: space-between;
                          align-items: center;
                        ">
                        <!-- 갤러리 이름이 없을 때 ID만 표시 -->
                        <span
                          v-if="!article.user_input.gallery_name"
                          class="over_flow show_anime">
                          {{ article.user_input.gallery_id }}
                        </span>
                        <!-- 갤러리 ID가 없을 때 이름만 표시 -->
                        <span
                          v-else-if="!article.user_input.gallery_id"
                          class="over_flow show_anime">
                          {{ article.user_input.gallery_name }}
                        </span>
                        <!-- 갤러리 이름과 ID 모두 표시 -->
                        <span v-else class="over_flow show_anime">
                          <span>{{ article.user_input.gallery_name }}</span>
                          <span class="text-subtitle-1">
                            ({{ article.user_input.gallery_id }})
                          </span>
                        </span>
                        <!-- 삭제 버튼 -->
                        <span>
                          <v-btn
                            id="delete_icon"
                            color="red"
                            icon
                            @click.stop="auto_delete_article(index)">
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </span>
                      </v-list-item-title>
                      <!-- 검색 옵션 정보 -->
                      <v-list-item-subtitle>
                        검색 옵션 : {{ article.user_input.search_type }}
                      </v-list-item-subtitle>
                      <!-- 반복 횟수 정보 -->
                      <v-list-item-subtitle>
                        반복 횟수 : {{ article.user_input.repeat_cnt }}
                      </v-list-item-subtitle>
                      <!-- 검색어 정보 -->
                      <v-list-item-subtitle style="color: black">
                        검색어 : {{ article.user_input.keyword }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-card>
              </v-container>
            </v-tab-item>

            <!-- 수동 저장 탭 -->
            <v-tab-item>
              <v-container class="py-4">
                <!-- 수동 저장 데이터가 없을 때 표시되는 알림 -->
                <v-list-item v-if="manual_save_data.length === 0">
                  <v-list-item-content>
                    <v-alert color="blue" type="info">
                      수동 저장된 데이터가 존재하지 않습니다.
                    </v-alert>
                  </v-list-item-content>
                </v-list-item>

                <!-- 수동 저장된 데이터 목록 -->
                <v-card
                  v-for="(article, index) in manual_save_data"
                  :key="index"
                  shaped
                  elevation="3"
                  class="mb-4"
                  @click="click_manual_save_item(article)"
                  @mousedown.right="mouse_right(article)">
                  <v-list-item>
                    <v-list-item-content>
                      <!-- 갤러리 정보 표시 영역 -->
                      <v-list-item-title
                        class="text-h6"
                        style="
                          display: flex;
                          justify-content: space-between;
                          align-items: center;
                        ">
                        <!-- 갤러리 이름이 없을 때 ID만 표시 -->
                        <span
                          v-if="!article.user_input.gallery_name"
                          class="over_flow show_anime">
                          {{ article.user_input.gallery_id }}
                        </span>
                        <!-- 갤러리 ID가 없을 때 이름만 표시 -->
                        <span
                          v-else-if="!article.user_input.gallery_id"
                          class="over_flow show_anime">
                          {{ article.user_input.gallery_name }}
                        </span>
                        <!-- 갤러리 이름과 ID 모두 표시 -->
                        <span v-else class="over_flow show_anime">
                          <span>{{ article.user_input.gallery_name }}</span>
                          <span class="text-subtitle-1">
                            ({{ article.user_input.gallery_id }})
                          </span>
                        </span>
                        <!-- 삭제 버튼 -->
                        <span>
                          <v-btn
                            id="delete_icon"
                            color="red"
                            icon
                            @click.stop="manual_delete_article(index)">
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </span>
                      </v-list-item-title>
                      <!-- 검색 옵션 정보 -->
                      <v-list-item-subtitle>
                        검색 옵션 : {{ article.user_input.search_type }}
                      </v-list-item-subtitle>
                      <!-- 반복 횟수 정보 -->
                      <v-list-item-subtitle>
                        반복 횟수 : {{ article.user_input.repeat_cnt }}
                      </v-list-item-subtitle>
                      <!-- 검색어 정보 -->
                      <v-list-item-subtitle style="color: black">
                        검색어 : {{ article.user_input.keyword }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-card>
              </v-container>
            </v-tab-item>
          </v-tabs-items>
        </div>
      </v-card>
    </v-dialog>

    <!-- 저장된 데이터 보기 다이얼로그 컴포넌트 -->
    <save-view
      :is_open_dialog="is_open_save_data"
      :color="color"
      v-on:update:value="is_open_save_data = $event"
      :table_rows="selected_save_data?.article_data"></save-view>
  </div>
</template>

<script lang="ts">
// 필요한 타입과 컴포넌트 임포트
import { Nullable } from "@/types/default";
import { SaveArticleData } from "@/types/view";
import SaveView from "./SaveView.vue";
import Vue from "vue";
import { IPCChannel } from "@/types/ipc";
import { ipcRenderer } from "electron";

export default Vue.extend({
  // 컴포넌트 속성 정의
  props: {
    is_open_dialog: Boolean, // 다이얼로그 열림 상태
    color: String, // 다이얼로그 색상
    auto_save_data: {
      type: Array as () => SaveArticleData[],
      default: () => [], // 자동 저장 데이터 배열
    },
    manual_save_data: {
      type: Array as () => SaveArticleData[],
      default: () => [], // 수동 저장 데이터 배열
    },
  },
  // 컴포넌트 데이터 정의
  data() {
    return {
      active_tab: 0, // 현재 활성화된 탭
      selected_save_data: null as Nullable<SaveArticleData>, // 선택된 저장 데이터
      is_open_save_data: false, // 저장 데이터 보기 다이얼로그 상태
      origin_gallery_id: "", // 원래 갤러리 ID
    };
  },
  // 계산된 속성
  computed: {
    // 다이얼로그 동기화 상태
    sync_is_open_dialog: {
      get(): boolean {
        return this.is_open_dialog;
      },
      set(value: boolean) {
        this.$emit("update:value", value);
      },
    },
    // 갤러리 ID 상태 관리
    gallery_id: {
      get(): string {
        return this.$store.getters.get_gallery_id;
      },
      set(value: string) {
        this.$store.commit("set_gallery_id", value);
      },
    },
  },
  // 메서드 정의
  methods: {
    // 자동 저장 항목 클릭 처리
    async click_auto_save_item(article: SaveArticleData) {
      this.selected_save_data = article;
      this.is_open_save_data = true;
      this.origin_gallery_id = this.gallery_id;
      this.gallery_id = article.user_input.gallery_id;
    },

    // 수동 저장 항목 클릭 처리
    async click_manual_save_item(article: SaveArticleData) {
      this.selected_save_data = article;
      this.is_open_save_data = true;
      this.origin_gallery_id = this.gallery_id;
      this.gallery_id = article.user_input.gallery_id;
    },

    // 수동 저장 항목 삭제
    async manual_delete_article(index: number) {
      this.$emit("delete:article", { type: "manual", index });
    },

    // 자동 저장 항목 삭제
    async auto_delete_article(index: number) {
      this.$emit("delete:article", { type: "auto", index });
    },

    // 우클릭 이벤트 처리 (갤러리 ID 복사)
    mouse_right(article: SaveArticleData) {
      const gallery_id = article.user_input.gallery_id;
      navigator.clipboard.writeText(gallery_id);
      this.$toast(`갤러리 ID ${gallery_id}를 복사했습니다.`, {
        position: "bottom-center",
        timeout: 718,
        closeOnClick: true,
        pauseOnFocusLoss: true,
        pauseOnHover: false,
        draggable: true,
        draggablePercent: 0.6,
        showCloseButtonOnHover: true,
        hideProgressBar: true,
        closeButton: "button",
        icon: true,
        rtl: false,
      } as any);
    },
  },
  // 컴포넌트 등록
  components: {
    SaveView,
  },
  // 감시자 정의
  watch: {
    // 저장 데이터 보기 다이얼로그 상태 변경 감시
    is_open_save_data: function (new_val) {
      if (new_val === false) {
        this.gallery_id = this.origin_gallery_id;
      }
    },
    // 자동 저장 데이터 변경 감시
    auto_save_data: async function (new_val: SaveArticleData[]) {
      const id_obj: any = {};
      for (const element of new_val) {
        id_obj[element.user_input.gallery_id] = null;
      }
      const result: Record<string, string> = await ipcRenderer.invoke(
        IPCChannel.Gallery.GET_TEXT_NAME,
        id_obj
      );
      for (const element of this.auto_save_data) {
        if (element.user_input.gallery_id in result) {
          this.$set(
            element.user_input,
            "gallery_name",
            result[element.user_input.gallery_id]
          );
        }
      }
    },
    // 수동 저장 데이터 변경 감시
    manual_save_data: async function (new_val: SaveArticleData[]) {
      const id_obj: any = {};
      for (const element of new_val) {
        id_obj[element.user_input.gallery_id] = null;
      }
      const result: Record<string, string> = await ipcRenderer.invoke(
        IPCChannel.Gallery.GET_TEXT_NAME,
        id_obj
      );
      for (const element of this.manual_save_data) {
        if (element.user_input.gallery_id in result) {
          this.$set(
            element.user_input,
            "gallery_name",
            result[element.user_input.gallery_id]
          );
        }
      }
    },
  },
});
</script>

<style scoped>
/* 텍스트 오버플로우 처리 */
.over_flow {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
