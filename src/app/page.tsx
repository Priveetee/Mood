import Link from "next/link";
import Image from "next/image";
import { Github, BookOpen } from "lucide-react";
import Silk from "@/components/Silk";

export default function HomePage() {
  return (
    <>
      <div className="fixed top-0 left-0 -z-10 h-screen w-screen">
        <Silk color="#6ed728" speed={2} scale={1.5} noiseIntensity={1} />
      </div>
      <main className="relative flex h-screen w-screen items-center justify-center overflow-hidden p-8 text-center">
        <div className="relative z-10 flex flex-col items-center">
          <Image
            src="/icon.svg"
            alt="Mood Logo"
            width={80}
            height={80}
            className="mb-6 drop-shadow-lg"
          />
          <h1 className="text-6xl font-extrabold tracking-tight text-white drop-shadow-xl md:text-8xl">
            Bienvenue sur Mood
          </h1>
          <p className="mt-4 max-w-lg text-xl text-slate-200 drop-shadow-lg">
            Rien à voir ici pour l&apos;instant... ou peut être le code ou la
            documentation ?
          </p>

          <div className="mt-10 flex items-center gap-6">
            <Link
              href="https://github.com/Priveetee/Mood"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Voir le code source sur GitHub"
              className="rounded-full bg-black/40 p-4 text-white transition-transform hover:scale-110"
            >
              <Github className="h-8 w-8" />
            </Link>
            <Link
              href="https://priveetee.github.io/Docs_Mood/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Consulter la documentation"
              className="rounded-full bg-black/40 p-4 text-white transition-transform hover:scale-110"
            >
              <BookOpen className="h-8 w-8" />
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
