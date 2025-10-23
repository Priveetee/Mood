import * as React from "react";
import { Suspense } from "react";
import GlobalResultsClient from "./client-page";

const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center p-8">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function GlobalResultsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GlobalResultsClient />
    </Suspense>
  );
}
