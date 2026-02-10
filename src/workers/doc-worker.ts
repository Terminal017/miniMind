//用于文章解析、切片、向量化和向量化模型下载的Web Worker
//注意Worker中不能导入是使用Node API的库，可能发生错误
import * as pdfjs from 'pdfjs-dist'
import { expose } from 'comlink'
import type { DocWorkerAPI } from '@/types/index'
import { addDocument } from '@/services/documentService'

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
    console.log('开始解析Markdown文件')

    const text = new TextDecoder('utf-8').decode(arrayBuffer)

    // 移除 YAML Front Matter（如果存在）
    let content = text.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '')

    const codeBlocks: string[] = []
    content = content.replace(/```[\s\S]*?```/g, (m) => {
      const key = `§§CODE_BLOCK${codeBlocks.length}§§`
      codeBlocks.push(m)
      return key
    })

    // 提取所有标题和内容块
    const results: string[] = []
    let currentHeader = '' // 当前最外层标题

    // 文本清理函数
    const cleanMarkdownText = (rawText: string): string => {
      return rawText
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接
        .replace(/https?:\/\/[^\s]+/g, '') // 移除URL
        .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
        .replace(/[*_~]{1,2}([^*_~]+)[*_~]{1,2}/g, '$1') // 移除格式标记
        .replace(/^#+\s+/, '') // 移除标题标记
        .replace(/\s+/g, ' ') // 合并空格
        .trim()
    }

    // 3. 按行分割处理
    const lines = content.split('\n')
    let currentParagraph = ''

    for (const line of lines) {
      const trimmed = line.trim()

      // 处理标题
      if (trimmed.startsWith('#')) {
        // 先保存之前的段落
        if (currentParagraph) {
          const cleaned = cleanMarkdownText(currentParagraph)
          if (cleaned) {
            const prefix = currentHeader ? `[${currentHeader}] ` : ''
            results.push(prefix + cleaned)
          }
          currentParagraph = ''
        }

        // 更新标题（提取标题文本，去除#号）
        const headerMatch = trimmed.match(/^#+\s+(.+)$/)
        if (headerMatch) {
          const title = headerMatch[1]
          currentHeader = title
        }
      }
      // 跳过空行和分隔线
      else if (!trimmed || trimmed.match(/^[-*_]{3,}$/)) {
        if (currentParagraph) {
          const cleaned = cleanMarkdownText(currentParagraph)
          if (cleaned) {
            const prefix = currentHeader ? `[${currentHeader}] ` : ''
            results.push(prefix + cleaned)
          }
          currentParagraph = ''
        }
      }
      // 累积段落内容
      else {
        currentParagraph += (currentParagraph ? ' ' : '') + trimmed
      }
    }

    // 处理最后一个段落
    if (currentParagraph) {
      const cleaned = cleanMarkdownText(currentParagraph)
      if (cleaned) {
        const prefix = currentHeader ? `[${currentHeader}] ` : ''
        results.push(prefix + cleaned)
      }
    }

    const finresults = results.map((res) => {
      return res.replace(
        /§§CODE_BLOCK(\d+)§§/g,
        (_, i) => codeBlocks[Number(i)] ?? '',
      )
    })

    console.log('Markdown解析结果：', finresults)
    return results.join('\n')
  },
}

expose(api)
