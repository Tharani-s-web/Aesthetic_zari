"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ChevronRight,
  ShoppingBag,
  Clock,
} from "lucide-react";

import API_BASE_URL from "../../lib/api";
import { getToken } from "../../lib/auth";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH USER ORDERS
  // ==========================================

  const fetchOrders = async () => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch orders"
        );
      }

      setOrders(data.orders || []);

    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setError(error.message);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-50 text-yellow-700";

      case "confirmed":
        return "bg-blue-50 text-blue-700";

      case "processing":
        return "bg-purple-50 text-purple-700";

      case "shipped":
        return "bg-indigo-50 text-indigo-700";

      case "delivered":
        return "bg-green-50 text-green-700";

      case "cancelled":
        return "bg-red-50 text-red-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--cream)]">
        <div className="text-center">
          <Package
            size={35}
            className="mx-auto animate-bounce text-[var(--gold)]"
          />

          <p className="mt-4 text-[var(--text-muted)]">
            Loading your orders...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!getToken()) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] px-6 text-center">
        <Package
          size={50}
          className="text-[var(--gold)]"
        />

        <h1 className="mt-5 text-3xl font-semibold text-[var(--primary)]">
          Please Login
        </h1>

        <p className="mt-3 text-[var(--text-muted)]">
          Login to view your orders.
        </p>

        <Link
          href="/login"
          className="mt-6 rounded-full bg-[var(--primary)] px-7 py-3 text-sm font-semibold text-white"
        >
          Login
        </Link>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] px-6">
        <Package
          size={45}
          className="text-red-400"
        />

        <p className="mt-4 text-red-500">
          {error}
        </p>

        <button
          onClick={fetchOrders}
          className="mt-6 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white"
        >
          Try Again
        </button>
      </main>
    );
  }

  // ==========================================
  // EMPTY ORDERS
  // ==========================================

  if (orders.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] px-6 text-center">
        <ShoppingBag
          size={55}
          className="text-[var(--gold)]"
        />

        <h1 className="mt-5 text-3xl font-semibold text-[var(--primary)]">
          No Orders Yet
        </h1>

        <p className="mt-3 max-w-md text-[var(--text-muted)]">
          You haven't placed any orders yet. Explore our collection and
          find something special.
        </p>

        <Link
          href="/products"
          className="mt-7 rounded-full bg-[var(--primary)] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[var(--secondary)]"
        >
          Start Shopping
        </Link>
      </main>
    );
  }

  // ==========================================
  // ORDERS PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-[var(--cream)] px-6 py-10 md:py-16">
      <div className="mx-auto max-w-5xl">

        {/* PAGE HEADING */}

        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            Your Purchases
          </p>

          <h1 className="mt-2 text-4xl font-semibold text-[var(--primary)]">
            My Orders
          </h1>

          <p className="mt-3 text-[var(--text-muted)]">
            Track and manage your recent orders.
          </p>
        </div>

        {/* ORDERS */}

        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                {/* LEFT */}

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-semibold text-[var(--primary)]">
                      {order.order_number}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                        order.order_status
                      )}`}
                    >
                      {order.order_status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--text-muted)]">

                    <span className="flex items-center gap-2">
                      <Clock size={15} />
                      {new Date(
                        order.created_at
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    <span>
                      {order.total_items}{" "}
                      {Number(order.total_items) === 1
                        ? "item"
                        : "items"}
                    </span>

                    <span className="font-medium text-[var(--text-dark)]">
                      ₹
                      {Number(
                        order.total_amount
                      ).toLocaleString("en-IN")}
                    </span>

                  </div>
                </div>

                {/* RIGHT */}

                <div className="flex items-center gap-4">

                  {/* PAYMENT STATUS */}

                  <div className="text-right">
                    <p className="text-xs text-[var(--text-muted)]">
                      Payment
                    </p>

                    <p className="mt-1 text-sm font-medium capitalize text-[var(--text-dark)]">
                      {order.payment_status}
                    </p>
                  </div>

                  {/* VIEW BUTTON */}

                  <Link
                    href={`/orders/${order.id}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-light)] transition hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
                    aria-label="View order"
                  >
                    <ChevronRight size={19} />
                  </Link>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}