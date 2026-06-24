<template>
  <div class="role-list">
    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <el-button type="primary" @click="openDialog()">
          <el-icon><Plus /></el-icon> 新增角色
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="name" label="角色名称" min-width="120" />
        <el-table-column prop="code" label="角色编码" min-width="120">
          <template #default="{ row }">
            <el-tag :type="row.code === 'admin' ? 'danger' : 'info'" size="small">
              {{ row.code }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="菜单权限" min-width="200">
          <template #default="{ row }">
            <span>{{ row.menuIds.length }} 个菜单/按钮</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(row)">
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              :disabled="row.id === 1"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? '编辑角色' : '新增角色'"
      width="600px"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="dialog.form" :rules="formRules" label-width="100px">
        <el-form-item v-if="!dialog.isEdit" label="角色名称" prop="name">
          <el-input v-model="dialog.form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item v-else label="角色名称">
          <el-input v-model="dialog.form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item v-if="!dialog.isEdit" label="角色编码" prop="code">
          <el-input v-model="dialog.form.code" placeholder="请输入角色编码（如 editor）" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="dialog.form.description"
            type="textarea"
            :rows="2"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="菜单权限" prop="menuIds">
          <el-tree
            ref="treeRef"
            :data="menuTreeData"
            :props="{ label: 'title', children: 'children' }"
            show-checkbox
            node-key="id"
            default-expand-all
            @check="handleTreeCheck"
          />
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

async function fetchData() {
  loading.value = true
  try {
    const data: any = await api.get('/system/roles')
    tableData.value = data
  } catch (err: any) {
    ElMessage.error(err?.message || '获取角色列表失败')
  } finally {
    loading.value = false
  }
}

// ---- 菜单树数据 ----
const menuTreeData = ref<any[]>([])
const treeRef = ref()

async function fetchMenus() {
  try {
    const data: any = await api.get('/system/menus')
    // 转为树形结构
    menuTreeData.value = buildTree(data)
  } catch {
    // 忽略
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
  // 清理空 children
  function clean(nodes: any[]) {
    for (const n of nodes) {
      if (n.children.length === 0) delete n.children
      else clean(n.children)
    }
  }
  clean(tree)
  return tree
}

// ---- 新增/编辑 ----
const formRef = ref<FormInstance>()
const dialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  editId: 0,
  form: {
    name: '',
    code: '',
    description: '',
    menuIds: [] as number[],
    status: 1 as 0 | 1,
  },
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
}

function openDialog(row?: any) {
  if (row) {
    dialog.isEdit = true
    dialog.editId = row.id
    dialog.form = {
      name: row.name,
      code: row.code,
      description: row.description,
      menuIds: [...row.menuIds],
      status: row.status,
    }
    // 延迟设置选中节点
    setTimeout(() => {
      treeRef.value?.setCheckedKeys(row.menuIds)
    }, 100)
  } else {
    dialog.isEdit = false
    dialog.editId = 0
    dialog.form = {
      name: '',
      code: '',
      description: '',
      menuIds: [],
      status: 1,
    }
    setTimeout(() => {
      treeRef.value?.setCheckedKeys([])
    }, 100)
  }
  dialog.visible = true
}

function resetForm() {
  formRef.value?.resetFields()
}

function handleTreeCheck() {
  const checked = treeRef.value?.getCheckedKeys() || []
  const halfChecked = treeRef.value?.getHalfCheckedKeys() || []
  dialog.form.menuIds = [...checked, ...halfChecked]
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    dialog.submitting = true
    try {
      if (dialog.isEdit) {
        await api.put(`/system/roles/${dialog.editId}`, dialog.form)
        ElMessage.success('更新成功')
      } else {
        await api.post('/system/roles', dialog.form)
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
    await ElMessageBox.confirm(`确定删除角色「${row.name}」吗？`, '提示', {
      type: 'warning',
    })
    await api.delete(`/system/roles/${row.id}`)
    ElMessage.success('删除成功')
    fetchData()
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error(err?.message || '删除失败')
    }
  }
}

onMounted(() => {
  fetchMenus()
  fetchData()
})
</script>

<style scoped>
.role-list {
  padding: 16px;
}

.table-card {
  border-radius: 8px;
}

.table-toolbar {
  margin-bottom: 16px;
}
</style>
