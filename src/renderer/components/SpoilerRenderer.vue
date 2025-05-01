<!-- 디시인사이드 스포일러 태그의 HTML 요소를 그대로 출력하는 컴포넌트 -->
<template>
  <!-- v-html을 사용해 디코딩된 HTML을 그대로 렌더링 -->
  <span v-html="value"></span>
</template>

<script>
export default {
  data() {
    return {
      value: "", // 최종 렌더링할 HTML 문자열
    };
  },

  beforeMount() {
    // Ag-Grid에서 전달받은 HTML Raw 문자열
    const raw = this.params.value;

    // HTML 엔티티를 실제 HTML 태그로 디코딩하기 위해 textarea 엘리먼트를 활용
    const ta = document.createElement("textarea");
    ta.innerHTML = raw;

    // HTML 문자열 그대로 할당
    this.value = ta.value;
  },
};
</script>
