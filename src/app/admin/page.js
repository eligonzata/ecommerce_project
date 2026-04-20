"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import AdminDataTable from "../components/AdminDataTable";
import AdminCreateModal from "../components/AdminCreateModal";

/**
 * Converts a camelCase or snake_case string to a human-readable format.
 */
function toHumanReadable(str) {
  if (!str) {
    return "";
  }
  let result = str.replace(/[_-]+/g, " ");
  result = result.replace(/([a-z])([A-Z])/g, "$1 $2");
  result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
  result = result
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  return result;
}

function urlGetParams(path, params) {
  let url;
  try {
    url = new URL(path);
  } catch (e) {
    if (!(e instanceof TypeError)) throw new Error("urlGetParams: Invalid URL");
    url = new URL(path, window.location.origin);
  }
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

/** Must match ecommerce_backend/admin.py ADMIN_DASHBOARD_ALLOWED_TABLES */
const TABLES_NAMES = {
  users: "Users",
  discount_codes: "Discount Codes",
  products: "Products",
  orders: "Orders",
  tags: "Tags",
};

const ORDERS_SORT_DEFAULT = "default";
const DEFAULT_PRODUCT_IMAGE_PATH = "/img/logo.png";

/** Column order when sorted API returns no rows (matches v_admin_orders). */
const ORDERS_VIEW_COLUMNS_FALLBACK = [
  "order_id",
  "order_date",
  "user_id",
  "customer_name",
  "email",
  "subtotal",
  "tax_amount",
  "discount_amount",
  "total_amount",
  "order_status",
  "payment_status",
  "payment_method",
];

function ordersSortToQuery(sortKey) {
  switch (sortKey) {
    case "date_desc":
      return { sort_by: "date", order: "DESC" };
    case "date_asc":
      return { sort_by: "date", order: "ASC" };
    case "customer":
      return { sort_by: "customer", order: "DESC" };
    case "amount_desc":
      return { sort_by: "amount", order: "DESC" };
    case "amount_asc":
      return { sort_by: "amount", order: "ASC" };
    default:
      return { sort_by: "date", order: "DESC" };
  }
}

async function fetchOrdersSortedRows(sortKey) {
  const q = ordersSortToQuery(sortKey);
  const res = await fetch(urlGetParams("/api/admin/orders", q));
  if (!res.ok) throw new Error("Failed to fetch sorted orders");
  return res.json();
}

function buildOrderViewColumnSpecs(schemaOrderCols, sampleRow) {
  const keys =
    sampleRow && typeof sampleRow === "object"
      ? Object.keys(sampleRow)
      : ORDERS_VIEW_COLUMNS_FALLBACK;
  const byName = Object.fromEntries(
    (schemaOrderCols || []).map((c) => [c.sqlName, c]),
  );
  return keys.map((sqlName) => {
    const fromSchema = byName[sqlName];
    const readOnly = sqlName === "customer_name" || sqlName === "email";
    return {
      accessorKey: sqlName,
      header: toHumanReadable(sqlName),
      meta: {
        sqlType: fromSchema?.sqlType || "varchar",
        columnKey:
          fromSchema?.columnKey || (sqlName === "order_id" ? "PRI" : ""),
        isNullable: fromSchema?.isNullable ?? true,
        readOnly,
      },
    };
  });
}

function primaryKeyFromColumns(tableColumns) {
  const pk = tableColumns.find((c) => c.columnKey === "PRI");
  return pk?.sqlName ?? tableColumns[0]?.sqlName;
}

function columnsForTableDisplay(tableName, tableColumns) {
  return tableColumns.filter(
    (c) => !(tableName === "users" && c.sqlName === "password"),
  );
}

function coerceValueForApi(raw, sqlType, sqlName, isNullable) {
  if (raw === null) return null;
  const t = (sqlType || "").toLowerCase();

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed === "") {
      if (isNullable) return null;
      throw new Error("Value cannot be empty");
    }

    if (["int", "bigint", "smallint", "mediumint", "integer"].includes(t)) {
      const n = parseInt(trimmed, 10);
      if (Number.isNaN(n)) throw new Error("Invalid integer");
      return n;
    }
    if (["decimal", "numeric", "float", "double"].includes(t)) {
      const n = parseFloat(trimmed);
      if (Number.isNaN(n)) throw new Error("Invalid number");
      return n;
    }
    if (t === "tinyint" && ["is_active", "is_on_sale"].includes(sqlName)) {
      const low = trimmed.toLowerCase();
      if (low === "true" || low === "1") return 1;
      if (low === "false" || low === "0") return 0;
      throw new Error("Use true or false (or 1 / 0)");
    }
    if (["datetime", "timestamp", "date"].includes(t)) {
      return trimmed;
    }
    return raw;
  }
  return raw;
}

