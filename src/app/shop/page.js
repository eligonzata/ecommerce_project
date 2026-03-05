"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductList from "../components/ProductList";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("EVERYTHING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await fetch(`${API_URL}/test`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          setApiStatus("online");
          fetchProducts();
        } else {
          setApiStatus("offline");
          setError("Cannot connect to server. Please make sure the backend is running.");
          setLoading(false);
        }
      } catch (err) {
        console.error("API connection error:", err);
        setApiStatus("offline");
        setError("Cannot connect to server. Please make sure the backend is running on http://localhost:5001");
        setLoading(false);
      }
    };

    checkAPI();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/products`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("Could not load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTagChange = (event) => {
    setSelectedTag(event.target.value);
  };

  const tags = ["EVERYTHING", ...new Set(products.map(p => p.wick_type || "Other"))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === "EVERYTHING" || product.wick_type === selectedTag;
    return matchesSearch && matchesTag;
  });

  return (
    <div>
      <Navbar />

      <div className="flex flex-col items-center p-4 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Our Candles</h1>

        {apiStatus === "offline" && (
          <div className="w-full max-w-md bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
            <p className="font-bold">Backend Not Connected</p>
            <p>Please start your Flask server:</p>
            <code className="block bg-gray-100 p-2 mt-2 rounded">
              cd path/to/backend && python app.py
            </code>
          </div>
        )}

        <input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={handleSearchChange}
          disabled={apiStatus === "offline"}
          className="w-full max-w-md p-2 border border-gray-300 rounded mb-4 disabled:bg-gray-100"
        />

        <select
          value={selectedTag}
          onChange={handleTagChange}
          disabled={apiStatus === "offline"}
          className="w-full max-w-md p-2 border border-gray-300 rounded mb-4 disabled:bg-gray-100"
        >
          {tags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            {apiStatus === "online" && (
              <button 
                onClick={fetchProducts}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {!loading && !error && apiStatus === "online" && (
          <ProductList products={filteredProducts} />
        )}
      </div>

      <Footer />
    </div>
  );
}