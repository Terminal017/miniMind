export interface ModelWorkerAPI {
  content: string
  output: (input: string) => string
}

export interface DocWorkerAPI {
  processFile: (
    arrayBuffer: ArrayBuffer,
    file: File,
    id: number,
    onProgress: (data: { progress: number }) => void,
  ) => Promise<void>
  parsePDF: (arrayBuffer: ArrayBuffer) => Promise<string>
  parseMarkdown: (arrayBuffer: ArrayBuffer) => Promise<string>
  splitText: (text: string, extension: string) => Promise<string[]>
  loadEmbedModel: (
    onProgress: (data: { progress: number }) => void,
  ) => Promise<void>
  vectorizeChunks: (chunks: string[]) => Promise<number[][]>
}
