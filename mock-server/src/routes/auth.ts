import { Router } from 'express'
import { users, tokens } from '../db'

const router = Router()

/** POST /api/auth/login — 登录 */
router.post('/login', (req, res) => {
  const { username, password } = req.body

  const user = users.find((u) => u.username === username)
  if (!user || user.password !== password) {
    return res.json({ code: 1, message: '用户名或密码错误', data: null })
  }

  if (user.status === 0) {
    return res.json({ code: 1, message: '账号已被禁用', data: null })
  }

  const token = `mock-token-${user.id}-${Date.now()}`
  tokens.set(token, user.id)

  return res.json({
    code: 0,
    message: '登录成功',
    data: { token, tokenType: 'Bearer', expiresIn: 7200 },
  })
})

/** POST /api/auth/logout — 登出 */
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization
  if (authHeader) {
    const token = authHeader.substring(7)
    tokens.delete(token)
  }
  return res.json({ code: 0, message: '登出成功', data: null })
})

export default router
