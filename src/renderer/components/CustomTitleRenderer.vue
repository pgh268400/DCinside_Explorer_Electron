<!-- 디시인사이드 스포일러 태그의 HTML 요소를 그대로 출력하는 컴포넌트 -->
<template>
  <!-- v-html을 사용해 디코딩된 HTML을 그대로 렌더링 -->
  <!-- 일반적으로 데이터 바인딩시 HTML이 들어가도 HTML 텍스트 그대로 렌더링 되나, 
   v-html을 적용하면 HTML 태그 그대로 렌더링 된다. -->
  <span v-html="value"></span>
</template>

<script lang="ts">
export default {
  data() {
    return {
      value: "", // 최종 렌더링할 HTML 문자열
    };
  },

  beforeMount() {
    /*
      Ag-Grid-Vue에서 전달받은 HTML Raw 문자열
      참고 : ag-grid-vue에서는 Custom Renderer 컴포넌트에 자동으로 params 객체를 주입한다.
      params는 Ag-Grid-vue가 런타임에 동적으로 주입하기에 타입 추론이 어려워서, any로 처리해서 무시한다.
    */
    const raw_html_text: string = (this as any).params.value; // title에 들어오는 html 형태의 텍스트
    this.value = raw_html_text; // value에 반영
  },
};
</script>
