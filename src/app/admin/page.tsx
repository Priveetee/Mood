"use client";

import { BarChart3, CodeXml, List, LogOut, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { usePerfMode } from "@/lib/perf/perf-mode-context";

const dashboardItems = [
  {
    icon: <PlusCircle className="h-8 w-8 text-white" />,
    title: "Nouvelle Campagne",
    description: "Lancer un nouveau sondage pour les managers.",
    className: "sm:col-span-2",
    href: "/admin/campaigns/new",
  },
  {
    icon: <List className="h-8 w-8 text-white" />,
    title: "Campagnes Actives",
    description: "Suivre les sondages en cours.",
    className: "",
    href: "/admin/campaigns/active",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-white" />,
    title: "Résultats Globaux",
    description: "Analyser les tendances de toutes les campagnes.",
    className: "",
    href: "/admin/results/global",
  },
  {
    icon: <CodeXml className="h-10 w-10 text-white" />,
    title: "Projet GitHub",
    description: "Voir le code source et contribuer.",
    className: "sm:col-span-2",
    href: "https://github.com/Priveetee/Mood",
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { effectiveMode } = usePerfMode();
  const lowPerf = effectiveMode === "low";

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (lowPerf) return;
    const cards = document.querySelectorAll<HTMLElement>(".card--border-glow");
    for (const card of Array.from(cards)) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--glow-x", `${x}px`);
      card.style.setProperty("--glow-y", `${y}px`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Déconnecté avec succès !");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec de la déconnexion.");
    }
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4 pt-24 sm:p-8 sm:pt-28"
      onMouseMove={onMouseMove}
    >
      <header className="relative mb-10 w-full max-w-6xl text-center sm:mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Dashboard Administrateur</h1>
        <p className="mt-2 text-slate-400">Gérez vos campagnes et analysez les résultats.</p>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="mt-4 text-slate-400 hover:text-white sm:absolute sm:right-0 sm:top-0 sm:mt-0"
        >
          <LogOut className="mr-2 h-5 w-5" /> Se déconnecter
        </Button>
      </header>

      <div className="w-full max-w-6xl">
        <BentoGrid>
          {dashboardItems.map((item) => (
            <Link key={item.href} href={item.href} className={item.className}>
              <BentoCard>
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-slate-400">{item.description}</p>
              </BentoCard>
            </Link>
          ))}
        </BentoGrid>
      </div>
    </main>
  );
}
