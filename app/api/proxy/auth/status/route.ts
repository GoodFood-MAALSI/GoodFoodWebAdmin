import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders, isAuthenticated } from "@/lib/serverAuth";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";
export async function GET(request: NextRequest) {
  console.log("STATUS ENDPOINT CALLED - checking authentication");
  try {
    if (!isAuthenticated(request)) {
      console.log("STATUS ENDPOINT - User not authenticated");
      return NextResponse.json(
        { message: "Non autorisé", authenticated: false },
        { status: 401 }
      );
    }

    console.log("STATUS ENDPOINT - Making backend call");
    const response = await fetch(`${API_BASE_URL}/administrateur/api/auth/status`, {
      method: "GET",
      headers: getAuthHeaders(request),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        return NextResponse.json(
          { message: `Backend error: ${response.status} - ${errorText}`, authenticated: false },
          { status: response.status }
        );
      }
      
      return NextResponse.json(
        { message: errorData.message || "Erreur lors de la vérification du statut", authenticated: false },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Check if user is suspended based on backend response
    const message = data.message || "";
    if (message.toLowerCase().includes("suspendu")) {
      return NextResponse.json(
        { 
          message: "Compte suspendu", 
          authenticated: false,
          suspended: true,
          redirectTo: "/notallowed"
        },
        { status: 403 }
      );
    }
    
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

    console.log("STATUS ENDPOINT - Returning success response");
    return NextResponse.json(normalizedResponse, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur interne du serveur", authenticated: false },
      { status: 500 }
    );
  }
}
