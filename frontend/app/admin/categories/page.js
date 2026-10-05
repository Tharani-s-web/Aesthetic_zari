"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Tag,
  X,
  Loader2,
  FolderPlus,
  Pencil,
  Image as ImageIcon,
} from "lucide-react";

import API_BASE_URL, {BACKEND_URL,} from "../../../lib/api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================

  const fetchCategories = async () => {
    try {
      setLoading(true);

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
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ==========================================
  // AUTO GENERATE SLUG
  // ==========================================

  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameChange = (value) => {
    setName(value);
    setSlug(generateSlug(value));
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");

    setEditingCategory(null);
    setMessage("");
    setError("");
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // ==========================================
  // OPEN CREATE MODAL
  // ==========================================

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const openEditModal = (category) => {
    setEditingCategory(category);

    setName(category.name || "");
    setSlug(category.slug || "");
    setDescription(category.description || "");
    setImageUrl(category.image_url || "");

    setMessage("");
    setError("");

    setShowModal(true);
  };

  // ==========================================
  // SUBMIT CATEGORY
  // ==========================================

  const handleSubmitCategory = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!name.trim() || !slug.trim()) {
      setError(
        "Category name and slug are required."
      );
      return;
    }

    try {
      setSubmitting(true);

      const isEditing = Boolean(editingCategory);

      const endpoint = isEditing
        ? `${API_BASE_URL}/categories/${editingCategory.id}`
        : `${API_BASE_URL}/categories`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description:
            description.trim() || null,
          image_url:
            imageUrl.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            `Failed to ${
              isEditing ? "update" : "create"
            } category`
        );
      }

      setMessage(
        isEditing
          ? "Category updated successfully!"
          : "Category created successfully!"
      );

      await fetchCategories();

      setTimeout(() => {
        closeModal();
      }, 800);

    } catch (error) {
      console.error(
        "Category submit error:",
        error
      );

      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // IMAGE URL HELPER
  // ==========================================

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    return imageUrl.startsWith("http")
      ? imageUrl
      : `${BACKEND_URL}${imageUrl}`;
  };

  return (
    <div className="min-h-screen">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--gold)]">
            Product Management
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-[var(--primary)]">
            Categories
          </h1>

          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Organize and manage your product categories.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--secondary)]"
        >
          <Plus size={18} />
          Add Category
        </button>

      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && !showModal && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ======================================
          LOADING
      ====================================== */}

      {loading && (
        <div className="flex min-h-[400px] items-center justify-center">

          <div className="flex items-center gap-3 text-[var(--text-muted)]">

            <Loader2
              size={22}
              className="animate-spin"
            />

            Loading categories...

          </div>

        </div>
      )}

      {/* ======================================
          EMPTY STATE
      ====================================== */}

      {!loading && categories.length === 0 && (

        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border-light)] bg-white p-8 text-center">

          <FolderPlus
            size={48}
            className="text-[var(--gold)]"
          />

          <h2 className="mt-5 text-xl font-semibold text-[var(--primary)]">
            No Categories Yet
          </h2>

          <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">
            Start organizing your products by creating your first category.
          </p>

          <button
            onClick={openCreateModal}
            className="mt-6 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white"
          >
            Create Category
          </button>

        </div>

      )}

      {/* ======================================
          CATEGORY GRID
      ====================================== */}

      {!loading && categories.length > 0 && (

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

          {categories.map((category) => (

            <div
              key={category.id}
              className="group overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white transition hover:-translate-y-1 hover:shadow-lg"
            >

              {/* IMAGE */}

              <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-[var(--beige)]">

                {category.image_url ? (

                  <img
                    src={getImageUrl(category.image_url)}
                    alt={category.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                ) : (

                  <Tag
                    size={38}
                    className="text-[var(--gold)]"
                  />

                )}

                {/* EDIT BUTTON */}

                <button
                  onClick={() =>
                    openEditModal(category)
                  }
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--primary)] shadow-md transition hover:bg-[var(--primary)] hover:text-white"
                  aria-label="Edit category"
                  title="Edit category"
                >
                  <Pencil size={17} />
                </button>

              </div>

              {/* CONTENT */}

              <div className="p-5">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <h2 className="text-lg font-semibold text-[var(--primary)]">
                      {category.name}
                    </h2>

                  </div>

                  

                </div>

                {category.description && (

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-[var(--text-muted)]">
                    {category.description}
                  </p>

                )}

                {/* EDIT CATEGORY BUTTON */}

                <button
                  onClick={() =>
                    openEditModal(category)
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-light)] py-2.5 text-sm font-medium text-[var(--primary)] transition hover:border-[var(--primary)] hover:bg-[var(--beige)]"
                >
                  <Pencil size={16} />
                  Edit Category
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

      {/* ======================================
          CREATE / EDIT CATEGORY MODAL
      ====================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl md:p-8">

            {/* CLOSE */}

            <button
              onClick={closeModal}
              className="absolute right-5 top-5 text-[var(--text-muted)] transition hover:text-red-500"
              aria-label="Close modal"
            >
              <X size={22} />
            </button>

            {/* HEADER */}

            <div className="pr-10">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
                {editingCategory
                  ? "Edit Category"
                  : "New Category"}
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-[var(--primary)]">
                {editingCategory
                  ? "Update Category"
                  : "Add Category"}
              </h2>

              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {editingCategory
                  ? "Update category details and image."
                  : "Create a category to organize your products."}
              </p>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmitCategory}
              className="mt-7 space-y-5"
            >

              {/* CATEGORY NAME */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
                  Category Name *
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    handleNameChange(
                      event.target.value
                    )
                  }
                  placeholder="Example: Birthday Gifts"
                  className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none transition focus:border-[var(--gold)]"
                />

              </div>

              {/* SLUG */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
                  Slug *
                </label>

                <input
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    setSlug(event.target.value)
                  }
                  placeholder="birthday-gifts"
                  className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none transition focus:border-[var(--gold)]"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Write a short description..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none transition focus:border-[var(--gold)]"
                />

              </div>

              {/* IMAGE URL */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
                  Category Image URL
                </label>

                <input
                  type="text"
                  value={imageUrl}
                  onChange={(event) =>
                    setImageUrl(event.target.value)
                  }
                  placeholder="/uploads/category-image.jpg"
                  className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none transition focus:border-[var(--gold)]"
                />

                {/* IMAGE PREVIEW */}

                {imageUrl && (

                  <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border-light)]">

                    <div className="flex aspect-video items-center justify-center bg-[var(--beige)]">

                      <img
                        src={getImageUrl(imageUrl)}
                        alt="Category preview"
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />

                    </div>

                  </div>

                )}

              </div>

              {/* ERROR */}

              {error && (

                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>

              )}

              {/* SUCCESS */}

              {message && (

                <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">
                  {message}
                </div>

              )}

              {/* SUBMIT BUTTON */}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {submitting && (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                )}

                {submitting
                  ? editingCategory
                    ? "Updating Category..."
                    : "Creating Category..."
                  : editingCategory
                  ? "Update Category"
                  : "Create Category"}

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}