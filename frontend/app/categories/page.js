"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tag, Loader2, ArrowRight } from "lucide-react";

import API_BASE_URL, { BACKEND_URL } from "../../lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================
  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/categories`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch categories"
          );
        }

        setCategories(data.categories || []);
      } catch (error) {
        console.error(
          "Failed to fetch categories:",
          error
        );

        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--cream)]">
        <div className="flex items-center gap-3 text-[var(--text-muted)]">
          <Loader2 size={22} className="animate-spin" />
          Loading categories...
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================
  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] px-6 text-center">
        <Tag
          size={48}
          className="mb-5 text-[var(--gold)]"
        />

        <h1 className="text-2xl font-semibold text-[var(--primary)]">
          Unable to Load Categories
        </h1>

        <p className="mt-3 text-sm text-red-500">
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cream)] px-6 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">

        {/* ======================================
            PAGE HEADER
        ====================================== */}

        <div className="mx-auto mb-12 max-w-2xl text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            Explore Our Collection
          </p>

          <h1 className="mt-3 text-4xl font-semibold text-[var(--primary)] md:text-5xl">
            Shop by Category
          </h1>

          <p className="mt-4 leading-7 text-[var(--text-muted)]">
            Discover thoughtfully curated creations designed
            for every special moment, celebration, and memory.
          </p>

        </div>

        {/* ======================================
            EMPTY STATE
        ====================================== */}

        {categories.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border-light)] bg-white p-8 text-center">

            <Tag
              size={50}
              className="text-[var(--gold)]"
            />

            <h2 className="mt-5 text-xl font-semibold text-[var(--primary)]">
              No Categories Available
            </h2>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              New collections will be added soon.
            </p>

          </div>
        ) : (

          /* ======================================
              CATEGORY GRID
          ====================================== */

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {categories.map((category) => {

              const imageSrc = category.image_url
                ? category.image_url.startsWith("http")
                  ? category.image_url
                  : `${BACKEND_URL}${category.image_url}`
                : null;

              return (
                <Link
                  key={category.id}
                  href={`/products?category=${category.id}`}
                  className="group relative overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                >

                  {/* CATEGORY IMAGE */}

                  <div className="aspect-[4/3] overflow-hidden bg-[var(--beige)]">

                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={category.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">

                        <Tag
                          size={42}
                          className="text-[var(--gold)]"
                        />

                      </div>
                    )}

                  </div>

                  {/* OVERLAY */}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80" />

                  {/* CATEGORY CONTENT */}

                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">

                    <div className="flex items-end justify-between gap-4">

                      <div>

                        <h2 className="text-2xl font-semibold">
                          {category.name}
                        </h2>

                        {category.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-white/85">
                            {category.description}
                          </p>
                        )}

                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[var(--primary)] transition group-hover:scale-110">
                        <ArrowRight size={18} />
                      </div>

                    </div>

                  </div>

                </Link>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}