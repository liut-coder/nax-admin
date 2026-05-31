import { cn } from "@/lib/cn";

export function StepHeader({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {steps.map((step, index) => (
        <div
          key={step}
          className={cn(
            "rounded-lg border bg-surface p-4",
            index === current ? "border-primary shadow-card" : "",
          )}
        >
          <div
            className={cn(
              "mb-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
              index <= current
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground",
            )}
          >
            {index + 1}
          </div>
          <div className="text-sm font-medium">{step}</div>
        </div>
      ))}
    </div>
  );
}
