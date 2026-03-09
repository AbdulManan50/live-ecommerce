import { apiRequest } from "@/lib/api";

export const getProducts = () => {
  return apiRequest("/api/products");
};

export const getProduct = (id:string) => {
  return apiRequest(`/api/products/${id}`);
};  