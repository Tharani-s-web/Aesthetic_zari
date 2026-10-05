"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  
} from "lucide-react";

export default function BrandStory({ section }) {
  const settings = section?.settings || {};

  const [currentImage, setCurrentImage] = useState(0);

  /*
   * Customer feedback screenshots
   *
   * Add or remove image paths according to the
   * screenshots available in:
   *
   * public/images/customer-feedbacks/
   */
  const feedbackImages = [
    "/images/customer-feedbacks/feedback-1.jpeg",
    "/images/customer-feedbacks/feedback-2.jpeg",
    "/images/customer-feedbacks/feedback-3.jpeg",
    "/images/customer-feedbacks/feedback-4.jpeg",
    "/images/customer-feedbacks/feedback-5.jpeg",
    "/images/customer-feedbacks/feedback-6.jpeg",
    "/images/customer-feedbacks/feedback-7.jpeg",
  ];

  /*
   * Automatically change feedback every 4 seconds.
   */
  useEffect(() => {
    if (feedbackImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImage((previous) =>
        previous === feedbackImages.length - 1
          ? 0
          : previous + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [feedbackImages.length]);

  /*
   * Previous feedback
   */
  function showPrevious() {
    setCurrentImage((previous) =>
      previous === 0
        ? feedbackImages.length - 1
        : previous - 1
    );
  }

  /*
   * Next feedback
   */
  function showNext() {
    setCurrentImage((previous) =>
      previous === feedbackImages.length - 1
        ? 0
        : previous + 1
    );
  }

  return (
    <section className="relative overflow-hidden bg-[var(--beige)]">
      <div className="mx-auto grid max-w-7xl items-center lg:grid-cols-2">

        {/* =====================================================
            LEFT — CUSTOMER LOVE / FEEDBACK GALLERY
        ====================================================== */}

        <div className="relative flex min-h-[650px] items-center justify-center bg-[var(--cream)] px-6 py-16 sm:px-10 lg:min-h-[700px] lg:px-14">

          <div className="w-full max-w-[500px]">

            {/* Small Heading */}
            <div className="mb-8 text-center">

              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
                Customer Love
              </p>

              <h3 className="text-2xl font-semibold text-[var(--primary)] md:text-3xl">
                Words That Mean Everything
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--text-muted)]">
                Every message from a happy customer is a reminder
                of why each little stitch is worth the time and care.
              </p>

            </div>


            {/* Feedback Gallery */}
            <div className="relative">

              {/* Image Frame */}
              <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border-light)] bg-white shadow-lg">

                <div className="relative aspect-[4/5] w-full">

                  {feedbackImages.map((image, index) => (
                    <img
                      key={image}
                      src={image}
                      alt={`Customer feedback ${index + 1}`}
                      className={`absolute inset-0 h-full w-full object-contain bg-white p-3 transition-all duration-700 ${
                        index === currentImage
                          ? "scale-100 opacity-100"
                          : "scale-[1.02] opacity-0"
                      }`}
                    />
                  ))}

                </div>
              </div>


              {/* Previous Button */}
              {feedbackImages.length > 1 && (
                <button
                  type="button"
                  onClick={showPrevious}
                  aria-label="Previous customer feedback"
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--primary)] shadow-md transition hover:bg-[var(--primary)] hover:text-white"
                >
                  <ChevronLeft size={20} />
                </button>
              )}


              {/* Next Button */}
              {feedbackImages.length > 1 && (
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Next customer feedback"
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--primary)] shadow-md transition hover:bg-[var(--primary)] hover:text-white"
                >
                  <ChevronRight size={20} />
                </button>
              )}

            </div>


            {/* Dots */}
            {feedbackImages.length > 1 && (
              <div className="mt-6 flex justify-center gap-2">

                {feedbackImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentImage(index)}
                    aria-label={`Show feedback ${index + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentImage
                        ? "w-7 bg-[var(--primary)]"
                        : "w-2 bg-[var(--gold)] opacity-40"
                    }`}
                  />

                ))}

              </div>
            )}

          </div>

        </div>


        {/* =====================================================
            RIGHT — BRAND STORY
        ====================================================== */}

        <div className="flex min-h-[650px] items-center bg-[var(--beige)] px-8 py-16 sm:px-12 lg:min-h-[700px] lg:px-16">

          <div className="max-w-xl">

            {/* Subtitle */}
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
              {section?.subtitle || "Made by hand. Made with heart."}
            </p>


            {/* Title */}
            <h2 className="text-4xl font-semibold leading-tight text-[var(--primary)] md:text-5xl">
              {section?.title || "Every Stitch Tells A Story"}
            </h2>


            {/* Description */}
            {section?.description && (
              <p className="mt-6 text-base leading-8 text-[var(--text-muted)]">
                {section.description}
              </p>
            )}


            {/* Trust Message */}
            <div className="mt-8 border-l-2 border-[var(--gold)] pl-5">

              <p className="text-sm leading-7 text-[var(--secondary)]">
                From a small idea to a meaningful keepsake,
                every Aesthetic Zari creation is made to hold
                a memory close.
              </p>

            </div>


            {/* Our Story */}
            <Link
              href={settings.buttonLink || "/about"}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] transition hover:text-[var(--gold)]"
            >
              {settings.buttonText || "Our Story"}
              <ArrowRight size={18} />
            </Link>

          </div>

        </div>

      </div>


      

    </section>
  );
}