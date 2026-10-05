"use client";

import Link from "next/link";
import {
  Heart,
  Sparkles,
  Gift,
  Gem,
  ArrowRight,
  Target,
  Eye,
} from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: Sparkles,
      title: "Thoughtfully Crafted",
      description:
        "Every detail matters. We focus on creating pieces that feel personal, meaningful, and truly special.",
    },
    {
      icon: Heart,
      title: "Made With Love",
      description:
        "Our creations are inspired by emotions, relationships, and the moments that bring people closer together.",
    },
    {
      icon: Gift,
      title: "Personalized For You",
      description:
        "We believe the best creations reflect the people behind them, which is why personalization is at the heart of what we do.",
    },
    {
      icon: Gem,
      title: "Memories That Last",
      description:
        "Our goal is simple — to create something that brings a smile today and becomes a cherished memory tomorrow.",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--cream)]">

      {/* ==========================================
          HERO SECTION
      ========================================== */}
      <section className="relative overflow-hidden px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">

          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--gold)]">
            Our Story
          </p>

          <h1 className="text-4xl font-semibold leading-tight text-[var(--primary)] md:text-6xl">
            Crafted for
            <span className="block text-[var(--secondary)]">
              Moments That Matter
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[var(--text-muted)] md:text-lg">
            At Aesthetic Zari, we believe that the most meaningful gifts are
            not simply bought — they are thoughtfully created.
          </p>

          <div className="mx-auto mt-10 h-px w-24 bg-[var(--gold)]" />

        </div>
      </section>

      {/* ==========================================
          OUR STORY
      ========================================== */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">

          {/* Visual */}
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-[2rem] bg-[var(--beige)]">

              <div className="flex h-full flex-col items-center justify-center p-10 text-center">
                <Sparkles
                  size={48}
                  className="text-[var(--gold)]"
                />

                <p className="mt-6 text-2xl font-semibold text-[var(--primary)]">
                  Aesthetic Zari
                </p>

                <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--text-muted)]">
                  Thoughtfully created pieces designed to celebrate life's
                  most beautiful moments.
                </p>
              </div>

            </div>

            {/* Decorative Box */}
            <div className="absolute -bottom-5 -right-5 hidden h-28 w-28 rounded-3xl border border-[var(--gold)] lg:block" />
          </div>

          {/* Content */}
          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
              More Than Just A Creation
            </p>

            <h2 className="mt-4 text-3xl font-semibold leading-tight text-[var(--primary)] md:text-4xl">
              Every Creation Has A Story
            </h2>

            <div className="mt-6 space-y-5 leading-8 text-[var(--text-muted)]">

              <p>
                Aesthetic Zari began with a simple idea — to turn ordinary
                moments into something unforgettable.
              </p>

              <p>
                We believe every celebration deserves a personal touch.
                Whether it's a birthday, anniversary, wedding, special
                occasion, or a simple gesture of love, our creations are
                designed to carry emotions and tell a story.
              </p>

              <p>
                From carefully chosen details to thoughtful personalization,
                every piece reflects the beauty of meaningful gifting.
              </p>

            </div>

            <p className="mt-7 text-lg font-medium italic text-[var(--secondary)]">
              Because for us, it's never just about creating a product.
              It's about creating a memory.
            </p>

          </div>

        </div>
      </section>

      {/* ==========================================
          MISSION & VISION
      ========================================== */}
      <section className="bg-[var(--beige)] px-6 py-20 md:py-24">

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">

          {/* Mission */}
          <div className="rounded-3xl bg-white p-8 md:p-10">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--cream)]">
              <Target
                size={24}
                className="text-[var(--gold)]"
              />
            </div>

            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
              Our Mission
            </p>

            <h2 className="mt-3 text-2xl font-semibold text-[var(--primary)]">
              Creating Meaningful Moments
            </h2>

            <p className="mt-5 leading-8 text-[var(--text-muted)]">
              To create meaningful, beautifully crafted, and personalized
              creations that help people express love, celebrate relationships,
              and preserve life's most precious moments.
            </p>

          </div>

          {/* Vision */}
          <div className="rounded-3xl bg-[var(--primary)] p-8 md:p-10">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Eye
                size={24}
                className="text-[var(--gold)]"
              />
            </div>

            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
              Our Vision
            </p>

            <h2 className="mt-3 text-2xl font-semibold text-white">
              Where Creativity Meets Emotion
            </h2>

            <p className="mt-5 leading-8 text-white/70">
              To become a trusted destination for thoughtful and personalized
              creations, where creativity meets emotion and every product
              carries a story worth remembering.
            </p>

          </div>

        </div>

      </section>

      {/* ==========================================
          VALUES
      ========================================== */}
      <section className="px-6 py-20 md:py-28">

        <div className="mx-auto max-w-7xl">

          {/* Heading */}
          <div className="mx-auto max-w-2xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
              What Makes Us Special
            </p>

            <h2 className="mt-4 text-3xl font-semibold text-[var(--primary)] md:text-4xl">
              Created With Meaning In Every Detail
            </h2>

            <p className="mt-5 leading-7 text-[var(--text-muted)]">
              Everything we create is guided by a simple belief — the smallest
              details can often create the biggest memories.
            </p>

          </div>

          {/* Values Grid */}
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {values.map((value) => {
              const Icon = value.icon;

              return (
                <div
                  key={value.title}
                  className="rounded-3xl border border-[var(--border-light)] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--beige)]">
                    <Icon
                      size={23}
                      className="text-[var(--gold)]"
                    />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold text-[var(--primary)]">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                    {value.description}
                  </p>
                </div>
              );
            })}

          </div>

        </div>

      </section>

      {/* ==========================================
          BRAND QUOTE
      ========================================== */}
      <section className="px-6 pb-20">

        <div className="mx-auto max-w-5xl rounded-[2rem] bg-[var(--primary)] px-8 py-16 text-center md:px-16 md:py-20">

          <Sparkles
            size={30}
            className="mx-auto text-[var(--gold)]"
          />

          <blockquote className="mx-auto mt-7 max-w-3xl text-2xl font-medium leading-relaxed text-white md:text-4xl">
            "The most beautiful gifts are not measured by their price,
            but by the memories they carry."
          </blockquote>

          <div className="mx-auto mt-8 h-px w-16 bg-[var(--gold)]" />

          <p className="mt-6 text-sm uppercase tracking-[0.25em] text-white/60">
            Aesthetic Zari
          </p>

        </div>

      </section>

      {/* ==========================================
          CTA SECTION
      ========================================== */}
      <section className="border-t border-[var(--border-light)] bg-white px-6 py-20">

        <div className="mx-auto max-w-3xl text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            Make It Meaningful
          </p>

          <h2 className="mt-4 text-3xl font-semibold text-[var(--primary)] md:text-4xl">
            Let's Create Something Meaningful
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-[var(--text-muted)]">
            Every occasion has a story waiting to be celebrated. Explore our
            collection and discover creations designed to make your special
            moments even more memorable.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--secondary)]"
          >
            Explore Our Collection
            <ArrowRight size={17} />
          </Link>

        </div>

      </section>

    </main>
  );
}