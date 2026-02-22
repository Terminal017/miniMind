//会话CRUD

import db from '@/lib/db'

//创建新会话
export async function createSession() {
  const new_session = {
    title: '新会话',
    libraryId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const id = await db.sessions.add(new_session)
  return { ...new_session, id } //返回session对象
}

//获取会话
export async function getSessions() {
  const sessions = await db.sessions.toArray()
  return sessions
}

//删除会话（用户操作提供错误处理提示）
export async function deleteSession(sessionId: number) {
  try {
    await db.sessions.delete(sessionId)
    return { success: true }
  } catch (error) {
    console.error('删除会话失败:', error)
    return { success: false }
  }
}

//更新会话标题或关联知识库
export async function updateSession(
  sessionId: number,
  updates: { title?: string; libraryId?: number | null },
) {
  await db.sessions.update(sessionId, { ...updates, updatedAt: new Date() })
}

//检查会话是否存在
export async function checkSession(sessionId: number) {
  const session = await db.sessions.get(sessionId)
  return !!session
}
