"use client";

import { useState, useEffect } from "react";
import ProductList from "../components/ProductList";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_URL = "http://localhost:5001";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("EVERYTHING");

  useEffect(() => {
  async function loadData() {
    const productRes = await fetch(`${API_URL}/products`);
    const productData = await productRes.json();

    const tagRes = await fetch(`${API_URL}/tags`);
    const tagData = await tagRes.json();

    setProducts(productData);
    setTags(tagData);
  }

  loadData();
}, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTagChange = async (event) => {
    const tag = event.target.value;
    setSelectedTag(tag);

    if (tag === "EVERYTHING") {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } else {
      const res = await fetch(`${API_URL}/products/tagged?tag=${tag}`);
      const data = await res.json();
      setProducts(data);
    }
};

const filteredProducts = products.filter(product => {

  const matchesSearch =
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase());

  return matchesSearch;
});

  return (
    <div>
      <Navbar />

      <div className="flex flex-col items-center p-4">

        <input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full max-w-md p-2 border border-gray-300 rounded mb-4"
        />

        <select
        value={selectedTag}
        onChange={handleTagChange}
        className="w-full max-w-md p-2 border border-gray-300 rounded mb-4"
        >

        {tags.map(tag => (
          <option key={tag.tag_id} value={tag.tag_name}>
            {tag.tag_name}
          </option>
        ))}

      </select>

        <ProductList products={filteredProducts} />

      </div>

      <Footer />
    </div>
  );
}