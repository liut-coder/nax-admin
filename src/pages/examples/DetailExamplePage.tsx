import {
  Activity,
  Cpu,
  Database,
  Globe2,
  HardDrive,
  ShieldCheck,
} from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SummaryPanel } from "@/components/shared/SummaryPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function DetailExamplePage() {
  return (
    <PageContainer>
      <PageHeader
        title="hk-edge-01"
        description="srv-8f3a1b2c / 香港 HK / 203.0.113.12"
        actions={
          <>
            <Button variant="secondary">重启</Button>
            <Button>编辑配置</Button>
          </>
        }
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge tone="online">在线</StatusBadge>
        <StatusBadge tone="info">edge</StatusBadge>
        <StatusBadge tone="info">proxy</StatusBadge>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="CPU"
          value="46%"
          hint="8 核 / 16 GB"
          icon={<Cpu className="h-5 w-5" />}
        />
        <StatCard
          label="内存"
          value="31%"
          hint="4.9 GB 使用中"
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          label="磁盘"
          value="15%"
          hint="120 GB SSD"
          icon={<HardDrive className="h-5 w-5" />}
        />
        <StatCard
          label="安全"
          value="正常"
          hint="最近巡检 5 分钟前"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-5">
          <div className="mb-5 text-base font-semibold">服务关系</div>
          {[
            ["api-gateway", "运行中", Globe2],
            ["postgres-main", "运行中", Database],
            ["metrics-agent", "运行中", Activity],
          ].map(([name, status, Icon]) => (
            <div
              key={name as string}
              className="flex items-center justify-between border-b py-4 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-md bg-orange-50 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">{name as string}</div>
                  <div className="text-xs text-muted-foreground">
                    自动托管服务
                  </div>
                </div>
              </div>
              <StatusBadge tone="success">{status as string}</StatusBadge>
            </div>
          ))}
        </Card>
        <SummaryPanel
          title="资源信息"
          items={[
            { label: "公网 IP", value: "203.0.113.12" },
            { label: "区域", value: "香港 HK" },
            { label: "规格", value: "Standard 8C16G" },
            { label: "到期时间", value: "2025-07-18 23:59" },
            { label: "负责人", value: "admin@nax.local" },
          ]}
        />
      </div>
    </PageContainer>
  );
}
