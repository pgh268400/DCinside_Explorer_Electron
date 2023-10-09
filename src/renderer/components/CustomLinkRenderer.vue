<!-- 검색 후 번호에 링크를 달기 위해 사용하는 ag-grid-vue를 위한 특수 컴포넌트 -->

<template>
  <a href="#" @click="url_open">{{ value }}</a>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
  data() {
    return {
      number: "",
    };
  },
  beforeMount() {
    this.value = this.params.value;
  },

  computed: {
    gallery_id: {
      get() {
        return this.$store.getters.get_gallery_id;
      },
      set(value) {
        this.$store.commit("set_gallery_id", value);
      },
    },
  },

  methods: {
    url_open() {
      // 링크 클릭시 해당 게시글로 크롬 브라우저 실행해 이동
      // ipc 이용하여 일렉트론 서버와 통신
      ipcRenderer.send("open-link", this.gallery_id, this.value);
    },
  },
};
</script>
