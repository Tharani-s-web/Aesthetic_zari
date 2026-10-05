"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Package,
  Heart,
  MapPin,
  LogOut,
  ChevronRight,
} from "lucide-react";

import API_BASE_URL from "../../lib/api";
import { getToken, removeToken } from "../../lib/auth";

export default function AccountPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch profile");
      }

      setUser(data.user);
    } catch (error) {
      console.error("Profile fetch error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-[var(--cream)] px-6 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-[var(--text-muted)]">
            Loading your account...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[var(--cream)] px-6 py-10 md:py-16">
      <div className="mx-auto max-w-5xl">

        {/* PAGE HEADER */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            My Account
          </p>

          <h1 className="mt-2 text-4xl font-semibold text-[var(--primary)] md:text-5xl">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>

          <p className="mt-3 text-[var(--text-muted)]">
            Manage your profile, orders, addresses and saved items.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* PROFILE CARD */}
        <div className="rounded-3xl border border-[var(--border-light)] bg-white p-6 md:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--beige)]">
              <User size={32} className="text-[var(--primary)]" />
            </div>

            {/* User Details */}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-[var(--primary)]">
                {user?.name || "User"}
              </h2>

              <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  {user?.email || "Email not available"}
                </div>

                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  {user?.phone || "Phone number not available"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACCOUNT OPTIONS */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">

          <AccountLink
            href="/orders"
            icon={<Package size={22} />}
            title="My Orders"
            description="Track and manage your orders"
          />

          <AccountLink
            href="/wishlist"
            icon={<Heart size={22} />}
            title="Wishlist"
            description="View your saved creations"
          />

          <AccountLink
            href="/checkout"
            icon={<MapPin size={22} />}
            title="Saved Addresses"
            description="Manage your delivery addresses"
          />

          <button
            onClick={handleLogout}
            className="group flex w-full items-center justify-between rounded-3xl border border-red-100 bg-white p-6 text-left transition hover:border-red-300 hover:shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <LogOut size={22} />
              </div>

              <div>
                <h3 className="font-semibold text-red-600">
                  Logout
                </h3>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Sign out securely from your account
                </p>
              </div>
            </div>

            <ChevronRight
              size={20}
              className="text-red-400 transition group-hover:translate-x-1"
            />
          </button>

        </div>
      </div>
    </section>
  );
}

function AccountLink({ href, icon, title, description }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-3xl border border-[var(--border-light)] bg-white p-6 transition hover:border-[var(--gold)] hover:shadow-sm"
    >
      <div className="flex items-center gap-4">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--beige)] text-[var(--primary)]">
          {icon}
        </div>

        <div>
          <h3 className="font-semibold text-[var(--primary)]">
            {title}
          </h3>

          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {description}
          </p>
        </div>
      </div>

      <ChevronRight
        size={20}
        className="text-[var(--text-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--gold)]"
      />
    </Link>
  );
}