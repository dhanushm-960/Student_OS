const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...customOptions } = options;

  // Build query string
  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, val);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Build headers
  const reqHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  const token = localStorage.getItem("studentos_token");
  if (token) {
    reqHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    headers: reqHeaders,
    ...customOptions,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Something went wrong with the request.");
  }

  return data;
}
