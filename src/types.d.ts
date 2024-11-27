import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        role: string;
      };
    }
  }
}

export interface Movie {
  id: number;
  title: string;
  genre: string[];
  release_year: number;
  minutes: number;
  description: string;
  poster_image: string;
  created_at?: string;
  updated_at?: string;
}

export interface Reservation {
  id: number;
  user_id: number;
  seat_id: number;
  showtime_id: number;
  payment_status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Showtime {
  id: number;
  movie_id: number;
  date: string;
  start_time: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  create_at?: string;
  updated_at?: string;
}

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export type Token = {
  token: string;
};

export interface AvailableSeatByShowtime {
  showtime_id: number;
  row_name: string;
  seat_id: number;
  seat_number: string;
}

export interface Payment {
  id: number;
  reservation_id: number;
  user_id: number;
  amount: number;
  status: string;
  payment_method: string;
  created_at?: string;
  updated_at?: string;
}
