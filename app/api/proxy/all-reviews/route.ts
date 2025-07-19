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
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/restaurateur/api/client-review-restaurant${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(request),
    });
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { message: error.message || "Erreur lors de la récupération des avis" },
        { status: response.status }
      );
    }
    const data = await response.json();
    
    if (data.statusCode === 200 && data.data && data.data.reviews) {
      const transformedResponse = {
        data: data.data.reviews,
        pagination: {
          page: data.data.meta?.currentPage || 1,
          limit: data.data.meta?.itemsPerPage || 10,
          total: data.data.meta?.totalItems || 0,
          totalPages: data.data.meta?.totalPages || 1
        }
      };
      return NextResponse.json(transformedResponse, { status: 200 });
    }
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
