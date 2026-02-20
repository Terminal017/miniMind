import { Field, FieldLabel } from '@/components/ui/field'
import { Progress } from '@/components/ui/progress'
import { useEmbedModelLoading, useFileProcessing } from '@/store/ai-store'

export function LoadModelProgress() {
  const progress = useEmbedModelLoading((state) => state.loadProcess)

  return (
    <Field className="min-w-73 mx-2">
      <FieldLabel
        htmlFor="progress-upload"
        className="flex flex-row w-full justify-between"
      >
        <span>下载向量化模型</span>
        <span className="ml-auto">{`${progress}%`}</span>
      </FieldLabel>
      <Progress value={progress} id="progress-upload" className="w-full" />
    </Field>
  )
}

export function GetFileProgress() {
  const current = useFileProcessing((state) => state.currentFile)
  const total = useFileProcessing((state) => state.totalFiles)
  const progress = total > 0 ? Math.floor((current / total) * 100) : 0
  return (
    <Field className="min-w-73 mx-2">
      <FieldLabel
        htmlFor="progress-upload"
        className="flex flex-row w-full justify-between"
      >
        <span>文件处理进度</span>
        <span className="ml-auto">{`${current} / ${total}`}</span>
      </FieldLabel>
      <Progress value={progress} id="progress-upload" className="w-full" />
    </Field>
  )
}
