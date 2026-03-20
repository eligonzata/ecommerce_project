"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SectionCard from "../components/SectionCard";

import { useAuth } from "../../context/AuthContext";
import Button from "../components/Button";
import Link from "next/link";

export default function MyAccountAndOrders() {
  const router = useRouter();
  const { user, logout } = useAuth();
  useEffect(() => {
    if (user === null) {
      // not logged in
      router.push("/sign-in"); // redirects to login page
    }
  }, [user]);

  const [openSection, setOpenSection] = useState("orders");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const toggleSection = (sectionName) => {
    setOpenSection((prev) => (prev === sectionName ? "" : sectionName));
    setMessage("");
    setError("");
  };

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#f7f2ec] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#641414]">
              {user ? `Welcome, ${user.name}` : "My Account"}
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your orders and account details.
            </p>
          </div>

          <div className="mb-6">
            {message && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}
          </div>

          {user !== undefined ? (
            <div className="flex flex-col gap-5">
              <SectionCard
                title="Orders"
                isOpen={openSection === "orders"}
                onToggle={() => toggleSection("orders")}
              ></SectionCard>
              <SectionCard
                title="Account"
                isOpen={openSection === "account"}
                onToggle={() => toggleSection("account")}
              >
                <div className="my-3">
                  <Link href="/account-management">
                    <Button text="Manage Account"></Button>
                  </Link>
                </div>
                <div className="my-3">
                  <Button text="Log Out" onClick={logout}></Button>
                </div>
              </SectionCard>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              Loading…
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
