<!-- 디시인사이드 스포일러 태그의 HTML 요소를 그대로 출력하는 컴포넌트 -->
<template>
  <!-- <div class="title-container" ref="container">
    <span class="title-text" ref="text" v-html="value"></span>
  </div> -->
  <span v-html="value"></span>
</template>

<script>
export default {
  data() {
    return {
      value: "",
      // is_overflow: false,
    };
  },
  mounted() {
    // this.$nextTick(() => {
    //   this.check_overflow();
    // });
  },
  methods: {
    check_overflow() {
      const container = this.$refs.container;
      const text = this.$refs.text;

      if (container && text) {
        this.is_overflow = text.scrollWidth > container.clientWidth;
        if (this.is_overflow) {
          container.classList.add("overflowing");
        }
      }
    },
  },
  beforeMount() {
    /*
      Ag-Grid-Vue에서 전달받은 HTML Raw 문자열
      참고 : ag-grid-vue에서는 Custom Renderer 컴포넌트에 자동으로 params 객체를 주입한다.
      params는 Ag-Grid-vue가 런타임에 동적으로 주입하기에 타입 추론이 어려워서 여기선 ts를 적용하지 않는다.
    */
    const raw_html_text = this.params.value;
    this.value = raw_html_text;
  },
};
</script>

<style scoped>
/* .title-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.title-text {
  display: inline-block;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;
}

.title-container.overflowing:hover .title-text {
  text-overflow: clip;
  overflow: visible;
  animation: scrollTitle 10s linear infinite;
  display: inline-block;
  position: relative;
} */

/* 오버플로우가 없는 경우에는 애니메이션 제거 */
/* .title-container:not(.overflowing) .title-text {
  animation: none !important;
} */
</style>
