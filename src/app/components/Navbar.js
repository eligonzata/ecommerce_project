"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCartIcon } from "@heroicons/react/24/solid";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const Navbar = () => {
  const [cartCount, setCartCount] = useState(0);
  const [userId, setUserId] = useState(null);

  const navbarBackgroundColor = "#641414";
  const textColor = "#FFFFFF";

  const commonStyles = {
    fontFamily: "Monospace",
    fontWeight: 600,
    fontSize: "14px",
    padding: "45px",
    height: "14px",
  };

  const navbarStyles = {
    backgroundColor: navbarBackgroundColor,
    color: textColor,
    ...commonStyles,
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?.id) {
      setUserId(user.id);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchCartCount = async () => {
      try {
        const response = await fetch(`${API_URL}/cart/${userId}`);
        if (response.ok) {
          const items = await response.json();
          setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
        }
      } catch (err) {
        console.error("Failed to fetch cart:", err);
      }
    };

    fetchCartCount();

    const interval = setInterval(fetchCartCount, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <nav
      style={navbarStyles}
      className="relative top-0 sticky backdrop-blur-lg mx-auto z-50"
    >
      <div className="flex items-center justify-between mt-[-20px]">
        <div className="sm:flex sm:items-center sm:space-x-4 relative sm:top-[-23px] sm:left-4">
          <Link href="/" aria-label="Go to homepage">
            <Image src="/img/logo.png" width={110} height={50} alt="Logo" />
          </Link>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="hidden md:flex lg:space-x-12 md:space-x-6 font-bold">
            <Link href="/" className="hover:text-gray-300">
              Home
            </Link>
            <Link href="/shop" className="hover:text-gray-300">
              Shop
            </Link>
            <Link href="/aboutus" className="hover:text-gray-300">
              About us
            </Link>
            <Link
              href="/account"
              className="bg-gradient-to-r text-transparent bg-clip-text from-[#FF6F61] to-[#FFD700] hover:opacity-90"
            >
              Account
            </Link>
            <Link href="/admin" className="hover:text-gray-300">
              Admin
            </Link>
          </div>
        </div>

        <div className="relative flex items-center space-x-4">
          <Link href="/cart" aria-label="View cart">
            <ShoppingCartIcon className="w-8 h-8 text-white cursor-pointer hover:text-blue-400 transition-colors" />
          </Link>

          {cartCount > 0 && (
            <span className="absolute top-0 right-0 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white"></div>
      </div>
    </nav>
  );
};

export default Navbar;