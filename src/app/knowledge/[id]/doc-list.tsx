'use client'

import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FolderUp } from 'lucide-react'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

import { columns, FileType } from './columns'
import { DataTable } from './table'
import { getAllDocuments } from '@/services/documentService'
import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect } from 'react'
import { useWorkerManager } from '@/store/ai-store'
import { LoadModelProgress } from './progress'
import * as Comlink from 'comlink'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

export default function DocList() {
  const { id } = useParams()

  // 向量化模型下载进度
  // const [modelProgress, setModelProgress] = useState(0)
  // 模型下载进度提示ref
  const modelToastRef = useRef<string | number | undefined>(undefined)
  // 节流控制
  const lastUpdateTime = useRef(0)

  //初始化文档处理Worker
  const docWorker = useWorkerManager((state) => state.docWorker)
  const initDocWorker = useWorkerManager((state) => state.initDocWorker)
  useEffect(() => {
    try {
      initDocWorker()
    } catch {
      toast.error('错误：初始化Worker失败，请检查Web GPU与显卡支持')
    }
  }, [initDocWorker])

  //获取文档列表
  const data = useLiveQuery(() => getAllDocuments(Number(id)) ?? [], []) ?? []

  //定义导入文件的input引用，将它作为受控组件（React不推荐通过DOM操作实现受控组件）
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files || files.length === 0) return

    const fileList = Array.from(files)
    console.log('选中的文件:', fileList)
    // toast.info(`开始处理 ${fileList.length} 个文件...`)

    //采用同步方式逐个处理文件，减少内存占用
    for (const file of fileList) {
      try {
        //获取二进制格式
        const buffer = await file.arrayBuffer()
        //交给Worker处理：解析、切片、向量化、添加到数据库
        console.log('使用worker', docWorker ? docWorker.worker : 'null')
        await docWorker?.api.processFile(
          buffer,
          file,
          Number(id),
          Comlink.proxy(getLoadingModel),
        )
      } catch {
        toast.info(`警告：处理文件 ${file.name} 失败`)
      }
    }
  }

  //获取模型下载进度（回调函数）
  function getLoadingModel(data: { progress: number }) {
    let v = Math.floor(data.progress) || 0
    const now = Date.now()

    // 节流：限制更新频率
    if (v < 100 && now - lastUpdateTime.current < 200) {
      return
    }
    lastUpdateTime.current = now

    //模型开始下载提示
    if (!modelToastRef.current && v > 0 && v < 100) {
      modelToastRef.current = toast('', {
        description: <LoadModelProgress task="下载向量化模型" progress={v} />,
        duration: Infinity,
        position: 'top-right',
      })
      return
    }

    // 模型下载进度提示
    if (modelToastRef.current && v < 100) {
      toast('', {
        id: modelToastRef.current, // 传入 ID 告诉 Sonner 以更新同一个 Toast
        description: <LoadModelProgress task="下载向量化模型" progress={v} />,
        position: 'top-right',
      })
      return
    }

    // 模型下载完成
    if (modelToastRef.current && v >= 100) {
      const toastId = modelToastRef.current

      //防止重复执行
      if (toastId === undefined) return
      //重置ref
      modelToastRef.current = undefined
      //更新为下载完成提示
      toast.success('模型下载完成', {
        id: toastId,
        description: null,
        duration: 2000,
      })
    }
  }

  return (
    <>
      <Breadcrumb className="w-full mt-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/knowledge">知识库</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-row justify-between items-center w-full p-4 mt-1">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-medium">文档处理</h2>
          <p className="text-sm text-gray-700">解析文档并进行切片向量化</p>
        </div>
        <Button
          className="gap-1 "
          onClick={() => fileInputRef.current?.click()}
        >
          批量导入
          <FolderUp />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          multiple //允许多选
          accept=".txt, .md, .pdf, .ts" //限制文件类型
        />
      </div>
      <div className="w-full p-4">
        <DataTable columns={columns} data={data} />
      </div>
    </>
  )
}
