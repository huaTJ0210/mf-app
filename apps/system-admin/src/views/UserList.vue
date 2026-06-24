<template>
  <div class="user-list">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-bar">
      <el-form :inline="true" :model="searchForm" @submit.prevent="handleSearch">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="用户名/昵称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <el-button
          type="primary"
          v-permission="'system:user:add'"
          @click="openDialog()"
        >
          <el-icon><Plus /></el-icon> 新增用户
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="username" label="用户名" min-width="100" />
        <el-table-column prop="nickname" label="昵称" min-width="100" />
        <el-table-column prop="email" label="邮箱" min-width="160" />
        <el-table-column prop="phone" label="手机号" min-width="120" />
        <el-table-column label="角色" min-width="100">
          <template #default="{ row }">
            <el-tag v-for="rid in row.roleIds" :key="rid" size="small" class="mr4">
              {{ roleNameMap[rid] || `角色${rid}` }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              v-permission="'system:user:edit'"
              @click="openDialog(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              v-permission="'system:user:delete'"
              :disabled="row.id === 1"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? '编辑用户' : '新增用户'"
      width="500px"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="dialog.form" :rules="formRules" label-width="80px">
        <el-form-item v-if="!dialog.isEdit" label="用户名" prop="username">
          <el-input v-model="dialog.form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="dialog.form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="dialog.form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="dialog.form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="dialog.form.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
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

// ---- 搜索 ----
const searchForm = reactive({ keyword: '' })

// ---- 表格 ----
const loading = ref(false)
const tableData = ref<any[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

// ---- 角色选项 ----
const roleOptions = ref<any[]>([])
const roleNameMap = ref<Record<number, string>>({})

async function fetchRoles() {
  try {
    const data: any = await api.get('/system/roles')
    roleOptions.value = data
    roleNameMap.value = data.reduce(
      (map: Record<number, string>, r: any) => ({ ...map, [r.id]: r.name }),
      {}
    )
  } catch {
    // 忽略角色加载失败
  }
}

async function fetchData() {
  loading.value = true
  try {
    const res: any = await api.get('/system/users', {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword,
      },
    })
    tableData.value = res.list
    pagination.total = res.total
  } catch (err: any) {
    ElMessage.error(err?.message || '获取用户列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function handleReset() {
  searchForm.keyword = ''
  handleSearch()
}

// ---- 新增/编辑 ----
const formRef = ref<FormInstance>()
const dialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  editId: 0,
  form: {
    username: '',
    nickname: '',
    email: '',
    phone: '',
    roleIds: [] as number[],
    status: 1 as 0 | 1,
  },
})

const formRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
}

function openDialog(row?: any) {
  if (row) {
    dialog.isEdit = true
    dialog.editId = row.id
    dialog.form = {
      username: row.username,
      nickname: row.nickname,
      email: row.email,
      phone: row.phone,
      roleIds: [...row.roleIds],
      status: row.status,
    }
  } else {
    dialog.isEdit = false
    dialog.editId = 0
    dialog.form = {
      username: '',
      nickname: '',
      email: '',
      phone: '',
      roleIds: [],
      status: 1,
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
      if (dialog.isEdit) {
        await api.put(`/system/users/${dialog.editId}`, dialog.form)
        ElMessage.success('更新成功')
      } else {
        await api.post('/system/users', dialog.form)
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
    await ElMessageBox.confirm(`确定删除用户「${row.nickname}」吗？`, '提示', {
      type: 'warning',
    })
    await api.delete(`/system/users/${row.id}`)
    ElMessage.success('删除成功')
    fetchData()
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error(err?.message || '删除失败')
    }
  }
}

onMounted(() => {
  fetchRoles()
  fetchData()
})
</script>

<style scoped>
.user-list {
  padding: 16px;
}

.search-bar {
  margin-bottom: 16px;
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.table-toolbar {
  margin-bottom: 16px;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.mr4 {
  margin-right: 4px;
}
</style>
