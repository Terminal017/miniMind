//用于文章解析、切片、向量化和向量化模型下载的Web Worker
import * as pdfjs from 'pdfjs-dist'
import { expose } from 'comlink'
import type { DocWorkerAPI } from '@/types/index'
import { addDocument } from '@/services/documentService'
import matter from 'front-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import { toString } from 'mdast-util-to-string'
// 设置 PDF.js 的 Worker 线程（它会新开一个Worker来处理PDF解析，这个库只能用它自己定义的Worker或当前线程）
//调用pdfjs.getDocument会自动通过这个配置创建新worker
//这里为了同源策略，拷贝了一份到本地（它默认是从第三方网站获取）。这个文件同样是配置文件。
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

//经过测验，浏览器对于在worker中创建worker的支持很低，pdfjs尝试后自动失败进行回退
//过滤对应警告
// const _warn = console.warn
// console.warn = (...args: any[]) => {
//   if (args[0]?.toString().includes('fake worker')) return
//   _warn(...args)
// }

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
    //解析yaml数据（attributes），默认丢弃，body为主体内容
    const { body } = matter(text)

    // 3. 解析为 AST (语法树)
    const { unified } = await import('unified')
    const remarkParse = (await import('remark-parse')).default

    const processor = unified().use(remarkParse)
    const ast = processor.parse(body)

    const results: string[] = []
    let h1Text = '' // 一级标题（h1）
    let currentSubHeader = '' // 当前标题（h2-h4）

    // 文本清理函数
    const cleanMarkdownText = (rawText: string): string => {
      return rawText
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文字
        .replace(/https?:\/\/[^\s]+/g, '') // 移除URL
        .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
        .replace(/[*_~]{1,2}([^*_~]+)[*_~]{1,2}/g, '$1') // 移除加粗/斜体/删除线
        .replace(/`+([^`]+)`+/g, '$1') // 移除行内代码标记，保留内容
        .replace(/\s+/g, ' ') // 多个空格合并为一个
        .trim()
    }

    // 3. 遍历节点
    ast.children.forEach((node) => {
      // 处理标题层级
      if (node.type === 'heading') {
        const titleText = toString(node)
        if (node.depth === 1) {
          h1Text = titleText
          currentSubHeader = '' // 切换 H1 时清空二级缓存
        } else if (node.depth >= 2 && node.depth <= 4) {
          currentSubHeader = titleText
        }
        return
      }

      // 处理正文（段落、列表、代码块等）
      if (
        node.type === 'paragraph' ||
        node.type === 'list' ||
        node.type === 'code'
      ) {
        //清理多余信息：去除URL、去除** _
        let rawText = toString(node)
        const cleanText = cleanMarkdownText(rawText)

        if (cleanText) {
          // 构造 [h1 > h2-h4] 前缀
          const prefix = currentSubHeader
            ? `[${h1Text} > ${currentSubHeader}] `
            : h1Text
            ? `[${h1Text}] `
            : ''

          results.push(prefix + cleanText)
        }
      }
    })
    console.log('Markdown解析结果：', results)
    // 返回解析后的文本数组，每一项代表一个带有上下文的语义段
    return results.join('\n')
    return ''
  },
}

expose(api)
