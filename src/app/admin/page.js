"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import AdminDataTable from "../components/AdminDataTable";

/**
 * Converts a camelCase or snake_case string to a human-readable format.
 * Examples: "helloWorld" -> "Hello world", "hello_world" -> "Hello world"
 *
 * @param {string} str The input string.
 * @returns {string} The human-readable string.
 */
function toHumanReadable(str) {
  if (!str) {
    return "";
  }

  // 1. Handle snake_case and kebab-case: replace underscores/hyphens with spaces
  let result = str.replace(/[_ inquiries-]+/g, " ");

  // 2. Handle camelCase: add a space before capital letters
  result = result.replace(/([a-z])([A-Z])/g, "$1 $2");

  // 3. Capitalize the first letter of the entire string and ensure the rest is lowercase
  result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();

  // Optional: Capitalize the first letter of every word (Title Case)
  result = result
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return result;
}

// TODO: globalize this func
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

const TABLES_NAMES = {
  users: "Users",
  v_product_catalog: "Product Catalog",
  discount_codes: "Discount Codes",
  products: "Products",
  orders: "Orders",
  tags: "Tags",
};

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
    console.error("Schema fetch error:", err);
  }
}

async function getTablesData(sqlTablesNames, oldData, setData) {
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
    const data = await response.json();
    const newData = { ...oldData }; // need to do this so refresh button can replace a specific table's data
    for (const [tableName, records] of Object.entries(data)) {
      newData[tableName] = records;
    }
    setData(newData);
  } catch (err) {
    console.error("Data fetch error:", err);
    setData(
      Object.fromEntries(
        sqlTablesNames.map((tableName) => [tableName, "ERROR"]),
      ),
    );
  }
}

export default function Admin() {
  const [schema, setSchema] = useState({});
  const [data, setData] = useState({});
  useEffect(() => {
    // fetches tables' schemas on startup
    getTablesSchemas(Object.keys(TABLES_NAMES), setSchema);
  }, []);
  useEffect(() => {
    getTablesData(Object.keys(TABLES_NAMES), data, setData);
  }, [schema]);

  return (
    <div>
      <Navbar />

      <main className="m-5">
        {Object.keys(schema).length > 0 ? (
          Object.entries(schema).map(([tableName, tableColumns]) => {
            return (
              <div key={tableName}>
                <div className="float-end">
                  <Button text="Reload" size={0} />
                  &nbsp;
                  <Button text="+" size={0} />
                </div>
                <h2 className="text-xl font-bold mb-3 ms-4">
                  {TABLES_NAMES[tableName]}
                </h2>
                <AdminDataTable
                  data={data[tableName] ?? "LOADING"}
                  columns={tableColumns.map(
                    ({ sqlName, humanReadableName, sqlType }) => {
                      return {
                        accessorKey: sqlName,
                        header: humanReadableName,
                      };
                    },
                  )}
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
