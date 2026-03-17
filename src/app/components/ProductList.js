"use client";

import Image from "next/image";
import Link from "next/link";

export default function ProductList({ products = [] }) {
  if (!products.length) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">No products match your filters.</p>
      </div>
    );
  }

  const gridCols =
    products.length === 1
      ? "grid-cols-1"
      : products.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-3 2xl:grid-cols-6";

  return (
    <div className={`grid gap-8 p-4 ${gridCols} justify-center`}>
      {products.map((product) => (
        <Link
          key={product.product_id}
          href={`/products/${product.product_id}`}
          className="bg-white shadow-md rounded-lg p-4 text-center hover:shadow-lg transition-shadow"
        >
          <div className="relative w-full h-48 mb-4">
            <Image
              src={product.image_url || "/img/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover rounded-md"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <h3 className="text-xl font-bold mt-4">{product.name}</h3>
          <p className="text-gray-600 line-clamp-2">{product.description}</p>
          <div className="mt-2">
            {product.is_on_sale ? (
              <div>
                <span className="text-gray-400 line-through mr-2">
                  ${product.price}
                </span>
                <span className="text-[#6f4f28] font-semibold">
                  ${product.sale_price}
                </span>
              </div>
            ) : (
              <p className="text-[#6f4f28] font-semibold">
                ${product.price}
              </p>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Wick: {product.wick_type}
          </p>
          <p className={`text-sm mt-1 ${
            product.stock_quantity > 0 ? "text-green-600" : "text-red-600"
          }`}>
            {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
          </p>
        </Link>
        );
})}
    </div>
  );
}