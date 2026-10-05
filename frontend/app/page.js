import Hero from "../components/home/Hero";
import FeaturedCategories from "../components/home/FeaturedCategories";
import BrandStory from "../components/home/BrandStory";
import FeaturedProducts from "../components/home/FeaturedProducts";
import CustomizationProcess from "../components/home/CustomizationProcess";
import WhyChooseUs from "../components/home/WhyChooseUs";

import { getHomepageSections } from "../lib/homepage";

const sectionComponents = {
  hero: Hero,
  featured_categories: FeaturedCategories,
  brand_story: BrandStory,
  featured_products: FeaturedProducts,
  customization_process: CustomizationProcess,
  why_choose_us: WhyChooseUs,
};

export default async function Home() {
  const sections = await getHomepageSections();

  return (
    <>
      {sections
        .filter((section) => section.isActive)
        .sort(
          (a, b) => a.position - b.position
        )
        .map((section) => {
          const SectionComponent =
            sectionComponents[
              section.sectionType
            ];

          if (!SectionComponent) {
            return null;
          }

          return (
            <SectionComponent
              key={section._id}
              section={section}
            />
          );
        })}
    </>
  );
}