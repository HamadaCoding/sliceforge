import { create } from "zustand";
import { api, readStoredToken, setAuthToken } from "../lib/api";

/**
 * Authenticated user entity returned by the API backend.
 */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  emailVerifiedAt: string | null;
}

/**
 * Structure of the API payload returned upon successful registration or login.
 */
interface AuthResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

/**
 * User credentials required for sign-in.
 */
export interface Credentials {
  email: string;
  password: string;
}

/**
 * User payload required for new account registration.
 */
export interface RegistrationPayload extends Credentials {
  name: string;
  passwordConfirmation: string;
}

/**
 * Global authentication state and action dispatchers.
 */
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  hydrate: () => Promise<void>;
  register: (registrationPayload: RegistrationPayload) => Promise<string>;
  login: (userCredentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<string>;
}

export const useAuthStore = create<AuthState>((setStoreState) => ({
  user: null,
  token: readStoredToken(),
  isReady: false,

  /**
   * Hydrates the user session on application launch by checking if a stored
   * personal access token is still valid with the backend.
   */
  hydrate: async () => {
    const existingToken = readStoredToken();
    if (!existingToken) {
      setStoreState({ user: null, token: null, isReady: true });
      return;
    }

    setAuthToken(existingToken);

    try {
      const response = await api.get<{ user: AuthUser }>("/user");
      setStoreState({ token: existingToken, user: response.data.user, isReady: true });
    } catch {
      // Token is invalid or expired; purge from client
      setAuthToken(null);
      setStoreState({ token: null, user: null, isReady: true });
    }
  },

  /**
   * Registers a new account and requests email verification.
   * Does NOT automatically log in the user, ensuring the user follows the explicit verification flow.
   */
  register: async (registrationPayload) => {
    const response = await api.post<AuthResponse>("/register", {
      name: registrationPayload.name,
      email: registrationPayload.email,
      password: registrationPayload.password,
      password_confirmation: registrationPayload.passwordConfirmation,
    });

    return response.data.message || "Account created successfully. A verification link has been sent to your email.";
  },

  /**
   * Authenticates using email and password and stores the personal access token.
   */
  login: async (userCredentials) => {
    const response = await api.post<AuthResponse>("/login", userCredentials);
    setAuthToken(response.data.token);
    setStoreState({
      token: response.data.token,
      user: response.data.user,
      isReady: true,
    });
  },

  /**
   * Revokes the current session token on the backend and clears client authentication.
   */
  logout: async () => {
    try {
      await api.post("/logout");
    } finally {
      setAuthToken(null);
      setStoreState({ token: null, user: null });
    }
  },

  /**
   * Requests the server to re-dispatch an email verification notification.
   */
  resendVerification: async () => {
    const response = await api.post<{ message: string }>("/email/verification-notification");
    return response.data.message;
  },
}));
