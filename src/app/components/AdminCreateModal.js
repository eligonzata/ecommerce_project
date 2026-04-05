"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "./Button";

function isAutoIncrement(col) {
  return (col.extra || "").toLowerCase().includes("auto_increment");
}

function fieldWidgetType(col) {
  if (col.sqlName === "password") return "password";
  const t = (col.sqlType || "").toLowerCase();
  if (["int", "bigint", "smallint", "mediumint", "integer"].includes(t))
    return "number";
  if (["decimal", "numeric", "float", "double"].includes(t)) return "number";
  if (t === "date") return "date";
  if (["datetime", "timestamp"].includes(t)) return "datetime-local";
  if (
    t === "tinyint" &&
    ["is_active", "is_on_sale"].includes(col.sqlName)
  ) {
    return "checkbox";
  }
  return "text";
}

export default function AdminCreateModal({
  open,
  tableName,
  tableLabel,
  columns,
  onClose,
  onSubmit,
}) {
  const fields = useMemo(() => {
    if (!columns?.length) return [];
    return columns.filter((c) => !(c.columnKey === "PRI" && isAutoIncrement(c)));
  }, [columns]);

  const [values, setValues] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const init = {};
    for (const col of fields) {
      const w = fieldWidgetType(col);
      init[col.sqlName] = w === "checkbox" ? false : "";
    }
    setValues(init);
    setError("");
  }, [open, fields]);

  if (!open) return null;

  const setField = (name, v) => {
    setValues((prev) => ({ ...prev, [name]: v }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const payload = {};
    for (const col of fields) {
      const w = fieldWidgetType(col);
      const raw = values[col.sqlName];
      if (w === "checkbox") {
        payload[col.sqlName] = raw ? 1 : 0;
        continue;
      }
      if (raw === "" || raw === undefined || raw === null) {
        if (!col.isNullable) {
          setError(`"${col.humanReadableName || col.sqlName}" is required.`);
          return;
        }
        continue;
      }
      if (w === "number") {
        const n = Number(raw);
        if (Number.isNaN(n)) {
          setError(`Invalid number for ${col.humanReadableName || col.sqlName}.`);
          return;
        }
        payload[col.sqlName] = n;
        continue;
      }
      payload[col.sqlName] = raw;
    }
    onSubmit(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-create-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-amber-200 bg-[#fffaf3] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="admin-create-title" className="mb-4 text-lg font-bold text-neutral-900">
          New row — {tableLabel || tableName}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {fields.map((col) => {
            const w = fieldWidgetType(col);
            const id = `create-${tableName}-${col.sqlName}`;
            return (
              <div key={col.sqlName}>
                <label
                  htmlFor={id}
                  className="mb-1 block text-sm font-medium text-neutral-700"
                >
                  {col.humanReadableName || col.sqlName}
                  <span className="ml-1 text-xs font-normal text-neutral-500">
                    ({col.sqlType}
                    {col.isNullable ? ", optional" : ""})
                  </span>
                </label>
                {w === "checkbox" ? (
                  <input
                    id={id}
                    type="checkbox"
                    className="h-4 w-4 rounded border-amber-300"
                    checked={!!values[col.sqlName]}
                    onChange={(e) => setField(col.sqlName, e.target.checked)}
                  />
                ) : (
                  <input
                    id={id}
                    type={w}
                    className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
                    value={values[col.sqlName] ?? ""}
                    onChange={(e) => setField(col.sqlName, e.target.value)}
                    autoComplete={col.sqlName === "password" ? "new-password" : "off"}
                  />
                )}
              </div>
            );
          })}
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2 pt-4">
            <Button text="Cancel" size={0} hasBg={false} onClick={onClose} />
            <Button text="Create" size={0} type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
}
