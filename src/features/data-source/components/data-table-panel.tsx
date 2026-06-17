"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DataTableColumn<T extends DataTableRow> = {
  key: keyof T;
  label: string;
  render?: (row: T) => ReactNode;
};

export type DataTableRow = {
  id: string;
  name: string;
};

type DataTablePanelProps<T extends DataTableRow> = {
  columns: DataTableColumn<T>[];
  createRow?: (index: number) => T;
  initialRows: T[];
  rows?: T[];
  selectedRowId?: string | null;
  title: string;
  toolbar?: ReactNode;
  emptyText?: string;
  onSelectedRowIdChange?: (rowId: string | null) => void;
};

const DataTablePanel = <T extends DataTableRow>({
  columns,
  createRow,
  initialRows,
  rows: controlledRows,
  selectedRowId: controlledSelectedRowId,
  title,
  toolbar,
  emptyText = "暂无数据",
  onSelectedRowIdChange,
}: DataTablePanelProps<T>) => {
  const [uncontrolledRows, setUncontrolledRows] = useState(initialRows);
  const [uncontrolledSelectedRowId, setUncontrolledSelectedRowId] = useState<string | null>(
    initialRows[0]?.id ?? null,
  );
  const rows = controlledRows ?? uncontrolledRows;
  const selectedRowId = controlledSelectedRowId ?? uncontrolledSelectedRowId;
  const setSelectedRowId = onSelectedRowIdChange ?? setUncontrolledSelectedRowId;

  const handleAdd = () => {
    if (!createRow || controlledRows) return;

    const row = createRow(rows.length + 1);
    setUncontrolledRows((currentRows) => [...currentRows, row]);
    setSelectedRowId(row.id);
  };

  const handleEdit = () => {
    if (!selectedRowId) return;

    if (controlledRows) return;

    setUncontrolledRows((currentRows) =>
      currentRows.map((row) =>
        row.id === selectedRowId
          ? {
              ...row,
              name: row.name.endsWith("（已编辑）")
                ? row.name
                : `${row.name}（已编辑）`,
            }
          : row,
      ),
    );
  };

  const handleDelete = () => {
    if (!selectedRowId) return;

    if (controlledRows) return;

    setUncontrolledRows((currentRows) => {
      const nextRows = currentRows.filter((row) => row.id !== selectedRowId);
      setSelectedRowId(nextRows[0]?.id ?? null);
      return nextRows;
    });
  };

  return (
    <section className="flex h-full min-w-0 flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        {toolbar ?? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="h-8 w-20 transition-colors duration-200 ease-out"
              onClick={handleAdd}
            >
              <Plus className="size-3.5" />
              新增
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 w-20 transition-colors duration-200 ease-out"
              disabled={!selectedRowId}
              onClick={handleEdit}
            >
              <Edit3 className="size-3.5" />
              编辑
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="h-8 w-20 transition-colors duration-200 ease-out"
              disabled={!selectedRowId}
              onClick={handleDelete}
            >
              <Trash2 className="size-3.5" />
              删除
            </Button>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead>
            <tr className="bg-muted/40 text-muted-foreground">
              {columns.map((column) => (
                <th key={String(column.key)} className="px-3 py-2 font-medium">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  className="px-3 py-8 text-center text-muted-foreground"
                  colSpan={columns.length}
                >
                  {emptyText}
                </td>
              </tr>
            ) : null}
            {rows.map((row) => {
              const isSelected = row.id === selectedRowId;

              return (
                <tr
                  key={row.id}
                  aria-selected={isSelected}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/50",
                    isSelected && "bg-muted",
                  )}
                  onClick={() => setSelectedRowId(row.id)}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="whitespace-nowrap px-3 py-2 text-foreground/80"
                    >
                      {column.render?.(row) ?? String(row[column.key])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DataTablePanel;
