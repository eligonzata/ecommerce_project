"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

/** Only allow same-origin paths; blocks open redirects. */
function getSafeNextPath(raw) {
  if (!raw || typeof raw !== "string") return null;
  let path;
  try {
    path = decodeURIComponent(raw.trim());
  } catch {
    return null;
  }
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (path.includes("://")) return null;
  return path;
}

export default function Account() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e) => {            //changed to use new login route 
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await fetch(`/api/login`, {
        method: "POST", // calls the new login route in main.py
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const user = await response.json();

      setSuccessMessage("Login successful!");
      const localStorageUserData = {
        id: user.user_id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.user_role,
      };
      login(localStorageUserData);

      const params =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : null;
      const nextPath = params ? getSafeNextPath(params.get("next")) : null;

      if (nextPath) {
        setTimeout(() => router.push(nextPath), 1000);
      } else if (user.user_role === "customer") {
        setTimeout(() => router.push("/"), 1000);
      } else {
        setTimeout(() => router.push("/admin"), 1000);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="relative flex min-h-screen bg-[#deddca] overflow-hidden">
        <div className="hidden md:block relative w-1/2 h-screen">
          <img
            src="/img/login.jpg"
            alt="Candles on a wooden surface"
            className="absolute inset-0 w-[120%] h-full object-cover -left-[.5%]"
          />
        </div>

        <div className="absolute top-5 right-[26%] md:right-[26%] z-10 md:block">
          <img
            src="/img/logo.png"
            alt="Scent Sanctuary Logo"
            className="w-[120px] h-auto"
          />
        </div>

        <div className="flex w-full md:w-1/2 bg-white justify-center items-center px-6">
          <div className="w-full max-w-md text-center">
            <h1 className="text-2xl font-semibold mb-6">
              Welcome to Scent Sanctuary
            </h1>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center"
            >
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

              {error && <p className="text-red-600 mb-2">{error}</p>}
              {successMessage && (
                <p className="text-green-600 mb-2">{successMessage}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#641414] text-white py-2 rounded hover:bg-[#555] transition ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="flex flex-col items-center mt-4 space-y-2">
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
