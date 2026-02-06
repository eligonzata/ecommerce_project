"use client";

import { useState } from "react";
import ProductList from "../components/ProductList";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("EVERYTHING");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTagChange = (event) => {
    setSelectedTag(event.target.value);
  };

  return (
    <div>
      <Navbar />

      <div className="flex flex-col items-center p-4">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full max-w-md p-2 border border-gray-300 rounded mb-4"
        />

        {/* Filter Dropdown */}
        <select
          value={selectedTag}
          onChange={handleTagChange}
          className="w-full max-w-md p-2 border border-gray-300 rounded mb-4"
        >
          {/* BACKEND TODO: load available tags/categories from API instead of hardcoding */}
          <option value="EVERYTHING">Everything</option>
          <option value="popular">Popular</option>
          <option value="trendy">Trendy</option>
          <option value="floral">Floral</option>
          <option value="woody">Woody</option>
          <option value="fruity">Fruity</option>
        </select>

        {/* Product List */}
        <ProductList search={searchTerm} tags={[selectedTag]} limit={60} />
      </div>

      <Footer />
    </div>
  );
}
