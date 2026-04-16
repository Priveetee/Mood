"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold">Une erreur est survenue</h1>
      <p className="text-slate-500">Impossible d'afficher cette page pour le moment.</p>
      <Button onClick={reset}>Reessayer</Button>
    </main>
  );
}
