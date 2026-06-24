<template>
  <!-- 隐藏的菜单项不渲染 -->
  <template v-if="!item.meta?.hidden && item.status !== 0">
    <!-- 有可见子菜单 → 渲染为可展开的子菜单 -->
    <el-sub-menu
      v-if="hasVisibleChildren"
      :index="resolvePath(item.path)"
    >
      <template #title>
        <el-icon v-if="item.meta?.icon">
          <component :is="resolveIcon(item.meta.icon)" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
      <SidebarItem
        v-for="child in visibleChildren"
        :key="child.id"
        :item="child"
        :base-path="resolvePath(item.path)"
      />
    </el-sub-menu>

    <!-- 无子菜单或只有一个子菜单 → 渲染为叶子菜单项 -->
    <el-menu-item
      v-else
      :index="resolvePath(onlyChild ? onlyChild.path : item.path)"
    >
      <el-icon v-if="iconName">
        <component :is="resolveIcon(iconName)" />
      </el-icon>
      <template #title>
        <span>{{ onlyChild ? onlyChild.meta?.title : item.meta?.title }}</span>
      </template>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuItem } from '@mf/shared'

const props = defineProps<{
  item: MenuItem
  basePath: string
}>()

// 可见且启用的子菜单（排除 button 类型）
const visibleChildren = computed(() => {
  if (!props.item.children) return []
  return props.item.children.filter(
    (child) => child.type !== 'button' && child.meta?.hidden !== true && child.status !== 0
  )
})

const hasVisibleChildren = computed(() => visibleChildren.value.length > 1)

// 只有一个子菜单时，直接展示子菜单
const onlyChild = computed(() => {
  if (visibleChildren.value.length === 1) {
    return visibleChildren.value[0]
  }
  return null
})

const iconName = computed(() => {
  if (onlyChild.value) {
    return onlyChild.value.meta?.icon || props.item.meta?.icon
  }
  return props.item.meta?.icon
})

function resolvePath(routePath: string): string {
  if (routePath.startsWith('/')) return routePath
  if (props.basePath === '') return `/${routePath}`
  return `${props.basePath}/${routePath}`
}

/** 将图标字符串名解析为 Element Plus 图标组件名 */
function resolveIcon(icon?: string): string {
  if (!icon) return ''
  return icon
}
</script>
