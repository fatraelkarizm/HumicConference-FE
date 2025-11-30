"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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

// --- Tipe Data untuk Menu ---
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
  roles?: string[]; // Role yang bisa akses menu ini
};

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
  const { user, logout } = useAuth();

  // Handle logout dengan konfirmasi
  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      try {
        await logout();
        // AuthContext akan handle redirect ke login
      } catch (error) {
        alert('Logout failed. Please try again.');
      }
    }
  };

  // Generate menu items berdasarkan role user
  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      { 
        id: "dashboard", 
        label: "Dashboard", 
        href: "/super-admin/dashboard",  
        icon: Squares2X2Icon,
        roles: ['SUPER_ADMIN', 'ADMIN_ICICYTA', 'ADMIN_ICODSA']
      },
    ];

    // Menu Jadwal - berbeda berdasarkan role
    if (user?.role === 'SUPER_ADMIN') {
      baseItems.push({
        id: "jadwal",
        label: "Manajemen Jadwal",
        icon: CalendarDaysIcon,
        roles: ['SUPER_ADMIN'],
        subItems: [
          { label: "Konferensi ICICyTA", href: "/super-admin/ICICYTA", icon: DocumentTextIcon },
          { label: "Konferensi ICoDSA", href: "/super-admin/ICODSA", icon: DocumentTextIcon },
        ],
      });
    } else if (user?.role === 'ADMIN_ICICYTA') {
      baseItems.push({
        id: "jadwal",
        label: "Jadwal ICICyTA",
        href: "/admin/ICICYTA",
        icon: CalendarDaysIcon,
        roles: ['ADMIN_ICICYTA'],
      });
    } else if (user?.role === 'ADMIN_ICODSA') {
      baseItems.push({
        id: "jadwal",
        label: "Jadwal ICoDSA", 
        href: "/admin/ICODSA",
        icon: CalendarDaysIcon,
        roles: ['ADMIN_ICODSA'],
      });
    }

    // Menu User Management - hanya untuk SUPER_ADMIN
    if (user?.role === 'SUPER_ADMIN') {
      baseItems.push({
        id: "user",
        label: "Manajemen User",
        icon: UserGroupIcon,
        roles: ['SUPER_ADMIN'],
        subItems: [
          { label: "Manajemen Admin", href: "/super-admin/manage-admin", icon: UserPlusIcon },
        ],
      });
    }

    // Menu Profile - hanya untuk SUPER_ADMIN
    if (user?.role === 'SUPER_ADMIN') {
      baseItems.push({
        id: "profile",
        label: "Kelola Profile",
        icon: UserCircleIcon,
        roles: ['SUPER_ADMIN'],
        subItems: [
          { label: "Profile Image", href: "/dashboard/profile/image", icon: PhotoIcon },
          { label: "Change Name", href: "/dashboard/profile/name", icon: PencilIcon },
        ],
      });
    }

    // Logout - untuk semua role
    baseItems.push({ 
      id: "logout", 
      label: "Logout", 
      icon: ArrowLeftStartOnRectangleIcon, 
      onClick: handleLogout,
      roles: ['SUPER_ADMIN', 'ADMIN_ICICYTA', 'ADMIN_ICODSA']
    });

    return baseItems;
  };

  // Filter menu berdasarkan role user
  const filteredMenuItems = getMenuItems().filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  );

  // Title berdasarkan role
  const getTitle = () => {
    switch (user?.role) {
      case 'ADMIN_ICICYTA':
        return 'Conference Schedule';
      case 'ADMIN_ICODSA':
        return 'Conference Schedule';
      default:
        return 'Conference Schedule';
    }
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      
      <div className={`w-[330px] h-screen bg-[#015B97] flex flex-col flex-shrink-0 fixed left-0 top-0 z-50 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white lg:hidden">
          <XMarkIcon className="w-6 h-6" />
        </button>
        
        {/* Header dengan title dinamis */}
        <div className="p-[50px_55px_20px] text-center">
          <h1 className="text-white font-satoshi text-3xl font-semibold leading-normal whitespace-pre-line">
            {getTitle()}
          </h1>
          {user && (
            <div className="mt-2 text-white/70 text-sm">
              Welcome, {user.name}
            </div>
          )}
        </div>

        {/* Menu Navigation */}
        <div className="flex-1 px-[25px] pt-8 overflow-y-auto">
          <nav className="flex flex-col gap-[18px]">
            {filteredMenuItems.map((item) => 
                item.subItems ? (
                    <CollapsibleMenuItem key={item.id} item={item} />
                ) : (
                    <SingleMenuItem key={item.id} item={item} isActive={pathname === item.href} />
                )
            )}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/20">
          <div className="text-white/60 text-xs text-center">
            <div>Role: {user?.role || 'Unknown'}</div>
            <div>User: {user?.email || 'Unknown'}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;