"use client";

import { useState, useEffect } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SectionCard from "../components/SectionCard";
import RequireAuth from "../components/RequireAuth";

import { useAuth } from "@/context/AuthContext";
import Button from "../components/Button";
import Link from "next/link";

function MyAccountContent() {
  const { user, logout } = useAuth();
  const isAdmin =
    user != null && String(user.role || "").toLowerCase() === "admin";

  const [openSection, setOpenSection] = useState(() =>
    isAdmin ? "account" : "orders",
  );

  useEffect(() => {
    if (isAdmin) {
      setOpenSection((prev) => (prev === "orders" ? "account" : prev));
    }
  }, [isAdmin]);

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
              {isAdmin
                ? "Manage your account details."
                : "Manage your orders and account details."}
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

          <div className="flex flex-col gap-5">
            {!isAdmin ? (
              <SectionCard
                title="Orders"
                isOpen={openSection === "orders"}
                onToggle={() => toggleSection("orders")}
              ></SectionCard>
            ) : null}
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
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function MyAccountAndOrders() {
  return (
    <RequireAuth>
      <MyAccountContent />
    </RequireAuth>
  );
}
