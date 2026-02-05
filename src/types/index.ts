export interface ModelWorkerAPI {
  content: string
  output: (input: string) => string
}
