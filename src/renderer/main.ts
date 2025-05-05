import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "./styles/global.css"; // 전역 스타일 import

import Toast from "vue-toastification";
// Import the CSS or use your own!
import "vue-toastification/dist/index.css";

Vue.config.productionTip = false;

const options = {
  transition: "Vue-Toastification__fade",
};

Vue.use(Toast, options);

const app = new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");

// 이걸 추가해야 Electron 이 통째로 종료될 때 Vue의 destroy 부분이 제대로 실행된다.
// https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/389
window.addEventListener("beforeunload", () => app.$destroy());
