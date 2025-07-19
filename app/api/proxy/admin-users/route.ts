import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders, isAuthenticated, checkUserRole, isSuperAdmin } from "@/lib/serverAuth";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    const { role, error } = await checkUserRole(request);
    if (error) {
      return NextResponse.json(
        { message: error },
        { status: 401 }
      );
    }

    if (!isSuperAdmin(role)) {
      return NextResponse.json(
        { message: "Accès restreint aux super-administrateurs" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const status = searchParams.get("status");

    const params = new URLSearchParams({
      page,
      limit,
    });

    if (status) {
      params.append("status", status);
    }

    const response = await fetch(`${API_BASE_URL}/administrateur/api/users?${params.toString()}`, {
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
        { message: error.message || "Erreur lors de la récupération des utilisateurs" },
        { status: response.status }
      );
    }

    const data = await response.json();

    const transformedData = {
      data: data.data || data.users || data,
      pagination: data.pagination || {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Array.isArray(data.data) ? data.data.length : Array.isArray(data.users) ? data.users.length : Array.isArray(data) ? data.length : 0,
        totalPages: 1
      }
    };

    return NextResponse.json(transformedData, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    const { role, error } = await checkUserRole(request);
    if (error) {
      return NextResponse.json(
        { message: error },
        { status: 401 }
      );
    }

    if (!isSuperAdmin(role)) {
      return NextResponse.json(
        { message: "Accès restreint aux super-administrateurs" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/administrateur/api/users`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(request),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
        { message: error.message || "Erreur lors de la création de l'utilisateur" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
