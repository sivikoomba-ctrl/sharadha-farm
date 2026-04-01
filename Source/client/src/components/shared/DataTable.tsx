import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  rowClassName?: (row: T) => string;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  rowClassName,
}: DataTableProps<T>) {
  if (loading) return <LoadingSpinner />;
  if (data.length === 0) return <EmptyState message="No records found." />;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.accessor)}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((row) => (
            <tr key={row.id} className={rowClassName?.(row) ?? ''}>
              {columns.map((col) => (
                <td key={String(col.accessor)} className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                  {col.cell ? col.cell(row) : String((row as Record<string, unknown>)[col.accessor as string] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
