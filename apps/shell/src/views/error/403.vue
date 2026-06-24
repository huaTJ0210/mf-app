<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">403</h1>
      <p class="error-message">抱歉，您没有权限访问此页面</p>
      <el-button type="primary" @click="router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.error-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-content {
  text-align: center;
}

.error-code {
  font-size: 120px;
  color: #e6a23c;
  margin: 0;
  line-height: 1;
}

.error-message {
  font-size: 18px;
  color: #909399;
  margin: 20px 0 30px;
}
</style>
