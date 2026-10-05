"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

import API_BASE_URL, { BACKEND_URL } from "../../lib/api";
import { getToken } from "../../lib/auth";

export default function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // ==========================================
  // CHECK EXISTING WISHLIST
  // ==========================================
  useEffect(() => {
    const checkWishlist = async () => {
      const token = getToken();

      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          return;
        }

        const wishlistItem = data.wishlist.find(
          (item) =>
            Number(item.product_id) === Number(product.id)
        );

        if (wishlistItem) {
          setIsWishlisted(true);
          setWishlistItemId(wishlistItem.wishlist_item_id);
        } else {
          setIsWishlisted(false);
          setWishlistItemId(null);
        }
      } catch (error) {
        console.error("Wishlist check error:", error);
      }
    };

    checkWishlist();
  }, [product.id]);

  // ==========================================
  // TOGGLE WISHLIST
  // ==========================================
  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = getToken();

    if (!token) {
      alert("Please login to manage your wishlist.");
      return;
    }

    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);

      // ======================================
      // REMOVE FROM WISHLIST
      // ======================================
      if (isWishlisted && wishlistItemId) {
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
            data.message || "Failed to remove from wishlist"
          );
        }

        setIsWishlisted(false);
        setWishlistItemId(null);

        return;
      }

      // ======================================
      // ADD TO WISHLIST
      // ======================================
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Already exists
        if (
          data.message ===
          "Product already exists in wishlist"
        ) {
          setIsWishlisted(true);

          // Refresh wishlist to get the item ID
          const wishlistResponse = await fetch(
            `${API_BASE_URL}/wishlist`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const wishlistData = await wishlistResponse.json();

          if (wishlistData.success) {
            const existingItem = wishlistData.wishlist.find(
              (item) =>
                Number(item.product_id) === Number(product.id)
            );

            if (existingItem) {
              setWishlistItemId(
                existingItem.wishlist_item_id
              );
            }
          }

          return;
        }

        throw new Error(
          data.message || "Failed to add to wishlist"
        );
      }

      setIsWishlisted(true);
      setWishlistItemId(data.wishlistItemId);
    } catch (error) {
      console.error("Wishlist error:", error);
      alert(error.message || "Wishlist operation failed");
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative flex aspect-square items-center justify-center overflow-hidden bg-[var(--beige)]"
      >
        {product.primary_image ? (
          <img
            src={`${BACKEND_URL}${product.primary_image}`}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="text-sm text-[var(--text-muted)]">
            Aesthetic Zari
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          disabled={wishlistLoading}
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition ${
            isWishlisted
              ? "text-red-500"
              : "text-[var(--primary)] hover:text-red-500"
          } ${
            wishlistLoading
              ? "cursor-not-allowed opacity-60"
              : ""
          }`}
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          <Heart
            size={18}
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>
      </Link>

      {/* Product Info */}
      <div className="p-5">

        {/* Category */}
        {product.category_name && (
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--gold)]">
            {product.category_name}
          </p>
        )}

        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-1 text-lg font-semibold text-[var(--primary)]">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-3">
          <p className="text-base font-semibold text-[var(--secondary)]">
            ₹{Number(product.base_price).toLocaleString("en-IN")}
          </p>
        </div>

      </div>
    </div>
  );
}