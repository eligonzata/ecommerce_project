"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

function Cart() {
  // BACKEND TODO: Cart and Discount should come from server
  const [cartItems, setCartItems] = useState([]);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [discount, setDiscount] = useState("");

  useEffect(() => {
    // TEMP: Retrieve cart items from localStorage
    // BACKEND TODO: replace with API call
    try {
      const raw = localStorage.getItem("cartItems");
      const parsed = raw ? JSON.parse(raw) : [];
      setCartItems(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      console.error("Failed to read cart from localStorage:", err);
      setCartItems([]);
    }
  }, []);

  const totalPrice = useMemo(() => {
    // BACKEND TODO: Total price MUST be calculated on the server
    const total = cartItems.reduce((acc, item) => {
      const priceString = String(item?.price || "").replace(/[^0-9.]/g, "");
      const price = parseFloat(priceString);
      const qty = Number(item?.quantity) || 1;

      if (Number.isNaN(price)) {
        console.error(`Invalid price for item ${item?.name}:`, priceString);
        return acc;
      }

      return acc + price * qty * 1.0825;
    }, 0);

    return total;
  }, [cartItems]);

  const persistCart = (updatedCart) => {
    setCartItems(updatedCart);

    // TEMP: persist to localStorage
    // BACKEND TODO: replace with API call
    try {
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    } catch (err) {
      console.error("Failed to write cart to localStorage:", err);
    }
  };

  const removeFromCart = (itemId) => {
    const updatedCartItems = cartItems.filter(
      (item) => Number(item?.id) !== Number(itemId),
    );
    persistCart(updatedCartItems);
  };

  const updateQuantity = (itemId, quantity) => {
    const nextQty = Math.max(1, Number.parseInt(quantity, 10) || 1);

    const updatedCartItems = cartItems.map((item) => {
      if (Number(item?.id) === Number(itemId)) {
        return { ...item, quantity: nextQty };
      }
      return item;
    });

    persistCart(updatedCartItems);
  };

  const handleCheckout = () => {
    // BACKEND TODO: Checkout must be handled by backend (create order, update inventory).
    // TEMP: clear local cart + show message
    setCheckoutMessage("Thank you for shopping with us!! 🎉");
    persistCart([]);

    try {
      localStorage.removeItem("cartItems");
    } catch (err) {
      console.error("Failed to remove cartItems:", err);
    }
  };

  function discountBtnHandler() {
    // BACKEND TODO: submit discount
    // TEMP: no-op
    console.log("Discount Set:", discount);
    setDiscount("");
  }

  const isEmpty = cartItems.length === 0;

  return (
    <div className="cart-container bg-gray-100 py-0 min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 mb-32">
        <h1 className="text-4xl font-bold text-center text-black mb-6">
          Your Cart
        </h1>

        {isEmpty ? (
          <div className="text-center">
            {checkoutMessage ? (
              <p className="text-lg text-green-600">{checkoutMessage}</p>
            ) : (
              <p className="text-lg text-gray-700">Your cart is empty.</p>
            )}

            <div className="mt-6">
              <Link
                href="/shop"
                className="inline-block bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
              >
                Go to Shop
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="cart-items bg-white rounded-lg shadow-lg p-6 mb-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="cart-item flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-gray-200 gap-4"
                >
                  <div className="flex items-center">
                    {/* BACKEND TODO: verify image paths/URLs are good */}
                    <div className="relative w-24 h-24 mr-4">
                      <Image
                        src={item.image || "/img/placeholder.png"}
                        alt={item.name || "Product image"}
                        fill
                        className="object-cover rounded-md"
                        sizes="96px"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {item.name}
                      </h3>
                      {/* BACKEND TODO: price should come from backend */}
                      <span className="text-sm text-gray-500">
                        Price: {item.price}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <select
                      className="border rounded-md p-2"
                      value={Number(item.quantity) || 1}
                      onChange={(e) => updateQuantity(item.id, e.target.value)}
                      aria-label={`Quantity for ${item.name}`}
                    >
                      {[...Array(10)].map((_, index) => (
                        <option key={index + 1} value={index + 1}>
                          {index + 1}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary bg-white rounded-lg shadow-lg p-6 mt-6">
              <p className="text-gray-800 max-w-sm font-semibold">Add Discount Code:</p>

              <div className="relative w-full max-w-sm m-0 p-0.5 mb-6 rounded-lg bg-gradient-to-r from-[#ffb03b] to-[#ff1f1b]">
                <input
                  className="p-3 pr-12 w-full rounded-lg focus:outline-none text-black"
                  type="discount"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder=""
                  aria-label="Discount"
                />
                <button
                  type="button"
                  className="absolute right-1 top-2 px-3 py-3"
                  onClick={discountBtnHandler}
                  aria-label="Submit email"
                >
                  <FaArrowRight fill="black" />
                </button>
              </div>

              <div className="flex justify-between mb-4">
                <span className="text-xl font-semibold text-gray-800">
                  Total Price (including 8.25% tax):
                </span>
                <span className="text-xl font-semibold text-gray-900">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 transform hover:scale-105"
                >
                  Checkout
                </button>

                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition duration-300 transform hover:scale-105"
                >
                  Continue Shopping
                </button>
              </div>

              {/* BACKEND TODO: add taxes/discount codes */}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Cart;
