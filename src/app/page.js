"use client";

import { useContext } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProductList from "./components/ProductList";
import ThemeContext from "@/context/ThemeContext";
import Link from "next/link";
import { Fade } from "react-awesome-reveal";

export default function Home() {
  // Access theme context if needed for dynamic styling
  const { theme } = useContext(ThemeContext);

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
            <button
              type="button"
              className="px-6 py-3 bg-gradient-to-r from-[#ffb03b] to-[#ff1f1b] text-white font-bold rounded"
            >
              Visit the Shop
            </button>
          </Link>
        </Fade>
      </div>

      {/* Popular Categories */}
      <div className="text-center py-10">
        <h2 className="text-[#6f4f28] text-4xl font-semibold">
          Popular Categories
        </h2>

        {/* BACKEND TODO: ProductList should fetch/filter products via API instead of hardcoded data */}
        <ProductList tags={["popular"]} limit={3} />
      </div>

      {/* Trending Products */}
      <div className="text-center py-10">
        <h2 className="text-[#6f4f28] text-4xl font-semibold">
          Trending Products
        </h2>

        {/* BACKEND TODO: ProductList should fetch/filter products via API instead of hardcoded data */}
        <ProductList tags={["trendy"]} limit={6} />
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
