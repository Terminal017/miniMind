import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2 } from 'lucide-react'
import { deleteDocumentInf } from '@/services/documentService'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
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

//定义文档列表渲染的类型
export type FileType = {
  id: number
  name: string
  createdAt: Date
  size: number
  status: string
}

//删除单个文档
async function handleDeleteFile(fileId: number) {
  const result = await deleteDocumentInf(fileId)
  if (!result.success) {
    toast.error('错误：删除文档失败')
    return
  }
}

//配置表格列定义
export const columns: ColumnDef<FileType>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          //选择所有项而非当页
          table.getIsAllRowsSelected() ||
          (table.getIsSomeRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        aria-label="全选"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="选择此行"
      />
    ),
  },
  {
    accessorKey: 'name',
    header: '文件名',
    cell: ({ row }) => (
      <p className="truncate w-full max-w-60">{row.original.name}</p>
    ),
  },
  {
    accessorKey: 'size',
    header: '大小',
    cell: ({ row }) => `${row.original.size} KB`,
  },
  {
    accessorKey: 'createdAt',
    header: ' 创建时间',
    cell: ({ row }) => row.original.createdAt.toISOString().split('T')[0],
  },
  {
    accessorKey: 'status',
    header: '状态',
  },
  {
    id: 'actions',
    header: () => <p className="text-center">操作</p>,
    cell: ({ row }) => {
      const fileId = row.original.id
      return (
        <div className="flex flex-row justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-red-500 w-8 h-8"
              >
                <Trash2 className="text-foreground size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除文档吗</AlertDialogTitle>
                <AlertDialogDescription></AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteFile(fileId)}>
                  确认
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    },
  },
]
