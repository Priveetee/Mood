"use client";

import { Cell, Pie, PieChart, type PieLabelRenderProps, type PieSectorDataItem } from "recharts";
import { OpenMojiImage } from "@/components/openmoji-image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface MoodData {
  name: string;
  votes: number;
  fill: string;
  emojiCode: string;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getEmojiCodeFromPayload(payload: unknown): string {
  if (!isRecord(payload)) {
    return "1F610";
  }
  const emojiCode = payload.emojiCode;
  return typeof emojiCode === "string" ? emojiCode : "1F610";
}

function getFillColor(item: PieSectorDataItem): string | null {
  if (typeof item.fill === "string") {
    return item.fill;
  }
  if (isRecord(item.payload) && typeof item.payload.fill === "string") {
    return item.payload.fill;
  }
  return null;
}

const CustomizedLabel = ({ cx, cy, midAngle, outerRadius, payload }: PieLabelRenderProps) => {
  if (
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    typeof midAngle !== "number" ||
    typeof outerRadius !== "number"
  ) {
    return null;
  }

  const radius = outerRadius + 25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const emojiCode = getEmojiCodeFromPayload(payload);

  return (
    <foreignObject x={x - 12} y={y - 12} width={24} height={24}>
      <OpenMojiImage code={emojiCode} alt="Mood" size={24} className="h-6 w-6" />
    </foreignObject>
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
          className="mx-auto aspect-square max-h-[280px] sm:max-h-[350px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  payload={[]}
                  active={false}
                  accessibilityLayer={false}
                />
              }
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
              onMouseEnter={(item: PieSectorDataItem) => {
                const fill = getFillColor(item);
                if (fill) {
                  onMoodHover(fill);
                }
              }}
              onMouseLeave={onMoodLeave}
            >
              {filteredData.map((item) => (
                <Cell
                  key={`cell-${item.name}`}
                  fill={item.fill}
                  stroke={item.fill}
                  style={{ transition: "fill 420ms ease, stroke 420ms ease" }}
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
