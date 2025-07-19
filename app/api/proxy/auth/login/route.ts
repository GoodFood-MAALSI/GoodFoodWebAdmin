import { NextRequest, NextResponse } from "next/server";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
        
    if (!body.email || !body.password) {
      return NextResponse.json(
        { message: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const loginPayload = {
      email: body.email,
      password: body.password,
    };

    let response;
    try {
      response = await fetch(`${API_BASE_URL}/administrateur/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginPayload),
      });
    } catch (fetchError) {
      throw new Error(`Backend API unavailable: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }
    
    let data;
    const responseText = await response.text();
    
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      throw new Error(`Backend returned invalid JSON response. Status: ${response.status}, Response: ${responseText.substring(0, 200)}`);
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Erreur de connexion" },
        { status: response.status }
      );
    }
    const responseData = data.data || data;
    const nextResponse = NextResponse.json(data, { status: 200 });
    const accessToken = responseData.token;
    const refreshToken = responseData.refreshToken;
    const forcePasswordChange = responseData.force_password_change || responseData.user?.force_password_change;
    
    if (accessToken) {
      nextResponse.cookies.set("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }
    if (refreshToken) {
      nextResponse.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }
    if (forcePasswordChange) {
      nextResponse.cookies.set("forcePasswordChange", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }
    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erreur interne du serveur",
        error: error instanceof Error ? error.message : "Unknown error",
        details: process.env.NODE_ENV === "development" ? error : undefined
      },
      { status: 500 }
    );
  }
}
