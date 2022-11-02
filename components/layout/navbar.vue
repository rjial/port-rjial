<template>
  <nav class="fixed top-0 flex justify-between mx-auto px-24 py-5 w-full">
    <span class="font-bold">rjial</span>
    <div class="flex space-x-5">
    
      <a :href="nav.navLink" v-for="nav in navItem" :key="navItem.indexOf(nav)">{{
        nav.navTitle
      }}</a>
    </div>
  </nav>
</template>

<script lang="ts">
import Vue from "vue";
import { NavItem } from "@/models/Navbar";
export default Vue.extend({
  data: () => {
    return {
      navItem: [new NavItem("Home", "#"), new NavItem("About", "#")] as Array<NavItem>,
    };
  },
});
</script>