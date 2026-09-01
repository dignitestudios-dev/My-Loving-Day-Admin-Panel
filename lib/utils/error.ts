import { AxiosError } from "axios";

/**
 * Extracts a clear, user-friendly error message from an API or Axios error.
 */
export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string = "Something went wrong. Please try again."
): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError<{
      message?: string | string[];
      error?: string;
      errors?: Record<string, string[] | string> | string[];
    }>;
    const data = axiosError.response?.data;

    if (data) {
      if (Array.isArray(data.message) && data.message.length > 0) {
        return data.message[0];
      }
      if (typeof data.message === "string" && data.message.trim() !== "") {
        if (data.message.toLowerCase() === "unprocessable entity") {
          return "Invalid request or unsupported characters entered. Please check your input.";
        }
        return data.message;
      }
      if (typeof data.error === "string" && data.error.trim() !== "") {
        if (data.error.toLowerCase() === "unprocessable entity") {
          return "Invalid request or unsupported characters entered. Please check your input.";
        }
        return data.error;
      }
      if (data.errors) {
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          const first = data.errors[0];
          if (typeof first === "string") return first;
        } else if (typeof data.errors === "object") {
          const firstKey = Object.keys(data.errors)[0];
          if (firstKey) {
            const val = (data.errors as Record<string, string[] | string>)[firstKey];
            if (Array.isArray(val) && val.length > 0) return val[0];
            if (typeof val === "string") return val;
          }
        }
      }
    }

    if (axiosError.message) {
      if (
        axiosError.message.toLowerCase().includes("unprocessable entity") ||
        axiosError.response?.status === 422
      ) {
        return "Invalid request or unsupported characters entered. Please check your input.";
      }
      return axiosError.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}
