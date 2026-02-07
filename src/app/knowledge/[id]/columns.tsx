import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'

//定义文档列表渲染的类型
export type FileType = {
  id: string
  name: string
  createdAt: string
  size: number
  status: string
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
  },
  {
    accessorKey: 'status',
    header: '状态',
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => {
      const fileId = row.original.id

      return <span>删除</span>
    },
  },
]
