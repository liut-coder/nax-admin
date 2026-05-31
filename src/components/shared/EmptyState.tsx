import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title = "暂无数据",
  description = "当前筛选条件下没有可展示的记录。",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-lg border bg-surface px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Inbox className="h-6 w-6" />
      </div>
      <div className="mt-4 text-base font-semibold">{title}</div>
      <div className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </div>
      {action ? (
        <div className="mt-5">{action}</div>
      ) : (
        <Button className="mt-5">创建资源</Button>
      )}
    </div>
  );
}
