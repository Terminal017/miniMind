'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
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
import { deleteDocuments } from '@/services/documentService'
import { deleteDocChunks } from '@/services/chunkService'
import { toast } from 'sonner'

//数据表格组件的 Props 类型定义（泛型自动推断）
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

//通用数据表组件定义
export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  //行选择状态
  const [rowSelection, setRowSelection] = useState({})
  //分页状态
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 })
  //确认删除的选中项数量
  const [delCount, setDelCount] = useState(0)

  // 初始化表格实例
  const table = useReactTable({
    data, // 绑定数据源
    columns, // 绑定列配置
    getCoreRowModel: getCoreRowModel(), // 获取基础行模型
    getPaginationRowModel: getPaginationRowModel(), // 获取分页行模型，默认每页10条
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      rowSelection,
      pagination,
    },
    getRowId: (row: any) => row.id, //从id获取
  })

  //处理批量删除
  async function handleBatchDelete() {
    // 获取选中行的 ID 列表
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original.id)

    if (selectedIds.length === 0) {
      return
    }

    //删除文档对应的chunks
    for (const docId of selectedIds) {
      const res = await deleteDocChunks(docId)
      if (!res.success) {
        toast.info(`删除文档 ${docId} chunks 失败`)
        return
      }
    }
    //批量删除文档
    const result = await deleteDocuments(selectedIds)

    table.resetRowSelection() //重置选择状态
    if (result.success) {
      toast.success('删除成功')
    } else {
      toast.info('警告：批量删除文档错误')
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-md border w-full">
        <Table>
          {/* 表头渲染 */}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {/* 遍历每个表头单元格 */}
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header, // 表头定义（可以是字符串或组件）
                            header.getContext(), // 表头上下文（包含表格状态等）
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          {/* 表格主体渲染 */}
          <TableBody>
            {table.getRowModel().rows?.length ? (
              // 有数据：遍历所有行并渲染数据
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // 无数据：显示空状态
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  无内容
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* 分页组件 */}
      <div className="flex justify-between">
        {/* 数据显示 */}
        <div className="flex flex-row items-center gap-2">
          <p className="w-36 border px-4 py-1 rounded-md">
            已选择 {table.getFilteredSelectedRowModel().rows.length} /{' '}
            {table.getFilteredRowModel().rows.length} 项
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="secondary"
                className="hover:bg-red-500"
                disabled={table.getFilteredSelectedRowModel().rows.length === 0} //禁用按钮
                onClick={() => {
                  setDelCount(table.getFilteredSelectedRowModel().rows.length)
                }}
              >
                删除所选项
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除吗</AlertDialogTitle>
                <AlertDialogDescription className="overflow-hidden">
                  {/* 提示选中数量 */}
                  <span className="font-bold wrap-anywhere">
                    {`总计${delCount}项`}
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleBatchDelete()}>
                  确认
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            下一页
          </Button>
        </div>
      </div>
    </>
  )
}
