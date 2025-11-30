// src/app/user/layout.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F1F5F9] overflow-x-hidden">
      <header className="bg-white shadow-md relative z-10">
        <nav className="lg:px-12 md:px-8 px-4  py-4 flex justify-between items-center bg-[#015B97]">
          <Link href="/user" className="text-2xl font-semibold text-white">
            Humic Conference
          </Link>

          {/* Link Desktop: Sembunyikan di mobile */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/user/ICICYTA" className="text-white">
              ICICyTA
            </Link>
            <Link href="/user/ICODSA" className="text-white">
              ICoDSA
            </Link>
            <Link href="/user/parallel" className="text-white">
              Parallel
            </Link>
            <Link href="/user/about" className="text-white">
              About
            </Link>
          </div>

          {/* Tombol Hamburger: Tampil hanya di mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-white focus:outline-none"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu (Slide-in dari kanan) */}
      <div
        className={`
          md:hidden fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white shadow-xl z-30
          transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header di dalam Menu (UPDATE DI SINI) */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="text-xl font-semibold text-gray-800">
            Humic Conference
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-700 focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Link Navigasi Mobile */}
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/user/ICICYTA"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => setIsMenuOpen(false)}
          >
            ICICyTA
          </Link>
          <Link
            href="/user/ICODSA"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => setIsMenuOpen(false)}
          >
            ICoDSA
          </Link>
          <Link
            href="/user/about"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
        </div>
      </div>

      {/* Overlay (UPDATE DI SINI) */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      <main>{children}</main>
    </div>
  );
}
