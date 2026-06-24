<template>
  <div class="standalone-app">
    <div class="standalone-header">
      <h3>Business — 独立开发模式</h3>
      <el-tag type="warning" size="small">仅用于子应用独立开发调试</el-tag>
    </div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 独立模式的根组件
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

.standalone-app {
  min-height: 100vh;
  background: #f0f2f5;
}

.standalone-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.standalone-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}
</style>
