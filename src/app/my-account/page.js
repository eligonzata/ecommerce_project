"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SectionCard from "../components/SectionCard";

import { useAuth } from "../../context/AuthContext";
import Button from "../components/Button";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function MyAccountAndOrders() {
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user === null) {
      router.push("/sign-in");
    }
  }, [user]);

  const [openSection, setOpenSection] = useState("orders");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState({});

  useEffect(() => {
    if (!user?.id) return;
    fetchOrders();
  }, [user, sortBy, sortOrder]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      let data = await response.json();

      // Sort orders on the frontend based on selected sort option
      data.sort((a, b) => {
        if (sortBy === "date") {
          return sortOrder === "DESC"
            ? new Date(b.order_date) - new Date(a.order_date)
            : new Date(a.order_date) - new Date(b.order_date);
        } else if (sortBy === "amount") {
          return sortOrder === "DESC"
            ? b.total_amount - a.total_amount
            : a.total_amount - b.total_amount;
        }
        return 0;
      });

      setOrders(data);
    } catch (err) {
      setError("Could not load orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchOrderItems = async (orderId) => {
    if (orderItems[orderId]) {
      // already fetched, just toggle
      setExpandedOrder(expandedOrder === orderId ? null : orderId);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/items`);
      if (!response.ok) throw new Error("Failed to fetch order items");
      const items = await response.json();
      setOrderItems((prev) => ({ ...prev, [orderId]: items }));
      setExpandedOrder(orderId);
    } catch (err) {
      setError("Could not load order details.");
    }
  };

  const toggleSection = (sectionName) => {
    setOpenSection((prev) => (prev === sectionName ? "" : sectionName));
    setMessage("");
    setError("");
  };

  const statusColor = (status) => {
    switch (status) {
      case "delivered": return "text-green-600";
      case "shipped": return "text-blue-600";
      case "processing": return "text-yellow-600";
      case "cancelled": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#f7f2ec] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#641414]">
              {user ? `Welcome, ${user.name}` : "My Account"}
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your orders and account details.
            </p>
          </div>

          <div className="mb-6">
            {message && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                {message}
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}
          </div>

          {user !== undefined ? (
            <div className="flex flex-col gap-5">
              <SectionCard
                title="Orders"
                isOpen={openSection === "orders"}
                onToggle={() => toggleSection("orders")}
              >
                {/* Sort Controls */}
                <div className="flex flex-wrap gap-3 mb-4 mt-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="amount">Sort by Amount</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="DESC">Newest / Highest First</option>
                    <option value="ASC">Oldest / Lowest First</option>
                  </select>
                </div>

                {/* Orders List */}
                {ordersLoading ? (
                  <p className="text-gray-500 text-sm">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <p className="text-gray-500 text-sm">You have no orders yet.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {orders.map((order) => (
                      <div
                        key={order.order_id}
                        className="border border-gray-200 rounded-xl bg-white p-4"
                      >
                        {/* Order Summary Row */}
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-800">
                              Order #{order.order_id}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.order_date).toLocaleDateString()}
                            </p>
                            <p className={`text-sm font-medium capitalize ${statusColor(order.order_status)}`}>
                              {order.order_status}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-800">
                              ${parseFloat(order.total_amount).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400">
                              Tax: ${parseFloat(order.tax_amount).toFixed(2)}
                            </p>
                            {order.discount_amount > 0 && (
                              <p className="text-xs text-green-600">
                                Discount: -${parseFloat(order.discount_amount).toFixed(2)}
                              </p>
                            )}
                            <button
                              onClick={() => fetchOrderItems(order.order_id)}
                              className="text-xs text-[#641414] hover:underline mt-1"
                            >
                              {expandedOrder === order.order_id ? "Hide Details" : "View Details"}
                            </button>
                          </div>
                        </div>

                        {/* Order Items (expanded) */}
                        {expandedOrder === order.order_id && orderItems[order.order_id] && (
                          <div className="mt-3 border-t pt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                            <div className="flex flex-col gap-2">
                              {orderItems[order.order_id].map((item) => (
                                <div key={item.order_item_id} className="flex justify-between text-sm text-gray-600">
                                  <span>{item.product_name} x{item.quantity}</span>
                                  <span>${parseFloat(item.subtotal).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="Account"
                isOpen={openSection === "account"}
                onToggle={() => toggleSection("account")}
              >
                <div className="my-3">
                  <Link href="/account-management">
                    <Button text="Manage Account"></Button>
                  </Link>
                </div>
                <div className="my-3">
                  <Button text="Log Out" onClick={logout}></Button>
                </div>
              </SectionCard>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              Loading…
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
