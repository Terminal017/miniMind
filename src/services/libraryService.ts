//知识库CRUD（函数调用而非API请求）

import db from '@/lib/db'
import { deleteDocumentInf, getAllDocuments } from './documentService'

//创建新知识库
export async function createLibrary(name: string) {
  const new_library = {
    name: name,
    createdAt: new Date(),
    updatedAt: new Date(),
    files: 0,
    chunks: 0,
    status: 'empty' as const,
  }
  try {
    await db.libraries.add(new_library)
    return { success: true }
  } catch (error) {
    console.error('创建知识库失败:', error)
    return { success: false }
  }
}

//读取所有知识库
export async function getAllLibraries() {
  const libraries = await db.libraries.toArray()
  return libraries
}

//删除单个知识库
export async function deleteLibrary(libraryId: number) {
  try {
    //删除库内所有文档和chunks
    const documents = await getAllDocuments(libraryId)
    for (const doc of documents) {
      const res = await deleteDocumentInf(doc.id)
      if (!res.success) {
        console.error(`删除文档 ${doc.id} 失败`)
        return { success: false }
      }
    }

    //上述文件删除成功后删除知识库
    await db.libraries.delete(libraryId)
    return { success: true }
  } catch (error) {
    console.error('删除知识库失败:', error)
    return { success: false }
  }
}

//同步知识库信息
export async function updateLibrary(libraryId: number | undefined) {
  if (!libraryId) {
    return
  }
  const docs = await db.documents.where('libraryId').equals(libraryId).count()
  const chunks = await db.chunks.where('libraryId').equals(libraryId).count()

  await db.libraries.update(libraryId, {
    files: docs,
    chunks: chunks,
    updatedAt: new Date(),
    status: chunks > 0 ? 'ready' : 'empty',
  })
}
