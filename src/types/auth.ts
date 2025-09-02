export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: 'customer' | 'admin';
}

export interface RegisterCredentials {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'customer' | 'admin';
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: User | null;
  token: string;
  requiresEmailConfirmation?: boolean;
  message?: string;
}
