import {
  Heart,
  Sparkles,
  Gift,
  ShieldCheck,
} from "lucide-react";

const icons = [
  Heart,
  Sparkles,
  Gift,
  ShieldCheck,
];

export default function WhyChooseUs({ section }) {
  const features = section?.settings?.features || [];

  return (
    <section className="bg-[var(--beige)] px-6 py-20">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
            {section?.subtitle || "Why Aesthetic Zari"}
          </p>

          <h2 className="text-3xl font-semibold text-[var(--primary)] md:text-4xl">
            {section?.title || "Crafted to Make Every Moment Special"}
          </h2>

          {section?.description && (
            <p className="mt-4 leading-7 text-[var(--text-muted)]">
              {section.description}
            </p>
          )}

        </div>


        {/* Features */}
        {features.length > 0 && (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {features.map((feature, index) => {

              const Icon = icons[index % icons.length];

              return (
                <div
                  key={feature.title ?? index}
                  className="rounded-2xl bg-white p-7 text-center transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* Icon */}
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--cream)] text-[var(--gold)]">
                    <Icon size={25} />
                  </div>


                  {/* Title */}
                  <h3 className="mt-6 text-lg font-semibold text-[var(--primary)]">
                    {feature.title}
                  </h3>


                  {/* Description */}
                  <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                    {feature.description}
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