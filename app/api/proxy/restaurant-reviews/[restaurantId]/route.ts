import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders, isAuthenticated } from "@/lib/serverAuth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { restaurantId } = resolvedParams;
    const { searchParams } = new URL(request.url);
    const apiUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL}/client-review-restaurant`);
    apiUrl.searchParams.append("restaurantId", restaurantId);
    searchParams.forEach((value, key) => {
      if (key !== "restaurantId") {
        apiUrl.searchParams.append(key, value);
      }
    });
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: getAuthHeaders(request),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Erreur lors de la récupération des avis" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
