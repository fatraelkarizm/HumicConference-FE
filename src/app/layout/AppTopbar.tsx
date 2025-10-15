"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";

const TopBar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white px-4 shadow-sm sm:px-6 lg:px-8">
      {/* Tombol menu untuk mobile, tersembunyi di layar besar */}
      <button
        onClick={onMenuClick}
        className="text-gray-500 hover:text-gray-700 lg:hidden"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Spacer agar profile user di kanan */}
      <div className="flex-1"></div>

      {/* Tampilkan profil user jika sudah login */}
      {user && (
        <div className="flex items-center gap-3">
           <div className="text-right">
                <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
           </div>
           <div className="w-10 h-10 bg-[#015B97] rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
           </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;