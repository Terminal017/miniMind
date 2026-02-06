//知识库CRUD（函数调用而非API请求）

import db from '@/lib/db'

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
    const new_id = await db.libraries.add(new_library)
    return { sucess: true }
  } catch (error) {
    console.error('创建知识库失败:', error)
    return { sucess: false }
  }
}

//读取所有知识库
export async function getAllLibraries() {
  try {
    const libraries = await db.libraries.toArray()
    return { sucess: true, data: libraries }
  } catch (error) {
    console.error('获取知识库列表失败:', error)
    return { sucess: false, data: [] }
  }
}

//删除单个知识库
export async function deleteLibrary(libraryId: number) {
  try {
    await db.libraries.delete(libraryId)
    return { sucess: true }
  } catch (error) {
    console.error('删除知识库失败:', error)
    return { sucess: false }
  }
}

//更新知识库信息
export async function updateLibrary(
  libraryId: number,
  updates: {
    files?: number
    chunks?: number
    status?: 'ready' | 'progressing' | 'error' | 'empty'
  },
) {
  try {
    db.libraries.update(libraryId, { ...updates, updatedAt: new Date() })
    return { sucess: true }
  } catch (error) {
    console.error('更新知识库失败:', error)
    return { sucess: false }
  }
}
