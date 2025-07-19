import { NextRequest } from "next/server";
export function getAuthHeaders(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  
  return headers;
}
export function isAuthenticated(request: NextRequest): boolean {
  const accessToken = request.cookies.get("accessToken")?.value;
  return !!accessToken;
}
export async function checkUserRole(request: NextRequest): Promise<{ role: string | null, error?: string }> {
  if (!isAuthenticated(request)) {
    return { role: null, error: "Non authentifié" };
  }

  try {
    const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";
    const response = await fetch(`${API_BASE_URL}/administrateur/api/auth/status`, {
      method: "GET",
      headers: getAuthHeaders(request),
    });

    if (!response.ok) {
      return { role: null, error: "Erreur lors de la vérification du statut" };
    }

    const data = await response.json();
    return { role: data.data?.role || null };
  } catch (error) {
    return { role: null, error: "Erreur interne" };
  }
}
export function isSuperAdmin(role: string | null): boolean {
  return role === "super-admin";
}
