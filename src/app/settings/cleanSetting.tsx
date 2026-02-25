'use client'

import { Button } from '@/components/ui/button'
import { useLiveQuery } from 'dexie-react-hooks'
import db from '@/lib/db'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useEffect, useState } from 'react'

export default function CleanSetting() {
  return (
    <div className="w-full max-w-4xl mt-4 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">网站数据</h1>
        <p className="text-sm text-muted-foreground">管理您的本地数据存储</p>
      </div>
      <CleanKnowledge />
      <CleanModel />
    </div>
  )
}

export function CleanKnowledge() {
  //查询知识库、文档、切片数量
  const libraryCount = useLiveQuery(() => db.libraries?.count() ?? 0, []) ?? 0

  const documentsCount = useLiveQuery(() => db.documents?.count() ?? 0, []) ?? 0

  const chunksCount = useLiveQuery(() => db.chunks?.count() ?? 0, []) ?? 0

  async function handleClearData() {
    await db.transaction(
      'rw',
      [db.libraries, db.documents, db.chunks],
      async () => {
        await db.chunks.clear()
        await db.documents.clear()
        await db.libraries.clear()
      },
    )
  }

  return (
    <div className="border rounded-lg p-6 bg-card">
      <div className="flex flex-row justify-between items-end">
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-4">知识库数据</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">知识库</span>
              <span className="text-2xl font-semibold text-primary">
                {libraryCount}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">文档</span>
              <span className="text-2xl font-semibold text-primary">
                {documentsCount}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">切片</span>
              <span className="text-2xl font-semibold text-primary">
                {chunksCount}
              </span>
            </div>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="secondary" className="ml-6 hover:bg-red-500/90">
              清除数据
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>警告：即将清除所有数据</AlertDialogTitle>
              <AlertDialogDescription className="overflow-hidden">
                即将删除所有知识库、文档和切片
                <br />
                注意，删除的数据将无法恢复
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await handleClearData()
                }}
              >
                确认
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export function CleanModel() {
  const [embeddingModelExists, setEmbeddingModelExists] = useState(false)
  const [chatModelExists, setChatModelExists] = useState(false)

  // 检查模型是否存在
  useEffect(() => {
    async function checkModels() {
      const chatExists = await checkModelInCache('Qwen2.5-0.5B-Instruct')
      const embeddingExists = await checkModelInCache('bge-small-zh-v1.5')
      setChatModelExists(chatExists)
      setEmbeddingModelExists(embeddingExists)
    }
    checkModels()
  }, [])

  //处理删除所有模型
  async function handleDeleteAllModels() {
    await deleteModelFromCache('Qwen2.5-0.5B-Instruct')
    await deleteModelFromCache('bge-small-zh-v1.5')
    setChatModelExists(false)
    setEmbeddingModelExists(false)
  }

  return (
    <div className="border rounded-lg px-6 pt-2 pb-6 bg-card">
      <div className="flex flex-row justify-between items-end">
        <div className="flex-1">
          <div className="flex flex-row justify-between items-center">
            <h3 className="text-lg font-medium my-4">模型状态</h3>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="ml-6 hover:bg-red-500/90"
                >
                  清除数据
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>警告：即将删除模型数据</AlertDialogTitle>
                  <AlertDialogDescription className="overflow-hidden">
                    即将删除所有模型的缓存数据
                    <br />
                    模型数据删除后需要重新下载
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllModels}>
                    确认
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {/* 对话模型 */}
            <div className="flex flex-col gap-3 p-4 border rounded-lg bg-background">
              <span className="text-sm font-medium text-muted-foreground">
                对话模型
              </span>
              <span className="text-lg font-semibold">
                Qwen2.5-0.5B-Instruct
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    chatModelExists ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    chatModelExists ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {chatModelExists ? '就绪' : '未加载'}
                </span>
              </div>
            </div>

            {/* 向量化模型 */}
            <div className="flex flex-col gap-3 p-4 border rounded-lg bg-background">
              <span className="text-sm font-medium text-muted-foreground">
                向量化模型
              </span>
              <span className="text-lg font-semibold">
                Xenova/bge-small-zh-v1.5
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    embeddingModelExists ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    embeddingModelExists ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {embeddingModelExists ? '就绪' : '未加载'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 检查模型是否存在于 Cache Storage
async function checkModelInCache(modelName: string): Promise<boolean> {
  try {
    const cache = await caches.open('transformers-cache')
    const keys = await cache.keys()
    return keys.some((request) => request.url.includes(modelName))
  } catch (error) {
    console.error('检查模型缓存失败:', error)
    return false
  }
}

// 从 Cache Storage 删除模型
async function deleteModelFromCache(modelName: string): Promise<void> {
  try {
    const cache = await caches.open('transformers-cache')
    const keys = await cache.keys()

    // 删除所有包含模型名称的缓存条目
    for (const request of keys) {
      if (request.url.includes(modelName)) {
        await cache.delete(request)
      }
    }
  } catch (error) {
    console.error('删除模型缓存失败:', error)
  }
}
