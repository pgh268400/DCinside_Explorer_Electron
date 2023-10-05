<template>
  <div>
    <v-dialog v-model="sync_is_open_dialog" width="450px">
      <v-card>
        <v-toolbar density="compact" :color="color" dense>
          <v-toolbar-title>
            <span style="color: white">LoadInterface</span>
          </v-toolbar-title>
        </v-toolbar>
        <div class="pa-4">
          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title class="text-h5">저장 목록</v-list-item-title>
              <v-list-item-subtitle>
                어떤 저장 목록을 확인하실 지 선택해주세요
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-btn
                color="primary"
                class="mb-3"
                @click="click_manual_save_item">
                수동 저장 목록
              </v-btn>
              <v-btn color="primary" @click="click_auto_save_item">
                자동 저장 목록
              </v-btn>
            </v-list-item-content>
          </v-list-item>
        </div>
      </v-card>
    </v-dialog>

    <!-- 수동 저장 목록 -->
    <manual-save-all-list
      :is_open_dialog="is_open_manual_data"
      :color="color"
      v-on:update:value="is_open_manual_data = $event"
      :auto_save_data="manual_save_data"></manual-save-all-list>

    <!-- 자동 저장 목록 -->
    <auto-save-all-list
      :is_open_dialog="is_open_save_data"
      :color="color"
      v-on:update:value="is_open_save_data = $event"
      :auto_save_data="auto_save_data"></auto-save-all-list>
  </div>
</template>

<script lang="ts">
import { Nullable } from "@/types/default";
import { SaveArticleData, SaveData } from "@/types/view";
import { defineComponent } from "vue";
import ManualSaveAllList from "./ManualSaveAllList.vue";
import AutoSaveAllList from "./AutoSaveAllList.vue";
export default defineComponent({
  props: {
    is_open_dialog: Boolean,
    color: String,
    auto_save_data: {
      type: Array as () => SaveArticleData[],
    },
    manual_save_data: {
      type: Array as () => SaveArticleData[],
    },
  },
  data() {
    return {
      selected_auto_save_data: null as Nullable<SaveArticleData>,
      is_open_save_data: false,
      is_open_manual_data: false,
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
    // 수동 저장 목록 클릭
    async click_auto_save_item() {
      // await this.read_file();
      this.is_open_save_data = !this.is_open_save_data;
    },

    // 자동 저장 목록 클릭
    async click_manual_save_item() {
      // await this.read_file();
      this.is_open_manual_data = !this.is_open_manual_data;
    },

    // 클릭할때마다 호출해야 하는 파일 읽기 함수
    // async read_file() {
    //   try {
    //     const data = await fs.promises.readFile("dc_data.json", "utf-8");
    //     const parsed_data: SaveData = JSON.parse(data);
    //     if (parsed_data.auto_save && parsed_data.auto_save.length !== 0) {
    //       this.auto_save_data = parsed_data.auto_save;
    //     }
    //     if (parsed_data.manual_save && parsed_data.manual_save.length !== 0) {
    //       this.manual_save_data = parsed_data.manual_save;
    //     }
    //   } catch (error: any) {
    //     console.log(error);
    //   }
    // },
  },
  components: {
    AutoSaveAllList,
    ManualSaveAllList,
  },
});
</script>

<style scoped></style>
