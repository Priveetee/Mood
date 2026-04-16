import Link from "next/link";
import FaultyTerminal from "@/components/faulty-terminal";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <FaultyTerminal
          tint="#3f7cf5"
          brightness={0.55}
          mouseReact={false}
          pageLoadAnimation={false}
        />
      </div>
      <h1 className="mb-3 text-5xl font-black tracking-tight text-white sm:text-6xl">404</h1>
      <p className="mb-8 max-w-md text-slate-300">Cette page n'existe pas ou a ete deplacee.</p>
      <Button asChild className="h-11 px-6">
        <Link href="/">Retour a l'accueil</Link>
      </Button>
    </main>
  );
}
