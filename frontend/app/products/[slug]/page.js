"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Minus,
  Plus,
} from "lucide-react";

import API_BASE_URL, {
  BACKEND_URL,
} from "../../../lib/api";

import { getToken } from "../../../lib/auth";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const slug = params?.slug;

  // ==========================================
  // PRODUCT STATES
  // ==========================================

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [customizationData, setCustomizationData] =
    useState({});

  // ==========================================
  // CART STATES
  // ==========================================

  const [cartLoading, setCartLoading] =
    useState(false);

  const [cartMessage, setCartMessage] =
    useState("");

  const [cartError, setCartError] =
    useState("");

  // ==========================================
  // WISHLIST STATES
  // ==========================================

  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  const [wishlistMessage, setWishlistMessage] =
    useState("");

  const [wishlistItemId, setWishlistItemId] =
    useState(null);

  // ==========================================
  // SELECTED IMAGE
  // ==========================================

  const [selectedImage, setSelectedImage] =
    useState(null);

  // ==========================================
  // PARSE CUSTOMIZATION OPTIONS
  // ==========================================

  const parseOptions = (options) => {
    if (!options) return [];

    // Already an array
    if (Array.isArray(options)) {
      return options;
    }

    // JSON string
    if (typeof options === "string") {
      try {
        const parsed = JSON.parse(options);

        if (Array.isArray(parsed)) {
          return parsed;
        }

        return [];
      } catch (error) {
        console.error(
          "Failed to parse customization options:",
          error
        );

        return [];
      }
    }

    return [];
  };

  // ==========================================
  // CHECK WISHLIST STATUS
  // ==========================================

  const checkWishlistStatus = async (productId) => {
    const token = getToken();

    if (!token) {
      setWishlistItemId(null);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/wishlist`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const existingItem = data.wishlist.find(
          (item) =>
            Number(item.product_id) ===
            Number(productId)
        );

        if (existingItem) {
          setWishlistItemId(
            existingItem.wishlist_item_id
          );
        } else {
          setWishlistItemId(null);
        }
      }
    } catch (error) {
      console.error(
        "Failed to check wishlist:",
        error
      );
    }
  };

  // ==========================================
  // FETCH PRODUCT
  // ==========================================

  useEffect(() => {
    if (!slug) return;

    async function fetchProduct() {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/products/slug/${slug}/details`
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setProduct(data.product);

          // Automatically select first size
          if (data.product.sizes?.length > 0) {
            setSelectedSize(
              data.product.sizes[0]
            );
          }

          // Automatically select first image
          if (data.product.images?.length > 0) {
            setSelectedImage(
              data.product.images[0]
            );
          }

          // Reset customization
          setCustomizationData({});

          // Check wishlist
          await checkWishlistStatus(
            data.product.id
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch product:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  // ==========================================
  // CUSTOMIZATION HANDLER
  // ==========================================

  const handleCustomizationChange = (
    fieldName,
    value
  ) => {
    setCustomizationData((previousData) => ({
      ...previousData,
      [fieldName]: value,
    }));

    // Remove error when user starts typing
    setCartError("");
  };

  // ==========================================
  // QUANTITY HANDLERS
  // ==========================================

  const increaseQuantity = () => {
    setQuantity((previous) => previous + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((previous) => previous - 1);
    }
  };

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart = async () => {
    setCartError("");
    setCartMessage("");

    const token = getToken();

    // Check login
    if (!token) {
      router.push("/login");
      return;
    }

    // ========================================
    // VALIDATE CUSTOMIZATION FIELDS
    // ========================================

    if (
      Number(product.is_customizable) === 1 &&
      product.customization_fields?.length > 0
    ) {
      const requiredFields =
        product.customization_fields.filter(
          (field) =>
            Number(field.is_required) === 1
        );

      for (const field of requiredFields) {
        const value =
          customizationData[field.field_name];

        if (
          value === undefined ||
          value === null ||
          String(value).trim() === ""
        ) {
          setCartError(
            `${field.field_label} is required.`
          );

          return;
        }
      }
    }

    try {
      setCartLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/cart`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            product_id: product.id,

            size_id: selectedSize
              ? selectedSize.id
              : null,

            quantity,

            customization_data:
              Object.keys(customizationData).length > 0
                ? customizationData
                : null,

            price: Number(displayPrice),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to add item to cart"
        );
      }

      setCartMessage(
        "Product added to cart successfully!"
      );

      // Refresh cart count/navbar
      window.dispatchEvent(
        new Event("cartUpdated")
      );

    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );

      setCartError(error.message);

    } finally {
      setCartLoading(false);
    }
  };

  // ==========================================
  // TOGGLE WISHLIST
  // ==========================================

  const handleWishlistToggle = async () => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setWishlistLoading(true);
      setWishlistMessage("");

      // ======================================
      // REMOVE FROM WISHLIST
      // ======================================

      if (wishlistItemId) {
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
            data.message ||
              "Failed to remove from wishlist"
          );
        }

        setWishlistItemId(null);

        setWishlistMessage(
          "Removed from wishlist"
        );

        window.dispatchEvent(
          new Event("wishlistUpdated")
        );

        return;
      }

      // ======================================
      // ADD TO WISHLIST
      // ======================================

      const response = await fetch(
        `${API_BASE_URL}/wishlist`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            product_id: product.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to add to wishlist"
        );
      }

      setWishlistItemId(
        data.wishlistItemId
      );

      setWishlistMessage(
        "Added to wishlist ❤️"
      );

      window.dispatchEvent(
        new Event("wishlistUpdated")
      );

    } catch (error) {
      console.error(
        "Wishlist error:",
        error
      );

      setWishlistMessage(error.message);

    } finally {
      setWishlistLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cream)]">
        <p className="text-[var(--text-muted)]">
          Loading product details...
        </p>
      </div>
    );
  }

  // ==========================================
  // PRODUCT NOT FOUND
  // ==========================================

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] px-6">
        <h1 className="text-2xl font-semibold text-[var(--primary)]">
          Product not found
        </h1>

        <Link
          href="/products"
          className="mt-6 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  // ==========================================
  // PRODUCT PRICE
  // ==========================================

  const displayPrice = selectedSize
    ? selectedSize.price
    : product.base_price;

  return (
    <section className="min-h-screen bg-[var(--cream)] px-6 py-10 md:py-16">
      <div className="mx-auto max-w-7xl">

        {/* BACK BUTTON */}

        <Link
          href="/products"
          className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-[var(--secondary)] transition hover:text-[var(--gold)]"
        >
          <ArrowLeft size={18} />
          Back to Shop
        </Link>

        <div className="grid gap-12 lg:grid-cols-2">

          {/* ======================================
              PRODUCT IMAGES
          ====================================== */}

          <div>

            {/* MAIN IMAGE */}

            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-[var(--beige)]">

              {selectedImage ? (

                <img
                  src={`${BACKEND_URL}${selectedImage.image_url}`}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />

              ) : (

                <div className="text-center">

                  <p className="text-sm uppercase tracking-[0.3em] text-[var(--gold)]">
                    Aesthetic Zari
                  </p>

                  <p className="mt-3 text-[var(--text-muted)]">
                    Product Image Coming Soon
                  </p>

                </div>

              )}

            </div>

            {/* IMAGE THUMBNAILS */}

            {product.images &&
              product.images.length > 1 && (

                <div className="mt-4 flex flex-wrap gap-3">

                  {product.images.map((image) => (

                    <button
                      key={image.id}
                      onClick={() =>
                        setSelectedImage(image)
                      }
                      className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition ${
                        selectedImage?.id === image.id
                          ? "border-[var(--gold)]"
                          : "border-[var(--border-light)] hover:border-[var(--gold)]"
                      }`}
                    >

                      <img
                        src={`${BACKEND_URL}${image.image_url}`}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />

                    </button>

                  ))}

                </div>

              )}

          </div>

          {/* ======================================
              PRODUCT DETAILS
          ====================================== */}

          <div>

            {/* CATEGORY */}

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
              {product.category_name}
            </p>

            {/* PRODUCT NAME */}

            <h1 className="mt-3 text-4xl font-semibold text-[var(--primary)] md:text-5xl">
              {product.name}
            </h1>

            {/* PRICE */}

            <p className="mt-5 text-2xl font-semibold text-[var(--secondary)]">
              ₹
              {Number(displayPrice).toLocaleString(
                "en-IN"
              )}
            </p>

            {/* DESCRIPTION */}

            {product.description && (

              <p className="mt-6 leading-8 text-[var(--text-muted)]">
                {product.description}
              </p>

            )}

            <div className="my-8 border-t border-[var(--border-light)]" />

            {/* SIZE SELECTION */}

            {product.sizes &&
              product.sizes.length > 0 && (

                <div>

                  <h3 className="mb-4 text-sm font-semibold text-[var(--primary)]">
                    Select Size
                  </h3>

                  <div className="flex flex-wrap gap-3">

                    {product.sizes.map((size) => (

                      <button
                        key={size.id}
                        onClick={() =>
                          setSelectedSize(size)
                        }
                        className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                          selectedSize?.id === size.id
                            ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                            : "border-[var(--border-light)] bg-white text-[var(--text-dark)] hover:border-[var(--gold)]"
                        }`}
                      >
                        {size.size_name}
                      </button>

                    ))}

                  </div>

                </div>

              )}

            {/* ======================================
                CUSTOMIZATION SECTION
            ====================================== */}

            {Number(product.is_customizable) === 1 &&
              product.customization_fields?.length > 0 && (

                <div className="mt-8">

                  <h3 className="mb-2 text-lg font-semibold text-[var(--primary)]">
                    Personalize Your Creation
                  </h3>

                  <p className="mb-5 text-sm text-[var(--text-muted)]">
                    Add your personalization details below.
                  </p>

                  <div className="space-y-5">

                    {product.customization_fields.map(
                      (field) => {

                        const options =
                          parseOptions(field.options);

                        return (
                          <div key={field.id}>

                            {/* LABEL */}

                            <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">

                              {field.field_label}

                              {Number(
                                field.is_required
                              ) === 1 && (
                                <span className="ml-1 text-red-500">
                                  *
                                </span>
                              )}

                            </label>

                            {/* TEXTAREA */}

                            {field.field_type ===
                              "textarea" && (

                              <textarea
                                placeholder={
                                  field.placeholder || ""
                                }
                                value={
                                  customizationData[
                                    field.field_name
                                  ] || ""
                                }
                                onChange={(event) =>
                                  handleCustomizationChange(
                                    field.field_name,
                                    event.target.value
                                  )
                                }
                                className="min-h-28 w-full rounded-xl border border-[var(--border-light)] bg-white px-4 py-3 outline-none transition focus:border-[var(--gold)]"
                              />

                            )}

                            {/* SELECT */}

                            {field.field_type ===
                              "select" && (

                              <select
                                value={
                                  customizationData[
                                    field.field_name
                                  ] || ""
                                }
                                onChange={(event) =>
                                  handleCustomizationChange(
                                    field.field_name,
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-[var(--border-light)] bg-white px-4 py-3 outline-none transition focus:border-[var(--gold)]"
                              >

                                <option value="">
                                  Select an option
                                </option>

                                {options.map(
                                  (option, index) => {

                                    const optionValue =
                                      typeof option ===
                                      "object"
                                        ? option.value ||
                                          option.label
                                        : option;

                                    const optionLabel =
                                      typeof option ===
                                      "object"
                                        ? option.label ||
                                          option.value
                                        : option;

                                    return (
                                      <option
                                        key={index}
                                        value={optionValue}
                                      >
                                        {optionLabel}
                                      </option>
                                    );
                                  }
                                )}

                              </select>

                            )}

                            {/* RADIO */}

                            {field.field_type ===
                              "radio" && (

                              <div className="flex flex-wrap gap-3">

                                {options.map(
                                  (option, index) => {

                                    const optionValue =
                                      typeof option ===
                                      "object"
                                        ? option.value ||
                                          option.label
                                        : option;

                                    const optionLabel =
                                      typeof option ===
                                      "object"
                                        ? option.label ||
                                          option.value
                                        : option;

                                    const isSelected =
                                      customizationData[
                                        field.field_name
                                      ] === optionValue;

                                    return (
                                      <button
                                        type="button"
                                        key={index}
                                        onClick={() =>
                                          handleCustomizationChange(
                                            field.field_name,
                                            optionValue
                                          )
                                        }
                                        className={`rounded-full border px-4 py-2 text-sm transition ${
                                          isSelected
                                            ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                                            : "border-[var(--border-light)] bg-white hover:border-[var(--gold)]"
                                        }`}
                                      >
                                        {optionLabel}
                                      </button>
                                    );
                                  }
                                )}

                              </div>

                            )}

                            {/* DEFAULT INPUT */}

                            {![
                              "textarea",
                              "select",
                              "radio",
                            ].includes(
                              field.field_type
                            ) && (

                              <input
                                type={
                                  field.field_type ||
                                  "text"
                                }
                                placeholder={
                                  field.placeholder || ""
                                }
                                value={
                                  customizationData[
                                    field.field_name
                                  ] || ""
                                }
                                onChange={(event) =>
                                  handleCustomizationChange(
                                    field.field_name,
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-[var(--border-light)] bg-white px-4 py-3 outline-none transition focus:border-[var(--gold)]"
                              />

                            )}

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

              )}

            {/* QUANTITY */}

            <div className="mt-8">

              <h3 className="mb-4 text-sm font-semibold text-[var(--primary)]">
                Quantity
              </h3>

              <div className="flex w-fit items-center rounded-full border border-[var(--border-light)] bg-white">

                <button
                  onClick={decreaseQuantity}
                  className="flex h-10 w-10 items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>

                <span className="w-10 text-center text-sm font-medium">
                  {quantity}
                </span>

                <button
                  onClick={increaseQuantity}
                  className="flex h-10 w-10 items-center justify-center"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>

              </div>

            </div>

            {/* CART ERROR */}

            {cartError && (

              <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {cartError}
              </div>

            )}

            {/* CART SUCCESS */}

            {cartMessage && (

              <div className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                {cartMessage}
              </div>

            )}

            {/* WISHLIST MESSAGE */}

            {wishlistMessage && (

              <p
                className={`mt-4 text-sm ${
                  wishlistMessage.includes("Added") ||
                  wishlistMessage.includes("Removed")
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {wishlistMessage}
              </p>

            )}

            {/* ACTION BUTTONS */}

            <div className="mt-10 flex gap-4">

              {/* ADD TO CART */}

              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-60"
              >

                <ShoppingBag size={18} />

                {cartLoading
                  ? "Adding..."
                  : "Add to Cart"}

              </button>

              {/* WISHLIST */}

              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`flex h-14 w-14 items-center justify-center rounded-full border transition disabled:opacity-50 ${
                  wishlistItemId
                    ? "border-red-300 bg-red-50 text-red-500"
                    : "border-[var(--border-light)] bg-white hover:border-red-300 hover:text-red-500"
                }`}
                aria-label={
                  wishlistItemId
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >

                <Heart
                  size={20}
                  className={
                    wishlistItemId
                      ? "fill-current"
                      : ""
                  }
                />

              </button>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}