import { Users } from "lucide-react";
import { OpenMojiImage } from "@/components/openmoji-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

function StatCard({ icon, title, value, onMouseEnter, onMouseLeave }: StatCardProps) {
  return (
    <Card
      className="bg-slate-900 border-slate-800 transition-transform duration-300 hover:-translate-y-1"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white sm:text-4xl">{value}</div>
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  totalVotes: number;
  dominantMood: string;
  dominantMoodEmojiCode: string;
  onDominantMoodHover: () => void;
  onDominantMoodLeave: () => void;
}

export function StatsCards({
  totalVotes,
  dominantMood,
  dominantMoodEmojiCode,
  onDominantMoodHover,
  onDominantMoodLeave,
}: StatsCardsProps) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
      <StatCard
        icon={<Users className="h-5 w-5 text-slate-500" />}
        title="Votes Totaux"
        value={totalVotes}
      />
      <StatCard
        icon={
          <OpenMojiImage code={dominantMoodEmojiCode} alt="Humeur" size={24} className="h-6 w-6" />
        }
        title="Humeur Dominante"
        value={dominantMood}
        onMouseEnter={onDominantMoodHover}
        onMouseLeave={onDominantMoodLeave}
      />
    </div>
  );
}
