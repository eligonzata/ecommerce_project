"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import AdminDataTable from "../components/AdminDataTable";

//
const API_ORIGIN = "https://localhost:5001"; // TODO: don't hardcode
//

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

const TABLES_NAMES = {
  users: "Users",
  v_product_catalog: "Catalog",
  discount_codes: "Discount Codes",
  products: "Products",
};

async function getTablesSchemas(sql_tables_names) {}

async function getTablesData(sql_tables_names) {}

export default function Admin() {
  const [schema, setSchema] = useState({});
  const [data, setData] = useState({});
  useEffect(() => {
    // fetches tables' schemas on startup
    getTablesSchemas(Object.keys(TABLES_NAMES));
  }, []);
  useEffect(() => {
    getTablesData(Object.keys(TABLES_NAMES));
  }, [schema]);

  return (
    <div>
      <Navbar />

      <main className="m-5">
        {Object.entries(schema).map(([table_name, table_columns]) => {
          return (
            <>
              <div className="float-end">
                <Button text="Refresh" size={0} />
                <Button text="+" size={0} />
              </div>
              <h2 className="text-xl font-bold mb-3 ms-4">
                {TABLES_NAMES[table_name]}
              </h2>
              <AdminDataTable
                data={data[table_name] ?? "LOADING"}
                columns={table_columns.map(
                  ({ sqlName, humanReadableName, sqlType }) => {
                    return { accessorKey: sqlName, header: humanReadableName };
                  },
                )}
              />

              <div className="h-5"></div>
            </>
          );
        })}
      </main>

      <Footer />
    </div>
  );
}
