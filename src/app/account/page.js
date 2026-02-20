"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Account() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // BACKEND TODO: replace with real auth endpoint (POST /api/auth/login)
    if (email && password) {
      setSuccessMessage("Login successful (placeholder)");
      localStorage.setItem("user", JSON.stringify({ email }));
      setTimeout(() => router.push("/"), 800);
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="relative flex min-h-screen bg-[#deddca] overflow-hidden">
        {/* Left image (hidden on mobile) */}
        <div className="hidden md:block relative w-1/2 h-screen">
          <img
            src="/img/login.jpg"
            alt="Candles on a wooden surface"
            className="absolute inset-0 w-[120%] h-full object-cover -left-[.5%]"
          />
        </div>

        {/* Logo */}
        <div className="absolute top-5 right-[26%] md:right-[26%] z-10 md:block">
          <img
            src="/img/logo.png"
            alt="Scent Sanctuary Logo"
            className="w-[120px] h-auto"
          />
        </div>

        {/* Right login panel */}
        <div className="flex w-full md:w-1/2 bg-white justify-center items-center px-6">
          <div className="w-full max-w-md text-center">
            <h1 className="text-2xl font-semibold mb-6">
              Welcome to Scent Sanctuary
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col items-center">
              <label htmlFor="email" className="mb-1">
                Email:
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mb-4 p-2 border border-gray-300 rounded"
              />

              <label htmlFor="password" className="mb-1">
                Password:
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full mb-4 p-2 border border-gray-300 rounded"
              />

              {error && (
                <p className="text-red-600 mb-2">{error}</p>
              )}
              {successMessage && (
                <p className="text-green-600 mb-2">{successMessage}</p>
              )}

              <button
                type="submit"
                className="w-full bg-[#641414] text-white py-2 rounded hover:bg-[#555] transition"
              >
                Login
              </button>

              <div className="flex flex-col items-center mt-4 space-y-2">
                {/* BACKEND/ROUTING TODO */}
                <Link
                  href="/forgot-password"
                  className="text-blue-600 hover:underline"
                >
                  Forgot Password?
                </Link>
                <Link
                  href="/register"
                  className="text-green-600 hover:underline"
                >
                  Create an Account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
