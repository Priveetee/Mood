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
      select: { id: true, campaignId: true },
    });

    if (!pollLink) {
      return NextResponse.json(
        { error: "Lien de sondage introuvable ou expiré" },
        { status: 404 },
      );
    }

    const vote = await prisma.vote.create({
      data: {
        pollLinkId: pollLink.id,
        campaignId: pollLink.campaignId,
        mood,
        comment: comment || null,
      },
    });

    return NextResponse.json(
      { message: "Votre vote a bien été enregistré", vote },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur lors de l'enregistrement du vote" },
      { status: 500 },
    );
  }
}
