import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders, isAuthenticated } from "@/lib/serverAuth";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }
    const body = await request.json();
    if (!body.password) {
      return NextResponse.json(
        { message: "Nouveau mot de passe requis" },
        { status: 400 }
      );
    }
    const response = await fetch(`${API_BASE_URL}/administrateur/api/auth/change-password`, {
      method: "POST",
      headers: getAuthHeaders(request),
      body: JSON.stringify({
        password: body.password,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Erreur lors du changement de mot de passe" },
        { status: response.status }
      );
    }
    const nextResponse = NextResponse.json(data, { status: 200 });
    nextResponse.cookies.set("forcePasswordChange", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });
    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
