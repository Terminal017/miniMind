import { create } from 'zustand'

type MessageType = {
  role: 'user' | 'model'
  content: string
}

type ChatStateType = {
  currentSessionId: number | null
  currentLibraryId: number | null
  messageList: MessageType[]
  isStreaming: boolean
  setCurrentSession: (sessionId: number, libraryId: number) => void
  setMessageList: (messages: MessageType[]) => void
  addMessage: (message: MessageType) => void
  setStreaming: (streaming: boolean) => void
}

const useChatStore = create<ChatStateType>((set) => ({
  currentSessionId: null, //当前会话ID
  currentLibraryId: null, //当前会话关联的知识库ID
  messageList: [], //当前会话的消息列表
  isStreaming: false, //是否正在接收消息流
  //更新当前会话ID和关联的知识库ID
  setCurrentSession: (sessionId, libraryId) =>
    set({
      currentSessionId: sessionId,
      currentLibraryId: libraryId,
      messageList: [],
    }),

  //添加新消息到消息列表
  addMessage: (message) =>
    set((state) => ({ messageList: [...state.messageList, message] })),

  //同步消息状态
  setMessageList: (messages) => set({ messageList: messages }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
}))
