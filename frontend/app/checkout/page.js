"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Check,
  ShoppingBag,
  CreditCard,
  Banknote,
} from "lucide-react";

import API_BASE_URL,{BACKEND_URL} from "../../lib/api";
import { getToken } from "../../lib/auth";

export default function CheckoutPage() {
  const router = useRouter();

  // ==========================================
  // STATE
  // ==========================================

  const [cart, setCart] = useState(null);

  const [addresses, setAddresses] = useState([]);

  const [selectedAddress, setSelectedAddress] =
    useState(null);

  // Payment method
  const [paymentMethod, setPaymentMethod] =
    useState("cod");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [orderError, setOrderError] =
    useState("");

  // ==========================================
  // FETCH CHECKOUT DATA
  // ==========================================

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchCheckoutData() {
      try {
        setLoading(true);
        setError("");

        const [cartResponse, addressResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/cart`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),

            fetch(`${API_BASE_URL}/addresses`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        const cartData =
          await cartResponse.json();

        const addressData =
          await addressResponse.json();

        // ======================================
        // VALIDATE CART RESPONSE
        // ======================================

        if (
          !cartResponse.ok ||
          !cartData.success
        ) {
          throw new Error(
            cartData.message ||
              "Failed to fetch cart"
          );
        }

        // ======================================
        // VALIDATE ADDRESS RESPONSE
        // ======================================

        if (
          !addressResponse.ok ||
          !addressData.success
        ) {
          throw new Error(
            addressData.message ||
              "Failed to fetch addresses"
          );
        }

        // ======================================
        // SET CART
        // ======================================

        setCart(cartData.cart);

        // ======================================
        // SET ADDRESSES
        // ======================================

        setAddresses(
          addressData.addresses || []
        );

        // ======================================
        // AUTO SELECT DEFAULT ADDRESS
        // ======================================

        const defaultAddress =
          addressData.addresses?.find(
            (address) =>
              Number(address.is_default) === 1
          );

        if (defaultAddress) {
          setSelectedAddress(
            defaultAddress.id
          );
        }
      } catch (error) {
        console.error(
          "Checkout error:",
          error
        );

        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCheckoutData();
  }, [router]);

  // ==========================================
  // PLACE ORDER
  // ==========================================
  const getImageUrl = (image) => {
    if (!image) return null;

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    const cleanImage = image.replace(/^\/+/, "");

    if (cleanImage.startsWith("uploads/")) {
      return `${BACKEND_URL}/${cleanImage}`;
    }

    if (!cleanImage.includes("/")) {
      return `${BACKEND_URL}/uploads/products/${cleanImage}`;
    }

    return `${BACKEND_URL}/${cleanImage}`;
  };
  const handlePlaceOrder = async () => {
    const token = getToken();

    // ======================================
    // AUTH CHECK
    // ======================================

    if (!token) {
      router.push("/login");
      return;
    }

    // ======================================
    // ADDRESS CHECK
    // ======================================

    if (!selectedAddress) {
      setOrderError(
        "Please select a delivery address."
      );

      return;
    }

    try {
      setPlacingOrder(true);
      setOrderError("");

      // ======================================
      // CREATE ORDER
      // ======================================

      const response = await fetch(
        `${API_BASE_URL}/orders/checkout`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            address_id: selectedAddress,
            payment_method: paymentMethod,
          }),
        }
      );

      const data =
        await response.json();

      // ======================================
      // HANDLE ERROR
      // ======================================

      if (
        !response.ok ||
        !data.success
      ) {
        console.log(
          "ORDER API ERROR:",
          data
        );

        throw new Error(
          data.message ||
            "Failed to place order"
        );
      }

      // ======================================
      // REFRESH CART COUNT
      // ======================================

      window.dispatchEvent(
        new Event("cartUpdated")
      );

      // ======================================
      // REDIRECT TO ORDER
      // ======================================

      router.push(
        `/orders/${data.order.id}`
      );
    } catch (error) {
      console.error(
        "Place order error:",
        error
      );

      setOrderError(error.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cream)]">
        <p className="text-[var(--text-muted)]">
          Preparing your checkout...
        </p>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-6">
        <div className="text-center">

          <p className="text-red-500">
            {error}
          </p>

          <button
            onClick={() =>
              router.push("/cart")
            }
            className="mt-5 rounded-full bg-[var(--primary)] px-6 py-3 text-white"
          >
            Back to Cart
          </button>

        </div>
      </div>
    );
  }

  // ==========================================
  // EMPTY CART
  // ==========================================

  if (
    !cart ||
    cart.items.length === 0
  ) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] px-6">

        <ShoppingBag
          size={48}
          className="text-[var(--gold)]"
        />

        <h1 className="mt-5 text-2xl font-semibold text-[var(--primary)]">
          Your cart is empty
        </h1>

        <button
          onClick={() =>
            router.push("/products")
          }
          className="mt-6 rounded-full bg-[var(--primary)] px-6 py-3 text-white"
        >
          Continue Shopping
        </button>

      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cream)] px-6 py-10 md:py-16">

      <div className="mx-auto max-w-7xl">

        {/* ======================================
            PAGE HEADING
        ====================================== */}

        <div className="mb-10">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
            Secure Checkout
          </p>

          <h1 className="mt-2 text-4xl font-semibold text-[var(--primary)]">
            Complete Your Order
          </h1>

        </div>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">

          {/* ======================================
              LEFT SECTION
          ====================================== */}

          <div>

            {/* ======================================
                ADDRESS SECTION
            ====================================== */}

            <section className="rounded-3xl bg-white p-6 shadow-sm md:p-8">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-semibold text-[var(--primary)]">
                    Delivery Address
                  </h2>

                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Select where you'd like your order delivered.
                  </p>

                </div>

                <button
                  onClick={() =>
                    router.push("/addresses")
                  }
                  className="flex items-center gap-2 rounded-full border border-[var(--border-light)] px-4 py-2 text-sm font-medium transition hover:border-[var(--gold)]"
                >
                  <Plus size={16} />
                  Add Address
                </button>

              </div>

              {/* ADDRESS LIST */}

              <div className="mt-6 space-y-4">

                {addresses.length === 0 ? (

                  <div className="rounded-2xl border border-dashed border-[var(--border-light)] p-6 text-center">

                    <MapPin
                      size={28}
                      className="mx-auto text-[var(--gold)]"
                    />

                    <p className="mt-3 text-sm text-[var(--text-muted)]">
                      You haven't added a delivery address yet.
                    </p>

                    <button
                      onClick={() =>
                        router.push("/addresses")
                      }
                      className="mt-4 text-sm font-semibold text-[var(--primary)]"
                    >
                      Add your first address
                    </button>

                  </div>

                ) : (

                  addresses.map((address) => (

                    <button
                      key={address.id}
                      onClick={() =>
                        setSelectedAddress(
                          address.id
                        )
                      }
                      className={`w-full rounded-2xl border p-5 text-left transition ${
                        selectedAddress ===
                        address.id
                          ? "border-[var(--primary)] bg-[var(--beige)]"
                          : "border-[var(--border-light)] hover:border-[var(--gold)]"
                      }`}
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <div className="flex items-center gap-3">

                            <h3 className="font-semibold text-[var(--primary)]">
                              {address.full_name}
                            </h3>

                            {Number(
                              address.is_default
                            ) === 1 && (

                              <span className="rounded-full bg-[var(--beige)] px-3 py-1 text-xs font-medium text-[var(--secondary)]">
                                Default
                              </span>

                            )}

                          </div>

                          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">

                            {address.address_line1}

                            {address.address_line2 &&
                              `, ${address.address_line2}`}

                            <br />

                            {address.city},{" "}
                            {address.state} -{" "}
                            {address.pincode}

                          </p>

                          <p className="mt-2 text-sm text-[var(--text-dark)]">
                            Phone: {address.phone}
                          </p>

                        </div>

                        {selectedAddress ===
                          address.id && (

                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white">

                            <Check size={16} />

                          </div>

                        )}

                      </div>

                    </button>

                  ))

                )}

              </div>

            </section>

            {/* ======================================
                PAYMENT SECTION
            ====================================== */}

            <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm md:p-8">

              <div className="flex items-center gap-3">

                <CreditCard
                  size={22}
                  className="text-[var(--gold)]"
                />

                <div>

                  <h2 className="text-xl font-semibold text-[var(--primary)]">
                    Payment Method
                  </h2>

                  <p className="text-sm text-[var(--text-muted)]">
                    Choose your preferred payment method.
                  </p>

                </div>

              </div>

              <div className="mt-6 space-y-4">

                {/* ==================================
                    CASH ON DELIVERY
                ================================== */}

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod("cod")
                  }
                  className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${
                    paymentMethod === "cod"
                      ? "border-[var(--primary)] bg-[var(--beige)]"
                      : "border-[var(--border-light)] hover:border-[var(--gold)]"
                  }`}
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--beige)] text-[var(--primary)]">

                      <Banknote size={21} />

                    </div>

                    <div>

                      <h3 className="font-semibold text-[var(--primary)]">
                        Cash on Delivery
                      </h3>

                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Pay when your order is delivered.
                      </p>

                    </div>

                  </div>

                  {paymentMethod === "cod" && (

                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-white">

                      <Check size={16} />

                    </div>

                  )}

                </button>

                {/* ==================================
                    ONLINE PAYMENT
                ================================== */}

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod("online")
                  }
                  className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${
                    paymentMethod === "online"
                      ? "border-[var(--primary)] bg-[var(--beige)]"
                      : "border-[var(--border-light)] hover:border-[var(--gold)]"
                  }`}
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--beige)] text-[var(--primary)]">

                      <CreditCard size={21} />

                    </div>

                    <div>

                      <h3 className="font-semibold text-[var(--primary)]">
                        Online Payment
                      </h3>

                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Pay securely using UPI, cards or net banking.
                      </p>

                    </div>

                  </div>

                  {paymentMethod === "online" && (

                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-white">

                      <Check size={16} />

                    </div>

                  )}

                </button>

              </div>

            </section>

          </div>

          {/* ======================================
              ORDER SUMMARY
          ====================================== */}

          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm lg:sticky lg:top-28">

            <h2 className="text-xl font-semibold text-[var(--primary)]">
              Order Summary
            </h2>

            {/* ======================================
                CART ITEMS
            ====================================== */}

            <div className="mt-6 space-y-5">

              {cart.items.map((item) => {

                let customization = null;

                try {

                  if (item.customization_data) {

                    customization =
                      typeof item.customization_data ===
                      "string"
                        ? JSON.parse(
                            item.customization_data
                          )
                        : item.customization_data;

                  }

                } catch (error) {

                  console.error(
                    "Failed to parse customization data:",
                    error
                  );

                  customization = null;

                }

                return (

                  <div
                    key={item.cart_item_id}
                    className="flex gap-4"
                  >

                    {/* PRODUCT IMAGE */}

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--beige)]">

                      {item.product_image ? (

                        <img
                          src={getImageUrl(item.product_image)}
                          alt={item.product_name}
                          className="h-full w-full object-cover"
                        />

                      ) : (

                        <ShoppingBag
                          size={20}
                          className="text-[var(--gold)]"
                        />

                      )}

                    </div>

                    {/* PRODUCT INFO */}

                    <div className="flex flex-1 justify-between gap-3">

                      <div>

                        <h3 className="text-sm font-semibold text-[var(--primary)]">
                          {item.product_name}
                        </h3>

                        {item.size_name && (

                          <p className="mt-1 text-xs text-[var(--text-muted)]">
                            Size: {item.size_name}
                          </p>

                        )}

                        {/* PERSONALIZATION */}

                        {customization &&
                          Object.keys(customization)
                            .length > 0 && (

                            <div className="mt-2 rounded-lg bg-[var(--beige)] px-3 py-2">

                              <p className="text-xs font-semibold text-[var(--primary)]">
                                Personalization
                              </p>

                              {Object.entries(
                                customization
                              ).map(
                                ([key, value]) => (

                                  <p
                                    key={key}
                                    className="mt-1 text-xs text-[var(--text-muted)]"
                                  >

                                    <span className="font-medium capitalize text-[var(--text-dark)]">

                                      {key.replace(
                                        /_/g,
                                        " "
                                      )}

                                      :

                                    </span>{" "}

                                    {value}

                                  </p>

                                )
                              )}

                            </div>

                          )}

                        {/* QUANTITY */}

                        <p className="mt-2 text-xs text-[var(--text-muted)]">
                          Qty: {item.quantity}
                        </p>

                      </div>

                      {/* PRICE */}

                      <p className="text-sm font-semibold text-[var(--primary)]">

                        ₹
                        {(
                          Number(item.price) *
                          Number(item.quantity)
                        ).toLocaleString("en-IN")}

                      </p>

                    </div>

                  </div>

                );

              })}

            </div>

            <div className="my-6 border-t border-[var(--border-light)]" />

            {/* ======================================
                PRICE SUMMARY
            ====================================== */}

            <div className="space-y-3 text-sm">

              <div className="flex justify-between text-[var(--text-muted)]">

                <span>Subtotal</span>

                <span>

                  ₹
                  {Number(
                    cart.total_amount
                  ).toLocaleString("en-IN")}

                </span>

              </div>

              <div className="flex justify-between text-[var(--text-muted)]">

                <span>Shipping</span>

                <span>
                  Free
                </span>

              </div>

              {/* PAYMENT METHOD */}

              <div className="flex justify-between text-[var(--text-muted)]">

                <span>Payment</span>

                <span>

                  {paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : "Online Payment"}

                </span>

              </div>

            </div>

            <div className="my-5 border-t border-[var(--border-light)]" />

            {/* ======================================
                TOTAL
            ====================================== */}

            <div className="flex justify-between">

              <span className="text-lg font-semibold text-[var(--primary)]">
                Total
              </span>

              <span className="text-xl font-semibold text-[var(--primary)]">

                ₹
                {Number(
                  cart.total_amount
                ).toLocaleString("en-IN")}

              </span>

            </div>

            {/* ======================================
                PLACE ORDER
            ====================================== */}

            <button
              onClick={handlePlaceOrder}
              disabled={
                !selectedAddress ||
                placingOrder
              }
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-50"
            >

              <CreditCard size={18} />

              {placingOrder
                ? "Processing..."
                : paymentMethod === "cod"
                ? "Place Order"
                : "Proceed to Payment"}

            </button>

            {/* ORDER ERROR */}

            {orderError && (

              <p className="mt-3 text-center text-sm text-red-500">
                {orderError}
              </p>

            )}

            {/* ADDRESS WARNING */}

            {!selectedAddress &&
              addresses.length > 0 && (

                <p className="mt-3 text-center text-xs text-red-500">
                  Please select a delivery address.
                </p>

              )}

          </aside>

        </div>

      </div>

    </main>
  );
}