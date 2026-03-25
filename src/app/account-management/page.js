"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SectionCard from "../components/SectionCard";

import { useAuth } from "../../context/AuthContext";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";


export default function AccountManagement() {
  const router = useRouter();
  const { user, setUser, logout } = useAuth();
  useEffect(() => {
    if (user === null) {
      // not logged in
      router.push("/sign-in"); // redirects to login page
    }
  }, [user]);
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
  //added async
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      //made it take from backend
      const response = await fetch(`${API_URL}/users/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user");
      }
      setMessage("Personal information updated successfully!");
      //updates the user currently so we don't fetch again from backend this could probably be done better
      user.name = formData.firstName + " " + formData.lastName;
    } catch (err) {
      console.error(err);
      setError("Could not update personal information.");
    }
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const updates = {};

      if (formData.email) updates.email = formData.email;
      if (formData.phone) updates.phone = formData.phone;

      if (Object.keys(updates).length === 0) {
        setError("Please enter at least one field to update.");
        return;
      }

      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user");
      }
      //updates the user currently so we don't fetch again from backend this could probably be done better
      user.email = formData.email;
      setMessage("Contact information updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Could not update contact information.");
    }
  };
// added functionality this function calls /user/<id>/password to update the users password
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
 
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError("Please fill out all password fields.");
      return;
    }
 
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
 
    try {
      const response = await fetch(`${API_URL}/users/${user.id}/password`, { //calls the new route in main.py to update the users password
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: formData.currentPassword, //sends the current password to verify before updating
          new_password: formData.newPassword,
        }),
      });
 
      const data = await response.json();
 
      if (!response.ok) {
        throw new Error(data.error || "Failed to update password");
      }
 
      setMessage("Password updated successfully!");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      console.error(err);
      setError(err.message);
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
                        required
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
                        required
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
