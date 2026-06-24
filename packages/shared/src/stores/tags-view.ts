import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TagView } from '../types'

export const useTagsViewStore = defineStore('tagsView', () => {
  const visitedViews = ref<TagView[]>([])
  const cachedViews = ref<string[]>([])

  function addView(view: TagView): void {
    // 避免重复添加
    if (visitedViews.value.some((v) => v.path === view.path)) return
    visitedViews.value.push(view)
    if (view.keepAlive && !cachedViews.value.includes(view.name)) {
      cachedViews.value.push(view.name)
    }
  }

  function delView(view: TagView): void {
    const idx = visitedViews.value.findIndex((v) => v.path === view.path)
    if (idx > -1) {
      visitedViews.value.splice(idx, 1)
    }
    const cacheIdx = cachedViews.value.indexOf(view.name)
    if (cacheIdx > -1) {
      cachedViews.value.splice(cacheIdx, 1)
    }
  }

  function delOtherViews(view: TagView): void {
    visitedViews.value = visitedViews.value.filter(
      (v) => v.affix || v.path === view.path
    )
    cachedViews.value = cachedViews.value.filter((name) => name === view.name)
  }

  function delAllViews(): void {
    visitedViews.value = visitedViews.value.filter((v) => v.affix)
    cachedViews.value = []
  }

  return {
    visitedViews,
    cachedViews,
    addView,
    delView,
    delOtherViews,
    delAllViews,
  }
})
