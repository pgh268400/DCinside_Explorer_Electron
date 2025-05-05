<!-- eslint-disable prettier/prettier -->
<template>
  <v-navigation-drawer
    :value="isOpen"
    @input="$emit('update:is_open', $event)"
    absolute
    temporary>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="text-h6 font-weight-bold">
          디시인사이드 글 검색기
        </v-list-item-title>
        <v-list-item-subtitle>written by pgh268400</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-divider></v-divider>
    <v-list dense nav>
      <v-list-item
        v-for="item in items"
        :key="item.title"
        link
        @click="onItemClick(item.action)">
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title class="font-weight-regular">
            {{ item.title }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from "vue";

enum DrawerAction {
  Settings = "settings",
  Load = "load",
  About = "about",
}

export default Vue.extend({
  name: "NavigationDrawer",
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    items: {
      type: Array as () => Array<{
        title: string;
        icon: string;
        action: string;
      }>,
      required: true,
    },
  },
  methods: {
    onItemClick(action: string) {
      this.$emit("item-click", action as DrawerAction);
    },
  },
});
</script>
