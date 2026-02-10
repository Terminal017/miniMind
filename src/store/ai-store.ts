import { create } from 'zustand'
import { wrap, Remote, releaseProxy } from 'comlink'
import type { ModelWorkerAPI, DocWorkerAPI } from '@/types/index'

//useModelLoading类型定义
type ModelLoadingState = {
  isWebGPUSupported: boolean
  loadStatus: 'empty' | 'loading' | 'loaded' | 'error'
  loadProcess: number
  setLoadStatus: (status: 'empty' | 'loading' | 'loaded' | 'error') => void
  setLoadProcess: (process: number) => void
  setIsWebGPUSupported: (supported: boolean) => void
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

//store用于管理模型加载状态
const useModelLoading = create<ModelLoadingState>((set) => ({
  isWebGPUSupported: false, //WebGPU 支持
  loadStatus: 'empty', //模型下载状态
  loadProcess: 0, //模型下载进度
  setLoadStatus: (status) => set({ loadStatus: status }),
  setLoadProcess: (process) => set({ loadProcess: process }),
  setIsWebGPUSupported: (supported) => set({ isWebGPUSupported: supported }),
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

export { useModelLoading, useWorkerManager }
