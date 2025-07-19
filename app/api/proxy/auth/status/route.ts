import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders, isAuthenticated } from "@/lib/serverAuth";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";
export async function GET(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { message: "Non autorisé", authenticated: false },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/administrateur/api/auth/status`, {
      method: "GET",
      headers: getAuthHeaders(request),
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Erreur lors de la vérification du statut", authenticated: false },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    let user = null;
    if (data.user) {
      user = data.user;
    } else if (data.data) {
      user = data.data;
    }

    const normalizedResponse = {
      authenticated: true,
      user,
      force_password_change: data.force_password_change || data.data?.force_password_change || false,
      message: data.message || "Authentifié avec succès"
    };

    return NextResponse.json(normalizedResponse, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur interne du serveur", authenticated: false },
      { status: 500 }
    );
  }
}
