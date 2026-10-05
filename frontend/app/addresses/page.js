"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
  Check,
} from "lucide-react";

import API_BASE_URL from "../../lib/api";
import { getToken } from "../../lib/auth";

const initialFormData = {
  full_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  is_default: false,
};

export default function AddressesPage() {
  const router = useRouter();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [formData, setFormData] = useState(initialFormData);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // FETCH ADDRESSES
  // ==========================================
  const fetchAddresses = async () => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch addresses");
      }

      setAddresses(data.addresses || []);
    } catch (error) {
      console.error("Fetch addresses error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================
  // OPEN ADD FORM
  // ==========================================
  const handleAddAddress = () => {
    setEditingAddress(null);
    setFormData(initialFormData);
    setMessage("");
    setError("");
    setShowForm(true);
  };

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================
  const handleEditAddress = (address) => {
    setEditingAddress(address);

    setFormData({
      full_name: address.full_name || "",
      phone: address.phone || "",
      address_line1: address.address_line1 || "",
      address_line2: address.address_line2 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      landmark: address.landmark || "",
      is_default: Number(address.is_default) === 1,
    });

    setMessage("");
    setError("");
    setShowForm(true);
  };

  // ==========================================
  // CLOSE FORM
  // ==========================================
  const closeForm = () => {
    setShowForm(false);
    setEditingAddress(null);
    setFormData(initialFormData);
  };

  // ==========================================
  // ADD / UPDATE ADDRESS
  // ==========================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const isEditing = editingAddress !== null;

      const endpoint = isEditing
        ? `${API_BASE_URL}/addresses/${editingAddress.id}`
        : `${API_BASE_URL}/addresses`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            `Failed to ${isEditing ? "update" : "add"} address`
        );
      }

      setMessage(
        isEditing
          ? "Address updated successfully!"
          : "Address added successfully!"
      );

      await fetchAddresses();

      closeForm();
    } catch (error) {
      console.error("Address submit error:", error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // DELETE ADDRESS
  // ==========================================
  const handleDeleteAddress = async (addressId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmDelete) return;

    const token = getToken();

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/addresses/${addressId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete address");
      }

      setMessage("Address deleted successfully!");

      await fetchAddresses();
    } catch (error) {
      console.error("Delete address error:", error);
      setError(error.message);
    }
  };

  // ==========================================
  // SET DEFAULT ADDRESS
  // ==========================================
  const handleSetDefault = async (addressId) => {
    const token = getToken();

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/addresses/${addressId}/default`,
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
          data.message || "Failed to set default address"
        );
      }

      setMessage("Default address updated!");

      await fetchAddresses();
    } catch (error) {
      console.error("Set default address error:", error);
      setError(error.message);
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cream)]">
        <p className="text-[var(--text-muted)]">
          Loading your addresses...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cream)] px-6 py-10 md:py-16">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
              Account
            </p>

            <h1 className="mt-2 text-4xl font-semibold text-[var(--primary)]">
              Saved Addresses
            </h1>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Manage your delivery addresses for a faster checkout.
            </p>
          </div>

          <button
            onClick={handleAddAddress}
            className="flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--secondary)]"
          >
            <Plus size={18} />
            Add New Address
          </button>
        </div>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="mt-8 rounded-xl bg-green-50 px-5 py-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mt-8 rounded-xl bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ADDRESS LIST */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {addresses.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-[var(--border-light)] bg-white p-12 text-center">
              <MapPin
                size={40}
                className="mx-auto text-[var(--gold)]"
              />

              <h2 className="mt-5 text-xl font-semibold text-[var(--primary)]">
                No saved addresses
              </h2>

              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Add an address to make checkout faster and easier.
              </p>

              <button
                onClick={handleAddAddress}
                className="mt-6 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white"
              >
                Add Your First Address
              </button>
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className={`relative rounded-3xl border bg-white p-6 transition ${
                  Number(address.is_default) === 1
                    ? "border-[var(--gold)]"
                    : "border-[var(--border-light)]"
                }`}
              >
                {/* DEFAULT BADGE */}
                {Number(address.is_default) === 1 && (
                  <div className="absolute right-5 top-5 flex items-center gap-1 rounded-full bg-[var(--beige)] px-3 py-1 text-xs font-semibold text-[var(--secondary)]">
                    <Check size={13} />
                    Default
                  </div>
                )}

                <MapPin
                  size={24}
                  className="text-[var(--gold)]"
                />

                <h2 className="mt-4 text-lg font-semibold text-[var(--primary)]">
                  {address.full_name}
                </h2>

                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                  {address.address_line1}
                  {address.address_line2 &&
                    `, ${address.address_line2}`}
                  <br />
                  {address.city}, {address.state}
                  <br />
                  {address.pincode}
                </p>

                {address.landmark && (
                  <p className="mt-2 text-sm text-[var(--text-muted)]">
                    Landmark: {address.landmark}
                  </p>
                )}

                <p className="mt-3 text-sm font-medium text-[var(--text-dark)]">
                  Phone: {address.phone}
                </p>

                {/* ACTIONS */}
                <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--border-light)] pt-5">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="flex items-center gap-2 rounded-full border border-[var(--border-light)] px-4 py-2 text-sm transition hover:border-[var(--gold)]"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  {Number(address.is_default) !== 1 && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="flex items-center gap-2 rounded-full border border-[var(--border-light)] px-4 py-2 text-sm transition hover:border-[var(--gold)]"
                    >
                      <Star size={15} />
                      Set Default
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="flex items-center gap-2 rounded-full border border-red-100 px-4 py-2 text-sm text-red-500 transition hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ==========================================
            ADD / EDIT ADDRESS FORM MODAL
        ========================================== */}
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 md:p-8">

              {/* MODAL HEADER */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--primary)]">
                    {editingAddress
                      ? "Edit Address"
                      : "Add New Address"}
                  </h2>

                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Enter your delivery details below.
                  </p>
                </div>

                <button
                  onClick={closeForm}
                  className="rounded-full p-2 transition hover:bg-[var(--beige)]"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >
                <div className="grid gap-5 md:grid-cols-2">

                  {/* FULL NAME */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Full Name *
                    </label>

                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none focus:border-[var(--gold)]"
                    />
                  </div>

                  {/* PHONE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Phone Number *
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none focus:border-[var(--gold)]"
                    />
                  </div>

                </div>

                {/* ADDRESS LINE 1 */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Address Line 1 *
                  </label>

                  <input
                    type="text"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleChange}
                    required
                    placeholder="House number, street, area"
                    className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none focus:border-[var(--gold)]"
                  />
                </div>

                {/* ADDRESS LINE 2 */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Address Line 2
                  </label>

                  <input
                    type="text"
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleChange}
                    placeholder="Apartment, building, etc."
                    className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none focus:border-[var(--gold)]"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">

                  {/* CITY */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      City *
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none focus:border-[var(--gold)]"
                    />
                  </div>

                  {/* STATE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      State *
                    </label>

                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none focus:border-[var(--gold)]"
                    />
                  </div>

                </div>

                <div className="grid gap-5 md:grid-cols-2">

                  {/* PINCODE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Pincode *
                    </label>

                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none focus:border-[var(--gold)]"
                    />
                  </div>

                  {/* LANDMARK */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Landmark
                    </label>

                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none focus:border-[var(--gold)]"
                    />
                  </div>

                </div>

                {/* DEFAULT ADDRESS */}
                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[var(--beige)] p-4">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />

                  <span className="text-sm font-medium text-[var(--text-dark)]">
                    Set as default delivery address
                  </span>
                </label>

                {/* BUTTONS */}
                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-full border border-[var(--border-light)] px-5 py-3 text-sm font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {submitting
                      ? "Saving..."
                      : editingAddress
                      ? "Update Address"
                      : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}