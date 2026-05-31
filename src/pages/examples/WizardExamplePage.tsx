import { useState } from "react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StepHeader } from "@/components/shared/StepHeader";
import { SummaryPanel } from "@/components/shared/SummaryPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

const steps = ["选择产品", "选择区域", "配置规格", "确认部署"];

export function WizardExamplePage() {
  const [current, setCurrent] = useState(0);
  return (
    <PageContainer>
      <PageHeader
        title="部署实例"
        description="使用步骤式流程创建一组标准资源"
      />
      <div className="mt-6">
        <StepHeader steps={steps} current={current} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-5">
          <div className="mb-4 text-base font-semibold">{steps[current]}</div>
          <div className="grid gap-3 md:grid-cols-3">
            {["Web 服务", "数据库", "边缘代理"].map((item, index) => (
              <button
                key={item}
                className={cn(
                  "rounded-lg border p-5 text-left hover:border-primary",
                  index === 0 && "border-primary bg-orange-50/40",
                )}
              >
                <div className="font-medium">{item}</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  标准模板，适合快速部署。
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-2 border-t pt-5">
            <Button
              variant="secondary"
              disabled={current === 0}
              onClick={() => setCurrent((value) => value - 1)}
            >
              上一步
            </Button>
            <Button
              onClick={() =>
                setCurrent((value) => Math.min(value + 1, steps.length - 1))
              }
            >
              {current === steps.length - 1 ? "开始部署" : "下一步"}
            </Button>
          </div>
        </Card>
        <SummaryPanel
          title="部署摘要"
          items={[
            { label: "产品", value: "Web 服务" },
            { label: "区域", value: "香港 HK" },
            { label: "规格", value: "Standard" },
            { label: "费用", value: "¥ 128 / 月" },
          ]}
        />
      </div>
    </PageContainer>
  );
}
