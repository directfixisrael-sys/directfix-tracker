import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted relative overflow-hidden",
        "after:absolute after:inset-0 after:translate-x-[-100%]",
        "after:bg-gradient-to-l after:from-transparent after:via-foreground/5 after:to-transparent",
        "after:animate-shimmer",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
