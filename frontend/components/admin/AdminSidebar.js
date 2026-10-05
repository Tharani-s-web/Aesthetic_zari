"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  LogOut,
  Store,
} from "lucide-react";

import { logout } from "../../lib/auth";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: Tags,
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-[var(--border-light)] bg-white">

      {/* Logo */}

      <div className="flex h-20 items-center gap-3 border-b border-[var(--border-light)] px-6">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
          <Store size={20} />
        </div>

        <div>
          <h1 className="font-semibold text-[var(--primary)]">
            Aesthetic Zari
          </h1>

          <p className="text-xs text-[var(--text-muted)]">
            Admin Panel
          </p>
        </div>

      </div>

      {/* Navigation */}

      <nav className="flex-1 space-y-2 p-4">

        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--text-dark)] hover:bg-[var(--beige)]"
              }`}
            >
              <Icon size={19} />

              {item.name}
            </Link>
          );
        })}

      </nav>

      {/* Logout */}

      <div className="border-t border-[var(--border-light)] p-4">

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
        >
          <LogOut size={19} />

          Logout
        </button>

      </div>

    </aside>
  );
}