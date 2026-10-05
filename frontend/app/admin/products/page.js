"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Eye,
  Package,
  Search,
} from "lucide-react";

import API_BASE_URL from "../../../lib/api";
import { getToken } from "../../../lib/auth";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/products/admin/all`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch products"
        );
      }

      setProducts(data.products || []);

    } catch (error) {
      console.error(
        "Products fetch error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ==========================================
  // TOGGLE PRODUCT AVAILABILITY
  // ==========================================

  const handleToggleAvailability = async (productId) => {
    try {
      setTogglingId(productId);

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found"
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/toggle-availability`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update product availability"
        );
      }

      // Update only the changed product
      setProducts((previousProducts) =>
        previousProducts.map((product) =>
          Number(product.id) === Number(productId)
            ? {
                ...product,
                is_active: Number(data.is_active),
              }
            : product
        )
      );

    } catch (error) {
      console.error(
        "Toggle availability error:",
        error
      );

      alert(error.message);
    } finally {
      setTogglingId(null);
    }
  };

  // ==========================================
  // SEARCH FILTER
  // ==========================================

  const filteredProducts = products.filter((product) =>
    product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <section className="min-h-screen bg-[var(--cream)] p-8">
        <p className="text-[var(--text-muted)]">
          Loading products...
        </p>
      </section>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <section className="min-h-screen bg-[var(--cream)] p-8">
        <div className="rounded-xl bg-red-50 p-5 text-red-600">
          {error}
        </div>

        <button
          onClick={fetchProducts}
          className="mt-5 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-medium text-white"
        >
          Try Again
        </button>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[var(--cream)] p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--gold)]">
              Inventory
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[var(--primary)]">
              Products
            </h1>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Manage your store products, availability and details.
            </p>
          </div>

          <Link
            href="/admin/products/add"
            className="flex items-center gap-2 self-start rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--secondary)]"
          >
            <Plus size={18} />
            Add Product
          </Link>

        </div>

        {/* SEARCH */}

        <div className="mb-6 flex max-w-md items-center gap-3 rounded-xl border border-[var(--border-light)] bg-white px-4 py-3">

          <Search
            size={19}
            className="text-[var(--text-muted)]"
          />

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            className="w-full bg-transparent text-sm outline-none"
          />

        </div>

        {/* PRODUCTS */}

        {filteredProducts.length === 0 ? (

          <div className="rounded-2xl border border-[var(--border-light)] bg-white py-16 text-center">

            <Package
              size={40}
              className="mx-auto text-[var(--gold)]"
            />

            <h2 className="mt-4 text-lg font-semibold text-[var(--primary)]">
              No products found
            </h2>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Add your first product to start managing inventory.
            </p>

          </div>

        ) : (

          <div className="overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white">

            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead className="border-b border-[var(--border-light)] bg-[var(--beige)]">

                  <tr>
                    <th className="px-5 py-4 font-semibold text-[var(--primary)]">
                      Product
                    </th>

                    <th className="px-5 py-4 font-semibold text-[var(--primary)]">
                      Category
                    </th>

                    <th className="px-5 py-4 font-semibold text-[var(--primary)]">
                      Price
                    </th>

                    <th className="px-5 py-4 font-semibold text-[var(--primary)]">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right font-semibold text-[var(--primary)]">
                      Actions
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {filteredProducts.map((product) => (

                    <tr
                      key={product.id}
                      className="border-b border-[var(--border-light)] last:border-none"
                    >

                      {/* PRODUCT */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-4">

                          <div className="h-14 w-14 overflow-hidden rounded-lg bg-[var(--beige)]">

                            {product.primary_image ? (

                              <img
                                src={
                                  product.primary_image.startsWith("http")
                                    ? product.primary_image
                                    : `http://localhost:5000${product.primary_image}`
                                }
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />

                            ) : (

                              <div className="flex h-full items-center justify-center">

                                <Package
                                  size={20}
                                  className="text-[var(--gold)]"
                                />

                              </div>

                            )}

                          </div>

                          <div>
                            <p className="font-medium text-[var(--primary)]">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                              ID: {product.id}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* CATEGORY */}

                      <td className="px-5 py-4 text-[var(--text-dark)]">
                        {product.category_name || "—"}
                      </td>

                      {/* PRICE */}

                      <td className="px-5 py-4 font-medium text-[var(--primary)]">
                        ₹
                        {Number(
                          product.base_price || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            Number(product.is_active) === 1
                              ? "bg-green-50 text-green-600"
                              : "bg-red-50 text-red-500"
                          }`}
                        >
                          {Number(product.is_active) === 1
                            ? "Available"
                            : "Unavailable"}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-end gap-3">

                          {/* VIEW */}

                          <Link
                            href={`/products/${product.slug}`}
                            className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--beige)] hover:text-[var(--primary)]"
                            title="View Product"
                          >
                            <Eye size={18} />
                          </Link>

                          {/* EDIT */}

                          <Link
                            href={`/admin/products/${product.slug}`}
                            className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--beige)] hover:text-[var(--primary)]"
                            title="Edit Product"
                          >
                            <Pencil size={18} />
                          </Link>

                          {/* AVAILABILITY TOGGLE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleAvailability(product.id)
                            }
                            disabled={
                              togglingId === product.id
                            }
                            className={`relative h-7 w-12 rounded-full transition ${
                              Number(product.is_active) === 1
                                ? "bg-green-500"
                                : "bg-gray-300"
                            } ${
                              togglingId === product.id
                                ? "cursor-not-allowed opacity-50"
                                : "cursor-pointer"
                            }`}
                            title={
                              Number(product.is_active) === 1
                                ? "Mark as unavailable"
                                : "Mark as available"
                            }
                          >

                            <span
                              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                                Number(product.is_active) === 1
                                  ? "left-6"
                                  : "left-1"
                              }`}
                            />

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>
    </section>
  );
}