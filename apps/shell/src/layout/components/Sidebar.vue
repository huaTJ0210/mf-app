<template>
  <div class="sidebar-container">
    <!-- Logo -->
    <div class="sidebar-logo">
      <el-icon size="28" color="#409eff"><Platform /></el-icon>
      <span v-show="!collapsed" class="sidebar-title">MF Admin</span>
    </div>

    <!-- 菜单 -->
    <el-scrollbar class="sidebar-scroll">
      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        :collapse-transition="false"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        router
      >
        <SidebarItem
          v-for="menu in menus"
          :key="menu.id"
          :item="menu"
          :base-path="''"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SidebarItem from './SidebarItem.vue'
import { usePermissionStore, useAppStore } from '@mf/shared'
import type { MenuItem } from '@mf/shared'

const route = useRoute()
const permissionStore = usePermissionStore()
const appStore = useAppStore()

const collapsed = computed(() => appStore.sidebarCollapsed)
const menus = computed<MenuItem[]>(() => permissionStore.sidebarMenus)

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route
  // 如果有 activeMenu 配置，优先使用
  if (meta?.activeMenu) {
    return meta.activeMenu as string
  }
  return path
})
</script>

<style scoped>
.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #2b3a4d;
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

.sidebar-scroll {
  flex: 1;
  overflow: hidden;
}

/* 覆盖 el-menu 折叠时的样式 */
.sidebar-scroll :deep(.el-menu) {
  border-right: none;
}
</style>
