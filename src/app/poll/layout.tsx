import PublicTRPCProvider from "@/lib/trpc/public-provider";

export default function PollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicTRPCProvider>{children}</PublicTRPCProvider>;
}
