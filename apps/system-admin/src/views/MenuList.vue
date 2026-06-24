<template>
  <div class="menu-list">
    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <el-button type="primary" @click="openDialog()">
          <el-icon><Plus /></el-icon> 新增菜单
        </el-button>
        <el-button @click="toggleExpand">
          <el-icon><Sort /></el-icon> {{ isExpandAll ? '折叠全部' : '展开全部' }}
        </el-button>
      </div>

      <el-table
        v-if="tableData.length > 0"
        :data="tableData"
        v-loading="loading"
        row-key="id"
        border
        stripe
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children' }"
      >
        <el-table-column prop="meta.title" label="菜单名称" min-width="180" />
        <el-table-column label="图标" width="60" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.meta?.icon" size="16">
              <component :is="row.meta.icon" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="140" />
        <el-table-column prop="component" label="组件" min-width="180">
          <template #default="{ row }">
            <el-tag v-if="row.component" size="small" type="info">{{ row.component }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTagMap[row.type]" size="small">
              {{ typeLabelMap[row.type] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="permission" label="权限标识" min-width="160">
          <template #default="{ row }">
            <span v-if="row.permission">{{ row.permission }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(undefined, row.id)">
              新增子项
            </el-button>
            <el-button type="primary" link size="small" @click="openDialog(row)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? '编辑菜单' : '新增菜单'"
      width="600px"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="dialog.form" :rules="formRules" label-width="100px">
        <el-form-item label="上级菜单" prop="parentId">
          <el-tree-select
            v-model="dialog.form.parentId"
            :data="parentMenuOptions"
            :props="{ label: 'title', children: 'children' }"
            check-strictly
            placeholder="请选择上级菜单（顶级菜单留空）"
            clearable
            node-key="id"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="dialog.form.type">
            <el-radio value="directory">目录</el-radio>
            <el-radio value="menu">菜单</el-radio>
            <el-radio value="button">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="dialog.form.name" placeholder="路由名称（如 SystemUser）" />
        </el-form-item>
        <el-form-item label="显示名称" prop="meta.title">
          <el-input v-model="dialog.form.meta.title" placeholder="侧边栏显示的名称" />
        </el-form-item>
        <el-form-item v-if="dialog.form.type !== 'button'" label="路由路径" prop="path">
          <el-input v-model="dialog.form.path" placeholder="如 user 或 /system" />
        </el-form-item>
        <el-form-item v-if="dialog.form.type !== 'button'" label="组件路径" prop="component">
          <el-input
            v-model="dialog.form.component"
            placeholder="如 Layout / shell/Dashboard / system-admin/UserList"
          />
        </el-form-item>
        <el-form-item v-if="dialog.form.type === 'directory'" label="重定向" prop="redirect">
          <el-input v-model="dialog.form.redirect" placeholder="如 /system/user" />
        </el-form-item>
        <el-form-item label="权限标识" prop="permission">
          <el-input v-model="dialog.form.permission" placeholder="如 system:user:list" />
        </el-form-item>
        <el-form-item v-if="dialog.form.type !== 'button'" label="图标" prop="meta.icon">
          <el-input v-model="dialog.form.meta.icon" placeholder="Element Plus 图标名（如 User）" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="dialog.form.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="dialog.form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { getApiClient } from '@mf/shared'

const api = getApiClient()

const loading = ref(false)
const tableData = ref<any[]>([])
const isExpandAll = ref(true)

const typeLabelMap: Record<string, string> = {
  directory: '目录',
  menu: '菜单',
  button: '按钮',
}

const typeTagMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
  directory: 'primary',
  menu: 'success',
  button: 'warning',
}

async function fetchData() {
  loading.value = true
  try {
    const data: any = await api.get('/system/menus')
    tableData.value = buildTree(data)
  } catch (err: any) {
    ElMessage.error(err?.message || '获取菜单列表失败')
  } finally {
    loading.value = false
  }
}

function buildTree(list: any[]): any[] {
  const map = new Map<number, any>()
  const tree: any[] = []
  for (const item of list) {
    map.set(item.id, { ...item, title: item.meta?.title || item.name, children: [] })
  }
  for (const item of list) {
    const node = map.get(item.id)!
    if (item.parentId === null || item.parentId === 0) {
      tree.push(node)
    } else {
      const parent = map.get(item.parentId)
      if (parent) parent.children.push(node)
      else tree.push(node)
    }
  }
  function sortAndClean(nodes: any[]) {
    nodes.sort((a, b) => (a.sort || 0) - (b.sort || 0))
    for (const n of nodes) {
      if (n.children.length === 0) delete n.children
      else sortAndClean(n.children)
    }
  }
  sortAndClean(tree)
  return tree
}

function toggleExpand() {
  isExpandAll.value = !isExpandAll.value
  // 刷新表格以应用展开/折叠
  const data = [...tableData.value]
  tableData.value = []
  setTimeout(() => {
    tableData.value = data
  }, 0)
}

// ---- 新增/编辑 ----
const formRef = ref<FormInstance>()
const parentMenuOptions = ref<any[]>([])
const dialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  editId: 0,
  form: {
    parentId: null as number | null,
    name: '',
    path: '',
    component: '',
    redirect: '',
    sort: 0,
    type: 'menu' as 'directory' | 'menu' | 'button',
    permission: '',
    visible: 1,
    status: 1 as 0 | 1,
    meta: {
      title: '',
      icon: '',
    },
  },
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  'meta.title': [{ required: true, message: '请输入显示名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
}

function openDialog(row?: any, parentId?: number) {
  // 准备父菜单选项
  parentMenuOptions.value = [
    { id: 0, title: '顶级菜单', children: tableData.value },
  ]

  if (row) {
    dialog.isEdit = true
    dialog.editId = row.id
    dialog.form = {
      parentId: row.parentId,
      name: row.name,
      path: row.path,
      component: row.component,
      redirect: row.redirect || '',
      sort: row.sort,
      type: row.type,
      permission: row.permission || '',
      visible: row.visible,
      status: row.status,
      meta: {
        title: row.meta?.title || '',
        icon: row.meta?.icon || '',
      },
    }
  } else {
    dialog.isEdit = false
    dialog.editId = 0
    dialog.form = {
      parentId: parentId ?? null,
      name: '',
      path: '',
      component: '',
      redirect: '',
      sort: 0,
      type: 'menu',
      permission: '',
      visible: 1,
      status: 1,
      meta: {
        title: '',
        icon: '',
      },
    }
  }
  dialog.visible = true
}

function resetForm() {
  formRef.value?.resetFields()
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    dialog.submitting = true
    try {
      const payload = { ...dialog.form }
      if (dialog.isEdit) {
        await api.put(`/system/menus/${dialog.editId}`, payload)
        ElMessage.success('更新成功')
      } else {
        await api.post('/system/menus', payload)
        ElMessage.success('新增成功')
      }
      dialog.visible = false
      fetchData()
    } catch (err: any) {
      ElMessage.error(err?.message || '操作失败')
    } finally {
      dialog.submitting = false
    }
  })
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(`确定删除菜单「${row.meta?.title || row.name}」吗？`, '提示', {
      type: 'warning',
    })
    await api.delete(`/system/menus/${row.id}`)
    ElMessage.success('删除成功')
    fetchData()
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error(err?.message || '删除失败')
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.menu-list {
  padding: 16px;
}

.table-card {
  border-radius: 8px;
}

.table-toolbar {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}
</style>
