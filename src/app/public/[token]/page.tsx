import { Suspense } from "react";
import PublicResultsClientPage from "./client-page";

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-transparent" />
    </div>
  );
}

export default function PublicResultsPage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PublicResultsClientPage params={params} />
    </Suspense>
  );
}
