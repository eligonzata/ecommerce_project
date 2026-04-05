"use client";

import { useState, useEffect } from "react";
import ProductList from "../components/ProductList";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_URL = "/api";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("EVERYTHING");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("default");
  //load in all of the tags
  useEffect(() => {
    async function loadTags() {
      const res = await fetch(`${API_URL}/tags`);
      const data = await res.json();
      setTags(data);
    }

    loadTags();
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    fetchProducts();
  }, [selectedTag, availabilityFilter, priceSort]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };


  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

  return matchesSearch;
});
//how to fetch the products
async function fetchProducts() {
      const url = `${API_URL}/products?tag=${selectedTag}&avail=${availabilityFilter}&price=${priceSort}`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    }
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
          onChange={(e) => {
            const value = e.target.value;
            setSelectedTag(value);
            fetchProducts(value, availabilityFilter, priceSort);
          }}
          className="w-full max-w-md p-2 border border-gray-300 rounded mb-4"
        >
          {tags.map((tag) => (
            <option key={tag.tag_id} value={tag.tag_name}>
              {tag.tag_name}
            </option>
          ))}
        </select>

      
        <select
            value={availabilityFilter}
            onChange={(e) => {
              const value = e.target.value;
              setAvailabilityFilter(value);
              fetchProducts(selectedTag, value, priceSort);
            }}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="all">Availability</option>
            <option value="in-stock">In Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>

          <select
            value={priceSort}
            onChange={(e) => {
              const value = e.target.value;
              setPriceSort(value);
              fetchProducts(selectedTag, availabilityFilter, value);
            }}
            className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="default">Default Price Order</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
          </select>
        <ProductList products={filteredProducts} />

      </div>

      <Footer />
    </div>
  );
}
