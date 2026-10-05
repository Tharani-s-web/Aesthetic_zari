import Link from "next/link";
import { Mail, Phone, Heart, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto bg-[var(--primary)] text-[var(--cream)]">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand */}
          <div>
            <h2 className="mb-4 text-2xl font-semibold tracking-wide">
              Aesthetic Zari
            </h2>

            <p className="max-w-xs text-sm leading-6 text-[#e8ddd2]">
              Thoughtfully handcrafted and personalized creations made to
              celebrate your most precious moments.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3 text-sm text-[#e8ddd2]">
              <Link href="/" className="transition hover:text-[var(--gold)]">
                Home
              </Link>

              <Link
                href="/products"
                className="transition hover:text-[var(--gold)]"
              >
                Shop
              </Link>

              <Link
                href="/categories"
                className="transition hover:text-[var(--gold)]"
              >
                Categories
              </Link>

              <Link
                href="/about"
                className="transition hover:text-[var(--gold)]"
              >
                About Us
              </Link>
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Customer Care
            </h3>

            <div className="flex flex-col gap-3 text-sm text-[#e8ddd2]">
              <Link
                href="/contact"
                className="transition hover:text-[var(--gold)]"
              >
                Contact Us
              </Link>

              <Link
                href="/orders"
                className="transition hover:text-[var(--gold)]"
              >
                Track Order
              </Link>

              <Link
                href="/wishlist"
                className="transition hover:text-[var(--gold)]"
              >
                Wishlist
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Get in Touch
            </h3>

            <div className="flex flex-col gap-4 text-sm text-[#e8ddd2]">
              <div className="flex items-center gap-3">
                <Send size={18} />
                <span>@aestheticzari</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} />
                <span>tharani1806@gmail.com</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} />
                <span>+91 6379880779</span>
              </div>
            </div>

            <div className="mt-5 flex gap-4">
              <a
                href="#"
                aria-label="Instagram"
                className="transition hover:text-[var(--gold)]"
              >
                <Send size={20} />
              </a>

              <a
                href="#"
                aria-label="Follow us"
                className="transition hover:text-[var(--gold)]"
              >
                <Heart size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-[#6b4f3b] pt-6 text-center text-sm text-[#cbbcaf]">
          © {new Date().getFullYear()} Aesthetic Zari. All rights reserved.
        </div>
      </div>
    </footer>
  );
}