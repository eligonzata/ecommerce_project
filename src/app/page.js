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
  const [isMounted, setIsMounted] = useState(false);

  // Step 1: confirm we're in the browser
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Step 2: only fetch once mounted in the browser
  useEffect(() => {
    if (!isMounted || !params?.id) return;

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
  }, [isMounted, params?.id]);

  function cartBtnHandler() {
    try {
      const existingCartRaw = localStorage.getItem("cartItems");
      const existingCart = existingCartRaw ? JSON.parse(existingCartRaw) : [];
      const safeCart = Array.isArray(existingCart) ? existingCart : [];

      const cartProduct = {
        ...product,
        id: product.id || product.product_id,
        price: `$${Number(product.price).toFixed(2)}`,
        image: product.image || product.image_url,
      };

      const existingIndex = safeCart.findIndex(
        (item) => Number(item?.id) === Number(cartProduct.id)
      );

      if (existingIndex > -1) {
        safeCart[existingIndex].quantity = (safeCart[existingIndex].quantity || 1) + 1;
      } else {
        safeCart.push({ ...cartProduct, quantity: 1 });
      }

      localStorage.setItem("cartItems", JSON.stringify(safeCart));
      window.dispatchEvent(new Event("storage")); // update Navbar cart count
      router.push("/cart");
    } catch (err) {
      console.error("Cart error:", err);
    }
  }

  // Don't render anything until we're in the browser
  if (!isMounted) return null;

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
          <div className="flex flex-col lg:flex-row items-center gap-10 p-6 lg:p-24">
            <Image
              src={product.image || product.image_url}
              alt={product.name}
              width={500}
              height={500}
              className="rounded-md"
            />

            <div className="flex flex-col items-center text-center max-w-xl">
              <h1 className="text-3xl font-bold mt-4">{product.name}</h1>
              <p className="text-gray-600 mt-2">{product.description}</p>

              <div className="flex flex-row mt-4 space-x-4">
                {product.is_on_sale ? (
                  <div className="flex flex-row space-x-2">
                    <p className="text-lg text-gray-400 line-through">
                      ${Number(product.price).toFixed(2)}
                    </p>
                    <p className="text-lg font-semibold text-red-600">
                      ${Number(product.sale_price).toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <p className="text-lg font-semibold text-[#6f4f28]">
                    ${Number(product.price).toFixed(2)}
                  </p>
                )}
                <p className="text-lg font-semibold text-[#6f4f28]">
                  Available: {product.stock_quantity}
                </p>
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
        )}
      </div>

      <Footer />
    </div>
  );
}