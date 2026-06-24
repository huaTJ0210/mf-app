import { Router } from 'express'
import { menus } from '../db'

const router = Router()

/** GET /api/system/menus — 完整菜单列表（树形） */
router.get('/', (req, res) => {
  res.json({
    code: 0,
    message: 'success',
    data: menus,
  })
})

/** POST /api/system/menus — 新增菜单 */
router.post('/', (req, res) => {
  const { parentId, name, path, component, redirect, sort, type, permission, visible, status, meta } =
    req.body

  const newMenu = {
    id: Math.max(...menus.map((m) => m.id)) + 1,
    parentId: parentId ?? null,
    name,
    path: path || '',
    component: component || '',
    redirect: redirect || undefined,
    sort: sort ?? 0,
    type: type || 'menu',
    permission: permission || undefined,
    visible: visible ?? 1,
    status: status ?? 1,
    meta: meta || { title: name },
  }
  menus.push(newMenu)

  res.json({ code: 0, message: '新增成功', data: newMenu })
})

/** PUT /api/system/menus/:id — 编辑菜单 */
router.put('/:id', (req, res) => {
  const id = Number(req.params.id)
  const menu = menus.find((m) => m.id === id)

  if (!menu) {
    return res.json({ code: 1, message: '菜单不存在', data: null })
  }

  const { parentId, name, path, component, redirect, sort, type, permission, visible, status, meta } =
    req.body
  if (parentId !== undefined) menu.parentId = parentId
  if (name !== undefined) menu.name = name
  if (path !== undefined) menu.path = path
  if (component !== undefined) menu.component = component
  if (redirect !== undefined) menu.redirect = redirect
  if (sort !== undefined) menu.sort = sort
  if (type !== undefined) menu.type = type
  if (permission !== undefined) menu.permission = permission
  if (visible !== undefined) menu.visible = visible
  if (status !== undefined) menu.status = status
  if (meta !== undefined) menu.meta = { ...menu.meta, ...meta }

  res.json({ code: 0, message: '更新成功', data: menu })
})

/** DELETE /api/system/menus/:id — 删除菜单 */
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id)
  const idx = menus.findIndex((m) => m.id === id)

  if (idx === -1) {
    return res.json({ code: 1, message: '菜单不存在', data: null })
  }

  // 检查是否有子菜单
  if (menus.some((m) => m.parentId === id)) {
    return res.json({ code: 1, message: '请先删除子菜单', data: null })
  }

  menus.splice(idx, 1)
  res.json({ code: 0, message: '删除成功', data: null })
})

export default router
