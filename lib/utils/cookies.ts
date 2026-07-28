import Cookies from "js-cookie";

export const AUTH_TOKEN_KEY = "authToken";
export const AUTH_USER_KEY = "authUser";

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  path: "/",
  sameSite: "lax",
  expires: 7,
  secure: process.env.NODE_ENV === "production",
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export function setAuthToken(token: string) {
  Cookies.set(AUTH_TOKEN_KEY, token, COOKIE_OPTIONS);
}

export function getAuthToken(): string | undefined {
  return Cookies.get(AUTH_TOKEN_KEY);
}

export function removeAuthToken() {
  Cookies.remove(AUTH_TOKEN_KEY, { path: "/" });
}

export function setAuthUser(user: AuthUser) {
  Cookies.set(AUTH_USER_KEY, JSON.stringify(user), COOKIE_OPTIONS);
}

export function getAuthUser(): AuthUser | null {
  const raw = Cookies.get(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function removeAuthUser() {
  Cookies.remove(AUTH_USER_KEY, { path: "/" });
}

export function clearAuthCookies() {
  removeAuthToken();
  removeAuthUser();
}
