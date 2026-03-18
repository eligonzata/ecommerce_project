"use client";

//import { useContext } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Button from "./components/Button";
import ProductList from "./components/ProductList";
import ThemeContext from "@/context/ThemeContext";
import Link from "next/link";
import { Fade } from "react-awesome-reveal";
import { useContext, useEffect, useState } from "react";

export default function Home() {
  const [popularProducts, setPopularProducts] = useState([]);
  const [trendyProducts, setTrendyProducts] = useState([]);
  // Access theme context if needed for dynamic styling
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
  async function fetchProducts() {
    const popularRes = await fetch(
      "http://localhost:5001/products/tagged?tag=popular&limit=3"
    );
    const trendyRes = await fetch(
      "http://localhost:5001/products/tagged?tag=trendy&limit=6"
    );

    const popularData = await popularRes.json();
    const trendyData = await trendyRes.json();

    setPopularProducts(popularData);
    setTrendyProducts(trendyData);
  }

  fetchProducts();
}, []);
  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Background and Content Container */}
      <div
        style={{
          backgroundImage: "url('/img/cover2.jpg')",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          minHeight: "80vh",
        }}
        className="flex flex-col items-center justify-center text-white relative"
      >
        {/* Main Content with Fade Animation */}
        <Fade triggerOnce={true}>
          <h1 className="text-4xl font-bold mb-4">Scent Sanctuary</h1>
          <p className="text-lg max-w-lg text-center mb-4">
            Transform Your Space, Elevate Your Senses
          </p>

          <Link href="/shop" className="mt-8">
            <Button text="Visit the Shop" />
          </Link>
        </Fade>
      </div>

      {/* Popular Categories */}
      <div className="text-center py-10">
        <h2 className="text-[#6f4f28] text-4xl font-semibold">
          Popular Categories
        </h2>

        {/* BACKEND TODO: ProductList should fetch/filter products via API instead of hardcoded data */}
       <ProductList products={popularProducts} />
      </div>

      {/* Trending Products */}
      <div className="text-center py-10">
        <h2 className="text-[#6f4f28] text-4xl font-semibold">
          Trending Products
        </h2>

        {/* BACKEND TODO: ProductList should fetch/filter products via API instead of hardcoded data */}
        <ProductList products={trendyProducts} />
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}