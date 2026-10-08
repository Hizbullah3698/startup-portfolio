"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getMe, logoutAdmin } from "@/lib/adminApi";
import type { AdminUser } from "@/types/admin";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoginPage) {
      getMe()
        .then(setUser)
        .catch(() => {
          // Handled by api interceptor
        });
    }
  }, [isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Dashboard", path: "/admin" },
    { name: "Projects", path: "/admin/projects" },
    { name: "Services", path: "/admin/services" },
    { name: "Testimonials", path: "/admin/testimonials" },
    { name: "Inquiries", path: "/admin/inquiries" },
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`block px-4 py-2 rounded transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
          <div className="font-medium text-lg">
            {navItems.find((item) => item.path === pathname)?.name || "Admin"}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <span className="text-gray-300">Welcome, {user.username}</span>
            ) : (
              <span className="text-gray-500 animate-pulse">Loading...</span>
            )}
            <button
              onClick={() => logoutAdmin()}
              className="px-4 py-2 bg-red-600/10 text-red-500 rounded hover:bg-red-600 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
