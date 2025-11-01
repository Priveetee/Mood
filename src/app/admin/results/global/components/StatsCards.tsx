import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

function StatCard({
  icon,
  title,
  value,
  onMouseEnter,
  onMouseLeave,
}: StatCardProps) {
  return (
    <Card
      className="bg-slate-900 border-slate-800 transition-transform duration-300 hover:-translate-y-1"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-white">{value}</div>
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  totalVotes: number;
  dominantMood: string;
  dominantMoodEmoji: string;
  onDominantMoodHover: () => void;
  onDominantMoodLeave: () => void;
}

export function StatsCards({
  totalVotes,
  dominantMood,
  dominantMoodEmoji,
  onDominantMoodHover,
  onDominantMoodLeave,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      <StatCard
        icon={<Users className="h-5 w-5 text-slate-500" />}
        title="Votes Totaux"
        value={totalVotes}
      />
      <StatCard
        icon={<span className="text-2xl">{dominantMoodEmoji}</span>}
        title="Humeur Dominante"
        value={dominantMood}
        onMouseEnter={onDominantMoodHover}
        onMouseLeave={onDominantMoodLeave}
      />
    </div>
  );
}
