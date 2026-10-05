import API_BASE_URL from "./api";

export async function getHomepageSections() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/homepage-sections`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch homepage sections"
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(
        data.message ||
          "Failed to load homepage sections"
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