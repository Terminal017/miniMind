//配置Index DB数据库Schema
import Dexie, { type EntityTable } from 'dexie'

type LibraryType = {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
  files: number //文件数量和切片数量
  chunks: number
  status: 'ready' | 'progressing' | 'error' | 'empty' //知识库状态
}

const knowledgeChineseStatusMap = {
  ready: '就绪',
  progressing: '处理中',
  error: '错误',
  empty: '无内容',
}

//导出中文UI描述
export const getChineseStatus = (status: LibraryType['status']) => {
  return knowledgeChineseStatusMap[status]
}

type DocsType = {
  id: number
  libraryId: number
  name: string
  rawText: string //纯文本内容
  size: number //文件大小,单位KB
  status: string //文档状态
  createdAt: Date
  enabled: boolean //是否启用
  metadata: object | null //额外信息，预留属性
}

type ChunkType = {
  id: number
  docId: number //所属文档ID
  libraryId: number //所属知识库ID，优化查询
  content: string //切片文本内容
  embedding: number[] //向量表示
  // metadata: object //额外信息，预留属性
}

//创建Dexie数据库实例
const db = new Dexie('MinimindDB') as Dexie & {
  libraries: EntityTable<LibraryType, 'id'>
  documents: EntityTable<DocsType, 'id'>
  chunks: EntityTable<ChunkType, 'id'>
}

//定义主键和索引
db.version(1).stores({
  libraries: '++id, name, status',
  documents: '++id, libraryId, name, status, enabled',
  chunks: '++id, docId, libraryId',
})

export default db
export type { LibraryType, DocsType, ChunkType }
