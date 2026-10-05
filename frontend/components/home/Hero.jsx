import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Users,
  Gift,
  Baby,
} from "lucide-react";

export default function Hero({ section }) {
  let settings = {};

  try {
    settings =
      typeof section?.settings === "string"
        ? JSON.parse(section.settings)
        : section?.settings || {};
  } catch (error) {
    console.error("Failed to parse hero settings:", error);
    settings = {};
  }

  const giftingIdeas = [
    {
      icon: Heart,
      title: "For Your Partner",
      text: "Weddings & anniversaries",
    },
    {
      icon: Users,
      title: "For Your Family",
      text: "Memories & milestones",
    },
    {
      icon: Gift,
      title: "For Your Friends",
      text: "Birthdays & celebrations",
    },
    {
      icon: Baby,
      title: "For New Beginnings",
      text: "Baby showers & precious moments",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[var(--beige)]">
      <div className="mx-auto grid min-h-[600px] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:px-8">

        {/* =========================================================
            LEFT CONTENT
        ========================================================= */}
        <div className="max-w-xl">

          {/* Subtitle */}
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
            {section?.subtitle || "Handcrafted with Love"}
          </p>

          {/* Main Heading */}
          <h1 className="text-5xl font-semibold leading-tight text-[var(--primary)] md:text-6xl">
            {section?.title || "Turning Beautiful Moments Into"}

            <span className="block text-[var(--gold)]"></span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-lg text-lg leading-8 text-[var(--text-muted)]">
            {section?.description ||
              "Discover thoughtfully handcrafted and personalized creations made to celebrate love, memories, and the moments that matter most."}
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">

            <Link
              href={settings.buttonLink || "/products"}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--secondary)]"
            >
              {settings.buttonText || "Explore Collection"}
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center rounded-full border border-[var(--primary)] px-6 py-3 text-sm font-medium text-[var(--primary)] transition hover:bg-[var(--primary)] hover:text-white"
            >
              Our Story
            </Link>

          </div>
        </div>


        {/* =========================================================
            RIGHT — GIFTING PURPOSE CARD
        ========================================================= */}
        <div className="relative flex items-center justify-center">

          <div className="relative w-full max-w-[500px] overflow-hidden rounded-[2rem] bg-[var(--cream)] p-8 shadow-sm md:p-10">

            {/* Small decorative circle */}
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[var(--gold)] opacity-10" />

            {/* Heading */}
            <div className="relative">

              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--gold)]">
                
              </p>

              <h2 className="mt-3 text-2xl font-semibold leading-tight text-[var(--primary)] md:text-3xl">
                A Gift That Feels Personal
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-[var(--text-muted)]">
                For the people you love, and the moments you never want to
                forget.
              </p>

            </div>


            {/* Gifting Ideas */}
            <div className="relative mt-7 space-y-3">

              {giftingIdeas.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="group flex items-center gap-4 rounded-2xl border border-[var(--border-light)] bg-white/70 p-4 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
                  >

                    {/* Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--beige)] text-[var(--gold)] transition duration-300 group-hover:bg-[var(--primary)] group-hover:text-white">
                      <Icon size={18} strokeWidth={1.8} />
                    </div>

                    {/* Text */}
                    <div>
                      <p className="text-sm font-semibold text-[var(--primary)]">
                        {item.title}
                      </p>

                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        {item.text}
                      </p>
                    </div>

                  </div>
                );
              })}

            </div>


            {/* Bottom message */}
            <div className="relative mt-7 border-t border-[var(--border-light)] pt-5">

              <p className="text-center text-xs font-medium tracking-[0.08em] text-[var(--secondary)]">
                Handcrafted&nbsp; • &nbsp;Personalized&nbsp; • &nbsp;Made to Remember
              </p>

            </div>

          </div>


          {/* =====================================================
              DECORATIVE ELEMENTS
          ===================================================== */}

          {/* Bottom-left circle */}
          <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full border border-[var(--gold)] opacity-50" />

          {/* Top-right circle */}
          <div className="absolute -right-3 top-8 h-16 w-16 rounded-full bg-[var(--gold)] opacity-20" />

        </div>

      </div>
    </section>
  );
}