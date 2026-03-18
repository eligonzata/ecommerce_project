import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import Button from "./Button";

export default function AdminDataTable({
  data,
  columns,
  rowStyles,
  deleteHandler,
  editHandler,
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const idColName = columns[0].accessorKey;

  return (
    <div className="rounded-lg border w-full shadow-md overflow-auto max-h-[50vh]">
      {Array.isArray(data) ? (
        <table className="w-full border-separate border-spacing-0">
          <thead className="bg-amber-100 sticky top-0">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} className="border-b text-start py-2 px-4">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
                <th className="border-b"></th>
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => {
              const rowId = row.getValue(idColName);
              const tdClassName = `py-2 px-4 ${index == 0 ? "" : "border-t"} ${rowStyles[rowId] === "DELETING" ? "text-red-500 text-bold line-through" : ""} ${rowStyles[rowId] === "NEW" ? "text-blue-500 text-bold bg-blue-100" : ""}`;
              return (
                <tr key={rowId}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={tdClassName}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                  <td className={tdClassName + " text-end"}>
                    <Button text="Edit" size={0} hasBg={false} />
                    <Button
                      text="Delete"
                      size={0}
                      hasBg={false}
                      onClick={() => {
                        deleteHandler(rowId); // WARNING : assumes 1st column is SQL table's primary key
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : data === "LOADING" ? (
        <div className="p-4">Loading…</div>
      ) : (
        <div className="p-4 text-red-500">
          <strong>Error loading data.</strong>
        </div>
      )}
    </div>
  );
}
