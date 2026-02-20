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
  const [status, setStatus] = useState("loading"); 
  // loading | ready | not_found | error
    useEffect(() => {
    let isMounted = true;

    fetch(`/api/products/${params.id}`)
        .then((response) => {
        if (response.status === 404) {
            setStatus("not_found");
            return null;
        }
        if (!response.ok) {
            throw new Error("Server error");
        }
        return response.json();
        })
        .then((data) => {
        if (!isMounted || !data) return;

        setProduct(data);
        setStatus("ready");
        })
        .catch((error) => {
        if (!isMounted) return;
        console.error("Error loading product:", error);
        setStatus("error");
        });

    return () => {
        isMounted = false;
    };
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

                {/* BACKEND TODO: price should come from backend*/}
                <p className="text-lg font-semibold text-[#6f4f28] mt-4">
                  {product.price}
                </p>

                <button
                  type="button"
                  onClick={cartBtnHandler}
                  className="mt-8 px-6 py-3 outline rounded-xl"
                >
                  Add to Cart
                </button>
              </div>
            </div>

            <div className="mt-10 text-center">
              <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>
              {/* BACKEND TODO: load reviews from API */}
              <p>No reviews yet. Coming Soon!</p>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
