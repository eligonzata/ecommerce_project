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
  let result = str.replace(/[_-]+/g, " ");

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
    console.error("Schema fetch error: ", err);
  }
}

function clearRowStyles(tableName, rowStyles, setRowStyles) {
  const newRowStyles = { ...rowStyles, [tableName]: undefined };
  setRowStyles(newRowStyles);
  return newRowStyles;
}

async function getTablesData(
  sqlTablesNames,
  oldData,
  setData,
  rowStyles,
  setRowStyles,
  doClearBeforeReceiveData = false,
) {
  if (doClearBeforeReceiveData) {
    const clearedData = { ...oldData };
    for (const tableName of Object.keys(clearedData)) {
      if (sqlTablesNames.includes(tableName)) {
        // shows loading state when user clicks [reload]
        delete clearedData[tableName];
      }
    }
    setData(clearedData);
    for (const tableName of sqlTablesNames) {
      rowStyles = clearRowStyles(tableName, rowStyles, setRowStyles);
    }
    oldData = clearedData;
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
    const data = await response.json();
    const newData = { ...oldData }; // need to do this so refresh button can replace a specific table's data
    for (const [tableName, records] of Object.entries(data)) {
      newData[tableName] = records;
      rowStyles = clearRowStyles(tableName, rowStyles, setRowStyles);
    }
    setData(newData);
  } catch (err) {
    console.error("Data fetch error: ", err);
    setData(
      Object.fromEntries(
        sqlTablesNames.map((tableName) => [tableName, "ERROR"]),
      ),
    );
  }
}

function typeOfColumn(oneTableSchema, colSqlName) {
  for (const { sqlName, humanReadableName, sqlType } of oneTableSchema) {
    if (sqlName === colSqlName) return sqlType;
  }
  throw new Error("typeOfColumn : column not found");
}

async function createEntity(
  tableName,
  schema,
  data,
  setData,
  rowStyles,
  setRowStyles,
) {
  try {
    let whatToDoNext, userEnteredFields, newId;
    switch (tableName) {
      case "discount_codes":
        userEnteredFields = {
          code: undefined,
          description: undefined,
          discount_type: undefined,
          discount_value: undefined,
          min_purchase_amount: undefined,
          max_uses: undefined,
          end_date: undefined,
        };
        whatToDoNext = async () => {
          const response = await fetch("/api/admin/discounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userEnteredFields),
          });
          if (!response.ok) {
            throw new Error("Failed to create discount code in back end");
            /*throw new Error(
              `Failed to create discount code in back end: ${await response.text()}`,
            );*/
            // commented out because it can print python stack traces and expose private info
          }
          const responseJson = await response.json();
          newId = responseJson.discount_id;
        };
        break;

      default:
        throw new Error(
          `Operation not permitted. Cannot create entity in table '${tableName}'`,
        );
    }

    for (const paramName of Object.keys(userEnteredFields)) {
      // TODO: dialog box and entry data types
      userEnteredFields[paramName] = prompt(
        `Enter ${paramName} (${typeOfColumn(schema[tableName], paramName)})`,
      );
    }

    await whatToDoNext();

    await getTablesData([tableName], data, setData, rowStyles, setRowStyles);
    setRowStyles({
      ...rowStyles,
      [tableName]: { ...rowStyles[tableName], [newId]: "NEW" },
    });
  } catch (err) {
    console.error("Error creating item: ", err);
  }
}

async function deleteRow(
  tableName,
  id,
  rowStyles,
  setRowStyles,
  data,
  setData,
) {
  try {
    if (Number.isNaN(typeof id === Number ? id : parseInt(id))) {
      throw new Error("Invalid ID");
    }
    setRowStyles({
      ...rowStyles,
      [tableName]: { ...rowStyles[tableName], [id]: "DELETING" },
    });
    switch (tableName) {
      case "users":
        const response = await fetch("/api/users/" + id, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to delete in back end");
        getTablesData(["users"], data, setData, rowStyles, setRowStyles);
        break;

      default:
        throw new Error(
          `Operation not permitted. Cannot delete entity from table '${tableName}'`,
        );
    }
  } catch (err) {
    console.error("Error deleting row: ", err);
    setRowStyles({
      ...rowStyles,
      [tableName]: { ...rowStyles[tableName], [id]: undefined },
    });
  }
}

export default function Admin() {
  const [schema, setSchema] = useState({});
  const [data, setData] = useState({});
  const [rowStyles, setRowStyles] = useState({});
  useEffect(() => {
    // fetches tables' schemas on startup
    getTablesSchemas(Object.keys(TABLES_NAMES), setSchema);
  }, []);
  useEffect(() => {
    if (Object.keys(schema).length === 0) return;

    getTablesData(
      Object.keys(TABLES_NAMES),
      data,
      setData,
      rowStyles,
      setRowStyles,
    );
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
                  <Button
                    text="Reload"
                    size={0}
                    onClick={() => {
                      getTablesData(
                        [tableName],
                        data,
                        setData,
                        rowStyles,
                        setRowStyles,
                        true,
                      );
                    }}
                  />
                  &nbsp;
                  <Button
                    text="+"
                    size={0}
                    onClick={() => {
                      createEntity(
                        tableName,
                        schema,
                        data,
                        setData,
                        rowStyles,
                        setRowStyles,
                      );
                    }}
                  />
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
                  rowStyles={rowStyles[tableName] ?? {}}
                  editHandler={() => {}}
                  deleteHandler={(id) => {
                    deleteRow(
                      tableName,
                      id,
                      rowStyles,
                      setRowStyles,
                      data,
                      setData,
                    );
                  }}
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
