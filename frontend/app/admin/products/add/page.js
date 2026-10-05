"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  ImagePlus,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";

import API_BASE_URL from "../../../../lib/api";
import { getToken } from "../../../../lib/auth";

const MAX_IMAGES = 5;

export default function AddProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category_id: "",
    description: "",
    base_price: "",
    is_customizable: false,
  });

  // ==========================================
  // MULTIPLE IMAGE STATES
  // ==========================================

  const [selectedImages, setSelectedImages] =
    useState([]);

  // ==========================================
  // LOADING STATES
  // ==========================================

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/admin/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch categories"
        );
      }

      setCategories(data.categories || []);
    } catch (error) {
      console.error("Category fetch error:", error);

      setError(error.message);
    } finally {
      setLoadingCategories(false);
    }
  };

  // ==========================================
  // GENERATE SLUG
  // ==========================================

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setFormData((previous) => {
      const updatedData = {
        ...previous,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      };

      if (name === "name") {
        updatedData.slug = generateSlug(value);
      }

      return updatedData;
    });
  };

  // ==========================================
  // HANDLE MULTIPLE IMAGE SELECTION
  // ==========================================

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);

    if (!files.length) return;

    setError("");

    const remainingSlots =
      MAX_IMAGES - selectedImages.length;

    if (remainingSlots <= 0) {
      setError(
        `You can upload a maximum of ${MAX_IMAGES} images.`
      );
      return;
    }

    const filesToAdd = files.slice(
      0,
      remainingSlots
    );

    // Validate all images
    for (const file of filesToAdd) {
      if (!file.type.startsWith("image/")) {
        setError(
          `${file.name} is not a valid image file.`
        );
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError(
          `${file.name} exceeds the 5MB size limit.`
        );
        return;
      }
    }

    const newImages = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedImages((previous) => [
      ...previous,
      ...newImages,
    ]);

    // Reset input so same image can be selected again
    event.target.value = "";
  };

  // ==========================================
  // REMOVE IMAGE
  // ==========================================

  const removeImage = (index) => {
    setSelectedImages((previous) => {
      const imageToRemove = previous[index];

      if (imageToRemove?.preview) {
        URL.revokeObjectURL(
          imageToRemove.preview
        );
      }

      return previous.filter(
        (_, imageIndex) =>
          imageIndex !== index
      );
    });
  };

  // ==========================================
  // ADD PRODUCT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    // Validate required fields
    if (
      !formData.name.trim() ||
      !formData.slug.trim() ||
      !formData.category_id ||
      formData.base_price === ""
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found"
        );
      }

      // ======================================
      // STEP 1: CREATE PRODUCT
      // ======================================

      const productResponse = await fetch(
        `${API_BASE_URL}/products`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            category_id: Number(
              formData.category_id
            ),
            description:
              formData.description.trim(),
            base_price: Number(
              formData.base_price
            ),
            is_customizable:
              formData.is_customizable ? 1 : 0,
          }),
        }
      );

      const productData =
        await productResponse.json();

      console.log(
        "CREATE PRODUCT RESPONSE:",
        productData
      );

      if (
        !productResponse.ok ||
        !productData.success
      ) {
        throw new Error(
          productData.message ||
            "Failed to create product"
        );
      }

      // ======================================
      // GET PRODUCT ID
      // ======================================

      const productId =
        productData.productId ||
        productData.product?.id;

      if (!productId) {
        throw new Error(
          "Product was created, but product ID was not returned by the server."
        );
      }

      // ======================================
      // GET PRODUCT SLUG
      // ======================================

      /*
       * Different backend response formats are
       * handled here.
       *
       * Possible formats:
       *
       * productData.slug
       * productData.product.slug
       * formData.slug
       *
       * Since we already generated the slug before
       * creating the product, formData.slug is a
       * reliable fallback.
       */

      const productSlug =
        productData.slug ||
        productData.product?.slug ||
        formData.slug.trim();

      if (!productSlug) {
        throw new Error(
          "Product was created, but product slug was not available."
        );
      }

      // ======================================
      // STEP 2: UPLOAD ALL IMAGES
      // ======================================

      if (selectedImages.length > 0) {
        for (
          let index = 0;
          index < selectedImages.length;
          index++
        ) {
          const imageFormData = new FormData();

          imageFormData.append(
            "image",
            selectedImages[index].file
          );

          // First image = primary image
          imageFormData.append(
            "is_primary",
            index === 0 ? "1" : "0"
          );

          const imageResponse = await fetch(
            `${API_BASE_URL}/product-images/${productId}`,
            {
              method: "POST",

              headers: {
                Authorization: `Bearer ${token}`,
              },

              body: imageFormData,
            }
          );

          const imageData =
            await imageResponse.json();

          if (
            !imageResponse.ok ||
            !imageData.success
          ) {
            throw new Error(
              `Product created but image ${
                index + 1
              } upload failed: ${
                imageData.message ||
                "Unknown error"
              }`
            );
          }
        }
      }

      // ======================================
      // SUCCESS MESSAGE
      // ======================================

      setMessage(
        selectedImages.length > 0
          ? `Product created successfully with ${selectedImages.length} image(s)!`
          : "Product created successfully!"
      );

      // ======================================
      // REDIRECT USING SLUG
      // ======================================

      setTimeout(() => {
        router.push(
          `/admin/products/${productSlug}`
        );
      }, 1200);

    } catch (error) {
      console.error(
        "Add product error:",
        error
      );

      setError(
        error.message ||
          "Failed to create product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[var(--cream)] p-8">
      <div className="mx-auto max-w-3xl">

        {/* BACK */}

        <Link
          href="/admin/products"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--secondary)] hover:text-[var(--gold)]"
        >
          <ArrowLeft size={18} />
          Back to Products
        </Link>

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--gold)]">
            Product Management
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-[var(--primary)]">
            Add New Product
          </h1>

          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Create a product and configure its details.
          </p>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[var(--border-light)] bg-white p-6 md:p-8"
        >

          {/* PRODUCT NAME */}

          <div className="mb-6">

            <label className="mb-2 block text-sm font-medium text-[var(--primary)]">
              Product Name *
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 text-sm outline-none focus:border-[var(--gold)]"
            />

          </div>

          {/* CATEGORY */}

          <div className="mb-6">

            <label className="mb-2 block text-sm font-medium text-[var(--primary)]">
              Category *
            </label>

            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              disabled={loadingCategories}
              className="w-full rounded-xl border border-[var(--border-light)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--gold)] disabled:opacity-60"
            >

              <option value="">
                {loadingCategories
                  ? "Loading categories..."
                  : "Select category"}
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}

            </select>

          </div>

          {/* BASE PRICE */}

          <div className="mb-6">

            <label className="mb-2 block text-sm font-medium text-[var(--primary)]">
              Base Price *
            </label>

            <input
              type="number"
              name="base_price"
              value={formData.base_price}
              onChange={handleChange}
              placeholder="Enter base price"
              min="0"
              step="0.01"
              className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 text-sm outline-none focus:border-[var(--gold)]"
            />

          </div>

          {/* PRODUCT IMAGES */}

          <div className="mb-6">

            <div className="mb-2 flex items-center justify-between">

              <label className="text-sm font-medium text-[var(--primary)]">
                Product Images
              </label>

              <span className="text-xs text-[var(--text-muted)]">
                {selectedImages.length}/{MAX_IMAGES} images
              </span>

            </div>

            {/* IMAGE UPLOAD */}

            {selectedImages.length < MAX_IMAGES && (

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-light)] bg-[var(--cream)] px-6 py-8 transition hover:border-[var(--gold)]">

                <ImagePlus
                  size={30}
                  className="text-[var(--gold)]"
                />

                <span className="mt-2 text-sm font-medium text-[var(--primary)]">
                  Click to upload images
                </span>

                <span className="mt-1 text-xs text-[var(--text-muted)]">
                  Select up to {MAX_IMAGES} images • JPG, PNG or WEBP
                </span>

                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />

              </label>

            )}

            {/* IMAGE PREVIEWS */}

            {selectedImages.length > 0 && (

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">

                {selectedImages.map(
                  (image, index) => (

                    <div
                      key={image.preview}
                      className="relative aspect-square overflow-hidden rounded-xl border border-[var(--border-light)]"
                    >

                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      {/* PRIMARY LABEL */}

                      {index === 0 && (

                        <span className="absolute bottom-1 left-1 rounded-md bg-[var(--primary)] px-2 py-1 text-[10px] font-medium text-white">
                          Primary
                        </span>

                      )}

                      {/* REMOVE */}

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(index)
                        }
                        className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X size={14} />
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          {/* DESCRIPTION */}

          <div className="mb-6">

            <label className="mb-2 block text-sm font-medium text-[var(--primary)]">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows={5}
              className="w-full resize-none rounded-xl border border-[var(--border-light)] px-4 py-3 text-sm outline-none focus:border-[var(--gold)]"
            />

          </div>

          {/* CUSTOMIZABLE */}

          <div className="mb-8 flex items-center justify-between rounded-xl bg-[var(--cream)] px-5 py-4">

            <div>

              <p className="text-sm font-medium text-[var(--primary)]">
                Customizable Product
              </p>

              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Enable this if customers can personalize the product.
              </p>

            </div>

            <input
              type="checkbox"
              name="is_customizable"
              checked={formData.is_customizable}
              onChange={handleChange}
              className="h-5 w-5 accent-[var(--primary)]"
            />

          </div>

          {/* ERROR */}

          {error && (

            <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>

          )}

          {/* SUCCESS */}

          {message && (

            <div className="mb-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>

          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Creating Product...
              </>
            ) : (
              <>
                <Save size={18} />
                Create Product
              </>
            )}

          </button>

        </form>

      </div>
    </section>
  );
}