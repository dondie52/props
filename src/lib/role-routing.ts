import type { UserRole } from "@/types";

export function routeForRole(role?: UserRole | null) {
  if (role === "admin") return "/admin";
  if (role === "tenant") return "/tenant/dashboard";
  return "/dashboard";
}
