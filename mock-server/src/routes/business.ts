import { Router } from 'express'
import { orders } from '../db'

const router = Router()

/** GET /api/business/dashboard — 看板统计数据 */
router.get('/dashboard', (req, res) => {
  const totalOrders = orders.length
  const totalRevenue = orders
    .filter((o) => o.status === 'completed' || o.status === 'paid')
    .reduce((sum, o) => sum + o.amount, 0)
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const completedOrders = orders.filter((o) => o.status === 'completed').length

  // 按状态统计
  const statusStats = {
    pending: orders.filter((o) => o.status === 'pending').length,
    paid: orders.filter((o) => o.status === 'paid').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  }

  // 最近 7 天趋势（mock 数据）
  const trend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toISOString().substring(5, 10),
      orders: Math.floor(Math.random() * 50) + 10,
      revenue: Math.floor(Math.random() * 5000) + 1000,
    }
  })

  res.json({
    code: 0,
    message: 'success',
    data: {
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      pendingOrders,
      completedOrders,
      statusStats,
      trend,
    },
  })
})

/** GET /api/business/orders — 订单列表（分页） */
router.get('/orders', (req, res) => {
  const page = Number(req.query.page) || 1
  const pageSize = Number(req.query.pageSize) || 10
  const keyword = (req.query.keyword as string) || ''
  const status = req.query.status as string

  let list = [...orders]
  if (keyword) {
    list = list.filter(
      (o) => o.orderNo.includes(keyword) || o.customer.includes(keyword)
    )
  }
  if (status && status !== 'all') {
    list = list.filter((o) => o.status === status)
  }

  const total = list.length
  const start = (page - 1) * pageSize
  const pageList = list.slice(start, start + pageSize)

  res.json({
    code: 0,
    message: 'success',
    data: { list: pageList, total, page, pageSize },
  })
})

/** POST /api/business/orders — 新增订单 */
router.post('/orders', (req, res) => {
  const { customer, amount, status } = req.body

  const newOrder = {
    id: Math.max(...orders.map((o) => o.id)) + 1,
    orderNo: `ORD${Date.now()}`,
    customer,
    amount,
    status: status || 'pending',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
  }
  orders.push(newOrder)

  res.json({ code: 0, message: '新增成功', data: newOrder })
})

/** PUT /api/business/orders/:id — 编辑订单 */
router.put('/orders/:id', (req, res) => {
  const id = Number(req.params.id)
  const order = orders.find((o) => o.id === id)

  if (!order) {
    return res.json({ code: 1, message: '订单不存在', data: null })
  }

  const { customer, amount, status } = req.body
  if (customer !== undefined) order.customer = customer
  if (amount !== undefined) order.amount = amount
  if (status !== undefined) order.status = status

  res.json({ code: 0, message: '更新成功', data: order })
})

/** DELETE /api/business/orders/:id — 删除订单 */
router.delete('/orders/:id', (req, res) => {
  const id = Number(req.params.id)
  const idx = orders.findIndex((o) => o.id === id)

  if (idx === -1) {
    return res.json({ code: 1, message: '订单不存在', data: null })
  }

  orders.splice(idx, 1)
  res.json({ code: 0, message: '删除成功', data: null })
})

export default router
