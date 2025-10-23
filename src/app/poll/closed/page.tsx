"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { ShieldX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

const FaultyTerminal = dynamic(() => import("@/components/FaultyTerminal"), {
  ssr: false,
  loading: () => <div className="h-screen w-screen bg-black" />,
});

export default function PollClosedPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const authError = searchParams.get("auth_error");
    if (authError === "unauthorized") {
      toast.error("Vous n'êtes pas autorisé à consulter cette page.");
    }
  }, [searchParams]);

  return (
    <>
      <div className="fixed top-0 left-0 -z-10 h-screen w-screen">
        <FaultyTerminal
          tint="#45B056"
          scale={2.1}
          digitSize={1.3}
          timeScale={0.5}
          noiseAmp={1}
          brightness={0.7}
          scanlineIntensity={1.2}
          curvature={0.11}
          mouseReact={true}
          mouseStrength={2}
          pageLoadAnimation={false}
          glitchAmount={0}
          flickerAmount={0}
        />
      </div>
      <main className="flex min-h-screen flex-col items-center justify-start p-4 pt-32">
        <Card className="w-full max-w-md rounded-2xl border-slate-800 bg-slate-900/80 text-white backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold tracking-tight">
              Sondage fermé ou expiré
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4 p-8 pt-2">
            <ShieldX className="h-20 w-20 text-red-500" />
            <p className="text-center text-slate-400">
              Il n&apos;est plus possible de participer à ce sondage. Merci de
              votre intérêt.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
