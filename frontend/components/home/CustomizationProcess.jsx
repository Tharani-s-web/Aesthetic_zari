import {
  MessageCircleHeart,
  Palette,
  PackageCheck,
} from "lucide-react";

const icons = [
  MessageCircleHeart,
  Palette,
  PackageCheck,
];

export default function CustomizationProcess({ section }) {
  const steps = section?.settings?.steps || [];

  return (
    <section className="bg-[var(--primary)] px-6 py-20 text-[var(--cream)]">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
            {section?.subtitle || "Made Especially For You"}
          </p>

          <h2 className="text-3xl font-semibold md:text-4xl">
            {section?.title || "From Your Memory to a Timeless Keepsake"}
          </h2>

          {section?.description && (
            <p className="mt-4 leading-7 text-[#e8ddd2]">
              {section.description}
            </p>
          )}

        </div>


        {/* Steps */}
        {steps.length > 0 && (
          <div className="mt-14 grid gap-8 md:grid-cols-3">

            {steps.map((step, index) => {

              const Icon = icons[index % icons.length];

              return (
                <div
                  key={step.number ?? index}
                  className="relative rounded-2xl border border-[#6b4f3b] p-8"
                >

                  {/* Number + Icon */}
                  <div className="flex items-center justify-between">

                    <span className="text-sm font-semibold tracking-widest text-[var(--gold)]">
                      {String(step.number ?? index + 1).padStart(2, "0")}
                    </span>

                    <Icon
                      size={28}
                      className="text-[var(--gold)]"
                    />

                  </div>


                  {/* Step Title */}
                  <h3 className="mt-8 text-xl font-semibold">
                    {step.title}
                  </h3>


                  {/* Step Description */}
                  <p className="mt-4 leading-7 text-[#e8ddd2]">
                    {step.description}
                  </p>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </section>
  );
}