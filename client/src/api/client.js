const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://scalar-assignment-6.onrender.com/api";

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function apiGet(path, token) {
  return request(path, { token });
}

export function apiPost(path, body, token) {
  return request(path, { method: "POST", body, token });
}

export function apiPatch(path, body, token) {
  return request(path, { method: "PATCH", body, token });
}

export function apiDelete(path, token) {
  return request(path, { method: "DELETE", token });
}

