import { Suspense } from "react";

export default function PollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-transparent" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
