import { cn } from "@/lib/utils";

const BentoGrid = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn("grid w-full grid-cols-1 sm:grid-cols-3 gap-4", className)}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "card--border-glow group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 ease-in-out hover:-translate-y-1",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-slate-900/20 to-transparent"></div>
      {children}
    </div>
  );
};

export { BentoGrid, BentoCard };
