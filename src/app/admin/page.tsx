"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { PlusCircle, List, BarChart3, Github, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
    icon: <Github className="h-10 w-10 text-white" />,
    title: "Projet GitHub",
    description: "Voir le code source et contribuer.",
    className: "sm:col-span-2",
    href: "https://github.com/Priveetee/Mood",
  },
];

export default function AdminDashboard() {
  const router = useRouter();

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const cards = document.getElementsByClassName("card--border-glow");
    for (const card of Array.from(cards)) {
      const rect = (card as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      (card as HTMLElement).style.setProperty("--glow-x", `${x}px`);
      (card as HTMLElement).style.setProperty("--glow-y", `${y}px`);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Erreur de déconnexion");
      }
      toast.success("Déconnecté avec succès !");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Échec de la déconnexion.");
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-8"
      onMouseMove={onMouseMove}
    >
      <header className="text-center mb-12 relative w-full max-w-6xl">
        <h1 className="text-5xl font-bold tracking-tight">
          Dashboard Administrateur
        </h1>
        <p className="text-slate-400 mt-2">
          Gérez vos campagnes et analysez les résultats.
        </p>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="absolute top-0 right-0 text-slate-400 hover:text-white"
        >
          <LogOut className="h-5 w-5 mr-2" /> Se déconnecter
        </Button>
      </header>

      <main className="w-full max-w-6xl">
        <BentoGrid>
          {dashboardItems.map((item, i) => (
            <Link key={i} href={item.href} className={item.className}>
              <BentoCard>
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-2xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-slate-400 mt-1">{item.description}</p>
              </BentoCard>
            </Link>
          ))}
        </BentoGrid>
      </main>
    </div>
  );
}
