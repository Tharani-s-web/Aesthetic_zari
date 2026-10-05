"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Package,
  ShoppingBag,
  IndianRupee,
  Clock,
  TrendingUp,
} from "lucide-react";

import API_BASE_URL from "../../../lib/api";
import { getToken } from "../../../lib/auth";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderStatusSummary, setOrderStatusSummary] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Authentication token not found");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch dashboard data"
        );
      }

      setDashboard(data.dashboard);
      setRecentOrders(data.recent_orders || []);
      setOrderStatusSummary(data.order_status_summary || []);

    } catch (error) {
      console.error("Dashboard error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-[var(--cream)] p-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-[var(--text-muted)]">
            Loading dashboard...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-[var(--cream)] p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl bg-red-50 p-5 text-red-600">
            {error}
          </div>

          <button
            onClick={fetchDashboard}
            className="mt-5 rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-medium text-white"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  const stats = [
    {
      name: "Total Customers",
      value: dashboard?.total_customers || 0,
      icon: Users,
    },
    {
      name: "Total Products",
      value: dashboard?.total_products || 0,
      icon: Package,
    },
    {
      name: "Total Orders",
      value: dashboard?.total_orders || 0,
      icon: ShoppingBag,
    },
    {
      name: "Total Revenue",
      value: `₹${Number(
        dashboard?.total_revenue || 0
      ).toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
    {
      name: "Pending Orders",
      value: dashboard?.pending_orders || 0,
      icon: Clock,
    },
  ];

  return (
    <section className="min-h-screen bg-[var(--cream)] p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--gold)]">
              Admin Panel
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[var(--primary)]">
              Dashboard Overview
            </h1>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Monitor your store performance and recent activity.
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2 self-start rounded-xl border border-[var(--border-light)] bg-white px-4 py-2 text-sm font-medium transition hover:border-[var(--gold)]"
          >
            <TrendingUp size={17} />
            Refresh
          </button>
        </div>

        {/* STATISTICS */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.name}
                className="rounded-2xl border border-[var(--border-light)] bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--text-muted)]">
                    {stat.name}
                  </p>

                  <div className="rounded-xl bg-[var(--beige)] p-2 text-[var(--primary)]">
                    <Icon size={18} />
                  </div>
                </div>

                <h2 className="mt-5 text-2xl font-semibold text-[var(--primary)]">
                  {stat.value}
                </h2>
              </div>
            );
          })}

        </div>

        {/* MAIN GRID */}

        <div className="mt-8 grid gap-8 lg:grid-cols-3">

          {/* RECENT ORDERS */}

          <div className="rounded-2xl border border-[var(--border-light)] bg-white p-6 lg:col-span-2">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--primary)]">
                  Recent Orders
                </h2>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Latest customer purchases
                </p>
              </div>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-10 text-center text-sm text-[var(--text-muted)]">
                No orders available yet.
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm">

                  <thead>
                    <tr className="border-b border-[var(--border-light)] text-[var(--text-muted)]">
                      <th className="pb-3 font-medium">
                        Order
                      </th>

                      <th className="pb-3 font-medium">
                        Customer
                      </th>

                      <th className="pb-3 font-medium">
                        Amount
                      </th>

                      <th className="pb-3 font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-[var(--border-light)] last:border-none"
                      >
                        <td className="py-4 font-medium text-[var(--primary)]">
                          {order.order_number}
                        </td>

                        <td className="py-4 text-[var(--text-dark)]">
                          {order.customer_name}
                        </td>

                        <td className="py-4">
                          ₹
                          {Number(
                            order.total_amount
                          ).toLocaleString("en-IN")}
                        </td>

                        <td className="py-4">
                          <span className="rounded-full bg-[var(--beige)] px-3 py-1 text-xs font-medium text-[var(--primary)]">
                            {order.order_status}
                          </span>
                        </td>
                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>

          {/* ORDER STATUS */}

          <div className="rounded-2xl border border-[var(--border-light)] bg-white p-6">

            <h2 className="text-lg font-semibold text-[var(--primary)]">
              Order Status
            </h2>

            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Current order distribution
            </p>

            <div className="mt-6 space-y-4">

              {orderStatusSummary.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  No order data available.
                </p>
              ) : (
                orderStatusSummary.map((status) => (
                  <div
                    key={status.order_status}
                    className="flex items-center justify-between rounded-xl bg-[var(--cream)] px-4 py-3"
                  >
                    <span className="capitalize text-sm text-[var(--text-dark)]">
                      {status.order_status}
                    </span>

                    <span className="font-semibold text-[var(--primary)]">
                      {status.count}
                    </span>
                  </div>
                ))
              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}