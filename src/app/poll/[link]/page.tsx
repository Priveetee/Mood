import PollClientPage from "./client-page";

export default async function Page({
  params,
}: {
  params: Promise<{ link: string }>;
}) {
  return <PollClientPage params={params} />;
}
