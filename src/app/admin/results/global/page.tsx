"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  Smile,
  FileDown,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { Pie, PieChart, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { useTheme } from "@/app/admin/theme-context";
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
import { ScrollArea } from "@/components/ui/scroll-area";

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

const moods = [
  { name: "Très bien", votes: 275, fill: "#22c55e", emoji: "😄" },
  { name: "Neutre", votes: 200, fill: "#38bdf8", emoji: "🙂" },
  { name: "Moyen", votes: 187, fill: "#f97316", emoji: "😕" },
  { name: "Pas bien", votes: 90, fill: "#ef4444", emoji: "😠" },
];

const chartConfig = {
  votes: { label: "Votes" },
  "Très bien": { label: "Très bien" },
  Neutre: { label: "Neutre" },
  Moyen: { label: "Moyen" },
  "Pas bien": { label: "Pas bien" },
} satisfies ChartConfig;

const mockComments = [
  {
    user: "user_123",
    manager: "Manager A",
    comment: "Super semaine, l'équipe est au top !",
    mood: "Très bien",
  },
  {
    user: "user_456",
    manager: "Manager C",
    comment: "Difficultés sur le projet X, besoin de support.",
    mood: "Moyen",
  },
  {
    user: "user_789",
    manager: "Manager B",
    comment: "RAS, tout se passe comme prévu.",
    mood: "Neutre",
  },
  {
    user: "user_101",
    manager: "Manager C",
    comment: "Encore des blocages, la pression monte.",
    mood: "Pas bien",
  },
  {
    user: "user_112",
    manager: "Manager A",
    comment: "Objectif atteint en avance, bravo à tous !",
    mood: "Très bien",
  },
];

const StatCard = ({
  icon,
  title,
  value,
  onMouseEnter,
  onMouseLeave,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) => (
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

const RADIAN = Math.PI / 180;
const CustomizedLabel = ({ cx, cy, midAngle, outerRadius, payload }: any) => {
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

const darkThemeColor = "#3f3f5a";

export default function GlobalResultsPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2025, 0, 1),
    to: new Date(2025, 10, 28),
  });
  const { setSilkColor } = useTheme();

  React.useEffect(() => {
    setIsClient(true);
    return () => setSilkColor(darkThemeColor);
  }, [setSilkColor]);

  React.useEffect(() => {
    if (isClient && !isPopoverOpen) {
      toast.info("Filtres de date appliqués.");
    }
  }, [date, isPopoverOpen, isClient]);

  const dominantMood = moods.sort((a, b) => b.votes - a.votes)[0];
  const totalVotes = moods.reduce((acc, cur) => acc + cur.votes, 0);

  return (
    <div className="p-8">
      <Link
        href="/admin"
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au Dashboard
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
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
                    <SelectTrigger className="w-[280px] h-11 bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Toutes les campagnes" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      <SelectItem value="all">Toutes les campagnes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[280px] h-11 bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Tous les managers" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      <SelectItem value="all">Tous les managers</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
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
              <Button
                variant="outline"
                className="h-11 gap-2 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
              >
                <FileDown className="h-4 w-4" />
                Exporter (CSV)
              </Button>
            </div>
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
                  className="mx-auto aspect-square max-h-[350px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={moods}
                      dataKey="votes"
                      nameKey="mood"
                      innerRadius={80}
                      outerRadius={120}
                      strokeWidth={5}
                      labelLine={false}
                      label={<CustomizedLabel />}
                      onMouseEnter={(data) => setSilkColor(data.fill)}
                      onMouseLeave={() => setSilkColor(darkThemeColor)}
                    >
                      {moods.map((entry) => (
                        <Cell
                          key={`cell-${entry.name}`}
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

            <Card className="flex flex-col bg-slate-900 border-slate-800 text-white">
              <CardHeader>
                <CardTitle>Derniers Commentaires</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[430px] pr-4">
                  <div className="space-y-6">
                    {mockComments.map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div
                          className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${item.mood === "Très bien" ? "bg-green-500" : item.mood === "Neutre" ? "bg-sky-500" : item.mood === "Moyen" ? "bg-orange-500" : "bg-red-500"}`}
                        />
                        <div>
                          <p className="font-semibold text-slate-300">
                            {item.user}{" "}
                            <span className="text-xs font-normal text-slate-500">
                              (Équipe {item.manager})
                            </span>
                          </p>
                          <p className="text-sm text-slate-400">
                            {item.comment}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <StatCard
              icon={<Users className="h-5 w-5 text-slate-500" />}
              title="Votes Totaux"
              value={totalVotes}
            />
            <StatCard
              icon={<span className="text-2xl">{dominantMood.emoji}</span>}
              title="Humeur Dominante"
              value={dominantMood.name}
              onMouseEnter={() => setSilkColor(dominantMood.fill)}
              onMouseLeave={() => setSilkColor(darkThemeColor)}
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5 text-slate-500" />}
              title="Taux de Participation"
              value="85%"
            />
          </div>
        </main>
      </motion.div>
    </div>
  );
}
