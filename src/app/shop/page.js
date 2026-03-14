"use client";

import { useState } from "react";
import ProductList from "../components/ProductList";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("EVERYTHING");

  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("default");

  return (
    <div>
      <Navbar />

      <div className="flex flex-col items-center p-4 gap-4">
        {/* Search + filters */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-4 gap-2">
          {/* Search by name */}
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />

          {/* Tag filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            {/* BACKEND TODO: load available tags/categories from API instead of hardcoding */}
            <option value="EVERYTHING">Everything</option>
            <option value="popular">Popular</option>
            <option value="trendy">Trendy</option>
            <option value="floral">Floral</option>
            <option value="woody">Woody</option>
            <option value="fruity">Fruity</option>
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="all">Availability</option>
            <option value="in-stock">In Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>

          <select
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="default">Default Price Order</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
          </select>
        </div>

        {/* Product List */}
        <ProductList
          searchTerm={searchTerm}
          tags={[selectedTag]}
          limit={60}
          availabilityFilter={availabilityFilter}
          priceSort={priceSort}
        />
      </div>

      <Footer />
    </div>
  );
}