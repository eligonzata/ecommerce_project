"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      // BACKEND TODO: replace with real forgot-password endpoint
      // Example: POST /api/auth/forgot-password
      setStatusMessage(
        "If an account with that email exists, a password reset link has been sent."
      );
      setEmail("");
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#f5eee6] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-semibold text-center text-[#641414] mb-4">
            Forgot Password
          </h1>

          <p className="text-center text-gray-600 mb-6">
            Enter your email address and we’ll help you reset your password.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>

              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#641414]"
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {statusMessage && (
              <p className="text-sm text-green-600">{statusMessage}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-[#641414] text-white py-2.5 font-medium hover:bg-[#4d1010] transition"
            >
              Send Reset Link
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/sign-in" className="text-[#641414] hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
