import db from '@/lib/db'
import { updateLibrary } from './libraryService'

//添加chunks及其向量
export async function addAllChunks(
  libraryId: number,
  docId: number,
  chunks: string[],
  vectors: number[][],
) {
  try {
    const chunkData = chunks.map((content, index) => ({
      docId,
      libraryId,
      content,
      embedding: vectors[index],
    }))
    await db.chunks.bulkAdd(chunkData)
    //更新library的chunks统计
    await updateLibrary(libraryId)
    return { success: true }
  } catch {
    return { success: false }
  }
}

//读取chunks及其向量
export async function getChunksByDocId(docId: number) {
  const chunks = await db.chunks.where('docId').equals(docId).toArray()
  return chunks
}

//删除目标文档的chunks
export async function deleteDocChunks(docId: number) {
  try {
    await db.chunks.where('docId').equals(docId).delete()
    return { success: true }
  } catch {
    return { success: false }
  }
}
