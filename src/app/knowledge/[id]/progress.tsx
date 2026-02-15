import { Field, FieldLabel } from '@/components/ui/field'
import { Progress } from '@/components/ui/progress'

export function LoadModelProgress({
  task,
  progress,
}: {
  task: string
  progress: number
}) {
  return (
    <Field className="w-full">
      <FieldLabel
        htmlFor="progress-upload"
        className="flex flex-row w-full justify-between"
      >
        <span>{task}</span>
        <span className="ml-auto">{`${progress}%`}</span>
      </FieldLabel>
      <Progress value={progress} id="progress-upload" className="w-full" />
    </Field>
  )
}
