//用于文章解析、切片、向量化和向量化模型下载的Web Worker
//注意Worker中不能导入是使用Node API的库，可能发生错误
import * as pdfjs from 'pdfjs-dist'
import { expose } from 'comlink'
import type { DocWorkerAPI } from '@/types/index'
import { addDocument } from '@/services/documentService'
import {
  RecursiveCharacterTextSplitter,
  MarkdownTextSplitter,
} from '@langchain/textsplitters'

// 设置 PDF.js 的 Worker 线程（它会新开一个Worker来处理PDF解析，这个库只能用它自己定义的Worker或当前线程）
//调用pdfjs.getDocument会自动通过这个配置创建新worker
//这里为了同源策略，拷贝了一份到本地（它默认是从第三方网站获取）。这个文件同样是配置文件。
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

//经过测验，浏览器对于在worker中创建worker的支持很低，pdfjs尝试后自动失败进行回退
//过滤对应警告
const _warn = console.warn
console.warn = (...args: any[]) => {
  if (args[0]?.toString().includes('fake worker')) return
  _warn(...args)
}

console.log('Worker Ready')

const api: DocWorkerAPI = {
  //处理文件：解析、切片、向量化
  async processFile(arrayBuffer: ArrayBuffer, file: File, id: number) {
    console.log('Worker开始处理文件:', file.name)
    //获取文件后缀名
    const extension = file.name.split('.').pop()?.toLowerCase()
    let rawText = ''

    //解析文件获取纯文本
    switch (extension) {
      case 'txt':
        rawText = new TextDecoder('utf-8').decode(arrayBuffer)
        break
      case 'pdf':
        rawText = await this.parsePDF(arrayBuffer)
        break
      case 'md':
        rawText = await this.parseMarkdown(arrayBuffer)
        break
      default:
        // 其他文本处理
        rawText = new TextDecoder('utf-8').decode(arrayBuffer)
    }
    //添加纯文本到document表
    await this.addDocument(file, rawText, id)

    //切片文本
    const chunks = await this.splitText(rawText, extension as string)
  },

  //添加文档到数据库
  async addDocument(file: File, content: string, id: number) {
    const size = new Blob([content]).size
    const filedata = {
      name: file.name,
      size: size,
      rawText: content,
      libraryId: id,
    }
    const result = await addDocument(
      filedata.libraryId,
      filedata.name,
      filedata.rawText,
      filedata.size,
    )
    console.log('Worker处理完毕')
    if (!result.success) {
      console.error(`添加文件 ${file.name} 失败`)
    }
  },

  //解析PDF
  async parsePDF(data: ArrayBuffer) {
    //PDF解析器配置
    const loadingTask = pdfjs.getDocument({
      data, //文件二进制数据
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/', // 字符映射文件(处理中文)
      cMapPacked: true,
      verbosity: pdfjs.VerbosityLevel.INFOS,
    })

    //解析PDF
    const pdf = await loadingTask.promise
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((item: any) => item.str).join('') + '\n'
    }
    console.log('PDF解析结果：', text)
    return text
  },

  //解析markdown
  async parseMarkdown(arrayBuffer: ArrayBuffer) {
    const text = new TextDecoder('utf-8').decode(arrayBuffer)

    // 移除 YAML Front Matter
    let content = text.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '')

    //包含代码块
    const codeBlocks: string[] = []
    content = content.replace(/```[\s\S]*?```/g, (m) => {
      const key = `__CODE_BLOCK${codeBlocks.length}__`
      codeBlocks.push(m)
      return key
    })

    // 文本清理函数（清理噪声，保留**文本）
    const cleanMarkdownText = (rawText: string): string => {
      return rawText
        .replace(/<[^>]+>/g, '') // 清理HTML标签，如 <div>.
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
        .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
        .replace(/https?:\/\/[^\s]+/g, '') // 移除URL
        .replace(/^#+\s+/, '') // 移除标题标记
        .replace(/\s+/g, ' ') // 合并空格
        .trim()
    }

    content = cleanMarkdownText(content)

    // 恢复代码块
    const result = content.replace(
      /__CODE_BLOCK(\d+)__/g,
      (_, i) => codeBlocks[Number(i)] ?? '',
    )
    console.log('Markdown解析结果：', result)
    return result
  },

  //文本切片
  async splitText(text: string, extension: string) {
    let splitter

    if (extension === 'md') {
      // 处理markdown，保证代码块完整
      splitter = new MarkdownTextSplitter({
        chunkSize: 800,
        chunkOverlap: 120,
      })
    } else {
      splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 600, //每个切片的近似字符数
        chunkOverlap: 100, //相邻切片的重叠字符数，增加上下文关联
        separators: ['\n\n', '\n', '。', '！', '？', '.', '!', '?', ' ', ''],
      })
    }
    const docs = await splitter.createDocuments([text])
    const chunks = docs.map((doc) => doc.pageContent)
    console.log('文本切片结果：', chunks)
    return chunks
  },
}

expose(api)
