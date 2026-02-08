//用于文章解析、切片、向量化和向量化模型下载的Web Worker
import * as pdfjs from 'pdfjs-dist'
import { expose } from 'comlink'
import type { DocWorkerAPI } from '@/types/index'
import { addDocument } from '@/services/documentService'
import { toast } from 'sonner'
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

const api: DocWorkerAPI = {
  //处理文件：解析、切片、向量化
  async processFile(arrayBuffer: ArrayBuffer, file: File, id: number) {
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
      toast.error(`添加文件 ${file.name} 失败`)
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
      text += content.items.map((item: any) => item.str).join(' ') + '\n'
    }
    return text
  },

  async parseMarkdown(arrayBuffer: ArrayBuffer) {
    return ''
  },
}

expose(api)
