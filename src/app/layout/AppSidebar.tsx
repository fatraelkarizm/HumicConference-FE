"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import {
  Squares2X2Icon,
  CalendarDaysIcon,
  UserGroupIcon,
  UserCircleIcon,
  ArrowLeftStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  DocumentTextIcon, 
  UserPlusIcon,     
  PhotoIcon,        
  PencilIcon,       
} from "@heroicons/react/24/outline";

// --- Tipe Data untuk Menu (Menambahkan ikon untuk sub-menu) ---
type SubMenuItem = {
  label: string;
  href: string;
  icon: React.ElementType; 
};

type MenuItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  subItems?: SubMenuItem[];
  onClick?: () => void;
};

// --- DATA MENU: Semua menu diatur dari sini ---
const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/super-admin/dashboard",  icon: Squares2X2Icon },
  {
    id: "jadwal",
    label: "Manajemen Jadwal",
    icon: CalendarDaysIcon,
    subItems: [
      { label: "Jadwal ICICyTA", href: "/super-admin/ICICyta", icon: DocumentTextIcon },
      { label: "Jadwal ICoDSA", href: "/super-admin/ICoDSA", icon: DocumentTextIcon },
    ],
  },
  {
    id: "user",
    label: "Manajemen User",
    icon: UserGroupIcon,
    subItems: [
      { label: "Manajemen Admin", href: "/super-admin/manage-admin", icon: UserPlusIcon },
    ],
  },
  {
    id: "profile",
    label: "Kelola Profile",
    icon: UserCircleIcon,
    subItems: [
      { label: "Profile Image", href: "/dashboard/profile/image", icon: PhotoIcon },
      { label: "Change Name", href: "/dashboard/profile/name", icon: PencilIcon },
    ],
  },
  { id: "logout", label: "Logout", icon: ArrowLeftStartOnRectangleIcon, onClick: () => console.log('Logout!') },
];


// --- MODUL 1: Komponen Link Tunggal ---
const SingleMenuItem = ({ item, isActive }: { item: MenuItem; isActive: boolean }) => (
  <Link
    href={item.href || '#'}
    onClick={item.onClick}
    className={`rounded-[3px] px-[15px] py-2 flex items-center gap-2.5 cursor-pointer transition-colors ${
      isActive ? 'bg-[#333A48]' : 'hover:bg-[#333A48]' 
    }`}
  >
    <item.icon className="w-5 h-5 text-white flex-shrink-0" />
    <span className="text-white font-satoshi text-base font-medium">
      {item.label}
    </span>
  </Link>
);

// --- MODUL 2: Komponen Menu Dropdown ---
const CollapsibleMenuItem = ({ item }: { item: MenuItem }) => {
  const pathname = usePathname();
  const isAnySubItemActive = item.subItems?.some(sub => pathname.startsWith(sub.href)) || false;
  const [isOpen, setIsOpen] = useState(isAnySubItemActive); 

  return (
    <div className="flex flex-col">
      <div
        className={`rounded-[3px] px-[15px] py-2 flex items-center justify-between cursor-pointer transition-colors ${isAnySubItemActive ? 'bg-[#333A48]' : 'hover:bg-[#333A48]'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <item.icon className="w-5 h-5 text-white flex-shrink-0" />
          <span className="text-white font-satoshi text-base font-medium">
            {item.label}
          </span>
        </div>
        {isOpen ? <ChevronUpIcon className="w-5 h-5 text-white" /> : <ChevronDownIcon className="w-5 h-5 text-white" />}
      </div>

      {isOpen && (
        <div className="pl-[25px] pr-[15px] mt-2 flex flex-col gap-1">
          {item.subItems?.map((subItem) => (
            <Link 
              key={subItem.href} 
              href={subItem.href} 
              className={`flex items-center gap-2.5 rounded-[3px] px-4 py-2 font-satoshi text-base font-medium transition-colors ${
                pathname.startsWith(subItem.href) 
                  ? 'bg-[#333A48] text-white' 
                  : 'text-white/80 hover:bg-[#333A48] hover:text-white'
              }`}
            >
                <subItem.icon className="w-4 h-4 flex-shrink-0" />
                <span>{subItem.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};


// --- KOMPONEN UTAMA: SIDEBAR ---
const Sidebar = ({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) => {
  const pathname = usePathname();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      
      <div className={`w-[330px] h-screen bg-[#015B97] flex flex-col flex-shrink-0 fixed left-0 top-0 z-50 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white lg:hidden">
          <XMarkIcon className="w-6 h-6" />
        </button>
        
        <div className="p-[50px_55px_20px] text-center">
          <h1 className="text-white font-satoshi text-3xl font-semibold  leading-normal">
            Humic<br />Conference
          </h1>
        </div>

        {/* Wrapper untuk menu agar bisa scroll jika menunya panjang */}
        <div className="flex-1 px-[25px] pt-8 overflow-y-auto">
          <nav className="flex flex-col gap-[18px]">
            {menuItems.map((item) => 
                item.subItems ? (
                    <CollapsibleMenuItem key={item.id} item={item} />
                ) : (
                    <SingleMenuItem key={item.id} item={item} isActive={pathname === item.href} />
                )
            )}
          </nav>
        </div>
        
      </div>
    </>
  );
};

export default Sidebar;