"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  CheckCircle,
} from "lucide-react";

import API_BASE_URL, { BACKEND_URL } from "../../../lib/api";
import { getToken } from "../../../lib/auth";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    const token = getToken();

    if (!token) {
      setError("Please login to view order details.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}`,
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

      console.log("ORDER API RESPONSE:", data);
      console.log("ORDER ITEMS:", data.order?.items);

      setOrder(data.order);
    } catch (error) {
      console.error("Order details error:", error);
      setError(error.message || "Failed to load order details");
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

      case "shipped":
        return "bg-purple-50 text-purple-700";

      case "processing":
        return "bg-blue-50 text-blue-700";

      default:
        return "bg-yellow-50 text-yellow-700";
    }
  };

  // Convert database image path into the backend image URL
  const getImageUrl = (image) => {
    if (!image) return null;

    // Already a complete URL
    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    // Remove leading slash
    const cleanImage = image.replace(/^\/+/, "");

    // Example:
    // uploads/products/image.jpg
    if (cleanImage.startsWith("uploads/")) {
      return `${BACKEND_URL}/${cleanImage}`;
    }

    // Example:
    // image.jpg
    if (!cleanImage.includes("/")) {
      return `${BACKEND_URL}/uploads/products/${cleanImage}`;
    }

    // Example:
    // products/image.jpg
    return `${BACKEND_URL}/${cleanImage}`;
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-[var(--cream)] px-6 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-[var(--text-muted)]">
            Loading order details...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-[var(--cream)] px-6 py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="rounded-3xl bg-white p-10">
            <Package
              size={40}
              className="mx-auto text-red-500"
            />

            <h1 className="mt-5 text-2xl font-semibold text-[var(--primary)]">
              Unable to load order
            </h1>

            <p className="mt-3 text-sm text-red-500">
              {error}
            </p>

            <Link
              href="/orders"
              className="mt-6 inline-flex rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!order) return null;

  return (
    <section className="min-h-screen bg-[var(--cream)] px-6 py-10 md:py-16">
      <div className="mx-auto max-w-6xl">

        {/* Back Button */}
        <Link
          href="/orders"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--secondary)] transition hover:text-[var(--gold)]"
        >
          <ArrowLeft size={18} />
          Back to Orders
        </Link>

        {/* Order Header */}
        <div className="rounded-3xl border border-[var(--border-light)] bg-white p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--gold)]">
                Order Details
              </p>

              <h1 className="mt-2 text-3xl font-semibold text-[var(--primary)]">
                Order #{order.order_number}
              </h1>

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

            <div className="flex flex-wrap gap-3">
              <span
                className={`rounded-full px-4 py-2 text-xs font-medium ${getStatusStyle(
                  order.order_status
                )}`}
              >
                {order.order_status || "Pending"}
              </span>

              <span className="rounded-full bg-[var(--beige)] px-4 py-2 text-xs font-medium text-[var(--primary)]">
                Payment: {order.payment_status || "Pending"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">

          {/* LEFT SECTION */}
          <div className="space-y-8 lg:col-span-2">

            {/* Ordered Products */}
            <div className="rounded-3xl border border-[var(--border-light)] bg-white p-6 md:p-8">

              <div className="flex items-center gap-3">
                <Package
                  size={21}
                  className="text-[var(--gold)]"
                />

                <h2 className="text-xl font-semibold text-[var(--primary)]">
                  Ordered Products
                </h2>
              </div>

              <div className="mt-6 space-y-6">

                {order.items?.map((item) => (
                  <div
                    key={item.order_item_id}
                    className="flex gap-4 border-b border-[var(--border-light)] pb-6 last:border-0 last:pb-0"
                  >

                    {/* Product Image */}
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--beige)]">

                      {item.product_image ? (
                        <img
                          src={getImageUrl(item.product_image)}
                          alt={item.product_name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            console.error(
                              "Product image failed:",
                              getImageUrl(item.product_image)
                            );

                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <Package
                          size={24}
                          className="text-[var(--gold)]"
                        />
                      )}

                    </div>

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col justify-between gap-3 sm:flex-row">

                      <div>

                        <h3 className="font-semibold text-[var(--primary)]">
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

                        {/* Customization Details */}
                        {item.customization_data &&
                          Object.keys(
                            typeof item.customization_data === "string"
                              ? JSON.parse(item.customization_data)
                              : item.customization_data
                          ).length > 0 && (
                            <div className="mt-3 rounded-lg bg-[var(--cream)] p-3">

                              <p className="text-xs font-semibold text-[var(--primary)]">
                                Personalization
                              </p>

                              <div className="mt-2 space-y-1">

                                {Object.entries(
                                  typeof item.customization_data === "string"
                                    ? JSON.parse(item.customization_data)
                                    : item.customization_data
                                ).map(([key, value]) => (
                                  <p
                                    key={key}
                                    className="text-xs text-[var(--text-muted)]"
                                  >
                                    <span className="capitalize">
                                      {key.replace(/_/g, " ")}:
                                    </span>{" "}
                                    {String(value)}
                                  </p>
                                ))}

                              </div>
                            </div>
                          )}

                      </div>

                      {/* Product Price */}
                      <div className="text-right">

                        <p className="font-semibold text-[var(--secondary)]">
                          ₹
                          {Number(
                            item.price * item.quantity
                          ).toLocaleString("en-IN")}
                        </p>

                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          ₹
                          {Number(
                            item.price
                          ).toLocaleString("en-IN")}{" "}
                          each
                        </p>

                      </div>

                    </div>

                  </div>
                ))}

              </div>
            </div>

            {/* Delivery Address */}
            {order.full_name && (
              <div className="rounded-3xl border border-[var(--border-light)] bg-white p-6 md:p-8">

                <div className="flex items-center gap-3">

                  <MapPin
                    size={21}
                    className="text-[var(--gold)]"
                  />

                  <h2 className="text-xl font-semibold text-[var(--primary)]">
                    Delivery Address
                  </h2>

                </div>

                <div className="mt-5 text-sm leading-7 text-[var(--text-muted)]">

                  <p className="font-semibold text-[var(--text-dark)]">
                    {order.full_name}
                  </p>

                  <p>{order.phone}</p>

                  <p>{order.address_line1}</p>

                  {order.address_line2 && (
                    <p>{order.address_line2}</p>
                  )}

                  <p>
                    {order.city}, {order.state} -{" "}
                    {order.pincode}
                  </p>

                  {order.landmark && (
                    <p>
                      Landmark: {order.landmark}
                    </p>
                  )}

                </div>
              </div>
            )}

          </div>

          {/* RIGHT SECTION */}
          <div className="space-y-8">

            {/* Payment Summary */}
            <div className="rounded-3xl border border-[var(--border-light)] bg-white p-6">

              <div className="flex items-center gap-3">

                <CreditCard
                  size={20}
                  className="text-[var(--gold)]"
                />

                <h2 className="text-lg font-semibold text-[var(--primary)]">
                  Payment Summary
                </h2>

              </div>

              <div className="mt-6 space-y-4 text-sm">

                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Subtotal</span>

                  <span>
                    ₹
                    {Number(
                      order.subtotal || 0
                    ).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Shipping</span>

                  <span>
                    ₹
                    {Number(
                      order.shipping_charge || 0
                    ).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="border-t border-[var(--border-light)] pt-4">

                  <div className="flex justify-between text-base font-semibold text-[var(--primary)]">

                    <span>Total</span>

                    <span>
                      ₹
                      {Number(
                        order.total_amount || 0
                      ).toLocaleString("en-IN")}
                    </span>

                  </div>

                </div>

              </div>
            </div>

            {/* Order Status */}
            <div className="rounded-3xl border border-[var(--border-light)] bg-white p-6">

              <div className="flex items-center gap-3">

                <CheckCircle
                  size={20}
                  className="text-[var(--gold)]"
                />

                <h2 className="text-lg font-semibold text-[var(--primary)]">
                  Order Status
                </h2>

              </div>

              <div className="mt-5 rounded-xl bg-[var(--cream)] px-4 py-4">

                <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Current Status
                </p>

                <p className="mt-1 font-semibold capitalize text-[var(--primary)]">
                  {order.order_status || "Pending"}
                </p>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}