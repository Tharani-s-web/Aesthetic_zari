const HOMEPAGE_API_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:5000/api";

export async function getHomepageSections() {
  try {
    const response = await fetch(
      `${HOMEPAGE_API_URL}/homepage-sections`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch homepage sections: ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(
        data.message || "Failed to load homepage sections"
      );
    }

    return data.sections || [];
  } catch (error) {
    console.error(
      "Homepage sections fetch error:",
      error
    );

    return [];
  }
}