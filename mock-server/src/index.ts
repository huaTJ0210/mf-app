import express from 'express'
import cors from 'cors'
import { authMiddleware } from './middleware/auth'
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import roleRoutes from './routes/role'
import menuRoutes from './routes/menu'
import businessRoutes from './routes/business'
import { users, getUserMenus, getUserPermissions, getUserRoleCodes } from './db'

const app = express()
const PORT = 3000

// ---- 中间件 ----
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ---- 请求日志 ----
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// ---- 认证路由（登录不需要 token） ----
app.use('/api/auth', authRoutes)

// ---- 用户信息路由（需要 token） ----
app.get('/api/user/info', authMiddleware, (req, res) => {
  const userId = (req as any).userId as number
  const user = users.find((u) => u.id === userId)
  if (!user) {
    return res.json({ code: 1, message: '用户不存在', data: null })
  }

  const roles = getUserRoleCodes(userId)
  const permissions = getUserPermissions(userId)
  const menus = getUserMenus(userId)
  const { password: _, ...userInfo } = user

  res.json({
    code: 0,
    message: 'success',
    data: { user: userInfo, roles, permissions, menus },
  })
})

// ---- 系统管理路由（需要 token） ----
app.use('/api/system/users', authMiddleware, userRoutes)
app.use('/api/system/roles', authMiddleware, roleRoutes)
app.use('/api/system/menus', authMiddleware, menuRoutes)

// ---- 业务路由（需要 token） ----
app.use('/api/business', authMiddleware, businessRoutes)

// ---- 健康检查 ----
app.get('/api/health', (_req, res) => {
  res.json({ code: 0, message: 'ok', data: { status: 'running', port: PORT } })
})

// ---- 404 ----
app.use((_req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在', data: null })
})

// ---- 启动 ----
app.listen(PORT, () => {
  console.log('========================================')
  console.log(`  Mock Server running at http://localhost:${PORT}`)
  console.log('========================================')
  console.log('  测试账号:')
  console.log('    admin / 123456  (超级管理员 - 全部权限)')
  console.log('    editor / 123456 (业务编辑员 - 仅业务模块)')
  console.log('    viewer / 123456 (访客 - 仅首页)')
  console.log('========================================')
})
