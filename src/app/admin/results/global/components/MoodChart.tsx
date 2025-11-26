"use client";

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
  onMoodHover: (_color: string) => void;
  onMoodLeave: () => void;
}

const chartConfig = {
  votes: { label: "Votes" },
  "Très bien": { label: "Très bien", color: "#22c55e" },
  Bien: { label: "Bien", color: "#38bdf8" },
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
  const filteredData = data.filter((item) => item.votes > 0);

  return (
    <Card className="flex flex-col border-slate-800 bg-slate-900 text-white">
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
              onMouseEnter={(item: MoodData) => onMoodHover(item.fill)}
              onMouseLeave={onMoodLeave}
            >
              {filteredData.map((item, index) => (
                <Cell
                  key={`cell-${item.name}-${index}`}
                  fill={item.fill}
                  stroke={item.fill}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm" />
    </Card>
  );
}
