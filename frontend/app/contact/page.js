"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Backend integration can be added later
    console.log("Contact Form:", formData);

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });

    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <main className="min-h-screen bg-[var(--cream)]">

      {/* ======================================
          HERO SECTION
      ====================================== */}

      <section className="border-b border-[var(--border-light)] bg-[var(--beige)] px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            Get In Touch
          </p>

          <h1 className="mt-4 text-4xl font-semibold text-[var(--primary)] md:text-5xl">
            We'd Love to Hear From You
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-[var(--text-muted)]">
            Have a question about our creations, customization options, or
            your order? Our team is here to help make your experience
            seamless and memorable.
          </p>

        </div>
      </section>

      {/* ======================================
          CONTACT CONTENT
      ====================================== */}

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">

          {/* ==================================
              LEFT SIDE - CONTACT DETAILS
          ================================== */}

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
              Contact Information
            </p>

            <h2 className="mt-3 text-3xl font-semibold text-[var(--primary)]">
              Let's Start a Conversation
            </h2>

            <p className="mt-4 leading-7 text-[var(--text-muted)]">
              Whether you're looking for a personalized creation, need help
              with an existing order, or simply want to know more about
              Aesthetic Zari, we're always happy to connect.
            </p>

            {/* Contact Cards */}

            <div className="mt-8 space-y-4">

              {/* Email */}

              <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--beige)] text-[var(--gold)]">
                  <Mail size={20} />
                </div>

                <div>
                  <h3 className="font-semibold text-[var(--primary)]">
                    Email Us
                  </h3>

                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    tharani1806@gmail.com
                  </p>
                </div>

              </div>

              {/* Phone */}

              <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--beige)] text-[var(--gold)]">
                  <Phone size={20} />
                </div>

                <div>
                  <h3 className="font-semibold text-[var(--primary)]">
                    Call Us
                  </h3>

                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    +91 63798 80779
                  </p>
                </div>

              </div>

              

              {/* Business Hours */}

              <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--beige)] text-[var(--gold)]">
                  <Clock size={20} />
                </div>

                <div>
                  <h3 className="font-semibold text-[var(--primary)]">
                    Business Hours
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                    Monday - Saturday
                    <br />
                    10:00 AM - 7:00 PM
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* ==================================
              RIGHT SIDE - CONTACT FORM
          ================================== */}

          <div className="rounded-3xl bg-white p-6 shadow-sm md:p-10">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--beige)] text-[var(--gold)]">
                <MessageCircle size={22} />
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-[var(--primary)]">
                  Send Us a Message
                </h2>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Fill out the form and we'll get back to you soon.
                </p>
              </div>

            </div>

            {/* Success Message */}

            {submitted && (
              <div className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">
                Thank you for contacting us! We'll get back to you soon.
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* Name */}

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
                  Full Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none transition focus:border-[var(--gold)]"
                />
              </div>

              {/* Email + Phone */}

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
                    Email Address *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none transition focus:border-[var(--gold)]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none transition focus:border-[var(--gold)]"
                  />
                </div>

              </div>

              {/* Subject */}

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
                  How Can We Help? *
                </label>

                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[var(--border-light)] bg-white px-4 py-3 outline-none transition focus:border-[var(--gold)]"
                >
                  <option value="">Select a subject</option>

                  <option value="Product Inquiry">
                    Product Inquiry
                  </option>

                  <option value="Customization Request">
                    Customization Request
                  </option>

                  <option value="Order Support">
                    Order Support
                  </option>

                  <option value="Delivery Information">
                    Delivery Information
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>
              </div>

              {/* Message */}

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-dark)]">
                  Your Message *
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Tell us how we can help you..."
                  className="w-full resize-none rounded-xl border border-[var(--border-light)] px-4 py-3 outline-none transition focus:border-[var(--gold)]"
                />
              </div>

              {/* Submit Button */}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-4 text-sm font-semibold text-white transition hover:bg-[var(--secondary)]"
              >
                <Send size={18} />
                Send Message
              </button>

            </form>

          </div>

        </div>
      </section>

      {/* ======================================
          BOTTOM CTA
      ====================================== */}

      <section className="border-t border-[var(--border-light)] bg-[var(--beige)] px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">

          <h2 className="text-3xl font-semibold text-[var(--primary)]">
            Looking for Something Truly Personal?
          </h2>

          <p className="mt-4 leading-7 text-[var(--text-muted)]">
            Share your idea with us and let's create something meaningful,
            beautiful, and uniquely yours.
          </p>

        </div>
      </section>

    </main>
  );
}