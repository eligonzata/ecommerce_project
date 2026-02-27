"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import AdminDataTable from "../components/AdminDataTable";

import { faker } from "@faker-js/faker";

// USERS
const tableUsersData = Array.from({ length: 50 }, (e, i) => ({
  id: i,
  name: faker.person.fullName(),
  email: faker.internet.email(),
  joinDate: faker.date.anytime(),
}));
const tableUsersColumns = [
  { accessorKey: "id", header: "User ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "joinDate", header: "Join Date" },
];

// INVENTORY
const tableInventoryData = Array.from({ length: 100 }, (e, i) => ({
  id: i,
  sku: faker.string.alphanumeric(8).toUpperCase(),
  productName: faker.commerce.productName(),
  category: faker.commerce.department(),
  price: faker.number.float({ min: 5, max: 500, precision: 0.01 }),
  stock: faker.number.int({ min: 0, max: 1000 }),
  supplier: faker.company.name(),
  lastRestocked: faker.date.recent({ days: 60 }),
}));
const tableInventoryColumns = [
  { accessorKey: "id", header: "Inventory ID" },
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "productName", header: "Product Name" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "price", header: "Price ($)" },
  { accessorKey: "stock", header: "Stock Qty" },
  { accessorKey: "supplier", header: "Supplier" },
  { accessorKey: "lastRestocked", header: "Last Restocked" },
];

// ORDERS
const tableOrdersData = Array.from({ length: 200 }, (e, i) => {
  const user = faker.helpers.arrayElement(tableUsersData);

  return {
    id: i,
    orderNumber: `ORD-${faker.string.numeric(6)}`,
    userId: user.id,
    customerName: user.name,
    totalAmount: faker.number.float({ min: 20, max: 2000, precision: 0.01 }),
    status: faker.helpers.arrayElement([
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ]),
    orderDate: faker.date.recent({ days: 90 }),
    shippingAddress: faker.location.streetAddress(),
  };
});
const tableOrdersColumns = [
  { accessorKey: "id", header: "Order ID" },
  { accessorKey: "orderNumber", header: "Order #" },
  { accessorKey: "userId", header: "User ID" },
  { accessorKey: "customerName", header: "Customer" },
  { accessorKey: "totalAmount", header: "Total ($)" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "orderDate", header: "Order Date" },
  { accessorKey: "shippingAddress", header: "Shipping Address" },
];

export default function Admin() {
  const usersTable = () => {};
  return (
    <div>
      <Navbar />

      <main className="m-5">
        <div className="float-end">
          <Button text="+" size={0} />
        </div>
        <h2 className="text-xl font-bold mb-3 ms-4">User Accounts</h2>
        <AdminDataTable data={tableUsersData} columns={tableUsersColumns} />

        <div className="h-5"></div>

        <div className="float-end">
          <Button text="+" size={0} />
        </div>
        <h2 className="text-xl font-bold mb-3 ms-4">Inventory</h2>
        <AdminDataTable
          data={tableInventoryData}
          columns={tableInventoryColumns}
        />

        <div className="h-5"></div>

        <div className="float-end">
          <Button text="+" size={0} />
        </div>
        <h2 className="text-xl font-bold mb-3 ms-4">Orders</h2>
        <AdminDataTable data={tableOrdersData} columns={tableOrdersColumns} />
      </main>

      <Footer />
    </div>
  );
}
