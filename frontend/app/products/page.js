"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import ProductCard from "../../components/products/ProductCard";
import API_BASE_URL from "../../lib/api";

function ProductsContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [sortOption, setSortOption] =
    useState("newest");

  const [loading, setLoading] = useState(true);

  // ==========================================
  // READ CATEGORY FROM URL
  // ==========================================

  useEffect(() => {
    const categoryFromUrl =
      searchParams.get("category");

    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    } else {
      setSelectedCategory("all");
    }
  }, [searchParams]);

  // ==========================================
  // FETCH PRODUCTS + CATEGORIES
  // ==========================================

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [
          productsResponse,
          categoriesResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/products`),
          fetch(`${API_BASE_URL}/categories`),
        ]);

        const productsData =
          await productsResponse.json();

        const categoriesData =
          await categoriesResponse.json();

        if (productsData.success) {
          setProducts(
            productsData.products || []
          );
        }

        if (categoriesData.success) {
          setCategories(
            categoriesData.categories || []
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch shop data:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // ==========================================
  // CATEGORY + SEARCH FILTER
  // ==========================================

  const filteredProducts = products
    .filter((product) => {
      if (selectedCategory === "all") {
        return true;
      }

      return (
        String(product.category_id) ===
        String(selectedCategory)
      );
    })
    .filter((product) => {
      const searchTerm =
        searchQuery.toLowerCase().trim();

      if (!searchTerm) {
        return true;
      }

      return (
        product.name
          ?.toLowerCase()
          .includes(searchTerm) ||
        product.description
          ?.toLowerCase()
          .includes(searchTerm) ||
        product.category_name
          ?.toLowerCase()
          .includes(searchTerm)
      );
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "price-low":
          return (
            Number(a.base_price) -
            Number(b.base_price)
          );

        case "price-high":
          return (
            Number(b.base_price) -
            Number(a.base_price)
          );

        case "name-az":
          return a.name.localeCompare(b.name);

        case "name-za":
          return b.name.localeCompare(a.name);

        case "newest":
        default:
          return (
            new Date(b.created_at) -
            new Date(a.created_at)
          );
      }
    });

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortOption("newest");
  };

  return (
    <section className="min-h-screen bg-[var(--cream)] px-6 py-16">
      <div className="mx-auto max-w-7xl">

        {/* PAGE HEADING */}

        <div className="mb-10 text-center">

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
            Our Collection
          </p>

          <h1 className="text-4xl font-semibold text-[var(--primary)] md:text-5xl">
            Discover Our Creations
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-[var(--text-muted)]">
            Explore thoughtfully handcrafted creations
            designed to celebrate memories, love, and
            life's most special moments.
          </p>

        </div>

        {/* SEARCH + SORT PANEL */}

        <div className="mb-8 rounded-3xl bg-white p-5 shadow-sm md:p-6">

          <div className="mb-4 flex items-center justify-between">

            <div className="flex items-center gap-2">

              <SlidersHorizontal
                size={19}
                className="text-[var(--gold)]"
              />

              <h2 className="font-semibold text-[var(--primary)]">
                Search & Sort
              </h2>

            </div>

            {(searchQuery ||
              selectedCategory !== "all" ||
              sortOption !== "newest") && (

              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--primary)]"
              >
                <X size={16} />
                Clear Filters
              </button>

            )}

          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_230px]">

            {/* SEARCH INPUT */}

            <div className="relative">

              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="Search by product name..."
                className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--cream)] py-3 pl-12 pr-5 text-sm text-[var(--text-dark)] outline-none transition focus:border-[var(--gold)]"
              />

            </div>

            {/* SORT SELECT */}

            <div className="relative">

              <select
                value={sortOption}
                onChange={(e) =>
                  setSortOption(e.target.value)
                }
                className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--cream)] px-4 py-3 text-sm text-[var(--text-dark)] outline-none transition focus:border-[var(--gold)]"
              >

                <option value="newest">
                  Newest First
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="name-az">
                  Name: A to Z
                </option>

                <option value="name-za">
                  Name: Z to A
                </option>

              </select>

            </div>

          </div>

        </div>

        {/* CATEGORY FILTERS */}

        {!loading && categories.length > 0 && (

          <div className="mb-10">

            <p className="mb-4 text-sm font-medium text-[var(--text-muted)]">
              Browse by Category
            </p>

            <div className="flex flex-wrap gap-3">

              <button
                onClick={() =>
                  setSelectedCategory("all")
                }
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  selectedCategory === "all"
                    ? "bg-[var(--primary)] text-white"
                    : "border border-[var(--border-light)] bg-white text-[var(--text-dark)] hover:border-[var(--gold)]"
                }`}
              >
                All Products
              </button>

              {categories.map((category) => (

                <button
                  key={category.id}
                  onClick={() =>
                    setSelectedCategory(category.id)
                  }
                  className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                    String(selectedCategory) ===
                    String(category.id)
                      ? "bg-[var(--primary)] text-white"
                      : "border border-[var(--border-light)] bg-white text-[var(--text-dark)] hover:border-[var(--gold)]"
                  }`}
                >
                  {category.name}
                </button>

              ))}

            </div>

          </div>

        )}

        {/* LOADING */}

        {loading && (

          <div className="py-20 text-center text-[var(--text-muted)]">
            Loading creations...
          </div>

        )}

        {/* PRODUCTS */}

        {!loading &&
          filteredProducts.length > 0 && (

            <>

              <div className="mb-6 flex items-center justify-between">

                <p className="text-sm text-[var(--text-muted)]">

                  {filteredProducts.length}{" "}

                  {filteredProducts.length === 1
                    ? "product"
                    : "products"}{" "}

                  found

                  {searchQuery &&
                    ` for "${searchQuery}"`}

                </p>

              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {filteredProducts.map(
                  (product) => (

                    <ProductCard
                      key={product.id}
                      product={product}
                    />

                  )
                )}

              </div>

            </>

          )}

        {/* EMPTY STATE */}

        {!loading &&
          filteredProducts.length === 0 && (

            <div className="py-20 text-center">

              <Search
                size={42}
                className="mx-auto text-[var(--gold)]"
              />

              <h2 className="mt-4 text-xl font-semibold text-[var(--primary)]">
                No products found
              </h2>

              <p className="mt-3 text-[var(--text-muted)]">

                {searchQuery
                  ? `We couldn't find any products matching "${searchQuery}".`
                  : "We couldn't find any products matching your filters."}

              </p>

              <button
                onClick={clearFilters}
                className="mt-6 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--secondary)]"
              >
                Clear Filters
              </button>

            </div>

          )}

      </div>
    </section>
  );
}

// ==========================================
// SUSPENSE BOUNDARY
// ==========================================

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <section className="min-h-screen bg-[var(--cream)] px-6 py-16">
          <div className="mx-auto max-w-7xl py-20 text-center text-[var(--text-muted)]">
            Loading creations...
          </div>
        </section>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}