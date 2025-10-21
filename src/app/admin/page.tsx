"use client";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { PlusCircle, List, BarChart3, Settings } from "lucide-react";

const dashboardItems = [
  {
    icon: <PlusCircle className="h-8 w-8 text-white" />,
    title: "Nouvelle Campagne",
    description: "Lancer un nouveau sondage pour les managers.",
    className: "sm:col-span-2",
  },
  {
    icon: <List className="h-8 w-8 text-white" />,
    title: "Campagnes Actives",
    description: "Suivre les sondages en cours.",
    className: "",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-white" />,
    title: "Résultats Globaux",
    description: "Analyser les tendances de toutes les campagnes.",
    className: "",
  },
  {
    icon: <Settings className="h-8 w-8 text-white" />,
    title: "Paramètres",
    description: "Gérer les administrateurs et les options.",
    className: "sm:col-span-2",
  },
];

export default function AdminDashboard() {
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

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-8"
      onMouseMove={onMouseMove}
    >
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight">
          Dashboard Administrateur
        </h1>
        <p className="text-slate-400 mt-2">
          Gérez vos campagnes et analysez les résultats.
        </p>
      </header>

      <main className="w-full max-w-6xl">
        <BentoGrid>
          {dashboardItems.map((item, i) => (
            <BentoCard key={i} className={item.className}>
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-2xl font-semibold text-white">
                {item.title}
              </h3>
              <p className="text-slate-400 mt-1">{item.description}</p>
            </BentoCard>
          ))}
        </BentoGrid>
      </main>
    </div>
  );
}
