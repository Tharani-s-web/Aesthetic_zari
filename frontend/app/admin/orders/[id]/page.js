"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Truck,
  Save,
  RefreshCw,
  Clock,
} from "lucide-react";

import API_BASE_URL from "../../../../lib/api";
import { getToken } from "../../../../lib/auth";

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const orderId = params?.id;

  // ==========================================
  // STATES
  // ==========================================

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const statusOptions = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  // ==========================================
  // FETCH ORDER DETAILS
  // ==========================================

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch order details"
        );
      }

      setOrder(data.order);
      setSelectedStatus(data.order.order_status);

    } catch (error) {
      console.error("Fetch order details error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // ==========================================
  // UPDATE ORDER STATUS
  // ==========================================

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    try {
      setUpdatingStatus(true);
      setStatusMessage("");
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/admin/orders/${orderId}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            order_status: selectedStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update order status"
        );
      }

      setStatusMessage("Order status updated successfully!");

      // Refresh order details and tracking
      fetchOrderDetails();

    } catch (error) {
      console.error("Update status error:", error);
      setError(error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

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

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cream)]">
        <RefreshCw
          size={28}
          className="animate-spin text-[var(--gold)]"
        />
      </div>
    );
  }

  // ==========================================
  // ERROR / NOT FOUND
  // ==========================================

  if (error && !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] px-6">
        <h1 className="text-xl font-semibold text-red-600">
          Failed to load order
        </h1>

        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {error}
        </p>

        <Link
          href="/admin/orders"
          className="mt-6 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-medium text-white"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cream)]">
        Order not found
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[var(--cream)] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* BACK BUTTON */}

        <Link
          href="/admin/orders"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--secondary)] transition hover:text-[var(--gold)]"
        >
          <ArrowLeft size={18} />
          Back to Orders
        </Link>

        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-start">

          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--gold)]">
              Order Details
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[var(--primary)]">
              {order.order_number}
            </h1>

            <p className="mt-2 flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <Clock size={15} />

              {new Date(order.created_at).toLocaleString(
                "en-IN"
              )}
            </p>
          </div>

          <span
            className={`w-fit rounded-full border px-4 py-2 text-sm font-medium capitalize ${getStatusStyle(
              order.order_status
            )}`}
          >
            {order.order_status}
          </span>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* SUCCESS MESSAGE */}

        {statusMessage && (
          <div className="mb-6 rounded-xl bg-green-50 px-5 py-4 text-sm text-green-700">
            {statusMessage}
          </div>
        )}

        {/* ORDER STATUS MANAGEMENT */}

        <div className="mb-8 rounded-2xl border border-[var(--border-light)] bg-white p-6">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-[var(--cream)] p-3 text-[var(--gold)]">
              <Truck size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-[var(--primary)]">
                Manage Order Status
              </h2>

              <p className="text-sm text-[var(--text-muted)]">
                Update the current order progress.
              </p>
            </div>

          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value)
              }
              className="flex-1 rounded-xl border border-[var(--border-light)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--gold)]"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() +
                    status.slice(1)}
                </option>
              ))}
            </select>

            <button
              onClick={handleStatusUpdate}
              disabled={
                updatingStatus ||
                selectedStatus === order.order_status
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {updatingStatus
                ? "Updating..."
                : "Update Status"}
            </button>

          </div>

        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          {/* LEFT SIDE */}

          <div className="space-y-8 lg:col-span-2">

            {/* ORDER ITEMS */}

            <div className="rounded-2xl border border-[var(--border-light)] bg-white p-6">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-[var(--cream)] p-3 text-[var(--gold)]">
                  <Package size={22} />
                </div>

                <h2 className="font-semibold text-[var(--primary)]">
                  Ordered Items
                </h2>

              </div>

              <div className="mt-6 space-y-5">

                {order.items?.map((item) => (

                  <div
                    key={item.order_item_id}
                    className="flex flex-col justify-between gap-4 border-b border-[var(--border-light)] pb-5 last:border-none last:pb-0 sm:flex-row"
                  >

                    <div>

                      <h3 className="font-medium text-[var(--primary)]">
                        {item.product_name}
                      </h3>

                      {item.size_name && (
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                          Size: {item.size_name}
                        </p>
                      )}

                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Quantity: {item.quantity}
                      </p>

                      {/* CUSTOMIZATION */}

                      {item.customization_data &&
                        (() => {
                          try {
                            const customization =
                              typeof item.customization_data ===
                              "string"
                                ? JSON.parse(
                                    item.customization_data
                                  )
                                : item.customization_data;

                            if (
                              Object.keys(customization).length ===
                              0
                            ) {
                              return null;
                            }

                            return (
                              <div className="mt-3 rounded-lg bg-[var(--cream)] p-3">

                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--gold)]">
                                  Customization
                                </p>

                                {Object.entries(
                                  customization
                                ).map(([key, value]) => (
                                  <p
                                    key={key}
                                    className="text-sm text-[var(--text-dark)]"
                                  >
                                    <span className="font-medium capitalize">
                                      {key.replace(
                                        /_/g,
                                        " "
                                      )}
                                      :
                                    </span>{" "}
                                    {String(value)}
                                  </p>
                                ))}

                              </div>
                            );
                          } catch {
                            return null;
                          }
                        })()}

                    </div>

                    <div className="text-left sm:text-right">

                      <p className="font-semibold text-[var(--secondary)]">
                        ₹
                        {(
                          Number(item.price) *
                          Number(item.quantity)
                        ).toLocaleString("en-IN")}
                      </p>

                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        ₹
                        {Number(item.price).toLocaleString(
                          "en-IN"
                        )}{" "}
                        each
                      </p>

                    </div>

                  </div>

                ))}

              </div>

              {/* ORDER TOTALS */}

              <div className="mt-6 border-t border-[var(--border-light)] pt-5">

                <div className="flex justify-between text-sm text-[var(--text-muted)]">
                  <span>Subtotal</span>

                  <span>
                    ₹
                    {Number(
                      order.subtotal
                    ).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="mt-3 flex justify-between text-sm text-[var(--text-muted)]">
                  <span>Shipping</span>

                  <span>
                    ₹
                    {Number(
                      order.shipping_charge
                    ).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="mt-4 flex justify-between border-t border-[var(--border-light)] pt-4 text-lg font-semibold text-[var(--primary)]">

                  <span>Total</span>

                  <span>
                    ₹
                    {Number(
                      order.total_amount
                    ).toLocaleString("en-IN")}
                  </span>

                </div>

              </div>

            </div>

            {/* ORDER TRACKING */}

            <div className="rounded-2xl border border-[var(--border-light)] bg-white p-6">

              <h2 className="font-semibold text-[var(--primary)]">
                Order Tracking History
              </h2>

              {order.tracking?.length === 0 ? (

                <p className="mt-5 text-sm text-[var(--text-muted)]">
                  No tracking updates available yet.
                </p>

              ) : (

                <div className="mt-6 space-y-5">

                  {order.tracking?.map((track) => (

                    <div
                      key={track.id}
                      className="border-l-2 border-[var(--gold)] pl-5"
                    >

                      <p className="font-medium capitalize text-[var(--primary)]">
                        {track.status}
                      </p>

                      {track.message && (
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                          {track.message}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-[var(--text-muted)]">
                        {new Date(
                          track.created_at
                        ).toLocaleString("en-IN")}
                      </p>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="space-y-8">

            {/* CUSTOMER */}

            <div className="rounded-2xl border border-[var(--border-light)] bg-white p-6">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-[var(--cream)] p-3 text-[var(--gold)]">
                  <User size={20} />
                </div>

                <h2 className="font-semibold text-[var(--primary)]">
                  Customer
                </h2>

              </div>

              <div className="mt-5">

                <p className="font-medium text-[var(--primary)]">
                  {order.customer_name}
                </p>

                <p className="mt-1 break-all text-sm text-[var(--text-muted)]">
                  {order.customer_email}
                </p>

              </div>

            </div>

            {/* DELIVERY ADDRESS */}

            <div className="rounded-2xl border border-[var(--border-light)] bg-white p-6">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-[var(--cream)] p-3 text-[var(--gold)]">
                  <MapPin size={20} />
                </div>

                <h2 className="font-semibold text-[var(--primary)]">
                  Delivery Address
                </h2>

              </div>

              <div className="mt-5 space-y-1 text-sm text-[var(--text-muted)]">

                <p className="font-medium text-[var(--primary)]">
                  {order.full_name}
                </p>

                <p>{order.phone}</p>

                <p>{order.address_line1}</p>

                {order.address_line2 && (
                  <p>{order.address_line2}</p>
                )}

                {order.landmark && (
                  <p>{order.landmark}</p>
                )}

                <p>
                  {order.city}, {order.state}
                </p>

                <p>{order.pincode}</p>

              </div>

            </div>

            {/* PAYMENT */}

            <div className="rounded-2xl border border-[var(--border-light)] bg-white p-6">

              <h2 className="font-semibold text-[var(--primary)]">
                Payment Status
              </h2>

              <span
                className={`mt-4 inline-flex rounded-full border px-3 py-1 text-sm font-medium capitalize ${
                  order.payment_status === "paid"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-yellow-200 bg-yellow-50 text-yellow-700"
                }`}
              >
                {order.payment_status}
              </span>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}