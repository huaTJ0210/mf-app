<template>
  <router-view />
</template>

<script setup lang="ts">
// 根组件：仅承载 router-view，所有布局在 Layout 中处理
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
}

* {
  box-sizing: border-box;
}
</style>
