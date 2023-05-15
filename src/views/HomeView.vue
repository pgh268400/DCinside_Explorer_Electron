<template>
  <hello-world />
</template>

<script lang="ts">
import Vue from "vue";
import HelloWorld from "../components/HelloWorld.vue";

export default Vue.extend({
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Home",

  components: {
    HelloWorld,
  },
});
</script>
