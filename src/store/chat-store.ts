import { create } from 'zustand'
import { getMessageList, createMessage } from '@/services/messageService'
import { getSessionItem } from '@/services/sessionService'

type MessageType = {
  role: 'user' | 'model'
  content: string
  createAt: Date
}

type ChatStateType = {
  currentSessionId: number | null
  currentLibraryId: number | null
  messageList: MessageType[]
  isStreaming: boolean
  setCurrentSession: (sessionId: number) => void
  appendChunk: (chunk: string) => void
  addMessage: (message: MessageType) => void
  initStreaming: () => void
  finishStreaming: (sessionId: number) => void
}

// RAF 节流变量（模块级别）
let buffer = ''
let rafId: number | null = null

const useChatStore = create<ChatStateType>((set, get) => ({
  currentSessionId: null, //当前会话ID
  currentLibraryId: null, //当前会话关联的知识库ID
  messageList: [], //当前会话的消息列表
  isStreaming: false, //是否正在接收消息流
  //初始化新会话
  setCurrentSession: async (sessionId) => {
    //先重置消息队列
    set({
      currentSessionId: sessionId,
      messageList: [],
    })

    //读取会话信息和消息历史并更新
    const session = await getSessionItem(sessionId)
    const libraryId = session?.libraryId || null
    const historyData = await getMessageList(sessionId)
    const history = historyData.map((msg) => ({
      role: msg.sender,
      content: msg.content,
      createAt: msg.createdAt,
    }))
    set({ currentLibraryId: libraryId, messageList: history })
  },

  //添加新消息到消息列表
  addMessage: async (message) => {
    const { currentSessionId } = useChatStore.getState()
    if (!currentSessionId) {
      return
    }
    //更新本地状态
    set((state) => ({ messageList: [...state.messageList, message] }))
    //异步更新数据库
    createMessage({
      sessionId: currentSessionId,
      sender: message.role,
      content: message.content,
    })
  },

  //初始化流式输出
  initStreaming: () => {
    // 重置 RAF 状态
    buffer = ''
    if (rafId) {
      cancelAnimationFrame(rafId)
    }
    rafId = null

    //添加一个占位信息
    const placeholderMsg: MessageType = {
      role: 'model',
      content: '',
      createAt: new Date(),
    }
    set((state) => ({
      messageList: [...state.messageList, placeholderMsg],
      isStreaming: true,
    }))
  },
  //同步消息状态
  appendChunk: (chunk) => {
    buffer += chunk

    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        set((state) => {
          const messages = state.messageList
          const lastMsg = messages[messages.length - 1]

          if (lastMsg?.role === 'model') {
            return {
              messageList: [
                ...messages.slice(0, -1),
                { ...lastMsg, content: lastMsg.content + buffer },
              ],
            }
          }
          return state
        })
        buffer = ''
        rafId = null
      })
    }
    // set((state) => {
    //   const newMessages = [...state.messageList]
    //   const lastMsg = newMessages[newMessages.length - 1]
    //   if (lastMsg && lastMsg.role === 'model') {
    //     lastMsg.content += chunk
    //   }
    //   return { messageList: newMessages }
    // })
  },
  //结束流式传输
  finishStreaming: async (sessionId: number) => {
    const { messageList, isStreaming } = get()
    if (!isStreaming) {
      return
    }

    // 刷新剩余 buffer
    if (rafId) {
      cancelAnimationFrame(rafId)
    }
    if (buffer) {
      set((state) => {
        const messages = state.messageList
        const lastMsg = messages[messages.length - 1]
        if (lastMsg?.role === 'model') {
          return {
            messageList: [
              ...messages.slice(0, -1),
              { ...lastMsg, content: lastMsg.content + buffer },
            ],
          }
        }
        return state
      })
      buffer = ''
    }

    const lastMsg = messageList[messageList.length - 1]
    //写入数据库
    await createMessage({
      sessionId: sessionId,
      sender: 'model',
      content: lastMsg.content,
    })
    set({ isStreaming: false })
  },
}))

export { useChatStore }
