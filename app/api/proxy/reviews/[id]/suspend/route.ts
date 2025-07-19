import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders, isAuthenticated } from "@/lib/serverAuth";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  if (!isAuthenticated(request)) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }
  try {
    const response = await fetch(`${API_BASE_URL}/restaurateur/api/client-review-restaurant/${resolvedParams.id}/suspend`, {
      method: "PATCH",
      headers: getAuthHeaders(request),
    });
    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { message: data.message || "Erreur lors de la suspension de l'avis" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
