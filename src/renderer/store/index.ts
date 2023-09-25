import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    gallary_id: "",
  },
  getters: {
    get_gallary_id: (state) => state.gallary_id,
  },
  mutations: {
    set_gallary_id(state, gallary_id) {
      state.gallary_id = gallary_id;
    },
  },
  actions: {},
  modules: {},
});
