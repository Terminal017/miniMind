// 大语言模型 (LLM) 加载、推理、Prompt 拼接、流式输出

import { expose } from 'comlink'
import type { ModelWorkerAPI } from '@/types/index'
import {
  pipeline,
  env,
  TextGenerationPipeline,
  TextStreamer,
} from '@huggingface/transformers'

//允许加载本地模型
env.allowLocalModels = false
//允许使用Cache Storage
env.useBrowserCache = true

// env.remoteHost = 'https://hf-mirror.com' //镜像网站
env.remoteHost = 'https://model.startrails.site/' //从R2中下载模型
env.remotePathTemplate = '{model}/'

//让浏览器从本地下载依赖文件而非从CDN
console.log('设置ONNX WASM路径为 /wasm/', env.backends.onnx)
const newpath = new URL('/wasm/', self.location.origin).toString()
console.log('新ONNX WASM路径:', newpath)
env.backends.onnx.wasm!.wasmPaths = newpath

//定义生成式语言模型
let GLModel: TextGenerationPipeline | null = null
//Promise锁
let GLModelLock: Promise<void> | null = null

const api: ModelWorkerAPI = {
  //向量化模型加载
  async loadGLModel(onProgress: (data: { progress: number }) => void) {
    if (GLModelLock) {
      await GLModelLock
      return
    }
    if (GLModel) {
      console.log('模型已存在', GLModel)
      return
    }
    GLModelLock = (async () => {
      try {
        console.log('开始加载向量模型 (尝试使用 WebGPU)...')

        //@ts-ignore
        GLModel = await pipeline(
          'text-generation',
          // 'onnx-community/Qwen2.5-0.5B-Instruct', //0.5B模型
          // 'onnx-community/LFM2-700M-ONNX', //更倾向于续写的模型，效果更好
          'LFM2-700M-ONNX',
          {
            // 指定使用 WebGPU 加速。
            device: 'webgpu',
            dtype: 'q4', //量化，每个参数 4bit，1B约500MB

            // 进度回调：Transformers.js 会密集地触发这个回调，报告下载进度
            // progressData 格式: { status: 'downloading', name: 'model.onnx', progress: 54.3 }
            progress_callback: (progressData: any) => {
              //下载阶段更新进度，如果是读取缓存则不更新

              if (progressData.status === 'progress') {
                onProgress({ progress: progressData.progress || 0 })
              }
            },
          },
        )

        console.log('WebGPU 模型加载完毕')
      } catch (error) {
        console.warn('WebGPU 初始化失败，正在降级到 WASM (CPU) 模式...', error)

        // 降级方案：如果用户的浏览器不支持 WebGPU，回退到 WASM
        GLModel = await pipeline(
          'text-generation',
          // 'onnx-community/LFM2-700M-ONNX',
          // 'onnx-community/Qwen2.5-0.5B-Instruct',
          'LFM2-700M-ONNX',
          {
            device: 'wasm',
            dtype: 'q4',
            progress_callback: (progressData: any) => {
              onProgress({ progress: progressData.progress || 0 })
            },
          },
        )
        console.log('WASM (CPU) 向量模型加载成功！')
      } finally {
        GLModelLock = null
      }
    })()
    return GLModelLock
  },

  async generateStreaming(prompt: string, onToken: (token: string) => void) {
    if (!GLModel) {
      throw new Error('模型尚未初始化')
    }

    //配置流式输出处理器
    const streamer = new TextStreamer(GLModel.tokenizer, {
      skip_prompt: true, // 配置：只输出 AI 生成的回答
      callback_function: (text: string) => {
        // 每当模型生成一个新词，触发回调函数
        onToken(text)
      },
    })

    await GLModel(prompt, {
      max_new_tokens: 512, // 控制最大生成长度
      temperature: 0.7, // 控制回答的创造性
      top_k: 50, // 限制采样候选数，减少噪音
      top_p: 0.9, // nucleus sampling，控制采样范围
      do_sample: true, // 启用采样
      repetition_penalty: 1.2, // 防止模型复读
      no_repeat_ngram_size: 3,
      streamer: streamer, // 挂载流式处理器
    })

    return
  },
}

expose(api)
