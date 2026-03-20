"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { useAuth } from "../../context/AuthContext";

function SectionCard({ title, isOpen, onToggle, children }) {
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <span className="text-lg font-semibold text-[#641414]">{title}</span>
        <span className="text-2xl text-gray-500">{isOpen ? "−" : "+"}</span>
      </button>

      {isOpen && (
        <div className="border-t border-gray-200 px-6 py-5">{children}</div>
      )}
    </div>
  );
}

export default function AccountManagement() {
  const router = useRouter();
  const { user, logout } = useAuth();
  if (user === null) {
    // not logged in
    router.push("/account"); // redirects to login page
  }

  const [openSection, setOpenSection] = useState("personal");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const toggleSection = (sectionName) => {
    setOpenSection((prev) => (prev === sectionName ? "" : sectionName));
    setMessage("");
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSavePersonal = (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      // BACKEND TODO: send firstName and lastName to update profile endpoint
      setMessage("Personal information updated successfully. (Placeholder)");
    } catch (err) {
      console.error(err);
      setError("Could not update personal information.");
    }
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      // BACKEND TODO: send email and phone to update profile endpoint
      setMessage("Contact information updated successfully. (Placeholder)");
    } catch (err) {
      console.error(err);
      setError("Could not update contact information.");
    }
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("Please fill out all password fields.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      // BACKEND TODO: send currentPassword and newPassword to password update endpoint
      setMessage("Password updated successfully. (Placeholder)");

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      console.error(err);
      setError("Could not update password.");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#f7f2ec] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#641414]">
              Account Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your personal details, contact information, and password.
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
                title="Personal Information"
                isOpen={openSection === "personal"}
                onToggle={() => toggleSection("personal")}
              >
                <form
                  onSubmit={handleSavePersonal}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#641414]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#641414]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#641414] px-4 py-2.5 font-medium text-white transition hover:bg-[#4f1010] md:w-fit"
                  >
                    Save Personal Info
                  </button>
                </form>
              </SectionCard>

              <SectionCard
                title="Contact Information"
                isOpen={openSection === "contact"}
                onToggle={() => toggleSection("contact")}
              >
                <form
                  onSubmit={handleSaveContact}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#641414]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(555) 555-5555"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#641414]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#641414] px-4 py-2.5 font-medium text-white transition hover:bg-[#4f1010] md:w-fit"
                  >
                    Save Contact Info
                  </button>
                </form>
              </SectionCard>

              <SectionCard
                title="Security"
                isOpen={openSection === "security"}
                onToggle={() => toggleSection("security")}
              >
                <form
                  onSubmit={handleSavePassword}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#641414]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#641414]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#641414]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#641414] px-4 py-2.5 font-medium text-white transition hover:bg-[#4f1010] md:w-fit"
                  >
                    Update Password
                  </button>
                </form>
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