function isValidImageUrl(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

async function getTablesSchemas(sqlTablesNames, setSchema) {
  try {
    const response = await fetch(
      urlGetParams("/api/schemas", { tables: sqlTablesNames.join(",") }),
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch tables' schemas");
    const schemas = await response.json();
    for (const tableName of Object.keys(schemas)) {
      for (const columnInfo of schemas[tableName]) {
        columnInfo.humanReadableName = toHumanReadable(columnInfo.sqlName);
      }
    }
    setSchema(schemas);
  } catch (err) {
    console.error("Schema fetch error: ", err);
  }
}

async function getTablesData(
  sqlTablesNames,
  setData,
  setRowStyles,
  doClearBeforeReceiveData = false,
) {
  if (doClearBeforeReceiveData) {
    setData((prev) => {
      const cleared = { ...prev };
      for (const tableName of sqlTablesNames) {
        delete cleared[tableName];
      }
      return cleared;
    });
    for (const tableName of sqlTablesNames) {
      setRowStyles((prev) => ({ ...prev, [tableName]: undefined }));
    }
  }

  try {
    const response = await fetch(
      urlGetParams("/api/multi-table-data", {
        tables: sqlTablesNames.join(","),
      }),
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch tables' data");
    const payload = await response.json();
    setData((prev) => {
      const next = { ...prev };
      for (const [tableName, records] of Object.entries(payload)) {
        next[tableName] = records;
      }
      return next;
    });
    for (const tableName of sqlTablesNames) {
      setRowStyles((prev) => ({ ...prev, [tableName]: undefined }));
    }
  } catch (err) {
    console.error("Data fetch error: ", err);
    setData((prev) => {
      const next = { ...prev };
      for (const tableName of sqlTablesNames) {
        next[tableName] = "ERROR";
      }
      return next;
    });
  }
}

export default function Admin() {
  const [schema, setSchema] = useState({});
  const [data, setData] = useState({});
  const [rowStyles, setRowStyles] = useState({});
  const [createModalTable, setCreateModalTable] = useState(null);
  const [ordersSort, setOrdersSort] = useState(ORDERS_SORT_DEFAULT);
  const [ordersViewData, setOrdersViewData] = useState(null);
  const [ordersSortLoading, setOrdersSortLoading] = useState(false);

  useEffect(() => {
    getTablesSchemas(Object.keys(TABLES_NAMES), setSchema);
  }, []);

  useEffect(() => {
    if (Object.keys(schema).length === 0) return;

    getTablesData(Object.keys(TABLES_NAMES), setData, setRowStyles);
  }, [schema]);

  useEffect(() => {
    if (ordersSort === ORDERS_SORT_DEFAULT) {
      setOrdersViewData(null);
      setOrdersSortLoading(false);
      return;
    }

    let cancelled = false;
    setOrdersSortLoading(true);
    (async () => {
      try {
        const rows = await fetchOrdersSortedRows(ordersSort);
        if (!cancelled) setOrdersViewData(rows);
      } catch (err) {
        console.error(err);
        if (!cancelled) setOrdersViewData([]);
      } finally {
        if (!cancelled) setOrdersSortLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ordersSort]);

  const handleCellSave = useCallback(
    async (tableName, rowId, columnKey, _oldValue, newRaw) => {
      const tableColumns = schema[tableName];
      if (!tableColumns) return;
      const colMeta = tableColumns.find((c) => c.sqlName === columnKey);
      if (!colMeta) return;

      let coerced;
      try {
        coerced = coerceValueForApi(
          newRaw,
          colMeta.sqlType,
          columnKey,
          colMeta.isNullable,
        );
      } catch (e) {
        window.alert(e.message || "Invalid value");
        return;
      }

      const id = typeof rowId === "number" ? rowId : parseInt(rowId, 10);
      if (Number.isNaN(id)) {
        window.alert("Invalid row id");
        return;
      }

      try {
        const response = await fetch(
          `/api/admin/table/${tableName}/row/${id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [columnKey]: coerced }),
          },
        );
        if (!response.ok) {
          const j = await response.json().catch(() => ({}));
          window.alert(j.error || "Update failed");
          return;
        }
        await getTablesData([tableName], setData, setRowStyles);
        if (tableName === "orders" && ordersSort !== ORDERS_SORT_DEFAULT) {
          try {
            const rows = await fetchOrdersSortedRows(ordersSort);
            setOrdersViewData(rows);
          } catch (e) {
            console.error(e);
          }
        }
      } catch (err) {
        console.error(err);
        window.alert("Update failed");
      }
    },
    [schema, ordersSort],
  );

  const handleDelete = useCallback(
    async (tableName, rowId) => {
      if (
        !window.confirm(
          "Delete this row permanently? This may fail if other records reference it.",
        )
      ) {
        return;
      }
      const id = typeof rowId === "number" ? rowId : parseInt(rowId, 10);
      if (Number.isNaN(id)) {
        window.alert("Invalid row id");
        return;
      }

      setRowStyles((prev) => ({
        ...prev,
        [tableName]: { ...prev[tableName], [id]: "DELETING" },
      }));

      try {
        const response = await fetch(
          `/api/admin/table/${tableName}/row/${id}`,
          { method: "DELETE" },
        );
        if (!response.ok) {
          const j = await response.json().catch(() => ({}));
          window.alert(j.error || "Delete failed");
          setRowStyles((prev) => ({
            ...prev,
            [tableName]: { ...prev[tableName], [id]: undefined },
          }));
          return;
        }
        await getTablesData([tableName], setData, setRowStyles);
        if (tableName === "orders" && ordersSort !== ORDERS_SORT_DEFAULT) {
          try {
            const rows = await fetchOrdersSortedRows(ordersSort);
            setOrdersViewData(rows);
          } catch (e) {
            console.error(e);
          }
        }
      } catch (err) {
        console.error(err);
        window.alert("Delete failed");
        setRowStyles((prev) => ({
          ...prev,
          [tableName]: { ...prev[tableName], [id]: undefined },
        }));
      }
    },
    [ordersSort],
  );

  const handleCreateSubmit = useCallback(
    async (payload) => {
      if (!createModalTable) return;
      const tableName = createModalTable;
      const nextPayload = { ...payload };
      if (
        tableName === "products" &&
        !isValidImageUrl(nextPayload.image_url)
      ) {
        nextPayload.image_url = DEFAULT_PRODUCT_IMAGE_PATH;
      }
      try {
        const response = await fetch(`/api/admin/table/${tableName}/row`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextPayload),
        });
        const j = await response.json().catch(() => ({}));
        if (!response.ok) {
          window.alert(j.error || "Create failed");
          return;
        }
        setCreateModalTable(null);
        const newId = j.id;
        await getTablesData([tableName], setData, setRowStyles);
        if (tableName === "orders" && ordersSort !== ORDERS_SORT_DEFAULT) {
          try {
            const rows = await fetchOrdersSortedRows(ordersSort);
            setOrdersViewData(rows);
          } catch (e) {
            console.error(e);
          }
        }
        if (newId != null) {
          setRowStyles((prev) => ({
            ...prev,
            [tableName]: { ...prev[tableName], [newId]: "NEW" },
          }));
        }
      } catch (err) {
        console.error(err);
        window.alert("Create failed");
      }
    },
    [createModalTable, ordersSort],
  );

  return (
    <div>
      <Navbar />

      <AdminCreateModal
        open={!!createModalTable}
        tableName={createModalTable || ""}
        tableLabel={createModalTable ? TABLES_NAMES[createModalTable] : ""}
        columns={createModalTable ? schema[createModalTable] : []}
        onClose={() => setCreateModalTable(null)}
        onSubmit={handleCreateSubmit}
      />

      <main className="m-5">
        {Object.keys(schema).length > 0 ? (
          Object.entries(schema).map(([tableName, tableColumns]) => {
            const pk = primaryKeyFromColumns(tableColumns);
            const visible = columnsForTableDisplay(tableName, tableColumns);
            const defaultColumnSpecs = visible.map((c) => ({
              accessorKey: c.sqlName,
              header: c.humanReadableName,
              meta: {
                sqlType: c.sqlType,
                columnKey: c.columnKey,
                isNullable: c.isNullable,
              },
            }));

            const useSortedOrders =
              tableName === "orders" && ordersSort !== ORDERS_SORT_DEFAULT;
            const columnSpecs = useSortedOrders
              ? buildOrderViewColumnSpecs(
                  schema.orders,
                  ordersViewData?.[0] ?? null,
                )
              : defaultColumnSpecs;
            const tableData =
              tableName === "orders" && useSortedOrders
                ? ordersSortLoading
                  ? "LOADING"
                  : Array.isArray(ordersViewData)
                    ? ordersViewData
                    : []
                : data[tableName] ?? "LOADING";

            return (
              <div key={tableName}>
                <div className="float-end">
                  <Button
                    text="Reload"
                    size={0}
                    onClick={() => {
                      if (
                        tableName === "orders" &&
                        ordersSort !== ORDERS_SORT_DEFAULT
                      ) {
                        setOrdersSortLoading(true);
                        fetchOrdersSortedRows(ordersSort)
                          .then((rows) => setOrdersViewData(rows))
                          .catch((err) => {
                            console.error(err);
                            setOrdersViewData([]);
                          })
                          .finally(() => setOrdersSortLoading(false));
                      } else {
                        getTablesData(
                          [tableName],
                          setData,
                          setRowStyles,
                          true,
                        );
                      }
                    }}
                  />
                  &nbsp;
                  <Button
                    text="+"
                    size={0}
                    onClick={() => setCreateModalTable(tableName)}
                  />
                </div>
                <h2 className="mb-3 ms-4 text-xl font-bold">
                  {TABLES_NAMES[tableName] ?? tableName}
                </h2>
                {tableName === "orders" ? (
                  <div className="mb-3 ms-4 flex flex-wrap items-center gap-2">
                    <label
                      htmlFor="admin-orders-sort"
                      className="text-sm font-medium text-neutral-700"
                    >
                      Sort orders by
                    </label>
                    <select
                      id="admin-orders-sort"
                      className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm shadow-sm"
                      value={ordersSort}
                      onChange={(e) => setOrdersSort(e.target.value)}
                    >
                      <option value={ORDERS_SORT_DEFAULT}>
                        Default
                      </option>
                      <option value="date_desc">
                        Order date — newest first
                      </option>
                      <option value="date_asc">
                        Order date — oldest first
                      </option>
                      <option value="customer">Customer name (A–Z)</option>
                      <option value="amount_desc">
                        Order total — high to low
                      </option>
                      <option value="amount_asc">
                        Order total — low to high
                      </option>
                    </select>
                  </div>
                ) : null}
                <AdminDataTable
                  data={tableData}
                  columnSpecs={columnSpecs}
                  primaryKeyColumn={pk}
                  rowStyles={rowStyles[tableName] ?? {}}
                  onCellSave={(rowId, columnKey, oldV, newV) =>
                    handleCellSave(tableName, rowId, columnKey, oldV, newV)
                  }
                  deleteHandler={(id) => handleDelete(tableName, id)}
                />

                <div className="h-5"></div>
              </div>
            );
          })
        ) : (
          <div>Loading…</div>
        )}
      </main>

      <Footer />
    </div>
  );
}
