export type AppRole = "admin" | "seller" | "user";

export function roleHomePath(role: AppRole) {
  if (role === "admin") return "/admin";
  if (role === "seller") return "/vendor";
  return "/dashboard";
}

