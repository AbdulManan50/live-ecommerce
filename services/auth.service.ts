import { apiRequest } from "@/lib/api";

export const registerUser = (data: any) => {
  return apiRequest("/api/auth/register","POST",data);
};

export const loginUser = (data: any) => {
  return apiRequest("/api/auth/login", "POST", data);
};