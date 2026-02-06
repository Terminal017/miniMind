import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DocList() {
  const docslist = [
    { id: 1, name: '文档仓库1', files: '1', chunks: '20', state: '就绪' },
    {
      id: 2,
      name: '文档仓库2Aaaakhauewshgiuwebghkasdhgifhadkgjhdaksghwsdhagjksldagh',
      chunks: '20',
      files: '2',
      state: '处理中',
    },
    { id: 3, name: '文档仓库3', files: '3', chunks: '20', state: '就绪' },
    { id: 4, name: '文档仓库4', files: '4', chunks: '20', state: '就绪' },
    { id: 5, name: '文档仓库5', files: '5', chunks: '20', state: '处理中' },
    { id: 6, name: '文档仓库6', files: '6', chunks: '20', state: '错误' },
  ]

  return (
    <>
      <div className="flex flex-row justify-between items-center w-full p-4 mt-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-medium">知识库</h2>
          <p className="text-sm text-gray-700">管理本地文档仓库以用于RAG</p>
        </div>
        <Button>
          <Plus />
          新建仓库
        </Button>
      </div>
      <div className="grid grid-cols-3 w-full py-4">
        {docslist.map((doc) => (
          <Card key={doc.id} className="m-4 gap-3 pb-0 overflow-hidden">
            <CardHeader className="gap-1">
              {/*使用text-overflow避免名称过长溢出*/}
              <CardTitle className="truncate text-lg">{doc.name}</CardTitle>
              <CardDescription className="text-sm">
                {doc.files} 文档 &nbsp;·&nbsp; {doc.chunks} 切片
              </CardDescription>
            </CardHeader>
            <CardContent
              className={cn('mb-2', 'font-medium', {
                'text-green-500': doc.state === '就绪',
                'text-orange-500': doc.state === '处理中',
                'text-red-500': doc.state === '错误',
              })}
            >
              <p>状态： {doc.state}</p>
            </CardContent>

            <CardFooter className="bg-muted/50 border-t py-4 gap-3">
              <Button variant="outline" size="sm" className="flex-1">
                打开
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                删除
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}
