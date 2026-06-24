<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2 class="login-title">MF Admin</h2>
        <p class="login-subtitle">基于 Module Federation 的微前端管理系统</p>
      </div>

      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-tips">
        <el-divider>测试账号</el-divider>
        <div class="tips-list">
          <div class="tip-item" @click="fillAccount('admin', '123456')">
            <el-tag type="danger" size="small">admin</el-tag>
            <span>超级管理员（全部权限）</span>
          </div>
          <div class="tip-item" @click="fillAccount('editor', '123456')">
            <el-tag type="warning" size="small">editor</el-tag>
            <span>编辑（系统管理权限）</span>
          </div>
          <div class="tip-item" @click="fillAccount('viewer', '123456')">
            <el-tag type="info" size="small">viewer</el-tag>
            <span>访客（仅查看权限）</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore, usePermissionStore } from '@mf/shared'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: '123456',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

function fillAccount(username: string, password: string) {
  loginForm.username = username
  loginForm.password = password
}

async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      // 1. 登录获取 token
      await userStore.login({
        username: loginForm.username,
        password: loginForm.password,
      })

      // 2. 获取用户信息（角色、权限、菜单）
      const userInfo = await userStore.getUserInfo()

      // 3. 生成动态路由
      permissionStore.generateRoutes(userInfo.menus)

      // 4. 将动态路由添加到 router
      const dynamicRoutes = permissionStore.routes
      for (const r of dynamicRoutes) {
        router.addRoute('Root', r)
      }

      ElMessage.success('登录成功')

      // 5. 跳转到目标页面或首页
      const redirect = (route.query.redirect as string) || '/'
      router.replace(redirect)
    } catch (err: any) {
      ElMessage.error(err?.message || '登录失败，请重试')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 28px;
  color: #303133;
  margin: 0 0 8px;
}

.login-subtitle {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.login-form {
  margin-bottom: 10px;
}

.login-btn {
  width: 100%;
}

.login-tips {
  margin-top: 10px;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.tip-item:hover {
  background: #f5f7fa;
}
</style>
