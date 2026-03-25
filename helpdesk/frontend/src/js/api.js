const API_BASE = "http://localhost:7070";

export async function apiRequest(method, options = {}) {
  const url = new URL(API_BASE, window.location.origin);
  url.searchParams.set("method", method);
  if (options.id) url.searchParams.set("id", options.id);

  const config = {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json" },
    ...options,
  };

  if (options.body instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (response.status === 204) return { success: true };

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export const API = {
  getAll: () => apiRequest("allTickets"),
  getById: (id) => apiRequest("ticketById", { id }),
  create: (data) =>
    apiRequest("createTicket", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiRequest("updateById", {
      id,
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id) => apiRequest("deleteById", { id, method: "DELETE" }),
};
