<template>
  <div>
    <v-dialog v-model="sync_is_open_dialog" width="500px">
      <v-card>
        <v-toolbar density="compact" :color="color" dense>
          <v-toolbar-title>
            <span style="color: white">ManualSaveAllList</span>
          </v-toolbar-title>
        </v-toolbar>
        <div class="pa-4">
          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title class="text-h5">
                수동 저장 목록
              </v-list-item-title>
              <v-list-item-subtitle>저장 목록 확인</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item v-if="auto_save_data.length === 0">
            <v-list-item-content>
              <v-alert color="blue" type="info">
                데이터가 존재하지 않습니다.
              </v-alert>
            </v-list-item-content>
          </v-list-item>

          <v-card
            v-for="(article, index) in auto_save_data"
            :key="index"
            shaped
            elevation="3"
            class="mb-5 ml-2 mr-2"
            @click="click_auto_save_item(article)">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title
                  class="text-h6"
                  style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                  ">
                  <span>갤러리 : {{ article.user_input.gallery_id }}</span>
                  <span>
                    <!-- 삭제 아이콘 추가 -->
                    <v-btn color="red" icon @click.stop="delete_article(index)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle>
                  검색 옵션 : {{ article.user_input.search_type }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  반복 횟수 : {{ article.user_input.repeat_cnt }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  검색어 : {{ article.user_input.keyword }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-card>
        </div>
      </v-card>
    </v-dialog>
    <!-- 자동 저장 목록 실제로 보는 다이얼로그 -->
    <save-view
      :is_open_dialog="is_open_save_data"
      :color="color"
      v-on:update:value="is_open_save_data = $event"
      :table_rows="selected_auto_save_data?.article_data"></save-view>
  </div>
</template>

<script lang="ts">
import { Nullable } from "@/types/default";
import { SaveArticleData } from "@/types/view";
import SaveView from "./SaveView.vue";
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    is_open_dialog: Boolean,
    color: String,
    auto_save_data: {
      required: true,
      type: Array as () => SaveArticleData[],
    },
  },
  data() {
    return {
      selected_auto_save_data: null as Nullable<SaveArticleData>,
      is_open_save_data: false,
      origin_gallery_id: "",
    };
  },
  computed: {
    // Vuex 데이터 추가
    gallery_id: {
      get(): string {
        return this.$store.getters.get_gallery_id;
      },
      set(value: string) {
        this.$store.commit("set_gallery_id", value);
      },
    },
    // 부모에서 값을 자식에도 실시간 바인딩 시키려면 computed를 사용해야 한다.
    sync_is_open_dialog: {
      get(): boolean {
        return this.is_open_dialog;
      },
      set(value: boolean) {
        this.$emit("update:value", value);
      },
    },
  },
  methods: {
    click_auto_save_item(article: SaveArticleData) {
      this.selected_auto_save_data = article;
      this.is_open_save_data = !this.is_open_save_data;
      //vuex 데이터에 갤러리 아이디를 반영해줘야 MainTable에서 갤러리 아이디를 제대로 가져올 수 있다.
      // 어짜피 Vuex에서 전체적으로 통합적으로 관리되고 있기 때문에 이렇게 해도 무방하다.
      // 괜히 props 내리려는 뻘짓을 시도 -.-
      this.gallery_id = article.user_input.gallery_id;

      // 원래의 갤러리 아이디를 저장해둔 상태서 바꾼다.
      this.origin_gallery_id = this.gallery_id;
      this.gallery_id = article.user_input.gallery_id;
    },
    delete_article(index: number) {
      // index 번을 삭제합니다 출력
      // console.log(`${index}번을 삭제합니다.`);

      // 삭제 이벤트 상위로 전달
      this.$emit("delete:article", index);
    },
  },
  components: {
    SaveView,
  },
  // watch
  watch: {
    // 다이얼로그가 닫힐 때 갤러리 아이디를 원래대로 돌려놓는다.
    is_open_save_data: function (new_val, old_val) {
      if (new_val === false) {
        this.gallery_id = this.origin_gallery_id;
      }
    },
  },
});
</script>

<style scoped></style>
