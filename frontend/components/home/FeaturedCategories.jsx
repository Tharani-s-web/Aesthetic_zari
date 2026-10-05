
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import API_BASE_URL, { BACKEND_URL } from "../../lib/api";

export default function FeaturedCategories({ section }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
   * Laravel stores settings as either:
   *
   * 1. An object
   *    {
   *      selectedCategories: [...]
   *    }
   *
   * 2. A JSON string
   *    "{\"selectedCategories\":[...]}"
   *
   * Handle both formats.
   */

  let parsedSettings = {};

  try {
    if (typeof section?.settings === "string") {
      parsedSettings = JSON.parse(section.settings);
    } else {
      parsedSettings = section?.settings || {};
    }
  } catch (error) {
    console.error("Failed to parse homepage section settings:", error);
    parsedSettings = {};
  }

  const selectedCategories = Array.isArray(
    parsedSettings.selectedCategories
  )
    ? parsedSettings.selectedCategories.map(String)
    : [];

  /*
   * Fetch categories from the backend.
   *
   * Category data comes from the backend API.
   * The selected category IDs come from the homepage
   * section stored in MongoDB.
   */
  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/categories`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch categories: ${response.status}`
          );
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.categories)) {
          setCategories([]);
          return;
        }

        /*
         * If admin selected categories,
         * display ONLY those categories.
         */
        if (selectedCategories.length > 0) {
          const categoryMap = new Map(
            data.categories.map((category) => [
              String(category.id),
              category,
            ])
          );

          /*
           * Map selected IDs in exactly the same order
           * as they are stored in MongoDB.
           */
          const selected = selectedCategories
            .map((categoryId) => categoryMap.get(categoryId))
            .filter(Boolean);

          setCategories(selected);
        } else {
          /*
           * No categories selected:
           * show nothing instead of automatically displaying
           * unrelated categories.
           */
          setCategories([]);
        }
      } catch (error) {
        console.error(
          "Failed to fetch featured categories:",
          error
        );

        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [JSON.stringify(selectedCategories)]);

  return (
    <section className="bg-[var(--cream)] px-6 py-20">
      <div className="mx-auto max-w-7xl">

        {/* =========================
            SECTION HEADING
        ========================== */}

        <div className="mb-12">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              {/* Subtitle */}
              {section?.subtitle && (
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
                  {section.subtitle}
                </p>
              )}

              {/* Title */}
              <h2 className="text-3xl font-semibold text-[var(--primary)] md:text-4xl">
                {section?.title || "Explore Our Collections"}
              </h2>

            </div>

            {/* View All */}
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--secondary)] transition hover:text-[var(--gold)]"
            >
              View All Categories
              <ArrowRight size={18} />
            </Link>

          </div>

          {/* Description */}
          {section?.description && (
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--text-muted)]">
              {section.description}
            </p>
          )}

        </div>


        {/* =========================
            LOADING
        ========================== */}

        {loading && (
          <div className="py-10 text-center text-[var(--text-muted)]">
            Loading collections...
          </div>
        )}


        {/* =========================
            SELECTED CATEGORIES
        ========================== */}

        {!loading && categories.length > 0 && (
          <div
            className={`grid gap-6 ${
              categories.length >= 4
                ? "sm:grid-cols-2 lg:grid-cols-4"
                : categories.length === 3
                ? "sm:grid-cols-2 lg:grid-cols-3"
                : categories.length === 2
                ? "sm:grid-cols-2"
                : "sm:grid-cols-1"
            }`}
          >

            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >

                {/* Category Image */}
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-[var(--beige)]">

                  {category.image_url ? (
                    <img
                      src={
                        category.image_url.startsWith("http")
                          ? category.image_url
                          : `${BACKEND_URL}${category.image_url}`
                      }
                      alt={category.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-sm text-[var(--text-muted)]">
                      Aesthetic Zari
                    </span>
                  )}

                </div>


                {/* Category Content */}
                <div className="p-5">

                  <h3 className="text-lg font-semibold text-[var(--primary)]">
                    {category.name}
                  </h3>

                  {category.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-muted)]">
                      {category.description}
                    </p>
                  )}

                </div>

              </Link>
            ))}

          </div>
        )}


        {/* =========================
            EMPTY STATE
        ========================== */}

        {!loading && categories.length === 0 && (
          <div className="rounded-2xl border border-[var(--border-light)] bg-white py-10 text-center">

            <p className="text-[var(--text-muted)]">
              No categories selected for this section.
            </p>

          </div>
        )}

      </div>
    </section>
  );
}
