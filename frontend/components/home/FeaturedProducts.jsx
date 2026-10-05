"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "../products/ProductCard";
import API_BASE_URL from "../../lib/api";

export default function FeaturedProducts({ section }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
   * Laravel/MongoDB may return settings either as:
   *
   * 1. An object
   * 2. A JSON string
   *
   * Example:
   *
   * {
   *   "productLimit": 4,
   *   "layout": "grid",
   *   "selectedProducts": ["22", "7", "21", "1"]
   * }
   */

  let settings = {};

  try {
    settings =
      typeof section?.settings === "string"
        ? JSON.parse(section.settings)
        : section?.settings || {};
  } catch (error) {
    console.error(
      "Failed to parse featured products settings:",
      error
    );

    settings = {};
  }

  const productLimit =
    Number(settings.productLimit) || 4;

  const selectedProducts =
    Array.isArray(settings.selectedProducts)
      ? settings.selectedProducts.map(String)
      : [];

  const subtitle =
    section?.subtitle || "Made With Love";

  const title =
    section?.title || "Featured Creations";

  const description =
    section?.description ||
    "Explore some of our handcrafted creations made for gifting and celebrating life's special moments.";

  const layout =
    settings.layout || "grid";

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/products`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch products: ${response.status}`
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message ||
              "Failed to fetch products"
          );
        }

        const allProducts =
          data.products || [];

        /*
         * If admin has selected products,
         * display ONLY those products.
         */
        if (selectedProducts.length > 0) {
          /*
           * Create a lookup using product ID.
           */
          const selected = allProducts.filter(
            (product) =>
              selectedProducts.includes(
                String(product.id)
              )
          );

          /*
           * Preserve the exact order
           * selected in the admin panel.
           */
          const orderedProducts =
            selectedProducts
              .map((selectedId) =>
                selected.find(
                  (product) =>
                    String(product.id) ===
                    String(selectedId)
                )
              )
              .filter(Boolean);

          /*
           * Apply product limit after
           * selecting the admin products.
           */
          setProducts(
            orderedProducts.slice(
              0,
              productLimit
            )
          );
        } else {
          /*
           * If admin has not selected any products,
           * use the newest products as fallback.
           */
          setProducts(
            allProducts.slice(
              0,
              productLimit
            )
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch products:",
          error
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [
    productLimit,
    JSON.stringify(selectedProducts),
  ]);

  return (
    <section className="bg-[var(--cream)] px-6 py-20">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">

          <div className="max-w-2xl">

            {/* Subtitle */}
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
              {subtitle}
            </p>

            {/* Title */}
            <h2 className="text-3xl font-semibold text-[var(--primary)] md:text-4xl">
              {title}
            </h2>

            {/* Description */}
            {description && (
              <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-muted)]">
                {description}
              </p>
            )}

          </div>

          {/* View All */}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--secondary)] transition hover:text-[var(--gold)]"
          >
            View All Products
            <ArrowRight size={18} />
          </Link>

        </div>

        {/* Loading */}
        {loading && (
          <div className="py-10 text-center text-[var(--text-muted)]">
            Loading products...
          </div>
        )}

        {/* Products */}
        {!loading &&
          products.length > 0 && (
            <div
              className={
                layout === "list"
                  ? "grid gap-6"
                  : "grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
              }
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}

        {/* Empty State */}
        {!loading &&
          products.length === 0 && (
            <div className="py-10 text-center text-[var(--text-muted)]">
              No products selected for this section.
            </div>
          )}

      </div>
    </section>
  );
}