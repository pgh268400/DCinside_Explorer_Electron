import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;

const vueApp = new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");

// 이걸 추가해야 Electron 이 통째로 종료될 때 Vue의 destroy 부분이 제대로 실행됨.
// https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/389
window.addEventListener("beforeunload", () => vueApp.$destroy());
