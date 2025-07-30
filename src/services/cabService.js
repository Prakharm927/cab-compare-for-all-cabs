// src/services/cabService.js

const BASE_URL = "http://localhost:8080/api/cabs"; // Your backend URL

export async function getCabFares(source, destination, sort) {
  try {
    const url = new URL(`${BASE_URL}/compare`);
    url.searchParams.append("source", source);
    url.searchParams.append("destination", destination);
    if (sort) url.searchParams.append("sort", sort);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch cab fares");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching cab fares:", error);
    return [];
  }
}
