"use client";

import { useMemo, useRef, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function formatDisplay(v) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}

function EditableCell({ value, rowId, columnId, meta, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const confirmLockRef = useRef(false);

  const isPk = meta?.columnKey === "PRI";
  const readOnly = meta?.readOnly;

  const startEdit = () => {
    if (isPk || readOnly) return;
    setDraft(value === null || value === undefined ? "" : String(value));
    setEditing(true);
  };

  const cancel = () => {
    if (confirmLockRef.current) return;
    setEditing(false);
  };

  const commit = () => {
    const oldStr = value === null || value === undefined ? "" : String(value);
    if (draft === oldStr) {
      setEditing(false);
      return;
    }
    confirmLockRef.current = true;
    const ok = window.confirm(
      `Apply change to "${columnId}"?\n\nNew value: ${draft === "" ? "(empty)" : draft}`,
    );
    confirmLockRef.current = false;
    if (!ok) return;
    const newVal = draft === "" && meta?.isNullable ? null : draft;
    onSave(rowId, columnId, value, newVal);
    setEditing(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  if (isPk || readOnly) {
    return (
      <span
        className={
          isPk
            ? "font-medium text-neutral-700 tabular-nums"
            : "text-neutral-700"
        }
      >
        {formatDisplay(value)}
      </span>
    );
  }

  if (editing) {
    return (
      <input
        className="w-full min-w-[8rem] rounded border border-amber-400 bg-white px-2 py-1 text-sm text-neutral-900"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={cancel}
        autoFocus
      />
    );
  }

  return (
    <button
      type="button"
      className="w-full cursor-pointer rounded px-1 text-left text-neutral-800 hover:bg-amber-50/80 focus:outline-none focus:ring-2 focus:ring-amber-300"
      onClick={startEdit}
    >
      {formatDisplay(value)}
    </button>
  );
}

export default function AdminDataTable({
  data,
  columnSpecs,
  primaryKeyColumn,
  rowStyles,
  onCellSave,
  deleteHandler,
}) {
  const columns = useMemo(
    () =>
      columnSpecs.map((spec) => ({
        accessorKey: spec.accessorKey,
        header: spec.header,
        meta: spec.meta,
        cell: ({ row, column, getValue }) => (
          <EditableCell
            value={getValue()}
            rowId={row.original[primaryKeyColumn]}
            columnId={spec.accessorKey}
            meta={column.columnDef.meta}
            onSave={onCellSave}
          />
        ),
      })),
    [columnSpecs, primaryKeyColumn, onCellSave],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="max-h-[50vh] w-full overflow-auto rounded-lg border shadow-md">
      {Array.isArray(data) ? (
        <table className="w-full border-separate border-spacing-0">
          <thead className="sticky top-0 bg-amber-100">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} className="border-b px-4 py-2 text-start">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
                <th className="w-12 border-b px-2 py-2 text-end" aria-label="Actions" />
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => {
              const rowId = row.original[primaryKeyColumn];
              const tdClassName = `py-2 px-4 ${index === 0 ? "" : "border-t border-neutral-200"} ${
                rowStyles[rowId] === "DELETING"
                  ? "text-red-500 font-semibold line-through"
                  : ""
              } ${
                rowStyles[rowId] === "NEW"
                  ? "bg-blue-100 font-semibold text-blue-700"
                  : ""
              }`;
              return (
                <tr key={String(rowId)}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={tdClassName}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                  <td className={`${tdClassName} px-2 text-end align-middle`}>
                    <button
                      type="button"
                      className="inline-flex rounded p-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                      aria-label="Delete row"
                      onClick={() => deleteHandler(rowId)}
                    >
                      <TrashIcon />
                    </button>
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
