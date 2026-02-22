import { Field, FieldLabel } from '@/components/ui/field'
import { Progress } from '@/components/ui/progress'
import { useGLModelLoading } from '@/store/ai-store'

export function LoadGLModelProgress() {
  const progress = useGLModelLoading((state) => state.loadProgress)

  return (
    <Field className="min-w-73 mx-2">
      <FieldLabel
        htmlFor="progress-upload"
        className="flex flex-row w-full justify-between"
      >
        <span>下载生成式语言模型</span>
        <span className="ml-auto">{`${progress}%`}</span>
      </FieldLabel>
      <Progress value={progress} id="progress-upload" className="w-full" />
    </Field>
  )
}
