"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductList({ search = "", tags = [], limit = 60 }) {
  const [products, setProducts] = useState([]);
  const [loadError, setLoadError] = useState("");

  const normalizedSearch = useMemo(() => {
    return String(search || "").trim().toLowerCase();
  }, [search]);

  useEffect(() => {
    let isMounted = true;

    // TEMP DATA SOURCE (frontend-only)
    // BACKEND TODO: replace candles.json fetch with an API call
    fetch("/candles.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load candles.json (HTTP ${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        if (!isMounted) return;

        const safeData = Array.isArray(data) ? data : [];

        // Filter by tags
        const filteredByTags = tags.includes("EVERYTHING")
          ? safeData
          : safeData.filter((product) => {
              const productTags = Array.isArray(product?.tags) ? product.tags : [];
              return tags.some((tag) => productTags.includes(tag));
            });

        // Filter by search term
        const filteredBySearch = normalizedSearch
          ? filteredByTags.filter((product) =>
              String(product?.name || "").toLowerCase().includes(normalizedSearch)
            )
          : filteredByTags;

        // Limit results
        setProducts(filteredBySearch.slice(0, limit));
        setLoadError("");
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error("Error loading data:", error);
        setProducts([]);
        setLoadError("Could not load products.");
      });

    return () => {
      isMounted = false;
    };
  }, [normalizedSearch, tags, limit]);

  const gridCols =
    products.length === 1
      ? "grid-cols-1"
      : products.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-3 2xl:grid-cols-6";

  if (loadError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 font-semibold">{loadError}</p>
        {/* BACKEND TODO: handle API errors + loading states more cleanly */}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">No products match your filters.</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-8 p-4 ${gridCols} justify-center`}>
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="bg-white shadow-md rounded-lg p-4 text-center"
        >
          {/* BACKEND TODO: verify that product image is good*/}
          <Image
            src={product.image}
            alt={product.name}
            width={200}
            height={200}
            className="mx-auto rounded-md"
          />
          <h3 className="text-xl font-bold mt-4">{product.name}</h3>
          <p className="text-gray-600">{product.blurb}</p>

          {/* BACKEND TODO: price should come from backend*/}
          <p className="text-[#6f4f28] font-semibold">{product.price}</p>
        </Link>
      ))}
    </div>
  );
}
