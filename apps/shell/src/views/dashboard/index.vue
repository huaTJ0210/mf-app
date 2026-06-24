<template>
  <div class="dashboard">
    <!-- 欢迎卡片 -->
    <el-card shadow="never" class="welcome-card">
      <div class="welcome-content">
        <el-avatar :size="64" :src="userStore.avatar" />
        <div class="welcome-text">
          <h2>{{ greeting }}，{{ userStore.nickname }}</h2>
          <p>欢迎使用 MF Admin 微前端管理系统</p>
        </div>
      </div>
    </el-card>

    <!-- 数据统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6" v-for="stat in stats" :key="stat.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" :style="{ background: stat.color }">
            <el-icon :size="24" color="#fff">
              <component :is="stat.icon" />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 功能介绍 -->
    <el-row :gutter="16">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="info-card">
          <template #header>
            <span>系统概览</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="架构模式">Module Federation</el-descriptions-item>
            <el-descriptions-item label="主应用">Shell (Vue3 + TS + Element Plus)</el-descriptions-item>
            <el-descriptions-item label="子应用1">system-admin（系统管理）</el-descriptions-item>
            <el-descriptions-item label="子应用2">business（业务管理）</el-descriptions-item>
            <el-descriptions-item label="权限模型">RBAC（角色-菜单-按钮）</el-descriptions-item>
            <el-descriptions-item label="当前用户">{{ userStore.username }}</el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag v-for="role in userStore.roles" :key="role" size="small" class="role-tag">
                {{ role }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="info-card">
          <template #header>
            <span>权限信息</span>
          </template>
          <div class="permission-list">
            <div class="permission-item">
              <span class="perm-label">权限码数量：</span>
              <el-tag type="success">{{ userStore.permissions.length }} 个</el-tag>
            </div>
            <div class="permission-item">
              <span class="perm-label">是否超管：</span>
              <el-tag :type="userStore.isSuperAdmin() ? 'danger' : 'info'">
                {{ userStore.isSuperAdmin() ? '是' : '否' }}
              </el-tag>
            </div>
            <div class="permission-item">
              <span class="perm-label">动态路由数量：</span>
              <el-tag type="warning">{{ permissionStore.routes.length }} 条</el-tag>
            </div>
            <el-divider />
            <div class="permission-codes">
              <span class="perm-label">权限码列表：</span>
              <div class="code-list">
                <el-tag
                  v-for="code in userStore.permissions"
                  :key="code"
                  size="small"
                  class="code-tag"
                >
                  {{ code }}
                </el-tag>
                <span v-if="userStore.permissions.length === 0" class="no-data">暂无权限</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore, usePermissionStore } from '@mf/shared'

const userStore = useUserStore()
const permissionStore = usePermissionStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const stats = [
  { label: '用户总数', value: '1,024', icon: 'User', color: '#409eff' },
  { label: '今日订单', value: '256', icon: 'ShoppingCart', color: '#67c23a' },
  { label: '活跃角色', value: '3', icon: 'UserFilled', color: '#e6a23c' },
  { label: '菜单项', value: '12', icon: 'Menu', color: '#f56c6c' },
]
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.welcome-card {
  border-radius: 8px;
}

.welcome-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome-text h2 {
  margin: 0 0 4px;
  font-size: 22px;
  color: #303133;
}

.welcome-text p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.stat-row {
  margin-bottom: 0;
}

.stat-card {
  border-radius: 8px;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.info-card {
  border-radius: 8px;
}

.role-tag {
  margin-right: 4px;
}

.permission-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.perm-label {
  color: #606266;
  font-weight: 500;
}

.code-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.code-tag {
  font-size: 12px;
}

.no-data {
  color: #c0c4cc;
  font-size: 13px;
}
</style>
