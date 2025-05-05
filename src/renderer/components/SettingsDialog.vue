<!-- eslint-disable prettier/prettier -->
<template>
  <!-- 설정 다이얼로그 컴포넌트 -->
  <v-dialog v-model="dialog" width="500px">
    <v-card>
      <!-- 상단 툴바 - 제목과 닫기 버튼 포함 -->
      <v-toolbar density="compact" :color="color" dense>
        <v-toolbar-title>
          <span style="color: white">Settings</span>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="close" class="no-drag">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <div class="pa-2">
        <!-- 프로그램 전체 동작 설정 섹션 -->
        <v-subheader>프로그램 전체 동작 설정</v-subheader>
        <v-list-item>
          <v-list-item-content class="pb-0">
            <!-- 최대 병렬 처리 횟수 입력 필드 -->
            <v-text-field
              label="최대 병렬 처리 횟수"
              outlined
              clearable
              v-model.number="
                localSettings.program_entire_settings.max_parallel
              "
              @input="updateSetting"
              height="auto"
              type="number"
              hide-spin-buttons></v-text-field>
          </v-list-item-content>
          <!-- 도움말 툴팁 -->
          <v-tooltip right :max-width="404">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                fab
                small
                color="primary"
                class="ma-2 mb-7"
                elevation="0"
                v-bind="attrs"
                v-on="on">
                <v-icon dark>mdi-help-circle</v-icon>
              </v-btn>
            </template>
            <span>
              최대 병렬 처리 횟수를 조정하면 10000개씩 검색하는 디시 검색 속도를
              늘릴 수 있습니다. 예를 들어서 30으로 설정한 경우 10000개의 글을
              동시에 30개 단위로 검색합니다.
              <br />
              즉, 300000개의 글을 한꺼번에 조회하게 되며 이 값을 늘리면 탐색
              속도는 빨라지지만 그만큼 디시에서 일시적 IP차단을 당할 확률이
              높아집니다.
              <u>100 이상 올리는 것은 권장하지 않습니다.</u>
              <br />
              <b>
                기본값 :
                {{ localSettings.program_entire_settings.max_parallel }}
              </b>
            </span>
          </v-tooltip>
        </v-list-item>
        <v-divider></v-divider>

        <!-- 유저 설정 섹션 -->
        <v-subheader>유저 설정</v-subheader>
        <v-list-item>
          <v-list-item-action>
            <!-- 검색 시 기존 결과 초기화 체크박스 -->
            <v-checkbox
              v-model="localSettings.user_preferences.clear_data_on_search"
              @change="updateSetting"></v-checkbox>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>검색 시 기존 검색 결과 초기화</v-list-item-title>
            <v-list-item-subtitle>
              검색하면 기존에 검색한 결과를 지우고 새로 검색합니다
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>

        <!-- 자동 저장 섹션 -->
        <v-subheader>자동 저장</v-subheader>
        <v-list-item>
          <v-list-item-action>
            <!-- 자동 저장 활성화 체크박스 -->
            <v-checkbox
              v-model="localSettings.auto_save.auto_save_result"
              @change="updateSetting"></v-checkbox>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>자동 저장 활성화</v-list-item-title>
            <v-list-item-subtitle>
              최근 검색 기록을 자동 저장합니다
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content class="pb-0">
            <!-- 최대 자동 저장 횟수 입력 필드 -->
            <v-text-field
              label="최대 자동 저장 횟수"
              outlined
              clearable
              v-model.number="localSettings.auto_save.max_auto_save"
              @input="updateSetting"
              height="auto"
              type="number"
              hide-spin-buttons
              :disabled="
                !localSettings.auto_save.auto_save_result
              "></v-text-field>
          </v-list-item-content>
          <!-- 자동 저장 도움말 툴팁 -->
          <v-tooltip right :max-width="404">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                fab
                small
                color="primary"
                class="ma-2 mb-7"
                elevation="0"
                v-bind="attrs"
                v-on="on">
                <v-icon dark>mdi-help-circle</v-icon>
              </v-btn>
            </template>
            <span>
              자동 저장 시 최대 저장 횟수를 조정합니다. 예를 들어서 10으로
              설정한 경우 검색할때마다 최근 10번의 검색 기록을 저장합니다. 아주
              큰 값을 입력하면 무한정 저장하게 할 수 있으나 용량도 무한히 늘어날
              수 있으니 주의해야 합니다.
              <br />
              <b>기본값 : {{ localSettings.auto_save.max_auto_save }}</b>
            </span>
          </v-tooltip>
        </v-list-item>
      </div>
      <!-- 하단 확인 버튼 -->
      <v-card-actions class="justify-center">
        <v-btn variant="text" @click="submit">확인</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
// Vue와 필요한 모듈들을 임포트
import Vue from "vue";
import { mapGetters, mapMutations } from "vuex";
import { Settings } from "../../types/view";

export default Vue.extend({
  // 컴포넌트 이름 정의
  name: "SettingsDialog",

  // 컴포넌트 props 정의
  props: {
    // 다이얼로그 표시 여부를 제어하는 값
    value: {
      type: Boolean,
      required: true,
    },
    // 툴바 색상을 지정하는 값
    color: {
      type: String,
      required: true,
    },
  },

  // 컴포넌트의 로컬 상태 데이터
  data() {
    return {
      dialog: this.value,
      localSettings: {
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
    };
  },

  // Vuex getter를 컴포넌트에 매핑
  computed: {
    ...mapGetters(["get_settings"]),
  },

  // 데이터 변경 감시를 위한 watch 옵션
  watch: {
    value(val) {
      this.dialog = val;
    },
    dialog(val) {
      this.$emit("input", val);
    },
    get_settings: {
      immediate: true,
      handler(val) {
        // 다이얼로그가 열릴 때만 초기값 설정
        if (this.dialog) {
          this.localSettings = JSON.parse(JSON.stringify(val));
        }
      },
    },
  },

  // 컴포넌트 메서드 정의
  methods: {
    // Vuex mutation을 컴포넌트에 매핑
    ...mapMutations(["set_settings"]),

    // 다이얼로그 닫기 메서드
    close() {
      this.dialog = false;
    },

    // 설정 저장 및 다이얼로그 닫기 메서드
    submit() {
      // 설정 저장 후 다이얼로그 닫기
      this.set_settings(this.localSettings);
      this.close();
    },

    // 설정값이 변경될 때마다 호출되는 메서드
    updateSetting() {
      // 현재 설정값을 Vuex store에 반영
      this.set_settings(this.localSettings);
    },
  },
});
</script>

<style scoped>
.no-drag {
  -webkit-app-region: no-drag;
}
</style>
