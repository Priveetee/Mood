import * as React from "react";
import { Suspense } from "react";
import PollClosedClientPage from "./client-page";

const Loading = () => <div className="h-screen w-screen bg-black" />;

export default function PollClosedPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PollClosedClientPage />
    </Suspense>
  );
}
