"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Package,
  LogOut,
} from "lucide-react";

import { isLoggedIn, logout } from "../../lib/auth";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/products" },
    { name: "Categories", href: "/categories" },
    { name: "About", href: "/about" },
  ];

  // ==========================================
  // CHECK LOGIN STATUS
  // ==========================================
  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, [pathname]);

  // ==========================================
  // HANDLE LOGOUT
  // ==========================================
  const handleLogout = () => {
    logout();

    setLoggedIn(false);
    setAccountOpen(false);
    setMenuOpen(false);

    router.push("/");
  };

  // ==========================================
  // CLOSE ACCOUNT SIDEBAR
  // ==========================================
  const closeAccount = () => {
    setAccountOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-light)] bg-[var(--cream)]">

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* ==========================================
            LOGO
        ========================================== */}
        <Link
          href="/"
          className="text-2xl font-semibold tracking-wide text-[var(--primary)]"
        >
          Aesthetic Zari
        </Link>

        {/* ==========================================
            DESKTOP NAVIGATION
        ========================================== */}
        <div className="hidden items-center gap-8 md:flex">

          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-[var(--text-dark)] transition hover:text-[var(--gold)]"
            >
              {link.name}
            </Link>
          ))}

        </div>

        {/* ==========================================
            DESKTOP RIGHT SIDE
        ========================================== */}
        <div className="hidden items-center gap-2 md:flex">

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--beige)] hover:text-[var(--gold)]"
            aria-label="Wishlist"
            title="Wishlist"
          >
            <Heart size={21} />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--beige)] hover:text-[var(--gold)]"
            aria-label="Cart"
            title="Cart"
          >
            <ShoppingBag size={21} />
          </Link>

          {/* Account */}
          <button
            onClick={() => setAccountOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--beige)] hover:text-[var(--gold)]"
            aria-label="Account"
            title="My Account"
          >
            <User size={21} />
          </button>

        </div>

        {/* ==========================================
            MOBILE MENU BUTTON
        ========================================== */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>

      </nav>

      {/* ==========================================
          MOBILE MENU
      ========================================== */}
      {menuOpen && (
        <div className="border-t border-[var(--border-light)] bg-[var(--cream)] px-6 py-5 md:hidden">

          <div className="flex flex-col gap-5">

            {/* Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-[var(--text-dark)]"
              >
                {link.name}
              </Link>
            ))}

            {/* ==========================================
                MOBILE ICONS
            ========================================== */}
            <div className="flex items-center gap-6 border-t border-[var(--border-light)] pt-4">

              {/* Search */}
              <button
                aria-label="Search"
                className="transition hover:text-[var(--gold)]"
              >
                <Search size={20} />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                onClick={() => setMenuOpen(false)}
                aria-label="Wishlist"
                className="transition hover:text-[var(--gold)]"
              >
                <Heart size={20} />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                onClick={() => setMenuOpen(false)}
                aria-label="Cart"
                className="transition hover:text-[var(--gold)]"
              >
                <ShoppingBag size={20} />
              </Link>

              {/* Account */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setAccountOpen(true);
                }}
                aria-label="Account"
                className="transition hover:text-[var(--gold)]"
              >
                <User size={20} />
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ==========================================
          ACCOUNT SIDEBAR OVERLAY
      ========================================== */}
      {accountOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/30"
          onClick={closeAccount}
        >

          {/* ==========================================
              ACCOUNT SIDEBAR
          ========================================== */}
          <aside
            className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-[var(--cream)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* ==========================================
                SIDEBAR HEADER
            ========================================== */}
            <div className="flex items-center justify-between border-b border-[var(--border-light)] px-6 py-5">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
                  Account
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[var(--primary)]">
                  My Account
                </h2>

              </div>

              <button
                onClick={closeAccount}
                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--beige)]"
                aria-label="Close account menu"
              >
                <X size={21} />
              </button>

            </div>

            {/* ==========================================
                ACCOUNT OPTIONS
            ========================================== */}
            <div className="flex flex-1 flex-col px-4 py-5">

              {loggedIn ? (
                <>
                  {/* My Orders */}
                  <Link
                    href="/orders"
                    onClick={closeAccount}
                    className="flex items-center gap-4 rounded-xl px-4 py-4 text-[var(--text-dark)] transition hover:bg-[var(--beige)] hover:text-[var(--gold)]"
                  >
                    <Package size={21} />

                    <span className="text-sm font-medium">
                      My Orders
                    </span>
                  </Link>

                  {/* Divider */}
                  <div className="my-4 border-t border-[var(--border-light)]" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 rounded-xl px-4 py-4 text-left text-red-500 transition hover:bg-red-50"
                  >
                    <LogOut size={21} />

                    <span className="text-sm font-medium">
                      Logout
                    </span>
                  </button>
                </>
              ) : (
                <>
                  {/* Login */}
                  <Link
                    href="/login"
                    onClick={closeAccount}
                    className="flex items-center gap-4 rounded-xl px-4 py-4 text-[var(--text-dark)] transition hover:bg-[var(--beige)] hover:text-[var(--gold)]"
                  >
                    <User size={21} />

                    <span className="text-sm font-medium">
                      Login
                    </span>
                  </Link>
                </>
              )}

            </div>

          </aside>

        </div>
      )}

    </header>
  );
}