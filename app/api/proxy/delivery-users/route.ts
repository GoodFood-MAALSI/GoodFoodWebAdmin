import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders, isAuthenticated } from "@/lib/serverAuth";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const params = new URLSearchParams({
      page,
      limit,
    });

    if (status) {
      params.append("status", status);
    }

    if (search) {
      params.append("search", search);
    }

    const response = await fetch(`${API_BASE_URL}/delivery/api/users?${params.toString()}`, {
      method: "GET",
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
        { message: error.message || "Erreur lors de la récupération des utilisateurs de livraison" },
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
