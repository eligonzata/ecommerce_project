"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function Register() {
  const [formData, setFormData] = useState({ 
    first_name: "", 
    last_name: "", 
    email: "", 
    password: "",
    phone: "" 
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setStatus("Account created successfully! Redirecting to login...");
      
      setFormData({ first_name: "", last_name: "", email: "", password: "", phone: "" });
      
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12 font-serif text-[#3b3b3b] overflow-x-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center bg-fixed brightness-75"
          style={{ backgroundImage: 'url("/img/contact.jpg")' }}
        />

        <div className="absolute inset-0 -z-10 bg-black/50" />

        <div className="w-full max-w-xl rounded-xl bg-white/90 p-8 md:p-10 shadow-2xl text-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#8a2a2a] mb-2">
            Create an Account
          </h1>

          <p className="text-sm md:text-base text-gray-600 mb-6">
            Join our budding community!
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
            <div className="w-full text-left">
              <label htmlFor="first_name" className="block font-bold mb-1">
                First Name:
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 p-2 text-base focus:outline-none focus:ring-2 focus:ring-[#8a2a2a]/40"
              />
            </div>

            <div className="w-full text-left">
              <label htmlFor="last_name" className="block font-bold mb-1">
                Last Name:
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 p-2 text-base focus:outline-none focus:ring-2 focus:ring-[#8a2a2a]/40"
              />
            </div>

            <div className="w-full text-left">
              <label htmlFor="email" className="block font-bold mb-1">
                Email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 p-2 text-base focus:outline-none focus:ring-2 focus:ring-[#8a2a2a]/40"
              />
            </div>

            <div className="w-full text-left">
              <label htmlFor="phone" className="block font-bold mb-1">
                Phone (optional):
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-2 text-base focus:outline-none focus:ring-2 focus:ring-[#8a2a2a]/40"
              />
            </div>

            <div className="w-full text-left">
              <label htmlFor="password" className="block font-bold mb-1">
                Password:
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 p-2 text-base focus:outline-none focus:ring-2 focus:ring-[#8a2a2a]/40"
              />
            </div>

            {error && (
              <p className="text-red-600 text-base mt-2">{error}</p>
            )}

            {status && (
              <p className="text-green-600 text-base mt-2">{status}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 rounded-md bg-[#8a2a2a] py-3 text-white font-semibold hover:bg-[#641414] transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link href="/account" className="text-blue-600 hover:underline">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}