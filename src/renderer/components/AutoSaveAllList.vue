<template>
  <div>
    <v-dialog v-model="sync_is_open_dialog" width="550px">
      <v-card>
        <v-toolbar density="compact" :color="color" dense>
          <v-toolbar-title>
            <span style="color: white">AutoSaveAllList</span>
          </v-toolbar-title>
        </v-toolbar>
        <div class="pa-4">
          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title class="text-h5">
                자동 저장 목록
              </v-list-item-title>
              <v-list-item-subtitle>저장 목록 확인</v-list-item-subtitle>
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
                <v-list-item-title class="text-h6">
                  갤러리 : {{ article.user_input.gallary_id }}
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
    <auto-save-view
      :is_open_dialog="is_open_save_data"
      :color="color"
      v-on:update:value="is_open_save_data = $event"
      :table_rows="selected_auto_save_data?.article_data"></auto-save-view>
  </div>
</template>

<script lang="ts">
import { Nullable } from "@/types/default";
import { SaveArticleData } from "@/types/view";
import AutoSaveView from "./AutoSaveView.vue";
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
    };
  },
  computed: {
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
    },
  },
  components: {
    AutoSaveView,
  },
});
</script>

<style scoped></style>
