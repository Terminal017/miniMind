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
import {
  addDocument,
  getAllDocuments,
  deleteDocuments,
} from '@/services/documentService'
import { useLiveQuery } from 'dexie-react-hooks'

export default function DocList() {
  const { id } = useParams()
  console.log('当前知识库ID:', id)

  const data = useLiveQuery(() => getAllDocuments(Number(id)) ?? [], []) ?? []

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
          onClick={() => addDocument(Number(id), '新文档', '这是文档内容', 100)}
        >
          批量导入
          <FolderUp />
        </Button>
      </div>
      <div className="w-full p-4">
        <DataTable columns={columns} data={data} />
      </div>
    </>
  )
}
