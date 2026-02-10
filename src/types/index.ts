export interface ModelWorkerAPI {
  content: string
  output: (input: string) => string
}

export interface DocWorkerAPI {
  processFile: (
    arrayBuffer: ArrayBuffer,
    file: File,
    id: number,
  ) => Promise<void>
  parsePDF: (arrayBuffer: ArrayBuffer) => Promise<string>
  parseMarkdown: (arrayBuffer: ArrayBuffer) => Promise<string>
  addDocument: (file: File, content: string, id: number) => Promise<void>
  splitText: (text: string, extension: string) => Promise<string[]>
}
