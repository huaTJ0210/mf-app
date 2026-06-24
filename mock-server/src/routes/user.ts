import { Router } from 'express'
import { users } from '../db'

const router = Router()

/** GET /api/system/users — 用户列表（分页） */
router.get('/', (req, res) => {
  const page = Number(req.query.page) || 1
  const pageSize = Number(req.query.pageSize) || 10
  const keyword = (req.query.keyword as string) || ''

  let list = [...users]
  if (keyword) {
    list = list.filter(
      (u) => u.username.includes(keyword) || u.nickname.includes(keyword)
    )
  }

  const total = list.length
  const start = (page - 1) * pageSize
  const pageList = list.slice(start, start + pageSize).map(({ password: _, ...u }) => u)

  res.json({
    code: 0,
    message: 'success',
    data: { list: pageList, total, page, pageSize },
  })
})

/** POST /api/system/users — 新增用户 */
router.post('/', (req, res) => {
  const { username, nickname, email, phone, roleIds, status } = req.body

  if (users.some((u) => u.username === username)) {
    return res.json({ code: 1, message: '用户名已存在', data: null })
  }

  const newUser = {
    id: Math.max(...users.map((u) => u.id)) + 1,
    username,
    password: '123456',
    nickname: nickname || username,
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    email: email || '',
    phone: phone || '',
    status: status ?? 1,
    roleIds: roleIds || [],
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
  }
  users.push(newUser)

  const { password: _, ...userInfo } = newUser
  res.json({ code: 0, message: '新增成功', data: userInfo })
})

/** PUT /api/system/users/:id — 编辑用户 */
router.put('/:id', (req, res) => {
  const id = Number(req.params.id)
  const user = users.find((u) => u.id === id)

  if (!user) {
    return res.json({ code: 1, message: '用户不存在', data: null })
  }

  const { nickname, email, phone, roleIds, status } = req.body
  if (nickname !== undefined) user.nickname = nickname
  if (email !== undefined) user.email = email
  if (phone !== undefined) user.phone = phone
  if (roleIds !== undefined) user.roleIds = roleIds
  if (status !== undefined) user.status = status

  const { password: _, ...userInfo } = user
  res.json({ code: 0, message: '更新成功', data: userInfo })
})

/** DELETE /api/system/users/:id — 删除用户 */
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id)
  const idx = users.findIndex((u) => u.id === id)

  if (idx === -1) {
    return res.json({ code: 1, message: '用户不存在', data: null })
  }

  if (id === 1) {
    return res.json({ code: 1, message: '不允许删除超级管理员', data: null })
  }

  users.splice(idx, 1)
  res.json({ code: 0, message: '删除成功', data: null })
})

export default router
