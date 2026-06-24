<template>
  <div class="tags-view-container">
    <el-scrollbar class="tags-scrollbar">
      <div class="tags-wrapper">
        <div
          v-for="tag in tagsViewStore.visitedViews"
          :key="tag.path"
          class="tag-item"
          :class="{ active: isActive(tag) }"
          @click="goTo(tag)"
          @contextmenu.prevent="openContextMenu($event, tag)"
        >
          <span class="tag-dot" v-if="isActive(tag)"></span>
          <span class="tag-title">{{ tag.title }}</span>
          <el-icon
            v-if="!tag.affix"
            class="tag-close"
            @click.stop="closeTag(tag)"
          >
            <Close />
          </el-icon>
        </div>
      </div>
    </el-scrollbar>

    <!-- 右键菜单 -->
    <ul
      v-show="contextMenu.visible"
      class="context-menu"
      :style="{ top: contextMenu.top + 'px', left: contextMenu.left + 'px' }"
    >
      <li @click="refreshSelected">刷新</li>
      <li v-if="!contextMenu.tag?.affix" @click="closeTag(contextMenu.tag!)">关闭</li>
      <li @click="closeOthers">关闭其他</li>
      <li @click="closeAll">关闭所有</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@mf/shared'
import type { TagView } from '@mf/shared'

const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()

const contextMenu = ref({
  visible: false,
  top: 0,
  left: 0,
  tag: null as TagView | null,
})

// 监听路由变化，添加标签
watch(
  () => route.fullPath,
  () => {
    if (route.meta?.noTagsView) return
    addTag()
  }
)

onMounted(() => {
  addTag()
  document.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})

function addTag() {
  const { name, path, meta } = route
  if (!name || !meta?.title) return
  tagsViewStore.addView({
    name: name as string,
    path,
    title: meta.title as string,
    affix: meta.affix as boolean | undefined,
    keepAlive: meta.keepAlive as boolean | undefined,
  })
}

function isActive(tag: TagView): boolean {
  return tag.path === route.path
}

function goTo(tag: TagView) {
  if (!isActive(tag)) {
    router.push(tag.path)
  }
}

function closeTag(tag: TagView) {
  tagsViewStore.delView(tag)
  // 如果关闭的是当前标签，跳转到最后一个标签
  if (isActive(tag)) {
    const views = tagsViewStore.visitedViews
    const last = views[views.length - 1]
    if (last) {
      router.push(last.path)
    } else {
      router.push('/dashboard')
    }
  }
  closeContextMenu()
}

function refreshSelected() {
  closeContextMenu()
  // 重新加载当前路由
  router.replace({ path: '/redirect' + route.fullPath })
}

function closeOthers() {
  if (contextMenu.value.tag) {
    tagsViewStore.delOtherViews(contextMenu.value.tag)
    router.push(contextMenu.value.tag.path)
  }
  closeContextMenu()
}

function closeAll() {
  tagsViewStore.delAllViews()
  const views = tagsViewStore.visitedViews
  if (views.length > 0) {
    router.push(views[0].path)
  } else {
    router.push('/dashboard')
  }
  closeContextMenu()
}

function openContextMenu(e: MouseEvent, tag: TagView) {
  contextMenu.value = {
    visible: true,
    top: e.clientY,
    left: e.clientX,
    tag,
  }
}

function closeContextMenu() {
  contextMenu.value.visible = false
}
</script>

<style scoped>
.tags-view-container {
  height: 34px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.tags-scrollbar {
  height: 34px;
}

.tags-wrapper {
  display: flex;
  align-items: center;
  height: 34px;
  padding: 0 8px;
  gap: 4px;
  white-space: nowrap;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 8px;
  border: 1px solid #e6e6e6;
  border-radius: 3px;
  font-size: 12px;
  color: #495060;
  background: #fff;
  cursor: pointer;
  gap: 4px;
  user-select: none;
}

.tag-item:hover {
  color: #409eff;
}

.tag-item.active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.tag-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  display: inline-block;
}

.tag-close {
  font-size: 12px;
  border-radius: 50%;
}

.tag-close:hover {
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
}

.context-menu {
  position: fixed;
  z-index: 3000;
  list-style: none;
  margin: 0;
  padding: 4px 0;
  background: #fff;
  border-radius: 4px;
  box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.15);
  font-size: 13px;
}

.context-menu li {
  padding: 6px 16px;
  cursor: pointer;
}

.context-menu li:hover {
  background: #f5f7fa;
  color: #409eff;
}
</style>
