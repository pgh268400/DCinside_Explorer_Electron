<template>
  <v-dialog v-model="sync_is_open_dialog" width="550px">
    <v-card>
      <v-toolbar density="compact" :color="color" dense>
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
</template>

<script lang="ts">
import { shell } from "electron";
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    is_open_dialog: Boolean,
    color: String,
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
  methods: {
    open_about_link() {
      shell.openExternal("https://github.com/pgh268400");
    },
  },
});
</script>

<style scoped></style>
