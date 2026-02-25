import { create } from 'zustand'
import { getMessageList, createMessage } from '@/services/messageService'
import { getSessionItem, updateSession } from '@/services/sessionService'
import { getLibraryItem } from '@/services/libraryService'

type MessageType = {
  role: 'user' | 'model'
  content: string
  createAt: Date
}

//当前session状态
type ChatStateType = {
  currentSessionId: number | null
  currentLibraryId: string | 'none' //更改为string，方便修改
  messageList: MessageType[] //全局消息
  backgroundStreams: { [sessionId: number]: string } //每个会话的流式输出缓存
  isStreaming: boolean
  setCurrentSession: (sessionId: number) => void
  setCurrentLibrary: (libraryId: string | 'none') => void
  appendChunk: (chunk: string, sessionId: number) => void
  addMessage: (message: MessageType) => void
  initStreaming: (sessionId: number) => void
  finishStreaming: (sessionId: number) => void
}

// RAF 节流变量（模块级别）
let buffer = ''
let rafId: number | null = null

const useChatStore = create<ChatStateType>((set, get) => ({
  currentSessionId: null, //当前会话ID
  currentLibraryId: 'none', //当前会话关联的知识库ID
  messageList: [], //当前会话的消息列表
  backgroundStreams: {}, //会话ID到流式输出缓存的映射
  isStreaming: false, //是否正在接收消息流
  //初始化新会话或已有对话
  setCurrentSession: async (sessionId) => {
    //先重置消息队列
    set({
      currentSessionId: sessionId,
      currentLibraryId: 'none',
      messageList: [],
    })

    //读取会话信息和消息历史并更新
    const session = await getSessionItem(sessionId)
    const libraryId = session?.libraryId?.toString() || 'none'
    const historyData = await getMessageList(sessionId)
    const history = historyData.map((msg) => ({
      role: msg.sender,
      content: msg.content,
      createAt: msg.createdAt,
    }))
    set({ currentLibraryId: libraryId, messageList: history })
  },

  //更新知识库
  setCurrentLibrary: async (libraryId: string | 'none') => {
    const session = get().currentSessionId
    if (!session) {
      return
    }
    set({ currentLibraryId: libraryId })
    //更新title为知识库名称
    const lib = (await getLibraryItem(Number(libraryId))) || { name: '新会话' }
    await updateSession(session, {
      title: libraryId === 'none' ? '新会话' : `知识库${lib.name}问答`,
      libraryId: libraryId === 'none' ? null : Number(libraryId),
    })
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
  initStreaming: (sessionId: number) => {
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
      backgroundStreams: { ...state.backgroundStreams, [sessionId]: '' }, //初始化流式输出缓存
    }))
  },
  //同步消息状态
  appendChunk: (chunk, sessionId) => {
    buffer += chunk

    //更新流式输出缓存
    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        const { currentSessionId, messageList } = get()
        set((state) => {
          const newStream = {
            ...state.backgroundStreams,
            [sessionId]: (state.backgroundStreams[sessionId] || '') + buffer, //累加流
          }

          // 如果是当前会话,同步更新 messageList
          if (currentSessionId === sessionId) {
            const lastMsg = messageList[messageList.length - 1]

            // 如果最后一条是 user 消息,追加新的 model 消息
            if (lastMsg?.role === 'user') {
              return {
                backgroundStreams: newStream,
                messageList: [
                  ...messageList,
                  {
                    role: 'model' as const,
                    content: newStream[sessionId],
                    createAt: new Date(),
                  },
                ],
              }
            }

            // 如果最后一条是 model 消息,更新其内容
            if (lastMsg?.role === 'model') {
              const msgs = [...messageList]
              msgs[msgs.length - 1] = {
                ...lastMsg,
                content: newStream[sessionId],
              }
              return {
                backgroundStreams: newStream,
                messageList: msgs,
              }
            }
          }

          //如果不是当前会话,只在后台更新流式输出缓存
          return {
            backgroundStreams: newStream,
          }
        })

        buffer = ''
        rafId = null
      })
    }
  },

  //结束流式传输
  finishStreaming: async (sessionId: number) => {
    const { isStreaming } = get()
    if (!isStreaming) {
      return
    }

    // 刷新剩余 buffer
    if (rafId) {
      cancelAnimationFrame(rafId)
    }
    if (buffer) {
      set((state) => {
        return {
          backgroundStreams: {
            ...state.backgroundStreams,
            [sessionId]: (state.backgroundStreams[sessionId] || '') + buffer,
          },
        }
      })
      buffer = ''
    }

    const lastMsg = {
      role: 'model',
      content: get().backgroundStreams[sessionId] || '',
      createAt: new Date(),
    }
    //写入数据库
    await createMessage({
      sessionId: sessionId,
      sender: 'model',
      content: lastMsg.content,
    })
    set({ isStreaming: false, backgroundStreams: {} })
  },
}))

export { useChatStore }
