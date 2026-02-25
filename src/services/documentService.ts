// 文档CRUD

import db from '@/lib/db'
import { updateLibrary } from './libraryService'

//读取所有文档
export async function getAllDocuments(LibraryId: number) {
  const documents = await db.documents
    .where('libraryId')
    .equals(LibraryId)
    .toArray((doc) =>
      doc.map(({ id, name, size, status, createdAt }) => ({
        id,
        name,
        size,
        status,
        createdAt,
      })),
    )
  return documents
}

//读取单个文档
export async function getDocument(documentId: number) {
  const document = await db.documents.get(documentId)
  return document
}

//批量删除文档
export async function deleteDocuments(idList: number[]) {
  try {
    await db.documents.bulkDelete(idList)
    return { success: true }
  } catch (error) {
    console.error('删除文档失败:', error)
    return { success: false }
  }
}

//删除单个文件和Chunks
export async function deleteDocumentInf(docId: number) {
  try {
    await db.chunks.where('docId').equals(docId).delete()
    const libId = await db.documents.get(docId)
    await db.documents.delete(docId)
    await updateLibrary(libId?.libraryId) //删除文档后更新知识库统计
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}

//添加文档
export async function addDocument(
  libraryId: number,
  name: string,
  rawText: string,
  size: number,
) {
  try {
    const newDocument = {
      libraryId,
      name,
      rawText,
      size,
      status: 'ready',
      createdAt: new Date(),
      enabled: true, //默认启用
      metadata: null, //预留属性
    }
    const newId = await db.documents.add(newDocument)
    //增加library的文档数量统计
    await updateLibrary(libraryId)
    return { success: true, id: newId }
  } catch (error) {
    console.error('添加文档失败:', error)
    return { success: false }
  }
}
