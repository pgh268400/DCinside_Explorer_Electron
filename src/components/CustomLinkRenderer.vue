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
    gallary_id: {
      get() {
        return this.$store.getters.get_gallary_id;
      },
      set(value) {
        this.$store.commit("set_gallary_id", value);
      },
    },
  },

  methods: {
    url_open() {
      // 링크 클릭시 해당 게시글로 크롬 브라우저 실행해 이동
      // ipc 이용하여 일렉트론 서버와 통신
      ipcRenderer.send("open-link", this.gallary_id, this.value);
    },
  },
};
</script>
