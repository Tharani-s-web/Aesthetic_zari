"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

import API_BASE_URL, {BACKEND_URL} from "../../lib/api";
import { getToken } from "../../lib/auth";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItem, setUpdatingItem] = useState(null);

  // ==========================================
  // FETCH CART
  // ==========================================
  const fetchCart = async () => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch cart");
      }

      setCart(data.cart);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================
  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    const token = getToken();

    try {
      setUpdatingItem(cartItemId);

      const response = await fetch(
        `${API_BASE_URL}/cart/${cartItemId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            quantity: newQuantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update quantity");
      }

      // Refresh cart with updated database data
      await fetchCart();

    } catch (error) {
      console.error("Quantity update error:", error);
      setError(error.message);
    } finally {
      setUpdatingItem(null);
    }
  };

  // ==========================================
  // REMOVE CART ITEM
  // ==========================================
  const removeItem = async (cartItemId) => {
    const token = getToken();

    try {
      setUpdatingItem(cartItemId);

      const response = await fetch(
        `${API_BASE_URL}/cart/${cartItemId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to remove item");
      }

      // Refresh cart
      await fetchCart();

    } catch (error) {
      console.error("Remove item error:", error);
      setError(error.message);
    } finally {
      setUpdatingItem(null);
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--cream)]">
        <p className="text-[var(--text-muted)]">
          Loading your cart...
        </p>
      </main>
    );
  }

  // ==========================================
  // NOT LOGGED IN
  // ==========================================
  if (!getToken()) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] px-6 text-center">
        <ShoppingBag
          size={48}
          className="mb-5 text-[var(--gold)]"
        />

        <h1 className="text-3xl font-semibold text-[var(--primary)]">
          Please Login
        </h1>

        <p className="mt-3 text-[var(--text-muted)]">
          Login to view and manage your cart.
        </p>

        <Link
          href="/login"
          className="mt-6 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white"
        >
          Login
        </Link>
      </main>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================
  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] px-6">
        <p className="text-red-500">{error}</p>

        <button
          onClick={fetchCart}
          className="mt-5 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white"
        >
          Try Again
        </button>
      </main>
    );
  }

  const cartItems = cart?.items || [];

  // ==========================================
  // EMPTY CART
  // ==========================================
  if (cartItems.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] px-6 text-center">
        <ShoppingBag
          size={55}
          className="mb-5 text-[var(--gold)]"
        />

        <h1 className="text-3xl font-semibold text-[var(--primary)]">
          Your Cart is Empty
        </h1>

        <p className="mt-3 max-w-md text-[var(--text-muted)]">
          Looks like you haven't added anything yet.
        </p>

        <Link
          href="/products"
          className="mt-7 rounded-full bg-[var(--primary)] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[var(--secondary)]"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cream)] px-6 py-10 md:py-16">
      <div className="mx-auto max-w-7xl">

        {/* Back to shop */}
        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--secondary)] hover:text-[var(--gold)]"
        >
          <ArrowLeft size={18} />
          Continue Shopping
        </Link>

        {/* Heading */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            Shopping Bag
          </p>

          <h1 className="mt-2 text-4xl font-semibold text-[var(--primary)]">
            Your Cart
          </h1>

          <p className="mt-2 text-[var(--text-muted)]">
            {cart.total_items} item
            {cart.total_items !== 1 ? "s" : ""} in your cart
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_350px]">

          {/* CART ITEMS */}
          <div className="space-y-5">
            {cartItems.map((item) => {
              let customization = null;

              try {
                if (item.customization_data) {
                  customization =
                    typeof item.customization_data === "string"
                      ? JSON.parse(item.customization_data)
                      : item.customization_data;
                }
              } catch (error) {
                console.error(
                  "Failed to parse customization data:",
                  error
                );

                customization = null;
              }

              const isUpdating =
                updatingItem === item.cart_item_id;

              return (
                <div
                  key={item.cart_item_id}
                  className="flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-sm sm:flex-row"
                >
                  {/* PRODUCT IMAGE */}
                  <div className="h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-[var(--beige)] sm:w-32">
                    {item.product_image ? (
                      <img
                        src={
                          item.product_image.startsWith("http")
                            ? item.product_image
                            : `${BACKEND_URL}${item.product_image}`
                        }
                        alt={item.image_url}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[var(--text-muted)]">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* PRODUCT DETAILS */}
                  <div className="flex flex-1 flex-col">

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-[var(--primary)]">
                          {item.product_name}
                        </h2>

                        {item.size_name && (
                          <p className="mt-1 text-sm text-[var(--text-muted)]">
                            Size: {item.size_name}
                          </p>
                        )}
                      </div>

                      {/* REMOVE BUTTON */}
                      <button
                        onClick={() =>
                          removeItem(item.cart_item_id)
                        }
                        disabled={isUpdating}
                        className="text-[var(--text-muted)] transition hover:text-red-500 disabled:opacity-50"
                        aria-label="Remove item"
                      >
                        <Trash2 size={19} />
                      </button>
                    </div>

                    {/* PRICE */}
                    <p className="mt-3 text-lg font-semibold text-[var(--secondary)]">
                      ₹{Number(item.price).toLocaleString("en-IN")}
                    </p>

                    {/* CUSTOMIZATION DETAILS */}
                    {customization && (
                      <div className="mt-4 rounded-xl bg-[var(--cream)] p-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--gold)]">
                          Personalization
                        </p>

                        <div className="space-y-1">
                          {Object.entries(customization).map(
                            ([key, value]) => (
                              <p
                                key={key}
                                className="text-sm text-[var(--text-muted)]"
                              >
                                <span className="font-medium capitalize text-[var(--text-dark)]">
                                  {key.replace(/_/g, " ")}:
                                </span>{" "}
                                {value}
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* QUANTITY + SUBTOTAL */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                      {/* Quantity Controls */}
                      <div className="flex items-center rounded-full border border-[var(--border-light)]">

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.cart_item_id,
                              item.quantity - 1
                            )
                          }
                          disabled={
                            item.quantity <= 1 || isUpdating
                          }
                          className="flex h-9 w-9 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={15} />
                        </button>

                        <span className="w-9 text-center text-sm font-medium">
                          {isUpdating ? "..." : item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.cart_item_id,
                              item.quantity + 1
                            )
                          }
                          disabled={isUpdating}
                          className="flex h-9 w-9 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus size={15} />
                        </button>

                      </div>

                      {/* Subtotal */}
                      <p className="text-sm font-medium text-[var(--text-dark)]">
                        Subtotal: ₹
                        {(
                          Number(item.price) * item.quantity
                        ).toLocaleString("en-IN")}
                      </p>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ORDER SUMMARY */}
          <aside className="h-fit rounded-3xl bg-white p-7 shadow-sm">
            <h2 className="text-xl font-semibold text-[var(--primary)]">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4 border-b border-[var(--border-light)] pb-6">

              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">
                  Items ({cart.total_items})
                </span>

                <span className="font-medium">
                  ₹{Number(cart.total_amount).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">
                  Delivery
                </span>

                <span className="text-[var(--gold)]">
                  Calculated at checkout
                </span>
              </div>

            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-lg font-semibold text-[var(--primary)]">
                Total
              </span>

              <span className="text-2xl font-semibold text-[var(--secondary)]">
                ₹{Number(cart.total_amount).toLocaleString("en-IN")}
              </span>
            </div>

            <Link
              href="/checkout"
              className="mt-7 flex w-full items-center justify-center rounded-full bg-[var(--primary)] py-4 text-sm font-semibold text-white transition hover:bg-[var(--secondary)]"
            >
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}