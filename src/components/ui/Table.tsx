import React from "react";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  mobileRenderer?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T extends { id: string | number }>({
  data,
  columns,
  mobileRenderer,
  emptyMessage = "No data found",
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`group transition-colors ${
                      onRowClick 
                      ? 'cursor-pointer hover:bg-sky-50 dark:hover:bg-sky-900/20' 
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {columns.map((col, index) => (
                    <td key={index} className={`px-6 py-4 ${col.className ?? ""}`}>
                      {col.cell
                        ? col.cell(item)
                        : col.accessorKey
                        ? String(item[col.accessorKey])
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {data.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">{emptyMessage}</div>
        ) : (
          data.map((item) => (
            <div 
                key={item.id} 
                className={`p-4 transition-colors ${
                    onRowClick 
                    ? 'cursor-pointer active:bg-sky-50 dark:active:bg-sky-900/20' 
                    : ''
                }`}
                onClick={() => onRowClick && onRowClick(item)}
            >
              {mobileRenderer ? (
                mobileRenderer(item)
              ) : (
                <div className="space-y-2">
                  {columns.map((col, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase">{col.header}</span>
                      <div className="text-sm text-slate-900 dark:text-white text-right">
                        {col.cell
                          ? col.cell(item)
                          : col.accessorKey
                          ? String(item[col.accessorKey])
                          : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
