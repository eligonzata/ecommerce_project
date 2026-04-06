"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import RequireAuth from "../../components/RequireAuth";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

function OrderPageContent() {
  const { id } = useParams(); 
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id || !id) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);

        // get order summary
        const orderRes = await fetch(`${API_URL}/orders/order/${id}`);
        const orderData = await orderRes.json();
        setOrder(orderData);

        // get items
        const itemsRes = await fetch(`${API_URL}/orders/${id}/items`);
        const itemsData = await itemsRes.json();
        setItems(itemsData);

      } catch (err) {
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div>
      <Navbar />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
            Thank you for shopping with us!! 🎉
        </h1>
        <h1 className="text-2xl font-bold mb-4">
          Order #{order.order_id}
        </h1>

        <p className="text-gray-600 mb-2">
          Date: {new Date(order.order_date).toLocaleDateString()}
        </p>

        <p className="mb-4">
          Status: {order.order_status}
        </p>

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Items</h2>

          {items.map((item) => (
            <div key={item.order_item_id} className="flex justify-between">
              <span>{item.product_name} x{item.quantity}</span>
              <span>${parseFloat(item.subtotal).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 text-right font-bold">
          Total: ${parseFloat(order.total_amount).toFixed(2)}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function OrderPage() {
  return (
    <RequireAuth>
      <OrderPageContent />
    </RequireAuth>
  );
}