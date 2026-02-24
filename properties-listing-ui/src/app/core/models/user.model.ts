export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface PropertyStats {
  total: number;
  forRent: number;
  forSale: number;
  featured: number;
  newThisMonth: number;
}
