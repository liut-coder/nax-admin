import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Database,
  FileText,
  KeyRound,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { ChartCard } from "@/components/shared/ChartCard";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import {
  getHealth,
  listAuditLogs,
  listFiles,
  listPermissions,
  listSettings,
  rolesApi,
  usersApi,
} from "@/features/admin/api";
import { dashboardTrend } from "@/mocks/data";

export function DashboardPage() {
  const healthQuery = useQuery({
    queryKey: ["admin", "health"],
    queryFn: getHealth,
  });
  const usersQuery = useQuery({
    queryKey: ["admin", "dashboard", "users"],
    queryFn: () => usersApi.list({ page: 1, pageSize: 1 }),
  });
  const rolesQuery = useQuery({
    queryKey: ["admin", "dashboard", "roles"],
    queryFn: () => rolesApi.list({ page: 1, pageSize: 1 }),
  });
  const permissionsQuery = useQuery({
    queryKey: ["admin", "dashboard", "permissions"],
    queryFn: () => listPermissions({ page: 1, pageSize: 1 }),
  });
  const settingsQuery = useQuery({
    queryKey: ["admin", "dashboard", "settings"],
    queryFn: () => listSettings({ page: 1, pageSize: 1 }),
  });
  const auditQuery = useQuery({
    queryKey: ["admin", "dashboard", "audit"],
    queryFn: () => listAuditLogs({ page: 1, pageSize: 5 }),
  });
  const filesQuery = useQuery({
    queryKey: ["admin", "dashboard", "files"],
    queryFn: () => listFiles({ page: 1, pageSize: 1 }),
  });

  const health = healthQuery.data;
  const recentLogs = auditQuery.data?.items ?? [];

  return (
    <PageContainer>
      <PageHeader
        title="脚手架总览"
        description="通用后台 API、认证、RBAC、配置、审计和文件模块的联调入口"
        actions={
          <div className="flex h-10 items-center gap-2 rounded-md border bg-surface px-3 text-sm">
            <Activity className="h-4 w-4" />
            <span>{health?.status === "ok" ? "API 正常" : "API 检查中"}</span>
          </div>
        }
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="用户"
          value={usersQuery.data?.pagination.total ?? "-"}
          hint="GET /users"
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          label="角色"
          value={rolesQuery.data?.pagination.total ?? "-"}
          hint="GET /roles"
          icon={<ShieldCheck className="h-6 w-6" />}
        />
        <StatCard
          label="权限"
          value={permissionsQuery.data?.pagination.total ?? "-"}
          hint="GET /permissions"
          icon={<KeyRound className="h-6 w-6" />}
        />
        <StatCard
          label="文件"
          value={filesQuery.data?.pagination.total ?? "-"}
          hint="GET /files"
          icon={<FileText className="h-6 w-6" />}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.8fr)]">
        <ChartCard
          title="模板图表组件"
          option={{
            tooltip: { trigger: "axis" },
            grid: { left: 36, right: 20, top: 25, bottom: 32 },
            xAxis: {
              type: "category",
              data: dashboardTrend.map((item) => item.day),
              boundaryGap: false,
            },
            yAxis: { type: "value", min: 0, max: 100 },
            series: [
              {
                type: "line",
                name: "API 延迟",
                data: dashboardTrend.map((item) => item.cpu),
                smooth: true,
                symbolSize: 6,
                lineStyle: { color: "#ff7a00" },
                itemStyle: { color: "#ff7a00" },
              },
              {
                type: "line",
                name: "请求量",
                data: dashboardTrend.map((item) => item.memory),
                smooth: true,
                symbolSize: 6,
                lineStyle: { color: "#2563eb" },
                itemStyle: { color: "#2563eb" },
              },
            ],
          }}
        />
        <Card className="p-5">
          <div className="mb-5 text-base font-semibold">后端契约</div>
          <div className="grid gap-3">
            {[
              ["统一响应", "success / data / message / requestId", Database],
              ["鉴权", "Bearer JWT + refresh cookie", ShieldCheck],
              ["RBAC", "permission key 控制路由和按钮", KeyRound],
              [
                "配置",
                `${settingsQuery.data?.pagination.total ?? "-"} 项设置`,
                Settings,
              ],
            ].map(([title, desc, Icon]) => (
              <div
                key={title as string}
                className="flex items-center gap-3 rounded-md border p-4"
              >
                <div className="grid h-9 w-9 place-items-center rounded-md bg-orange-50 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">{title as string}</div>
                  <div className="text-xs text-muted-foreground">
                    {desc as string}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 text-base font-semibold">可复用模块</div>
          {[
            "认证登录：POST /auth/login，401 自动退出，refresh 自动续签",
            "用户角色：用户 CRUD、角色 CRUD、权限勾选",
            "配置审计：系统设置更新、审计日志查询",
            "文件上传：multipart 上传和文件列表",
          ].map((item, index) => (
            <div
              key={item}
              className="flex items-center gap-3 border-b py-3 last:border-0"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] text-white">
                {index + 1}
              </span>
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </Card>
        <Card className="p-5">
          <div className="mb-4 text-base font-semibold">最近审计</div>
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex gap-4 border-l py-2 pl-4 text-sm"
              >
                <span className="w-20 text-muted-foreground">
                  {log.resource}
                </span>
                <span className="flex-1">
                  {log.action}
                  {log.resourceId ? ` / ${log.resourceId}` : ""}
                </span>
                <StatusBadge tone="success">已记录</StatusBadge>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">暂无审计记录</div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
