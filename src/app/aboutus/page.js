"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AboutUs() {
  return (
    <div>
      <Navbar />

      <div className="min-h-screen overflow-hidden bg-gradient-to-r from-[#f1e5d9] via-[#f1e5d9] to-white">
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-0px)]">
          {/* Left image panel */}
          <div className="relative w-full md:w-1/2 h-[50vh] md:h-screen overflow-hidden">
            <img
              src="/img/about.png"
              alt="Serene candles and aromas"
              className="w-full h-full object-cover brightness-75"
            />

            <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6">
              <h1 className="text-white text-center font-bold tracking-widest drop-shadow-lg text-3xl md:text-5xl">
                A World of Scents
              </h1>
            </div>
          </div>

          {/* Right content panel */}
          <div className="w-full md:w-1/2 bg-white flex items-center px-6 md:px-12 py-12 md:py-0">
            <div className="max-w-lg text-left">
              <h1 className="text-[#8a2a2a] text-3xl md:text-4xl font-semibold mb-5">
                Our Story
              </h1>

              <p className="text-[#444] text-base md:text-lg leading-7 md:leading-8 mb-5">
                Welcome to <span className="font-semibold text-[#8a2a2a]">Scent Sanctuary</span>, where
                scents transcend simple aromas. Our candles are crafted to evoke
                emotions, create atmosphere, and transform your space into a
                peaceful sanctuary. We carefully select premium ingredients to
                bring you sustainable and eco-friendly products that are as safe
                as they are luxurious.
              </p>

              <p className="text-[#444] text-base md:text-lg leading-7 md:leading-8">
                From soft floral notes to warm, earthy scents, each candle is
                inspired by the beauty of nature and the essence of tranquility.
                Thank you for being part of our journey and letting us share these
                moments with you.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
