import axios from "axios";

/**
 * Key name used to persist the Laravel Sanctum bearer token in browser local storage.
 */
const TOKEN_STORAGE_KEY = "sliceforge.token";

/**
 * Pre-configured Axios HTTP client communicating with the Laravel API.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/**
 * Retrieves the stored Sanctum API token from local storage.
 */
export function readStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Synchronizes the Sanctum bearer token across Axios default headers and browser storage.
 */
export function setAuthToken(authToken: string | null): void {
  if (authToken) {
    localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
    api.defaults.headers.common.Authorization = `Bearer ${authToken}`;
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
  delete api.defaults.headers.common.Authorization;
}

// Initialize authorization header on application load if token exists
const existingAuthToken = readStoredToken();
if (existingAuthToken) {
  api.defaults.headers.common.Authorization = `Bearer ${existingAuthToken}`;
}

/**
 * Extracts a user-friendly error message from a Laravel HTTP API response.
 * Prefers the first field-level validation message, falls back to the top-level message.
 */
export function readApiError(apiError: unknown): string {
  if (axios.isAxiosError(apiError)) {
    const errorPayload = apiError.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;

    const validationFieldArrays = errorPayload?.errors ? Object.values(errorPayload.errors) : [];
    const firstValidationMessage = validationFieldArrays.find((messages) => messages.length > 0)?.[0];

    if (firstValidationMessage) {
      return firstValidationMessage;
    }

    if (errorPayload?.message) {
      return errorPayload.message;
    }
  }

  if (apiError instanceof Error && apiError.message) {
    return apiError.message;
  }

  return "An unexpected server error occurred. Please verify your connection and try again.";
}
