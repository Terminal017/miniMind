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
    set((state) => {
      const newMessages = [...state.messageList]
      const lastMsg = newMessages[newMessages.length - 1]
      if (lastMsg && lastMsg.role === 'model') {
        lastMsg.content += chunk
      }
      return { messageList: newMessages }
    })
  },
  //结束流式传输
  finishStreaming: async (sessionId: number) => {
    const { messageList, isStreaming } = get()
    if (!isStreaming) {
      return
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
