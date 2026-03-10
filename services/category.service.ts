import { apiRequest } from "@/lib/api";

export type Category = {
  _id: string;
  title: string;
  slug: string;
};

export const getCategories = () => {
  return apiRequest("/api/categories");
};

