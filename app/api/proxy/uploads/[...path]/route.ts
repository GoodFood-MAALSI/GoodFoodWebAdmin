import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const uploadPath = params.path.join('/');
    const uploadUrl = `${API_BASE_URL}/restaurateur/api/uploads/${uploadPath}`;
    
    
    const response = await fetch(uploadUrl, {
      method: "GET",
      headers: {
        'User-Agent': 'GoodFood-Admin/1.0',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Fichier non trouvé" },
        { status: 404 }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    const fileBuffer = await response.arrayBuffer();
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur lors de la récupération du fichier" },
      { status: 500 }
    );
  }
}