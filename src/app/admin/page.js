"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import AdminDataTable from "../components/AdminDataTable";

const data = [
  { id: 1, name: "Ada" },
  { id: 2, name: "John" },
];
const columns = [
  { accessorKey: "id", header: "User ID" },
  { accessorKey: "name", header: "Name" },
];

export default function Admin() {
  const usersTable = () => {};
  return (
    <div>
      <Navbar />

      <main className="m-5">
        <div class="float-end">
          <Button text="+" size={0} />
        </div>
        <h2 className="text-xl font-bold mb-3 ms-4">User Accounts</h2>
        <AdminDataTable data={data} columns={columns} />

        <div class="h-5"></div>

        <div class="float-end">
          <Button text="+" size={0} />
        </div>
        <h2 className="text-xl font-bold mb-3 ms-4">Inventory</h2>
        <AdminDataTable data={data} columns={columns} />

        <div class="h-5"></div>

        <div class="float-end">
          <Button text="+" size={0} />
        </div>
        <h2 className="text-xl font-bold mb-3 ms-4">Orders</h2>
        <AdminDataTable data={data} columns={columns} />
      </main>

      <Footer />
    </div>
  );
}
