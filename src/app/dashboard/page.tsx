// src/app/dashboard/page.tsx

"use client"; // Wajib karena menggunakan hook (useEffect, useRouter, useAuth)

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Sesuaikan path jika perlu

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Hook ini akan memproteksi halaman
  useEffect(() => {
    // Jika pengecekan sesi selesai dan tidak ada user, redirect ke halaman login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memuat sesi...</p>
      </div>
    );
  }
  return user ? (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4">
          Selamat Datang di Dashboard!
        </h1>
        <p className="text-lg">
          Halo, <span className="font-semibold">{user.name}</span>!
        </p>
        <p className="text-gray-600">{user.email}</p>
        <button
          onClick={logout}
          className="mt-6 bg-[#015B97] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#014d80] transition"
        >
          Logout
        </button>
      </div>
    </div>
  ) : null;
}