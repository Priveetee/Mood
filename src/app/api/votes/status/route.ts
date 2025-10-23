import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pollLinkId = searchParams.get("pollLinkId");

    if (!pollLinkId) {
      return NextResponse.json(
        { error: "ID du sondage requis" },
        { status: 400 },
      );
    }

    let ipAddress = (
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown"
    )
      .split(",")[0]
      .trim();
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Normalise IP Adress for localhost
    if (ipAddress === "::1" || ipAddress === "::ffff:127.0.0.1") {
      ipAddress = "127.0.0.1";
    }

    console.log(
      `[GET /api/votes/status] PollLink: ${pollLinkId}, Normalized IP: ${ipAddress}, UA: ${userAgent}`,
    );

    const existingVote = await prisma.vote.findFirst({
      where: {
        pollLinkId,
        ipAddress,
      },
    });

    return NextResponse.json({ hasVoted: !!existingVote }, { status: 200 });
  } catch (error) {
    console.error(`[GET /api/votes/status] Erreur: ${error}`);
    return NextResponse.json(
      { error: "Erreur serveur lors de la vérification du vote" },
      { status: 500 },
    );
  }
}
