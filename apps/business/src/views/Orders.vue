<template>
  <div class="orders-page">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-bar">
      <el-form :inline="true" :model="searchForm" @submit.prevent="handleSearch">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="订单号/客户名"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option label="全部" value="all" />
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
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
          v-permission="'business:order:add'"
          @click="openDialog()"
        >
          <el-icon><Plus /></el-icon> 新增订单
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="orderNo" label="订单号" min-width="160" />
        <el-table-column prop="customer" label="客户" min-width="100" />
        <el-table-column label="金额" min-width="100" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType[row.status]" size="small">
              {{ statusLabel[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="140" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              v-permission="'business:order:edit'"
              @click="openDialog(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
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
      :title="dialog.isEdit ? '编辑订单' : '新增订单'"
      width="480px"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="dialog.form" :rules="formRules" label-width="80px">
        <el-form-item label="客户名" prop="customer">
          <el-input v-model="dialog.form.customer" placeholder="请输入客户名" />
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number
            v-model="dialog.form.amount"
            :min="0"
            :precision="2"
            :step="100"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="dialog.form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
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

// ---- 状态映射 ----
const statusLabel: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
}

const statusTagType: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
  pending: 'warning',
  paid: 'primary',
  shipped: 'info',
  completed: 'success',
  cancelled: 'danger',
}

// ---- 搜索 ----
const searchForm = reactive({
  keyword: '',
  status: 'all' as string,
})

// ---- 表格 ----
const loading = ref(false)
const tableData = ref<any[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

async function fetchData() {
  loading.value = true
  try {
    const res: any = await api.get('/business/orders', {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword,
        status: searchForm.status,
      },
    })
    tableData.value = res.list
    pagination.total = res.total
  } catch (err: any) {
    ElMessage.error(err?.message || '获取订单列表失败')
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
  searchForm.status = 'all'
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
    customer: '',
    amount: 0,
    status: 'pending' as string,
  },
})

const formRules: FormRules = {
  customer: [{ required: true, message: '请输入客户名', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
}

function openDialog(row?: any) {
  if (row) {
    dialog.isEdit = true
    dialog.editId = row.id
    dialog.form = {
      customer: row.customer,
      amount: row.amount,
      status: row.status,
    }
  } else {
    dialog.isEdit = false
    dialog.editId = 0
    dialog.form = {
      customer: '',
      amount: 0,
      status: 'pending',
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
        await api.put(`/business/orders/${dialog.editId}`, dialog.form)
        ElMessage.success('更新成功')
      } else {
        await api.post('/business/orders', dialog.form)
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
    await ElMessageBox.confirm(`确定删除订单「${row.orderNo}」吗？`, '提示', {
      type: 'warning',
    })
    await api.delete(`/business/orders/${row.id}`)
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
.orders-page {
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

.amount {
  font-weight: 600;
  color: #f56c6c;
}
</style>
