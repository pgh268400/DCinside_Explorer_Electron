<template>
  <v-dialog v-model="sync_is_open_dialog">
    <v-card>
      <v-toolbar density="compact" :color="color" dense>
        <v-toolbar-title>
          <span style="color: white">SaveView</span>
        </v-toolbar-title>
      </v-toolbar>
      <div class="pa-6">
        <main-table
          :rows_data="table_rows"
          :is_hide_save_button="true"></main-table>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { AGGridVueArticle } from "@/types/view";
import { defineComponent } from "vue";
import MainTable from "./MainTable.vue";
export default defineComponent({
  props: {
    is_open_dialog: Boolean,
    color: String,
    table_rows: {
      type: Array as () => AGGridVueArticle[],
    },
  },
  data() {
    return {};
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
  methods: {},
  components: {
    MainTable,
  },
});
</script>
