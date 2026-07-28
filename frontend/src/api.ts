import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

export type FinanceType = "income" | "expense";

export interface UserResponse {
  id: number;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: UserResponse;
}

export interface Category {
  id: number;
  name: string;
  type: FinanceType;
  user_id: number;
}

export interface Transaction {
  id: number;
  amount: number | string;
  type: FinanceType;
  description: string | null;
  date_time: string;
  category_id: number;
}

export interface TransactionPayload {
  amount: number;
  type: FinanceType;
  description: string | null;
  category_id: number;
}

export interface CashflowPoint {
  month: number;
  total_income: number | string;
  total_expense: number | string;
}

export interface ExpenseByCategoryPoint {
  category_name: string;
  total_amount: number | string;
}

export interface ApiErrorResponse {
  detail?: string;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getStoredToken(): string | null {
  return localStorage.getItem("access_token");
}

export function logoutUser(): void {
  localStorage.removeItem("access_token");
}

export async function registerUser(email: string, password: string): Promise<UserResponse> {
  const response = await api.post<UserResponse>("/auth/signup", { email, password });
  return response.data;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", { email, password });
  localStorage.setItem("access_token", response.data.access_token);
  return response.data;
}

export async function checkHealth(): Promise<{ status: string }> {
  const response = await api.get<{ status: string }>("/health");
  return response.data;
}

const userId = Number(import.meta.env.VITE_USER_ID || 1);

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>("/categories", { params: { user_id: userId } });
  return response.data;
}

export async function createCategory(name: string, type: FinanceType): Promise<Category> {
  const response = await api.post<Category>("/categories", { name, type, user_id: userId });
  return response.data;
}

export async function createTransaction(payload: TransactionPayload): Promise<Transaction> {
  const response = await api.post<Transaction>("/transactions", { ...payload, user_id: userId });
  return response.data;
}

export async function getCashflowByMonth(): Promise<CashflowPoint[]> {
  const response = await api.get<CashflowPoint[]>("/stats/cashflow-by-month", { params: { user_id: userId } });
  return response.data;
}

export async function getExpenseByCategory(fromDate: string, toDate: string): Promise<ExpenseByCategoryPoint[]> {
  const response = await api.get<ExpenseByCategoryPoint[]>("/stats/expenses-by-category", {
    params: { user_id: userId, from_date: fromDate, to_date: toDate },
  });
  return response.data;
}

export async function getTransactions(): Promise<Transaction[]> {
  const response = await api.get<Transaction[]>("/transactions", {
    params: { user_id: userId, limit: 8, offset: 0 },
  });
  return response.data;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.detail || fallback;
}
