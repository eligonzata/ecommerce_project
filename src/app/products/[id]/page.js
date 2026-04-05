"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [userId, setUserId] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const { user } = useAuth();
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    } else {
      setUserId(null);
    }
  }, [user]);

  useEffect(() => {
    if (!params?.id) return;

    fetch(`${API_URL}/products/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setStatus("ready");
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  }, [params?.id]);

  async function addToCart() {
    if (!userId) {
      const next = encodeURIComponent(`/products/${params.id}`);
      router.push(`/sign-in?next=${next}`);
      return;
    }

    setAddingToCart(true);
    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          product_id: product.id,
          quantity: 1,
        }),
      });

      if (!response.ok) throw new Error("Failed to add to cart");

      router.push("/cart");
    } catch (err) {
      console.error("Cart error:", err);
      alert("Failed to add item to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  }

  return (
    <div>
      <Navbar />

      <div className="container mx-auto py-10 min-h-screen">
        {status === "loading" && (
          <p className="text-center text-gray-600">Loading...</p>
        )}

        {status === "error" && (
          <div className="text-center">
            <p className="text-red-600 font-semibold">
              Could not load product.
            </p>
          </div>
        )}

        {status === "ready" && product && (
          <div className="flex flex-col lg:flex-row items-center gap-10 p-6 lg:p-24">
            <div className="relative w-full lg:w-1/2 h-96">
              <Image
                src={product.image || "/img/placeholder.png"}
                alt={product.name}
                fill
                className="object-cover rounded-md"
              />
            </div>

            <div className="flex flex-col items-center text-center max-w-xl">
              <h1 className="text-3xl font-bold mt-4">{product.name}</h1>

              <p className="text-gray-600 mt-2">{product.description}</p>

              <div className="flex flex-col mt-4 space-y-2">
                {product.is_on_sale ? (
                  <div>
                    <p className="text-lg text-gray-400 line-through">
                      ${Number(product.price).toFixed(2)}
                    </p>
                    <p className="text-2xl font-semibold text-[#6f4f28]">
                      ${Number(product.sale_price).toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <p className="text-2xl font-semibold text-[#6f4f28]">
                    ${Number(product.price).toFixed(2)}
                  </p>
                )}

                <p className="text-lg">Available: {product.stock_quantity}</p>

                <p className="text-sm text-gray-500">
                  Wick Type: {product.wick_type}
                </p>
              </div>

              <button
                type="button"
                onClick={addToCart}
                disabled={addingToCart || product.stock_quantity === 0}
                className={`mt-8 px-6 py-3 rounded-xl ${
                  product.stock_quantity > 0
                    ? "bg-[#641414] text-white hover:bg-[#8a2a2a]"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                {addingToCart
                  ? "Adding..."
                  : product.stock_quantity > 0
                    ? "Add to Cart"
                    : "Out of Stock"}
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
