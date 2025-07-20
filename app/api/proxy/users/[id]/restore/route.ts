import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders, isAuthenticated } from "@/lib/serverAuth";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    // First, get the user to check if they're a super-admin
    const checkResponse = await fetch(`${API_BASE_URL}/restaurateur/api/users/${id}`, {
      method: "GET",
      headers: getAuthHeaders(request),
    });

    if (!checkResponse.ok) {
      const errorText = await checkResponse.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch (jsonError) {
        return NextResponse.json(
          { message: `Erreur backend: ${checkResponse.status} - ${errorText}` },
          { status: checkResponse.status }
        );
      }
      return NextResponse.json(
        { message: error.message || "Erreur lors de la récupération de l'utilisateur" },
        { status: checkResponse.status }
      );
    }

    const userData = await checkResponse.json();
    
    // Prevent management of super-admin users
    if (userData.role === "super-admin" || (userData.data && userData.data.role === "super-admin")) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/restaurateur/api/users/${id}/restore`, {
      method: "PATCH",
      headers: getAuthHeaders(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch (jsonError) {
        return NextResponse.json(
          { message: `Erreur backend: ${response.status} - ${errorText}` },
          { status: response.status }
        );
      }
      return NextResponse.json(
        { message: error.message || "Erreur lors de la réactivation de l'utilisateur" },
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
