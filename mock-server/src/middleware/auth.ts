import type { Request, Response, NextFunction } from 'express'
import { tokens, getUserById } from '../db'

/** token 验证中间件 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // 登录接口不需要验证
  if (req.path === '/api/auth/login') {
    next()
    return
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ code: 401, message: '未授权：缺少 token', data: null })
    return
  }

  const token = authHeader.substring(7)
  const userId = tokens.get(token)

  if (!userId) {
    res.status(401).json({ code: 401, message: '未授权：token 无效或已过期', data: null })
    return
  }

  const user = getUserById(userId)
  if (!user) {
    res.status(401).json({ code: 401, message: '未授权：用户不存在', data: null })
    return
  }

  // 将用户信息挂载到 request 上
  ;(req as any).userId = userId
  next()
}
