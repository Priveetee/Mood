import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const response = NextResponse.json(
      { message: "Déconnecté avec succès" },
      { status: 200 },
    );
    response.cookies.delete("auth_token");
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur lors de la déconnexion" },
      { status: 500 },
    );
  }
}
