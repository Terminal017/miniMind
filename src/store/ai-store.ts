import { create } from 'zustand'
import { wrap, Remote, releaseProxy } from 'comlink'
import type { ModelWorkerAPI, DocWorkerAPI } from '@/types/index'

//useModelLoading类型定义
type ModelLoadingState = {
  loadStatus: 'empty' | 'loading' | 'loaded' | 'error'
  loadProcess: number
  setLoadStatus: (status: 'empty' | 'loading' | 'loaded' | 'error') => void
  setLoadProcess: (process: number) => void
  resetProcess: () => void
}

// useFileProcessing类型定义
type FileProcessingState = {
  loadStatus: 'empty' | 'processing' | 'completed' | 'error'
  currentFile: number
  totalFiles: number
  setLoadStatus: (
    status: 'empty' | 'processing' | 'completed' | 'error',
  ) => void
  increaseCurrentFile: () => void
  setTotalFiles: (total: number) => void
  resetProcess: () => void
}

//定义worker和通信代理类型
type WorkerInstance<T = any> = {
  worker: Worker
  api: Remote<T>
}

//useWorkerManager类型定义
type WorkerManagerState = {
  modelWorker: WorkerInstance<ModelWorkerAPI> | null
  docWorker: WorkerInstance<DocWorkerAPI> | null
  initModelWorker: () => void
  initDocWorker: () => void
  terminateModelWorker: () => void
  terminateDocWorker: () => void
  cleanupAll: () => void
}

//用于管理向量化模型加载状态
const useEmbedModelLoading = create<ModelLoadingState>((set) => ({
  loadStatus: 'empty', //模型下载状态（预留）
  loadProcess: 0, //模型下载进度
  setLoadStatus: (status) => set({ loadStatus: status }),
  setLoadProcess: (process) => set({ loadProcess: process }),
  resetProcess: () => set({ loadStatus: 'empty', loadProcess: 0 }),
}))

//管理文章处理进度状态
const useFileProcessing = create<FileProcessingState>((set) => ({
  loadStatus: 'empty', //文件处理状态
  currentFile: 0, //当前处理文件
  totalFiles: 0, //总文件数
  setLoadStatus: (status) => set({ loadStatus: status }),
  increaseCurrentFile: () =>
    set((state) => ({
      currentFile: state.currentFile + 1,
    })),
  setTotalFiles: (total) => set({ totalFiles: total }),
  resetProcess: () =>
    set({
      loadStatus: 'empty',
      currentFile: 0,
      totalFiles: 0,
    }),
}))

// 管理全局Web Worker
const useWorkerManager = create<WorkerManagerState>((set, get) => ({
  //Worker 通信代理和实例
  modelWorker: null, //{ worker, api }
  docWorker: null,

  //初始化Worker
  initModelWorker: () => {
    console.log('初始化 Model Worker...')
    if (get().modelWorker) return
    console.log('Web Worker初始化成功（Zustand）')
    const worker = new Worker(
      new URL('../workers/model-worker.ts', import.meta.url),
    )
    const api = wrap<ModelWorkerAPI>(worker)
    set({ modelWorker: { worker, api } })
  },

  initDocWorker: () => {
    console.log('初始化 Doc Worker...')
    if (get().modelWorker) return
    console.log('Web Worker初始化成功（Zustand）')
    const worker = new Worker('/doc-worker-bundle.js', { type: 'module' })
    const api = wrap<DocWorkerAPI>(worker)
    set({ docWorker: { worker, api } })
  },

  //释放Worker
  terminateModelWorker: () => {
    const { modelWorker } = get()
    if (!modelWorker) return

    //释放Comlin代理
    modelWorker.api[releaseProxy]()
    //终止Worker实例
    modelWorker.worker.terminate()
    set({ modelWorker: null })
    console.log('Model Worker已终止')
  },

  terminateDocWorker: () => {
    const { docWorker } = get()
    if (!docWorker) return

    docWorker.api[releaseProxy]()
    docWorker.worker.terminate()
    set({ docWorker: null })
    console.log('Doc Worker已终止')
  },

  // 全局清理
  cleanupAll: () => {
    get().terminateModelWorker()
    get().terminateDocWorker()
  },
}))

export { useEmbedModelLoading, useWorkerManager, useFileProcessing }
