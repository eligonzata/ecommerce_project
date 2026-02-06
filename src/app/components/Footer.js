"use client";

import { useContext, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import ThemeContext from "@/context/ThemeContext";

const Footer = () => {
  const themeContext = useContext(ThemeContext);
  const [email, setEmail] = useState("");

  if (!themeContext) {
    throw new Error("Footer must be used within a ThemeProvider");
  }

  const { theme } = themeContext;

  const lightModeStyles = {
    backgroundColor: "#FFFFFF",
    color: "#4B5563",
  };

  const darkModeStyles = {
    backgroundColor: "#000000",
    color: "#D1D5DB",
  };

  const currentStyles = theme === "light" ? lightModeStyles : darkModeStyles;

  const gradientImage =
    theme === "light" ? "" : "/img/exchange-hero-red-bg.png";

  function emailBtnHandler() {
    // OPTIONAL TODO: submit email to newsletter endpoint or just delete
    // TEMP: no-op
    console.log("Newsletter signup email:", email);
    setEmail("");
  }

  return (
    <footer
      style={currentStyles}
      className="relative py-10 overflow-x-hidden overflow-y-hidden inset-0 z-0"
    >
      {/* Black line at the top */}
      <div className="border-t-2 border-black w-full absolute top-0 left-0" />

      {/* Footer for md and bigger screens */}
      <div className="container hidden md:flex flex-col md:flex-row md:space-x-8 lg:space-x-24 md:space-y-4 md:ml-12 lg:ml-24">
        {/* Logo and Description Container */}
        <div className="flex flex-col space-y-4 z-10">
          <div className="flex items-center space-x-2">
            <Image
              src="/img/logo.png"
              width={150}
              height={50}
              alt="Logo"
              priority
            />
          </div>

          <p className="text-gray-600 max-w-sm">
            Sign up to get the latest in news, discounts, opportunities, and more.
          </p>

          <div className="relative w-full max-w-sm m-0 p-0.5 rounded-lg bg-gradient-to-r from-[#ffb03b] to-[#ff1f1b]">
            <input
              className="p-3 pr-12 w-full rounded-lg focus:outline-none text-black"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              aria-label="Email Address"
            />
            <button
              type="button"
              className="absolute right-1 top-2 px-3 py-3"
              onClick={emailBtnHandler}
              aria-label="Submit email"
            >
              <FaArrowRight fill="gray" />
            </button>
          </div>

          {/* TODO: maybe add company name */}
          <p className="text-gray-600">&copy; 2026 LLC, all rights reserved.</p>
        </div>

        {/* Navigation Links Container */}
        <div className="flex flex-col space-y-3 text-gray-600 z-10">
          {/*  TODO: replace placeholder routes with real pages */}
          <Link href="/" className="hover:text-black font-semibold">
            Home
          </Link>
          <Link href="/shop" className="hover:text-black">
            Shop
          </Link>
          <Link href="/aboutus" className="hover:text-black">
            About
          </Link>
          <Link href="/contact" className="hover:text-black">
            Contact
          </Link>
        </div>

        {/* Policy + Social Links Container */}
        <div className="flex flex-col space-y-3 text-gray-600 z-10">
          <p className="font-semibold">Privacy Policy and Terms of Service</p>

          {/* maybe delete these*/}
          <Link href="/privacy" className="hover:text-black">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-black">
            Terms & Conditions
          </Link>

          <div className="flex space-x-2 mt-4">
            {/* External links should be <a> with target/rel */}
            <a
              href="https://telegram.org"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-16"
              aria-label="Telegram"
            >
              <Image
                src="/img/telegram-icon-light.png"
                width={30}
                height={30}
                alt="Telegram Logo"
                priority
              />
            </a>

            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-16"
              aria-label="X"
            >
              <Image
                src="/img/x-icon-light.png"
                width={30}
                height={30}
                alt="X Logo"
                priority
              />
            </a>

            {/* BACKEND TODO: add real Instagram link */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-16"
              aria-label="Instagram"
            >
              <Image
                src="/img/instagram-icon-light.png"
                width={30}
                height={30}
                alt="Instagram Logo"
                priority
              />
            </a>
          </div>
        </div>
      </div>

      {/* Right side gradient image */}
      <div className="hidden md:absolute md:right-0 md:top-0 md:h-full md:w-1/3 z-10 md:block">
        <div
          className="h-full bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${gradientImage})`,
            backgroundSize: "cover",
            backgroundPosition: "left",
          }}
        />
      </div>
    </footer>
  );
};

export default Footer;