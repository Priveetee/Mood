import { Suspense } from "react";
import { PublicTRPCProvider } from "@/lib/trpc";

export default function PublicResultsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicTRPCProvider>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-transparent" />
          </div>
        }
      >
        {children}
      </Suspense>
    </PublicTRPCProvider>
  );
}
