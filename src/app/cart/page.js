"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import RequireAuth from "../components/RequireAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

function CartContent() {
  const [cartItems, setCartItems] = useState([]);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(null);
  const router = useRouter();
  const { user } = useAuth();
  const userId = user.id;
  const [showPayment, setShowPayment] = useState(false);
  const [payment, setPayment] = useState({
    cardName: "",
    cardNumber: "",
    expiration: "",
    cvv: "",
  });

  useEffect(() => {
    if (!userId) return;

    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/cart/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch cart");
        const data = await response.json();
        setCartItems(data);
      } catch (err) {
        console.error("Failed to load cart:", err);
        setError("Could not load cart. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [userId]);

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.0825;
  };

  const calculateDiscount = (subtotal) => {
    if (!discount) return 0;
    const value = Number(discount.discount_value);
    if (discount.discount_type === "percentage") {
      return subtotal * (value / 100);
    } else {
      return value;
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount(subtotal);
    const taxableAmount = subtotal - discountAmount;
    const tax = calculateTax(taxableAmount);
    return taxableAmount + tax;
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const response = await fetch(`${API_URL}/cart/${userId}/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) throw new Error("Failed to update cart");

      const cartResponse = await fetch(`${API_URL}/cart/${userId}`);
      const updatedCart = await cartResponse.json();
      setCartItems(updatedCart);
    } catch (err) {
      console.error("Failed to update quantity:", err);
      setError("Could not update cart. Please try again.");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/cart/${userId}/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove item");

      setCartItems(cartItems.filter((item) => item.product_id !== productId));
    } catch (err) {
      console.error("Failed to remove item:", err);
      setError("Could not remove item. Please try again.");
    }
  };

  const validateDiscount = async () => {
    if (!discountCode) return;

    try {
      const subtotal = calculateSubtotal();
      const response = await fetch(`${API_URL}/discounts/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode, cart_total: subtotal }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Invalid discount code");
      }

      const data = await response.json();
      setDiscount(data.discount);
      setError(null);
    } catch (err) {
      setError(err.message);
      setDiscount(null);
    }
  };

  //still need to have some form of payment processing
  const handleCheckout = async () => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

      const paymentError = validatePayment();
        if (paymentError) {
          setError(paymentError);
          return;
        }

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          payment_method: "Credit Card",
          discount_code: discount?.code || "",
          payment_info: {
            card_name: payment.cardName,
            card_last4: payment.cardNumber.slice(-4),
            expiration: payment.expiration,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to create order");

      const data = await response.json();
      //setCheckoutMessage("Thank you for shopping with us!! 🎉");
      setCartItems([]);

      router.push(`/order-summary/${data.order_id}`);
    } catch (err) {
      console.error("Checkout failed:", err);
      setError("Checkout failed. Please try again.");
    }
  };

  const isEmpty = cartItems.length === 0;

  function handlePaymentChange(e) {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 16);
      setPayment((prev) => ({ ...prev, [name]: digits }));
      return;
    }

    if (name === "cvv") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      setPayment((prev) => ({ ...prev, [name]: digits }));
      return;
    }

    if (name === "expiration") {
      let cleaned = value.replace(/\D/g, "").slice(0, 4);
      if (cleaned.length > 2) {
        cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
      }
      setPayment((prev) => ({ ...prev, [name]: cleaned }));
      return;
    }

    setPayment((prev) => ({ ...prev, [name]: value }));
  }

  function validatePayment() {
    if (!showPayment) {
      return "Please open the payment section and enter your payment information.";
    }

    if (!payment.cardName.trim()) {
      return "Please enter the name on the card.";
    }

    if (payment.cardNumber.length !== 16) {
      return "Please enter a valid 16-digit card number.";
    }

    if (!/^\d{2}\/\d{2}$/.test(payment.expiration)) {
      return "Please enter a valid expiration date in MM/YY format.";
    }

    if (payment.cvv.length < 3) {
      return "Please enter a valid CVV.";
    }

    return "";
  }

  return (
    <div className="cart-container bg-gray-100 py-0 min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 mb-32">
        <h1 className="text-4xl font-bold text-center text-black mb-6">
          Your Cart
        </h1>

        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading cart...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && isEmpty ? (
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
          !loading &&
          !isEmpty && (
            <div>
              <div className="cart-items bg-white rounded-lg shadow-lg p-6 mb-6">
                {cartItems.map((item) => (
                  <div
                    key={item.product_id}
                    className="cart-item flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-gray-200 gap-4"
                  >
                    <div className="flex items-center">
                      <div className="relative w-24 h-24 mr-4">
                        <Image
                          src={item.image_url || "/img/placeholder.png"}
                          alt={item.product_name}
                          fill
                          className="object-cover rounded-md"
                          sizes="96px"
                        />
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {item.product_name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          Price: ${item.price}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <select
                        className="border rounded-md p-2"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.product_id,
                            parseInt(e.target.value),
                          )
                        }
                        aria-label={`Quantity for ${item.product_name}`}
                      >
                        {[...Array(10)].map((_, index) => (
                          <option key={index + 1} value={index + 1}>
                            {index + 1}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product_id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Enter discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded"
                  />
                  <button
                    onClick={validateDiscount}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Apply
                  </button>
                </div>
                {discount && (
                  <p className="text-green-600 mt-2">
                    Discount applied: {discount.description}
                  </p>
                )}
              </div>

              <div className="cart-summary bg-white rounded-lg shadow-lg p-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  {discount && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>
                        -${calculateDiscount(calculateSubtotal()).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax (8.25%):</span>
                    <span>
                      $
                      {calculateTax(
                        calculateSubtotal() -
                          calculateDiscount(calculateSubtotal()),
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-4 border-t">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                {/* Payment Section Toggle */}
                <button
                  onClick={() => setShowPayment(!showPayment)}
                  className="w-full mt-4 mb-4 text-left font-semibold text-[#641414]"
                >
                  {showPayment ? "Hide Payment Info −" : "Enter Payment Info +"}
                </button>

                {showPayment && (
                  <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                    <h3 className="text-lg font-semibold mb-3">Payment Information</h3>

                    <div className="flex flex-col gap-3">
                      <input
                        name="cardName"
                        placeholder="Name on Card"
                        value={payment.cardName}
                        onChange={handlePaymentChange}
                        className="p-2 border rounded"
                      />

                      <input
                        name="cardNumber"
                        placeholder="Card Number"
                        value={payment.cardNumber}
                        onChange={handlePaymentChange}
                        className="p-2 border rounded"
                      />

                      <div className="flex gap-3">
                        <input
                          name="expiration"
                          placeholder="MM/YY"
                          value={payment.expiration}
                          onChange={handlePaymentChange}
                          className="p-2 border rounded w-1/2"
                        />

                        <input
                          name="cvv"
                          placeholder="CVV"
                          value={payment.cvv}
                          onChange={handlePaymentChange}
                          className="p-2 border rounded w-1/2"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 transform hover:scale-105"
                  >
                    Checkout
                  </button>

                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition duration-300 transform hover:scale-105"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function Cart() {
  return (
    <RequireAuth>
      <CartContent />
    </RequireAuth>
  );
}
