"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import API_BASE_URL from "../../../../lib/api";
import { getToken } from "../../../../lib/auth";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const slug = params?.slug;

  // ==========================================
  // PRODUCT STATES
  // ==========================================

  const [productId, setProductId] = useState(null);

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    slug: "",
    description: "",
    base_price: "",
    is_customizable: false,
    stock_status: "available",
  });

  // ==========================================
  // CUSTOMIZATION FIELD STATES
  // ==========================================

  const [customizationFields, setCustomizationFields] =
    useState([]);

  const [fieldLoading, setFieldLoading] =
    useState(false);

  const [fieldError, setFieldError] =
    useState("");

  const [newField, setNewField] = useState({
    field_name: "",
    field_label: "",
    field_type: "text",
    placeholder: "",
    options: [],
    is_required: false,
    display_order: 0,
  });

  // ==========================================
  // FETCH CUSTOMIZATION FIELDS
  // ==========================================

  const fetchCustomizationFields = async (id) => {
    if (!id) return;

    try {
      setFieldError("");

      const token = getToken();

      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};

      const response = await fetch(
        `${API_BASE_URL}/customization-fields/${id}`,
        {
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to fetch customization fields"
        );
      }

      setCustomizationFields(data.fields || []);
    } catch (error) {
      console.error(
        "Customization fields fetch error:",
        error
      );

      setFieldError(error.message);
    }
  };

  // ==========================================
  // FETCH PRODUCT BY SLUG
  // ==========================================

  const fetchProductBySlug = async (
    currentSlug,
    headers
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/products/slug/${encodeURIComponent(
        currentSlug
      )}`,
      {
        headers,
      }
    );

    const data = await response.json();

    if (
      response.ok &&
      data.success &&
      data.product
    ) {
      return data.product;
    }

    return null;
  };

  // ==========================================
  // FALLBACK: FETCH FROM ADMIN PRODUCT LIST
  // ==========================================

  const fetchProductFromAdminList = async (
    currentSlug,
    headers
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/products/admin/all`,
      {
        headers,
      }
    );

    const data = await response.json();

    if (
      !response.ok ||
      !data.success
    ) {
      return null;
    }

    const products =
      data.products || [];

    /*
     * First try to find by slug.
     */

    let foundProduct =
      products.find(
        (product) =>
          String(product.slug) ===
          String(currentSlug)
      );

    /*
     * If the URL is still using an old
     * numeric product ID, also support it.
     *
     * Example:
     *
     * /admin/products/17
     */

    if (!foundProduct) {
      foundProduct =
        products.find(
          (product) =>
            String(product.id) ===
            String(currentSlug)
        );
    }

    return foundProduct || null;
  };

  // ==========================================
  // FETCH PRODUCT + CATEGORIES
  // ==========================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        const headers = token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {};

        if (!slug) {
          throw new Error(
            "Product slug is missing"
          );
        }

        // ======================================
        // STEP 1: TRY SLUG API
        // ======================================

        let product =
          await fetchProductBySlug(
            slug,
            headers
          );

        // ======================================
        // STEP 2: FALLBACK TO ADMIN PRODUCT LIST
        // ======================================

        if (!product) {
          console.warn(
            "Slug API could not find product. Trying admin product list..."
          );

          product =
            await fetchProductFromAdminList(
              slug,
              headers
            );
        }

        // ======================================
        // PRODUCT NOT FOUND
        // ======================================

        if (!product) {
          throw new Error(
            `Product not found for slug: ${slug}`
          );
        }

        // ======================================
        // FETCH CATEGORIES
        // ======================================

        const categoriesResponse =
          await fetch(
            `${API_BASE_URL}/categories`,
            {
              headers,
            }
          );

        const categoriesData =
          await categoriesResponse.json();

        if (
          !categoriesResponse.ok ||
          !categoriesData.success
        ) {
          throw new Error(
            categoriesData.message ||
              "Failed to fetch categories"
          );
        }

        // ======================================
        // SAVE NUMERIC PRODUCT ID
        // ======================================

        setProductId(product.id);

        // ======================================
        // SET PRODUCT FORM DATA
        // ======================================

        setFormData({
          category_id:
            product.category_id || "",

          name:
            product.name || "",

          slug:
            product.slug || "",

          description:
            product.description || "",

          base_price:
            product.base_price || "",

          is_customizable:
            Number(
              product.is_customizable
            ) === 1,

          stock_status:
            product.stock_status ||
            "available",
        });

        // ======================================
        // SET CATEGORIES
        // ======================================

        setCategories(
          categoriesData.categories || []
        );

        // ======================================
        // FETCH CUSTOMIZATION FIELDS
        // ======================================

        await fetchCustomizationFields(
          product.id
        );
      } catch (error) {
        console.error(
          "Fetch product error:",
          error
        );

        setError(
          error.message ||
            "Failed to fetch product"
        );
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  // ==========================================
  // HANDLE PRODUCT INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ==========================================
  // AUTO GENERATE PRODUCT SLUG
  // ==========================================

  const handleNameChange = (value) => {
    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )
      .replace(
        /\s+/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      );

    setFormData((previous) => ({
      ...previous,

      name: value,

      slug: generatedSlug,
    }));
  };

  // ==========================================
  // HANDLE CUSTOMIZATION FIELD CHANGE
  // ==========================================

  const handleFieldChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setNewField((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ==========================================
  // AUTO GENERATE FIELD NAME
  // ==========================================

  const handleFieldLabelChange = (value) => {
    const generatedFieldName = value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )
      .replace(
        /\s+/g,
        "_"
      )
      .replace(
        /-+/g,
        "_"
      );

    setNewField((previous) => ({
      ...previous,

      field_label: value,

      field_name:
        generatedFieldName,
    }));
  };

  // ==========================================
  // ADD CUSTOMIZATION FIELD
  // ==========================================

  const handleAddCustomizationField =
    async () => {
      try {
        setFieldLoading(true);
        setFieldError("");

        if (
          !newField.field_label.trim()
        ) {
          throw new Error(
            "Customization field label is required"
          );
        }

        if (!productId) {
          throw new Error(
            "Product ID not available"
          );
        }

        const token = getToken();

        if (!token) {
          throw new Error(
            "Authentication token not found"
          );
        }

        const response = await fetch(
          `${API_BASE_URL}/customization-fields/${productId}`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              field_name:
                newField.field_name,

              field_label:
                newField.field_label,

              field_type:
                newField.field_type,

              placeholder:
                newField.placeholder,

              options:
                newField.options,

              is_required:
                newField.is_required,

              display_order:
                customizationFields.length,
            }),
          }
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to add customization field"
          );
        }

        await fetchCustomizationFields(
          productId
        );

        setNewField({
          field_name: "",
          field_label: "",
          field_type: "text",
          placeholder: "",
          options: [],
          is_required: false,
          display_order: 0,
        });
      } catch (error) {
        console.error(
          "Add customization field error:",
          error
        );

        setFieldError(
          error.message
        );
      } finally {
        setFieldLoading(false);
      }
    };

  // ==========================================
  // DELETE CUSTOMIZATION FIELD
  // ==========================================

  const handleDeleteCustomizationField =
    async (fieldId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this customization field?"
        );

      if (!confirmed) return;

      try {
        setFieldError("");

        const token = getToken();

        if (!token) {
          throw new Error(
            "Authentication token not found"
          );
        }

        const response = await fetch(
          `${API_BASE_URL}/customization-fields/field/${fieldId}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to delete customization field"
          );
        }

        await fetchCustomizationFields(
          productId
        );
      } catch (error) {
        console.error(
          "Delete customization field error:",
          error
        );

        setFieldError(
          error.message
        );
      }
    };

  // ==========================================
  // UPDATE PRODUCT
  // ==========================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found"
        );
      }

      if (!productId) {
        throw new Error(
          "Product ID not available"
        );
      }

      if (
        !formData.category_id ||
        !formData.name.trim() ||
        !formData.slug.trim()
      ) {
        throw new Error(
          "Category, product name and slug are required"
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/products/${productId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            category_id:
              formData.category_id,

            name:
              formData.name.trim(),

            slug:
              formData.slug.trim(),

            description:
              formData.description.trim() ||
              null,

            base_price:
              Number(
                formData.base_price
              ) || 0,

            is_customizable:
              formData.is_customizable,

            stock_status:
              formData.stock_status,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to update product"
        );
      }

      setSuccess(
        "Product updated successfully!"
      );

      setTimeout(() => {
        router.push(
          "/admin/products"
        );

        router.refresh();
      }, 1000);
    } catch (error) {
      console.error(
        "Update product error:",
        error
      );

      setError(
        error.message ||
          "Failed to update product"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[var(--cream)]">
        <div className="flex items-center gap-3 text-[var(--text-muted)]">
          <Loader2
            size={22}
            className="animate-spin"
          />

          Loading product details...
        </div>
      </section>
    );
  }

  // ==========================================
  // INITIAL ERROR
  // ==========================================

  if (
    error &&
    !formData.name
  ) {
    return (
      <section className="min-h-screen bg-[var(--cream)] p-8">
        <div className="mx-auto max-w-3xl">

          <button
            onClick={() =>
              router.push(
                "/admin/products"
              )
            }
            className="mb-6 flex items-center gap-2 text-sm text-[var(--secondary)]"
          >
            <ArrowLeft size={18} />

            Back to Products
          </button>

          <div className="rounded-2xl bg-red-50 p-6 text-red-600">
            {error}
          </div>

        </div>
      </section>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <section className="min-h-screen bg-[var(--cream)] p-6 md:p-8">

      <div className="mx-auto max-w-4xl">

        {/* BACK BUTTON */}

        <button
          onClick={() =>
            router.push(
              "/admin/products"
            )
          }
          className="mb-8 flex items-center gap-2 text-sm font-medium text-[var(--secondary)] transition hover:text-[var(--gold)]"
        >
          <ArrowLeft size={18} />

          Back to Products
        </button>

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--gold)]">
            Product Management
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-[var(--primary)]">
            Edit Product
          </h1>

          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Update your product information,
            availability and customization fields.
          </p>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 shadow-sm md:p-8"
        >

          {/* PRODUCT DETAILS */}

          <div className="grid gap-6 md:grid-cols-2">

            {/* CATEGORY */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
                Category *
              </label>

              <select
                name="category_id"
                value={
                  formData.category_id
                }
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--border-light)] bg-white px-4 py-3 outline-none transition focus:border-[var(--gold)]"
              >

                <option value="">
                  Select Category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {category.name}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* PRODUCT NAME */}

            <div>

              <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
                Product Name *
              </label>

              <input
                type="text"
                value={
                  formData.name
                }
                onChange={(event) =>
                  handleNameChange(
                    event.target.value
                  )
                }
                placeholder="Enter product name"
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
                name="slug"
                value={
                  formData.slug
                }
                onChange={handleChange}
                placeholder="product-slug"
                className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none transition focus:border-[var(--gold)]"
              />

            </div>

            {/* BASE PRICE */}

            <div>

              <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
                Base Price (₹)
              </label>

              <input
                type="number"
                name="base_price"
                min="0"
                value={
                  formData.base_price
                }
                onChange={handleChange}
                placeholder="0"
                className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none transition focus:border-[var(--gold)]"
              />

            </div>

            {/* STOCK STATUS */}

            <div>

              <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
                Stock Status
              </label>

              <select
                name="stock_status"
                value={
                  formData.stock_status
                }
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--border-light)] bg-white px-4 py-3 outline-none transition focus:border-[var(--gold)]"
              >

                <option value="available">
                  Available
                </option>

                <option value="out_of_stock">
                  Out of Stock
                </option>

              </select>

            </div>

            {/* DESCRIPTION */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
                Product Description
              </label>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={handleChange}
                rows={6}
                placeholder="Write a detailed description about the product..."
                className="w-full resize-none rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none transition focus:border-[var(--gold)]"
              />

            </div>

          </div>

          {/* PRODUCT CUSTOMIZATION TOGGLE */}

          <div className="mt-6 rounded-2xl border border-[var(--border-light)] bg-[var(--cream)] p-5">

            <div className="flex items-center justify-between gap-5">

              <div>

                <h3 className="font-semibold text-[var(--primary)]">
                  Product Customization
                </h3>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Allow customers to personalize
                  this product.
                </p>

              </div>

              <label className="relative inline-flex cursor-pointer items-center">

                <input
                  type="checkbox"
                  name="is_customizable"
                  checked={
                    formData.is_customizable
                  }
                  onChange={handleChange}
                  className="peer sr-only"
                />

                <div className="h-7 w-12 rounded-full bg-gray-300 transition peer-checked:bg-[var(--secondary)]">

                  <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />

                </div>

              </label>

            </div>

          </div>

          {/* CUSTOMIZATION FIELDS */}

          {formData.is_customizable && (

            <div className="mt-6 rounded-2xl border border-[var(--border-light)] bg-white p-5">

              <div className="mb-6">

                <h3 className="font-semibold text-[var(--primary)]">
                  Customization Fields
                </h3>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Add fields customers must fill
                  while personalizing this product.
                </p>

              </div>

              {fieldError && (

                <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {fieldError}
                </div>

              )}

              {customizationFields.length > 0 && (

                <div className="mb-6">

                  <p className="mb-3 text-sm font-medium text-[var(--text-dark)]">
                    Existing Fields
                  </p>

                  <div className="space-y-3">

                    {customizationFields.map(
                      (field) => (

                        <div
                          key={field.id}
                          className="flex items-center justify-between rounded-xl border border-[var(--border-light)] bg-[var(--cream)] px-4 py-3"
                        >

                          <div>

                            <p className="font-medium text-[var(--primary)]">

                              {field.field_label}

                              {Number(
                                field.is_required
                              ) === 1 && (

                                <span className="ml-1 text-red-500">
                                  *
                                </span>

                              )}

                            </p>

                            <div className="mt-1 flex gap-3 text-xs text-[var(--text-muted)]">

                              <span>
                                Type:{" "}
                                {
                                  field.field_type
                                }
                              </span>

                              {field.placeholder && (

                                <span>
                                  Placeholder:{" "}
                                  {
                                    field.placeholder
                                  }
                                </span>

                              )}

                            </div>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteCustomizationField(
                                field.id
                              )
                            }
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                            title="Delete field"
                          >

                            <Trash2
                              size={18}
                            />

                          </button>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

              {/* ADD FIELD */}

              <div className="rounded-xl border border-dashed border-[var(--border-light)] p-5">

                <h4 className="mb-5 text-sm font-semibold text-[var(--primary)]">
                  Add New Field
                </h4>

                <div className="grid gap-4 md:grid-cols-2">

                  {/* FIELD LABEL */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
                      Field Label *
                    </label>

                    <input
                      type="text"
                      value={
                        newField.field_label
                      }
                      onChange={(event) =>
                        handleFieldLabelChange(
                          event.target.value
                        )
                      }
                      placeholder="Example: Bride Name"
                      className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 text-sm outline-none focus:border-[var(--gold)]"
                    />

                  </div>

                  {/* FIELD TYPE */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
                      Field Type
                    </label>

                    <select
                      name="field_type"
                      value={
                        newField.field_type
                      }
                      onChange={
                        handleFieldChange
                      }
                      className="w-full rounded-xl border border-[var(--border-light)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--gold)]"
                    >

                      <option value="text">
                        Text
                      </option>

                      <option value="textarea">
                        Long Text
                      </option>

                      <option value="date">
                        Date
                      </option>

                      <option value="number">
                        Number
                      </option>

                    </select>

                  </div>

                  {/* PLACEHOLDER */}

                  <div className="md:col-span-2">

                    <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
                      Placeholder
                    </label>

                    <input
                      type="text"
                      name="placeholder"
                      value={
                        newField.placeholder
                      }
                      onChange={
                        handleFieldChange
                      }
                      placeholder="Example: Enter bride name"
                      className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 text-sm outline-none focus:border-[var(--gold)]"
                    />

                  </div>

                </div>

                {/* REQUIRED */}

                <label className="mt-5 flex cursor-pointer items-center gap-3">

                  <input
                    type="checkbox"
                    name="is_required"
                    checked={
                      newField.is_required
                    }
                    onChange={
                      handleFieldChange
                    }
                    className="h-4 w-4 accent-[var(--primary)]"
                  />

                  <span className="text-sm text-[var(--text-dark)]">
                    This field is required
                  </span>

                </label>

                {/* ADD BUTTON */}

                <button
                  type="button"
                  onClick={
                    handleAddCustomizationField
                  }
                  disabled={
                    fieldLoading
                  }
                  className="mt-5 flex items-center gap-2 rounded-xl bg-[var(--secondary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {fieldLoading ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Adding Field...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />

                      Add Customization Field
                    </>
                  )}

                </button>

              </div>

            </div>

          )}

          {/* PRODUCT ERROR */}

          {error && (

            <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>

          )}

          {/* SUCCESS */}

          {success && (

            <div className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>

          )}

          {/* ACTION BUTTONS */}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/products"
                )
              }
              disabled={saving}
              className="rounded-xl border border-[var(--border-light)] px-6 py-3 text-sm font-medium text-[var(--text-dark)] transition hover:bg-[var(--cream)]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={18} />

                  Save Changes
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </section>
  );
}