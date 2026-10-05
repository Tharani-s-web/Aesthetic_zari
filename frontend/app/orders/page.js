"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";

import API_BASE_URL from "../../lib/api";
import { getToken } from "../../lib/auth";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = getToken();

    // Redirect/login message handling can be improved later
    if (!token) {
      setError("Please login to view your orders.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Orders fetch error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-50 text-green-700";

      case "cancelled":
        return "bg-red-50 text-red-600";

      case "processing":
        return "bg-blue-50 text-blue-700";

      case "shipped":
        return "bg-purple-50 text-purple-700";

      case "pending":
      default:
        return "bg-yellow-50 text-yellow-700";
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-[var(--cream)] px-6 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-[var(--text-muted)]">
            Loading your orders...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[var(--cream)] px-6 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            Your Purchases
          </p>

          <h1 className="mt-2 text-4xl font-semibold text-[var(--primary)] md:text-5xl">
            My Orders
          </h1>

          <p className="mt-3 text-[var(--text-muted)]">
            Track and manage all your Aesthetic Zari orders.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty Orders */}
        {!error && orders.length === 0 && (
          <div className="rounded-3xl border border-[var(--border-light)] bg-white px-6 py-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--beige)] text-[var(--primary)]">
              <Package size={28} />
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-[var(--primary)]">
              No orders yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--text-muted)]">
              You haven't placed any orders yet. Explore our collection and
              find something special.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--secondary)]"
            >
              <ShoppingBag size={17} />
              Start Shopping
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!error && orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="group block rounded-3xl border border-[var(--border-light)] bg-white p-6 transition hover:border-[var(--gold)] hover:shadow-sm"
              >
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

                  {/* Order Information */}
                  <div>
                    <div className="flex flex-wrap items-center gap-3">

                      <h2 className="text-lg font-semibold text-[var(--primary)]">
                        Order #{order.order_number}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                          order.order_status
                        )}`}
                      >
                        {order.order_status || "Pending"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                      Placed on{" "}
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "N/A"}
                    </p>
                  </div>

                  {/* Order Amount */}
                  <div className="flex items-center justify-between gap-8 md:justify-end">

                    <div className="text-left md:text-right">
                      <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                        Total Amount
                      </p>

                      <p className="mt-1 text-lg font-semibold text-[var(--secondary)]">
                        ₹
                        {Number(
                          order.total_amount || 0
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <ChevronRight
                      size={22}
                      className="text-[var(--text-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--gold)]"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}