"use client";

import Link from "next/link";
import { useEffect } from "react";
import FaultyTerminal from "@/components/faulty-terminal";
import { Button } from "@/components/ui/button";

export default function GlobalError({
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
    <html lang="en">
      <body>
        <main className="relative flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <div className="pointer-events-none fixed inset-0 -z-10">
            <FaultyTerminal
              tint="#a03333"
              brightness={0.45}
              mouseReact={false}
              pageLoadAnimation={false}
            />
          </div>
          <h1 className="mb-3 text-4xl font-black text-white sm:text-5xl">Erreur critique</h1>
          <p className="mb-8 max-w-md text-slate-300">
            Une erreur globale est survenue. Vous pouvez reessayer.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reset}>Reessayer</Button>
            <Button asChild variant="outline">
              <Link href="/">Accueil</Link>
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
