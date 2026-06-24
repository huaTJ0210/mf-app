<template>
  <el-container class="layout-wrapper">
    <!-- 侧边栏 -->
    <el-aside :width="sidebarCollapsed ? '64px' : '210px'" class="layout-aside">
      <Sidebar />
    </el-aside>

    <!-- 右侧主区域 -->
    <el-container class="layout-main">
      <!-- 导航栏 -->
      <el-header class="layout-header">
        <Navbar />
      </el-header>

      <!-- 标签页 -->
      <TagsView />

      <!-- 内容区 -->
      <el-main class="layout-content">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import TagsView from './components/TagsView.vue'
import { useAppStore, useTagsViewStore } from '@mf/shared'

const appStore = useAppStore()
const tagsViewStore = useTagsViewStore()

const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)
const cachedViews = computed(() => tagsViewStore.cachedViews)
</script>

<style scoped>
.layout-wrapper {
  height: 100vh;
  overflow: hidden;
}

.layout-aside {
  background-color: #304156;
  transition: width 0.28s;
  overflow: hidden;
}

.layout-main {
  height: 100vh;
  overflow: hidden;
}

.layout-header {
  height: 50px;
  padding: 0;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.layout-content {
  background-color: #f0f2f5;
  padding: 16px;
  overflow-y: auto;
}

/* 路由切换动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
