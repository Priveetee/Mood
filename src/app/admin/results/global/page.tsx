"use client";

import * as React from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  Smile,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { Pie, PieChart, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const calendarClassNames = {
  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
  month: "space-y-4",
  caption_label: "text-sm font-medium text-slate-100",
  nav_button:
    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-slate-700 rounded-md hover:bg-slate-800",
  head_cell: "text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
  cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-800/50 [&:has([aria-selected])]:bg-slate-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
  day: "h-9 w-9 p-0 font-normal rounded-md hover:bg-slate-800 text-slate-300",
  day_selected:
    "bg-slate-200 text-slate-900 hover:bg-slate-200 focus:bg-slate-200",
  day_today: "bg-slate-700 text-slate-100",
  day_outside: "text-slate-500 opacity-50",
  day_disabled: "text-slate-600 opacity-50",
  day_range_middle:
    "aria-selected:bg-slate-800/50 aria-selected:text-slate-100",
};

const chartData = [
  { mood: "Très bien", votes: 275, fill: "#22c55e" },
  { mood: "Neutre", votes: 200, fill: "#38bdf8" },
  { mood: "Moyen", votes: 187, fill: "#f97316" },
  { mood: "Pas bien", votes: 90, fill: "#ef4444" },
];

const chartConfig = {
  votes: { label: "Votes" },
  "Très bien": { label: "Très bien" },
  Neutre: { label: "Neutre" },
  Moyen: { label: "Moyen" },
  "Pas bien": { label: "Pas bien" },
} satisfies ChartConfig;

const StatCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}) => (
  <Card className="bg-slate-900 border-slate-800">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-400">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{value}</div>
    </CardContent>
  </Card>
);

export default function GlobalResultsPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2025, 8, 1),
    to: new Date(),
  });

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (isClient && !isPopoverOpen) {
      toast.info("Filtres de date appliqués.");
    }
  }, [date, isPopoverOpen, isClient]);

  return (
    <div className="p-8">
      <header className="mb-10 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white">Résultats Globaux</h1>
        <p className="text-slate-400 mt-2">
          Analysez et filtrez les résultats de toutes les campagnes.
        </p>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 p-4 mb-8 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-4">
            {isClient && (
              <>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[280px] h-11 bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Toutes les campagnes" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="all">Toutes les campagnes</SelectItem>
                    <SelectItem value="cam_1">Sondage T3 2025</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[280px] h-11 bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Tous les managers" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="all">Tous les managers</SelectItem>
                    <SelectItem value="manager_a">Manager A</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
          {isClient && (
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] h-11 justify-start text-left font-normal bg-slate-800 border-slate-700 hover:bg-slate-700 text-white",
                    !date && "text-slate-400",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Choisissez une période</span>
                  )}
                </Button>
              </PopoverTrigger>
              <AnimatePresence>
                {isPopoverOpen && (
                  <PopoverContent
                    asChild
                    className="w-auto p-0 border-slate-800 bg-slate-950"
                    align="end"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        classNames={calendarClassNames}
                      />
                    </motion.div>
                  </PopoverContent>
                )}
              </AnimatePresence>
            </Popover>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="flex flex-col bg-slate-900 border-slate-800 text-white">
            <CardHeader className="items-center pb-0">
              <CardTitle>Répartition des Humeurs</CardTitle>
              <CardDescription>Période sélectionnée</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[300px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={chartData}
                    dataKey="votes"
                    nameKey="mood"
                    innerRadius={60}
                    strokeWidth={5}
                    label={({
                      x,
                      y,
                      textAnchor,
                      dominantBaseline,
                      payload,
                    }) => (
                      <text
                        x={x}
                        y={y}
                        textAnchor={textAnchor}
                        dominantBaseline={dominantBaseline}
                        style={{ fill: "#fff", fontSize: "0.8rem" }}
                      >
                        {payload.votes}
                      </text>
                    )}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
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
          <div className="h-full rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
            <p className="text-slate-500">Zone pour l'évolution temporelle</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <StatCard
            icon={<Users className="h-5 w-5 text-slate-500" />}
            title="Votes Totaux"
            value={500}
          />
          <StatCard
            icon={<Smile className="h-5 w-5 text-slate-500" />}
            title="Humeur Dominante"
            value="Très bien"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-slate-500" />}
            title="Taux de Participation"
            value="85%"
          />
        </div>
      </main>
    </div>
  );
}
