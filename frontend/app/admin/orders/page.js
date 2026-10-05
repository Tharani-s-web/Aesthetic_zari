"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Package, RefreshCw } from "lucide-react";

import API_BASE_URL from "../../../lib/api";
import { getToken } from "../../../lib/auth";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH ALL ORDERS
  // ==========================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/orders`,
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
      console.error("Fetch orders error:", error);
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
    const styles = {
      pending:
        "bg-yellow-50 text-yellow-700 border-yellow-200",

      confirmed:
        "bg-blue-50 text-blue-700 border-blue-200",

      processing:
        "bg-purple-50 text-purple-700 border-purple-200",

      shipped:
        "bg-indigo-50 text-indigo-700 border-indigo-200",

      delivered:
        "bg-green-50 text-green-700 border-green-200",

      cancelled:
        "bg-red-50 text-red-700 border-red-200",
    };

    return (
      styles[status?.toLowerCase()] ||
      "bg-gray-50 text-gray-700 border-gray-200"
    );
  };

  return (
    <section className="min-h-screen bg-[var(--cream)] p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--gold)]">
              Order Management
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[var(--primary)]">
              Orders
            </h1>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Monitor customer orders and manage order status.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border-light)] bg-white px-5 py-3 text-sm font-medium text-[var(--primary)] transition hover:border-[var(--gold)] disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="rounded-2xl border border-[var(--border-light)] bg-white p-10 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Loading orders...
            </p>
          </div>
        ) : orders.length === 0 ? (

          /* EMPTY STATE */

          <div className="rounded-2xl border border-[var(--border-light)] bg-white px-6 py-16 text-center">

            <Package
              size={40}
              className="mx-auto text-[var(--gold)]"
            />

            <h2 className="mt-4 text-xl font-semibold text-[var(--primary)]">
              No orders yet
            </h2>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Customer orders will appear here once they are placed.
            </p>

          </div>

        ) : (

          <>
            {/* ORDER COUNT */}

            <p className="mb-5 text-sm text-[var(--text-muted)]">
              Total {orders.length}{" "}
              {orders.length === 1 ? "order" : "orders"}
            </p>

            {/* DESKTOP TABLE */}

            <div className="hidden overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white md:block">

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-[var(--cream)]">

                    <tr className="border-b border-[var(--border-light)]">

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Order
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Customer
                      </th>

                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Items
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Total
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Status
                      </th>

                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {orders.map((order) => (

                      <tr
                        key={order.id}
                        className="border-b border-[var(--border-light)] last:border-none"
                      >

                        {/* ORDER NUMBER */}

                        <td className="px-6 py-5">

                          <p className="font-medium text-[var(--primary)]">
                            {order.order_number}
                          </p>

                          <p className="mt-1 text-xs text-[var(--text-muted)]">
                            {new Date(
                              order.created_at
                            ).toLocaleDateString("en-IN")}
                          </p>

                        </td>

                        {/* CUSTOMER */}

                        <td className="px-6 py-5">

                          <p className="font-medium text-[var(--primary)]">
                            {order.customer_name}
                          </p>

                          <p className="mt-1 text-xs text-[var(--text-muted)]">
                            {order.customer_email}
                          </p>

                        </td>

                        {/* ITEMS */}

                        <td className="px-6 py-5 text-center text-sm text-[var(--text-dark)]">
                          {order.total_items}
                        </td>

                        {/* TOTAL */}

                        <td className="px-6 py-5 font-semibold text-[var(--secondary)]">
                          ₹
                          {Number(
                            order.total_amount
                          ).toLocaleString("en-IN")}
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-5">

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(
                              order.order_status
                            )}`}
                          >
                            {order.order_status}
                          </span>

                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-5 text-center">

                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-light)] text-[var(--primary)] transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
                            aria-label="View order"
                          >
                            <Eye size={17} />
                          </Link>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

            {/* MOBILE CARDS */}

            <div className="space-y-4 md:hidden">

              {orders.map((order) => (

                <div
                  key={order.id}
                  className="rounded-2xl border border-[var(--border-light)] bg-white p-5"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="font-semibold text-[var(--primary)]">
                        {order.order_number}
                      </p>

                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {order.customer_name}
                      </p>

                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(
                        order.order_status
                      )}`}
                    >
                      {order.order_status}
                    </span>

                  </div>

                  <div className="mt-5 flex items-center justify-between">

                    <div>

                      <p className="text-xs text-[var(--text-muted)]">
                        Total
                      </p>

                      <p className="mt-1 font-semibold text-[var(--secondary)]">
                        ₹
                        {Number(
                          order.total_amount
                        ).toLocaleString("en-IN")}
                      </p>

                    </div>

                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="rounded-lg border border-[var(--border-light)] px-4 py-2 text-sm font-medium text-[var(--primary)]"
                    >
                      View Order
                    </Link>

                  </div>

                </div>

              ))}

            </div>

          </>
        )}

      </div>
    </section>
  );
}