'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import {
  createLibrary,
  getAllLibraries,
  deleteLibrary,
} from '@/services/libraryService'
import { getChineseStatus } from '@/lib/db'

export default function LibList() {
  //控制Dialog显示
  const [isOpen, setIsOpen] = useState(false)

  //使用useLiveQuery，当监听内容发生变化时会自动更新
  const libraries = useLiveQuery(() => getAllLibraries() ?? [], []) ?? []

  //添加新的数据库后，表发生变化，libraries会自动更新
  async function handleCreate(formData: FormData) {
    const name = formData.get('name') as string
    const result = await createLibrary(name)

    if (result.success) {
      toast.success('仓库创建成功', {
        className: 'text-base',
        position: 'bottom-right',
      })
      setIsOpen(false) // 关闭对话框
    } else {
      toast.info('警告：新建知识库发生错误', {
        className: 'text-base',
        position: 'bottom-right',
      })
    }
  }

  //删除知识库
  async function handleDelete(libraryId: number) {
    const result = await deleteLibrary(libraryId)
    if (result.success) {
      toast.success('仓库删除成功', {
        className: 'text-base',
        position: 'bottom-right',
      })
    }
  }

  return (
    <>
      <div className="flex flex-row justify-between items-center w-full p-4 mt-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-medium">知识库</h2>
          <p className="text-sm text-gray-700">管理本地文档仓库以用于RAG</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus />
              新建仓库
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            {/* <form action={handleCreate}> */}
            <DialogHeader>
              <DialogTitle>新建知识库</DialogTitle>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <Label htmlFor="name-1">名称</Label>
                <Input id="name-1" name="name" form="add-libname" required />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">取消</Button>
              </DialogClose>
              <form id="add-libname" action={handleCreate}>
                <Button type="submit">确认</Button>
              </form>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-3 w-full py-4">
        {libraries.map((lib) => (
          <Card key={lib.id} className="m-4 gap-3 pb-0 overflow-hidden">
            <CardHeader className="gap-1">
              {/*使用text-overflow避免名称过长溢出*/}
              <CardTitle className="truncate text-lg">{lib.name}</CardTitle>
              <CardDescription className="text-sm">
                {lib.files} 文档 &nbsp;·&nbsp; {lib.chunks} 切片
              </CardDescription>
            </CardHeader>
            <CardContent
              className={cn('mb-2', 'font-medium', {
                'text-green-500': lib.status === 'ready',
                'text-orange-500': lib.status === 'progressing',
                'text-red-500': lib.status === 'error',
                'text-foreground': lib.status === 'empty',
              })}
            >
              <p>状态： {getChineseStatus(lib.status)}</p>
            </CardContent>

            <CardFooter className="bg-muted/50 border-t py-4 gap-3">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`knowledge/${lib.id}`}>打开</Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    删除
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认删除吗</AlertDialogTitle>
                    <AlertDialogDescription className="overflow-hidden">
                      请确认删除的仓库：
                      <br />
                      <span className="font-bold wrap-anywhere">
                        {lib.name}
                      </span>
                      <br />
                      删除后仓库和文档无法恢复
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(lib.id)}>
                      确认
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}
