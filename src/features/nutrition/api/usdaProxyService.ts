export class USDAProxyService {
  static async searchFoods(query: string, page = 1, pageSize = 25) {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/usda-search?query=${encodeURIComponent(
        query
      )}&page=${page}&pageSize=${pageSize}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error("USDA proxy error");
    }

    const data = await res.json();

    return data.data;
  }
}
