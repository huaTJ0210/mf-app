<template>
  <div class="biz-dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #409eff">
            <el-icon :size="24" color="#fff"><ShoppingCart /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalOrders }}</div>
            <div class="stat-label">订单总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #67c23a">
            <el-icon :size="24" color="#fff"><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ stats.totalRevenue }}</div>
            <div class="stat-label">总收入</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #e6a23c">
            <el-icon :size="24" color="#fff"><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.pendingOrders }}</div>
            <div class="stat-label">待处理订单</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #f56c6c">
            <el-icon :size="24" color="#fff"><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.completedOrders }}</div>
            <div class="stat-label">已完成订单</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势 + 状态分布 -->
    <el-row :gutter="16">
      <el-col :xs="24" :lg="14">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span>近 7 天订单趋势</span>
          </template>
          <div class="trend-chart">
            <div
              v-for="item in stats.trend"
              :key="item.date"
              class="trend-bar-group"
            >
              <div class="trend-bars">
                <div
                  class="trend-bar bar-orders"
                  :style="{ height: barHeight(item.orders, maxOrders) + 'px' }"
                  :title="`订单数: ${item.orders}`"
                ></div>
                <div
                  class="trend-bar bar-revenue"
                  :style="{ height: barHeight(item.revenue, maxRevenue) + 'px' }"
                  :title="`收入: ¥${item.revenue}`"
                ></div>
              </div>
              <div class="trend-date">{{ item.date }}</div>
            </div>
          </div>
          <div class="trend-legend">
            <span class="legend-item">
              <i class="legend-dot" style="background: #409eff"></i> 订单数
            </span>
            <span class="legend-item">
              <i class="legend-dot" style="background: #67c23a"></i> 收入
            </span>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="10">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span>订单状态分布</span>
          </template>
          <div class="status-list">
            <div v-for="item in statusList" :key="item.key" class="status-item">
              <div class="status-info">
                <el-tag :type="item.tagType" size="small">{{ item.label }}</el-tag>
                <span class="status-count">{{ stats.statusStats[item.key] }} 单</span>
              </div>
              <el-progress
                :percentage="statusPercentage(item.key)"
                :color="item.color"
                :show-text="false"
                :stroke-width="8"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getApiClient } from '@mf/shared'

const api = getApiClient()

const stats = ref({
  totalOrders: 0,
  totalRevenue: '0.00',
  pendingOrders: 0,
  completedOrders: 0,
  statusStats: {
    pending: 0,
    paid: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0,
  },
  trend: [] as { date: string; orders: number; revenue: number }[],
})

type StatusKey = keyof typeof stats.value.statusStats
type TagType = 'primary' | 'success' | 'warning' | 'info' | 'danger'

const statusList: { key: StatusKey; label: string; tagType: TagType; color: string }[] = [
  { key: 'pending', label: '待支付', tagType: 'warning', color: '#e6a23c' },
  { key: 'paid', label: '已支付', tagType: 'primary', color: '#409eff' },
  { key: 'shipped', label: '已发货', tagType: 'info', color: '#909399' },
  { key: 'completed', label: '已完成', tagType: 'success', color: '#67c23a' },
  { key: 'cancelled', label: '已取消', tagType: 'danger', color: '#f56c6c' },
]

const maxOrders = computed(() =>
  Math.max(...stats.value.trend.map((t) => t.orders), 1)
)
const maxRevenue = computed(() =>
  Math.max(...stats.value.trend.map((t) => t.revenue), 1)
)

function barHeight(value: number, max: number): number {
  return max > 0 ? (value / max) * 150 : 0
}

function statusPercentage(key: string): number {
  const total = stats.value.totalOrders || 1
  return Math.round((stats.value.statusStats[key as keyof typeof stats.value.statusStats] / total) * 100)
}

async function fetchDashboard() {
  try {
    const data: any = await api.get('/business/dashboard')
    stats.value = data
  } catch (err: any) {
    ElMessage.error(err?.message || '获取看板数据失败')
  }
}

onMounted(() => {
  fetchDashboard()
})
</script>

<style scoped>
.biz-dashboard {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-row {
  margin-bottom: 0;
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

.chart-card {
  border-radius: 8px;
}

/* 趋势柱状图 */
.trend-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200px;
  padding: 10px 0;
}

.trend-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.trend-bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 160px;
}

.trend-bar {
  width: 20px;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  min-height: 2px;
}

.bar-orders {
  background: #409eff;
}

.bar-revenue {
  background: #67c23a;
}

.trend-date {
  font-size: 12px;
  color: #909399;
}

.trend-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

/* 状态分布 */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-count {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}
</style>
