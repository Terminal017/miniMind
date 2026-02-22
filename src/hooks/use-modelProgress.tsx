import { useRef } from 'react'
import { toast } from 'sonner'

interface ModelLoadingCallbacks {
  setProgress: (progress: number) => void
  resetProgress: () => void
  ProgressComponent: React.ComponentType
}

export function useModelLoading({
  setProgress,
  resetProgress,
  ProgressComponent,
}: ModelLoadingCallbacks) {
  // 模型下载进度提示ref
  const modelToastRef = useRef<string | number | undefined>(undefined)
  // 节流控制ref
  const lastUpdateTime = useRef(0)

  const getLoadingModel = (data: { progress: number }) => {
    let v = Math.floor(data.progress) || 0
    const now = Date.now()

    // 节流：限制更新频率
    if (v < 100 && now - lastUpdateTime.current < 200) {
      return
    }
    lastUpdateTime.current = now

    // 模型下载完成
    if (modelToastRef.current && v >= 100) {
      toast.success('模型下载完成', {
        id: modelToastRef.current,
        description: null,
        duration: 2000,
      })
      modelToastRef.current = undefined
      resetProgress()
      return
    }

    // 模型开始下载提示
    if (!modelToastRef.current && v > 0 && v < 100) {
      modelToastRef.current = toast('', {
        description: <ProgressComponent />,
        duration: Infinity,
        position: 'top-right',
      })
      return
    }

    // 更新下载进度
    setProgress(v)
  }

  return { getLoadingModel }
}
