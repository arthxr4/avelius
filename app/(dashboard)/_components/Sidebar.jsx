"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings/billing", label: "Plan & Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Menu</h2>
      <nav className="space-y-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
              ${pathname === href
                ? "bg-gray-100 text-black"
                : "text-gray-600 hover:bg-gray-50 hover:text-black"}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        <SignOutButton>
          <button className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
