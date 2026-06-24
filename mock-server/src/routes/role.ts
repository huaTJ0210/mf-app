import { Router } from 'express'
import { roles } from '../db'

const router = Router()

/** GET /api/system/roles — 角色列表 */
router.get('/', (req, res) => {
  res.json({
    code: 0,
    message: 'success',
    data: roles,
  })
})

/** POST /api/system/roles — 新增角色 */
router.post('/', (req, res) => {
  const { name, code, description, menuIds, status } = req.body

  if (roles.some((r) => r.code === code)) {
    return res.json({ code: 1, message: '角色编码已存在', data: null })
  }

  const newRole = {
    id: Math.max(...roles.map((r) => r.id)) + 1,
    name,
    code,
    description: description || '',
    status: status ?? 1,
    menuIds: menuIds || [],
  }
  roles.push(newRole)

  res.json({ code: 0, message: '新增成功', data: newRole })
})

/** PUT /api/system/roles/:id — 编辑角色 */
router.put('/:id', (req, res) => {
  const id = Number(req.params.id)
  const role = roles.find((r) => r.id === id)

  if (!role) {
    return res.json({ code: 1, message: '角色不存在', data: null })
  }

  const { name, description, menuIds, status } = req.body
  if (name !== undefined) role.name = name
  if (description !== undefined) role.description = description
  if (menuIds !== undefined) role.menuIds = menuIds
  if (status !== undefined) role.status = status

  res.json({ code: 0, message: '更新成功', data: role })
})

/** DELETE /api/system/roles/:id — 删除角色 */
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id)
  const idx = roles.findIndex((r) => r.id === id)

  if (idx === -1) {
    return res.json({ code: 1, message: '角色不存在', data: null })
  }

  if (id === 1) {
    return res.json({ code: 1, message: '不允许删除超级管理员角色', data: null })
  }

  roles.splice(idx, 1)
  res.json({ code: 0, message: '删除成功', data: null })
})

export default router
