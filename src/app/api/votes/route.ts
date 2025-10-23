import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { pollLinkId, mood, comment } = await req.json();

    if (!pollLinkId || !mood) {
      return NextResponse.json(
        { error: "ID du sondage et humeur sont requis" },
        { status: 400 },
      );
    }

    const validMoods = ["green", "blue", "yellow", "red"];
    if (!validMoods.includes(mood)) {
      return NextResponse.json({ error: "Humeur invalide" }, { status: 400 });
    }

    const pollLink = await prisma.pollLink.findUnique({
      where: { token: pollLinkId },
      select: { id: true, campaignId: true, managerName: true },
    });

    if (!pollLink) {
      return NextResponse.json(
        { error: "Lien de sondage introuvable ou expiré" },
        { status: 404 },
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

    if (ipAddress === "::1" || ipAddress === "::ffff:127.0.0.1") {
      ipAddress = "127.0.0.1";
    }

    const existingVote = await prisma.vote.findFirst({
      where: {
        pollLinkId: pollLink.id,
        ipAddress,
      },
    });

    if (existingVote) {
      await prisma.voteAttempt.create({
        data: {
          pollLinkId: pollLink.id,
          ipAddress,
          userAgent,
          success: false,
          reason: "Double vote détecté (même IP pour ce lien)",
        },
      });
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/poll/closed?voted=true`;
      return NextResponse.json(
        { error: "Vous avez déjà voté pour ce sondage", redirect: redirectUrl },
        { status: 409, headers: { Location: redirectUrl } },
      );
    }

    const voteAttempt = await prisma.voteAttempt.create({
      data: {
        pollLinkId: pollLink.id,
        ipAddress,
        userAgent,
        success: false,
        reason: "Nouvelle tentative de vote",
      },
    });

    const vote = await prisma.vote.create({
      data: {
        pollLinkId: pollLink.id,
        campaignId: pollLink.campaignId,
        mood,
        comment: comment || null,
        ipAddress,
        userAgent,
      },
    });

    await prisma.voteAttempt.update({
      where: { id: voteAttempt.id },
      data: { success: true, reason: "Vote enregistré" },
    });

    return NextResponse.json(
      { message: "Votre vote a bien été enregistré", vote },
      { status: 201 },
    );
  } catch (error) {
    if (
      (error as any).code === "P2002" &&
      (error as any).meta?.target.includes("pollLinkId") &&
      (error as any).meta?.target.includes("ipAddress")
    ) {
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/poll/closed?voted=true`;
      await prisma.voteAttempt.create({
        data: {
          pollLinkId: (req as any).body.pollLinkId,
          ipAddress: (
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "unknown"
          )
            .split(",")[0]
            .trim(),
          userAgent: req.headers.get("user-agent") || "unknown",
          success: false,
          reason: "Double vote détecté (contrainte unique DB)",
        },
      });
      return NextResponse.json(
        { error: "Vous avez déjà voté pour ce sondage", redirect: redirectUrl },
        { status: 409, headers: { Location: redirectUrl } },
      );
    }
    return NextResponse.json(
      { error: "Erreur serveur lors de l'enregistrement du vote" },
      { status: 500 },
    );
  }
}
