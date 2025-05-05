import Vue from "vue";
import Vuex from "vuex";
import { Settings } from "../../types/view";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    gallery_id: "",
    settings: {
      program_entire_settings: {
        max_parallel: 100,
      },
      user_preferences: {
        clear_data_on_search: true,
      },
      auto_save: {
        auto_save_result: true,
        max_auto_save: 10,
      },
    } as Settings,
  },
  getters: {
    get_gallery_id: (state) => state.gallery_id,
    get_settings: (state) => state.settings,
  },
  mutations: {
    set_gallery_id(state, gallery_id) {
      state.gallery_id = gallery_id;
    },
    set_settings(state, settings: Settings) {
      state.settings = settings;
    },
    update_setting(
      state,
      { path, value }: { path: (keyof Settings)[]; value: any }
    ) {
      let obj: any = state.settings;
      for (let i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]];
      }
      obj[path[path.length - 1]] = value;
    },
  },
  actions: {},
  modules: {},
});
