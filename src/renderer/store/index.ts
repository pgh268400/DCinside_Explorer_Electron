import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    gallery_id: "",
  },
  getters: {
    get_gallery_id: (state) => state.gallery_id,
  },
  mutations: {
    set_gallery_id(state, gallery_id) {
      state.gallery_id = gallery_id;
    },
  },
  actions: {},
  modules: {},
});
