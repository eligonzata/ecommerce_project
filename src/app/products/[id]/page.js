"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | not_found | error

  useEffect(() => {
  fetch(`http://localhost:5000/products/${params.id}`)
    .then((res) => {
      if (!res.ok) throw new Error("Not found");
      return res.json();
    })
    .then((data) => {
      setProduct(data);
      setStatus("ready");
    })
    .catch(() => {
      setStatus("not_found");
    });
}, [params?.id]);

  function cartBtnHandler() {
    // BACKEND TODO: Cart should be managed server-side
    // This is temporary UI-only behavior.

    try {
      const existingCartRaw = localStorage.getItem("cartItems");
      const existingCart = existingCartRaw ? JSON.parse(existingCartRaw) : [];

      const safeCart = Array.isArray(existingCart) ? existingCart : [];

      const existingProductIndex = safeCart.findIndex(
        (item) => Number(item?.id) === Number(product?.id)
      );

      if (existingProductIndex > -1) {
        safeCart[existingProductIndex].quantity =
          (safeCart[existingProductIndex].quantity || 1) + 1;
      } else {
        safeCart.push({ ...product, quantity: 1 });
      }

      localStorage.setItem("cartItems", JSON.stringify(safeCart));
      router.push("/cart");
    } catch (err) {
      console.error("Cart error:", err);
      // Keep user on page if storage fails
    }
  }

  return (
    <div>
      <Navbar />

      <div className="container mx-auto py-10">
        {status === "loading" && (
          <p className="text-center text-gray-600">Loading...</p>
        )}

        {status === "error" && (
          <div className="text-center">
            <p className="text-red-600 font-semibold">Could not load product.</p>
          </div>
        )}

        {status === "not_found" && (
          <div className="text-center">
            <p className="text-gray-700 font-semibold">Product not found.</p>
            <button
              type="button"
              onClick={() => router.push("/shop")}
              className="mt-4 px-6 py-2 outline rounded-xl"
            >
              Back to Shop
            </button>
          </div>
        )}

        {status === "ready" && product && (
          <>
            <div className="flex flex-col lg:flex-row items-center gap-10 p-6 lg:p-24">
              <Image
                src={product.image}
                alt={product.name}
                width={500}
                height={500}
                className="rounded-md"
              />

              <div className="flex flex-col items-center text-center max-w-xl">
                <h1 className="text-3xl font-bold mt-4">{product.name}</h1>

                <p className="text-gray-600 mt-2">
                  {product.description}
                </p>

                {/* DONE: prices and item availability should come from backend*/}
                <div className= "flex flex-row mt-4 space-x-4">
                  <p className="text-lg font-semibold text-[#6f4f28]">
                  {product.price}
                </p>
                <p className="text-lg font-semibold text-[#6f4f28]"> Available: {product.stock_quantity}</p>
                </div>

                <button
                  type="button"
                  onClick={cartBtnHandler}
                  className="mt-8 px-6 py-3 outline rounded-xl"
                >
                  Add to Cart
                </button>
              </div>
            </div>

          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
