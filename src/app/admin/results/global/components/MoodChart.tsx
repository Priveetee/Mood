import { TrendingUp } from "lucide-react";
import { Pie, PieChart, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface MoodData {
  name: string;
  votes: number;
  fill: string;
  emoji: string;
}

interface MoodChartProps {
  data: MoodData[];
  onMoodHover: (color: string) => void;
  onMoodLeave: () => void;
}

const chartConfig = {
  votes: { label: "Votes" },
  "Très bien": { label: "Très bien", color: "#22c55e" },
  Neutre: { label: "Neutre", color: "#38bdf8" },
  Moyen: { label: "Moyen", color: "#facc15" },
  "Pas bien": { label: "Pas bien", color: "#ef4444" },
} satisfies ChartConfig;

const RADIAN = Math.PI / 180;
const CustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  payload,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  payload: { emoji: string };
}) => {
  const radius = outerRadius + 25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-2xl"
    >
      {payload.emoji}
    </text>
  );
};

export function MoodChart({ data, onMoodHover, onMoodLeave }: MoodChartProps) {
  const filteredData = data.filter((m) => m.votes > 0);

  return (
    <Card className="flex flex-col bg-slate-900 border-slate-800 text-white">
      <CardHeader className="items-center pb-0">
        <CardTitle>Répartition des Humeurs</CardTitle>
        <CardDescription>Période sélectionnée</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[350px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={filteredData}
              dataKey="votes"
              nameKey="name"
              innerRadius={80}
              outerRadius={120}
              strokeWidth={5}
              labelLine={false}
              label={CustomizedLabel}
              onMouseEnter={(data: MoodData) => onMoodHover(data.fill)}
              onMouseLeave={onMoodLeave}
            >
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}-${index}`}
                  fill={entry.fill}
                  stroke={entry.fill}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none text-slate-300">
          Tendance positive de 3.4% ce mois-ci{" "}
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="leading-none text-slate-500">
          Affichage des résultats pour la période complète
        </div>
      </CardFooter>
    </Card>
  );
}
