import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PublicDataTableColumn<Row> = {
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  align?: "left" | "right";
  className?: string;
  numeric?: boolean;
};

type PublicDataTableProps<Row> = {
  columns: readonly PublicDataTableColumn<Row>[];
  rows: readonly Row[];
  rowKey: (row: Row) => string | number;
  rowClassName?: (row: Row) => string | undefined;
};

export function PublicDataTable<Row>({
  columns,
  rows,
  rowKey,
  rowClassName,
}: PublicDataTableProps<Row>) {
  return (
    <div data-slot="public-data-table" className="site-table-shell">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm text-zinc-300">
          <thead className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 font-medium",
                    column.align === "right" ? "text-right" : "text-left",
                    column.numeric && "site-tabular",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {rows.map((row) => (
              <tr key={rowKey(row)} className={cn("bg-transparent", rowClassName?.(row))}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-4 py-3 align-top",
                      column.align === "right" ? "text-right" : "text-left",
                      column.numeric && "site-tabular",
                      column.className,
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
