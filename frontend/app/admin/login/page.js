"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

import API_BASE_URL from "../../../lib/api";
import { saveAuth } from "../../../lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      // Check whether logged-in user is admin
      if (data.user.role !== "admin") {
        setError("Access denied. Admin privileges required.");
        return;
      }

      // Save admin authentication
      saveAuth(data.token, data.user);

      // Redirect to admin dashboard
      router.push("/admin/dashboard");
      router.refresh();

    } catch (error) {
      console.error("Admin login error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-6 py-12">

      <div className="w-full max-w-md rounded-3xl border border-[var(--border-light)] bg-white p-8 shadow-sm md:p-10">

        {/* Header */}

        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white">
            <LockKeyhole size={24} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            Aesthetic Zari
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-[var(--primary)]">
            Admin Portal
          </h1>

          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Sign in to manage your store
          </p>

        </div>

        {/* Error Message */}

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          {/* Email */}

          <div>

            <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
              Email Address
            </label>

            <div className="relative">

              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter admin email"
                className="w-full rounded-xl border border-[var(--border-light)] px-11 py-3 outline-none transition focus:border-[var(--gold)]"
              />

            </div>

          </div>

          {/* Password */}

          <div>

            <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
              Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter password"
                className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 pr-12 outline-none transition focus:border-[var(--gold)]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>

          {/* Login Button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[var(--primary)] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in as Admin"}
          </button>

        </form>

        {/* Back to Store */}

        <div className="mt-8 text-center">

          <Link
            href="/"
            className="text-sm text-[var(--text-muted)] transition hover:text-[var(--gold)]"
          >
            ← Back to Store
          </Link>

        </div>

      </div>

    </section>
  );
}