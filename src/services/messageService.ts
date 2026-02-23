//消息CRUD

import db from '@/lib/db'

//添加新消息
export async function createMessage({
  sessionId,
  sender,
  content,
}: {
  sessionId: number
  sender: 'user' | 'model'
  content: string
}) {
  //验证会话合法性
  const session = await db.sessions.get(sessionId)
  if (!session) {
    return
  }

  const newMessage = {
    sessionId,
    sender,
    content,
    createdAt: new Date(),
  }
  const id = await db.messages.add(newMessage)
  return { id, ...newMessage }
}

//获取会话消息列表
export async function getMessageList(sessionId: number) {
  return await db.messages
    .where('sessionId')
    .equals(sessionId)
    .sortBy('createdAt')
}

//清理会话消息
export async function clearMessages(sessionId: number) {
  const messages = await db.messages
    .where('sessionId')
    .equals(sessionId)
    .toArray()
  const ids = messages.map((msg) => msg.id)
  await db.messages.bulkDelete(ids)
}
