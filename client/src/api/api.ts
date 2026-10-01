import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export function isUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export function getApiError(error: unknown): {
  message: string;
  code?: string;
} {
  if (axios.isAxiosError(error) && error.response) {
    const body = error.response.data as {
      message?: string | string[];
      code?: string;
    };
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : body?.message;
    return {
      message: message ?? `Błąd ${error.response.status}`,
      code: body?.code,
    };
  }
  return { message: "Brak połączenia z serwerem" };
}
