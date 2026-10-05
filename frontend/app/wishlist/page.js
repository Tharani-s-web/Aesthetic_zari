"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";

import API_BASE_URL, { BACKEND_URL } from "../../lib/api";
import { getToken } from "../../lib/auth";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingItem, setRemovingItem] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);

  // ==========================================
  // FETCH WISHLIST
  // ==========================================
  const fetchWishlist = async () => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch wishlist");
      }

      setWishlist(data.wishlist);
    } catch (error) {
      console.error("Wishlist fetch error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // ==========================================
  // ADD TO CART
  // ==========================================
  const addToCart = async (item) => {
    const token = getToken();

    if (!token) {
      setError("Please login to add products to your cart.");
      return;
    }

    try {
      setAddingToCart(item.product_id);
      setError("");

      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: item.product_id,
          quantity: 1,
          price: item.product_price,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to add product to cart"
        );
      }

      // Redirect to cart after successful addition
      window.location.href = "/cart";
    } catch (error) {
      console.error("Add to cart error:", error);
      setError(error.message);
      setAddingToCart(null);
    }
  };

  // ==========================================
  // REMOVE FROM WISHLIST
  // ==========================================
  const removeFromWishlist = async (wishlistItemId) => {
    const token = getToken();

    try {
      setRemovingItem(wishlistItemId);

      const response = await fetch(
        `${API_BASE_URL}/wishlist/${wishlistItemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to remove product from wishlist"
        );
      }

      await fetchWishlist();
    } catch (error) {
      console.error("Remove wishlist error:", error);
      setError(error.message);
    } finally {
      setRemovingItem(null);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--cream)]">
        <p className="text-[var(--text-muted)]">
          Loading your wishlist...
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
        <Heart size={50} className="mb-5 text-[var(--gold)]" />

        <h1 className="text-3xl font-semibold text-[var(--primary)]">
          Please Login
        </h1>

        <p className="mt-3 text-[var(--text-muted)]">
          Login to view your saved creations.
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
        <p className="text-red-500">{error}</p>

        <button
          onClick={() => {
            setError("");
            fetchWishlist();
          }}
          className="mt-5 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white"
        >
          Try Again
        </button>
      </main>
    );
  }

  // ==========================================
  // EMPTY WISHLIST
  // ==========================================
  if (wishlist.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] px-6 text-center">
        <Heart size={55} className="mb-5 text-[var(--gold)]" />

        <h1 className="text-3xl font-semibold text-[var(--primary)]">
          Your Wishlist is Empty
        </h1>

        <p className="mt-3 max-w-md text-[var(--text-muted)]">
          Save your favorite handcrafted creations here and revisit them
          anytime.
        </p>

        <Link
          href="/products"
          className="mt-7 rounded-full bg-[var(--primary)] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[var(--secondary)]"
        >
          Explore Products
        </Link>
      </main>
    );
  }

  // ==========================================
  // WISHLIST
  // ==========================================
  return (
    <main className="min-h-screen bg-[var(--cream)] px-6 py-10 md:py-16">
      <div className="mx-auto max-w-7xl">

        {/* BACK */}
        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--secondary)] transition hover:text-[var(--gold)]"
        >
          <ArrowLeft size={18} />
          Continue Shopping
        </Link>

        {/* HEADING */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            Saved Creations
          </p>

          <h1 className="mt-2 text-4xl font-semibold text-[var(--primary)]">
            My Wishlist
          </h1>

          <p className="mt-2 text-[var(--text-muted)]">
            {wishlist.length} saved item
            {wishlist.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* WISHLIST GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <div
              key={item.wishlist_item_id}
              className="group overflow-hidden rounded-3xl bg-white shadow-sm"
            >

              {/* IMAGE */}
              <div className="aspect-square overflow-hidden bg-[var(--beige)]">
                {item.product_image ? (
                  <img
                    src={
                      item.product_image.startsWith("http")
                        ? item.product_image
                        : `${BACKEND_URL}${item.product_image}`
                    }
                    alt={item.product_name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">
                    Product Image
                  </div>
                )}
              </div>

              {/* DETAILS */}
              <div className="p-5">

                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--gold)]">
                  {item.category_name}
                </p>

                <h2 className="mt-2 text-lg font-semibold text-[var(--primary)]">
                  {item.product_name}
                </h2>

                {/* PRICE */}
                <p className="mt-2 text-base font-semibold text-[var(--secondary)]">
                  ₹{Number(item.product_price || 0).toLocaleString("en-IN")}
                </p>

                {item.product_description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-muted)]">
                    {item.product_description}
                  </p>
                )}

                {/* ACTIONS */}
                <div className="mt-5 flex items-center gap-3">

                  {/* ADD TO CART */}
                  <button
                    onClick={() => addToCart(item)}
                    disabled={addingToCart === item.product_id}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ShoppingBag size={16} />

                    {addingToCart === item.product_id
                      ? "Adding..."
                      : "Add to Cart"}
                  </button>

                  {/* REMOVE */}
                  <button
                    onClick={() =>
                      removeFromWishlist(item.wishlist_item_id)
                    }
                    disabled={
                      removingItem === item.wishlist_item_id
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-light)] text-[var(--text-muted)] transition hover:border-red-300 hover:text-red-500 disabled:opacity-50"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={18} />
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}