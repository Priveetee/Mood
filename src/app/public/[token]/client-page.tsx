"use client";

import { use } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { OpenMojiImage } from "@/components/openmoji-image";
import PollSilk from "@/components/poll-silk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePublicResultsController } from "./use-public-results-controller";

export default function PublicResultsClientPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const controller = usePublicResultsController(token);

  if (controller.query.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-transparent" />
      </div>
    );
  }

  if (!controller.query.data) {
    return null;
  }

  return (
    <div className="relative isolate min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-0">
        <PollSilk
          color={controller.silkColor}
          speed={5}
          scale={1.1}
          noiseIntensity={1.2}
          rotation={0}
        />
      </div>
      <main className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-3xl border-slate-800 bg-slate-900/80 text-white backdrop-blur-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{controller.query.data.campaignName}</CardTitle>
            <p className="text-slate-300">Vue publique en lecture seule</p>
          </CardHeader>
          <CardContent className="grid gap-8 md:grid-cols-2">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={controller.query.data.moodDistribution}
                    dataKey="votes"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={105}
                    strokeWidth={4}
                  >
                    {controller.query.data.moodDistribution.map((item) => (
                      <Cell key={item.name} fill={item.fill} stroke={item.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <p className="text-lg font-semibold text-slate-100">
                Total votes: {controller.query.data.totalVotes}
              </p>
              <ul className="space-y-2 text-sm text-slate-200">
                {controller.query.data.moodDistribution.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between rounded-md bg-slate-800/80 px-3 py-2"
                  >
                    <span className="flex items-center gap-2">
                      <OpenMojiImage
                        code={item.emojiCode}
                        alt={item.name}
                        size={20}
                        className="h-5 w-5"
                      />
                      {item.name}
                    </span>
                    <span className="font-semibold">{item.votes}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
