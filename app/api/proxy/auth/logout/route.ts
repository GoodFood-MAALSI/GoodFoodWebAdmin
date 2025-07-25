import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ message: "Déconnecté avec succès" }, { status: 200 });
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });
    response.cookies.set("forcePasswordChange", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur lors de la déconnexion" },
      { status: 500 }
    );
  }
}
