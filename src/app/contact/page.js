"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState } from "react";

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // OPTIONAL TODO: send message to backend endpoint 
    // TEMP: success message only
    setStatus("Thank you! Your message has been sent.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div>
      <Navbar />

      <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12 font-serif text-[#3b3b3b] overflow-x-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center bg-fixed brightness-75"
          style={{ backgroundImage: 'url("/img/contact.jpg")' }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 -z-10 bg-black/50" />

        {/* Form card */}
        <div className="w-full max-w-xl rounded-xl bg-white/90 p-8 md:p-10 shadow-2xl text-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#8a2a2a] mb-2">
            Contact Us
          </h1>

          <p className="text-sm md:text-base text-gray-600 mb-6">
            We would love to hear from you. Please reach out with any questions,
            comments, or just to say hello!
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
            <div className="w-full text-left">
              <label htmlFor="name" className="block font-bold mb-1">
                Name:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
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
              <label htmlFor="message" className="block font-bold mb-1">
                Message:
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 p-2 text-base h-28 resize-none focus:outline-none focus:ring-2 focus:ring-[#8a2a2a]/40"
              />
            </div>

            {status && (
              <p className="text-green-600 text-base mt-2">{status}</p>
            )}

            <button
              type="submit"
              className="w-full mt-2 rounded-md bg-[#8a2a2a] py-3 text-white font-semibold hover:bg-[#641414] transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
