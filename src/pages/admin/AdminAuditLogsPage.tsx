import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Activity } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Input } from "@/components/ui/input";
import { listAuditLogs } from "@/features/admin/api";
import type { AuditLogRecord } from "@/features/admin/types";
import { asErrorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export function AdminAuditLogsPage() {
  const [search, setSearch] = useState("");
  const [resource, setResource] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);

  const auditQuery = useQuery({
    queryKey: ["admin", "audit-logs", page, search, resource, action],
    queryFn: () =>
      listAuditLogs({
        page,
        pageSize: 12,
        actorUserId: search || undefined,
        resource: resource || undefined,
        action: action || undefined,
      }),
  });

  const rows = auditQuery.data?.items ?? [];
  const pagination = auditQuery.data?.pagination;

  const columns = useMemo<ColumnDef<AuditLogRecord>[]>(
    () => [
      {
        accessorKey: "action",
        header: "动作",
        cell: ({ row }) => (
          <StatusBadge tone="info">{row.original.action}</StatusBadge>
        ),
      },
      {
        accessorKey: "resource",
        header: "资源",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.resource}</div>
        ),
      },
      { accessorKey: "resourceId", header: "资源 ID" },
      {
        accessorKey: "actorUserId",
        header: "操作者",
        cell: ({ row }) => row.original.actorUserId || "system",
      },
      { accessorKey: "ipAddress", header: "IP" },
      {
        accessorKey: "createdAt",
        header: "时间",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
    ],
    [],
  );

  return (
    <PageContainer>
      <PageHeader
        title="审计日志"
        description="查看登录、变更、上传等管理操作记录"
        actions={
          <div className="flex h-10 items-center gap-2 rounded-md border bg-surface px-3 text-sm">
            <Activity className="h-4 w-4" />
            实时查询
          </div>
        }
      />
      <div className="mt-6 space-y-5">
        <FilterBar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="按操作者 UUID 过滤"
        >
          <Input
            className="w-40"
            placeholder="资源，如 user"
            value={resource}
            onChange={(event) => {
              setResource(event.target.value);
              setPage(1);
            }}
          />
          <Input
            className="w-40"
            placeholder="动作，如 login"
            value={action}
            onChange={(event) => {
              setAction(event.target.value);
              setPage(1);
            }}
          />
        </FilterBar>
        <DataTable
          data={rows}
          columns={columns}
          total={pagination?.total}
          page={pagination?.page}
          pageCount={pagination?.totalPages}
          onPreviousPage={() => setPage((value) => Math.max(1, value - 1))}
          onNextPage={() =>
            setPage((value) =>
              Math.min(pagination?.totalPages ?? value, value + 1),
            )
          }
          isPreviousDisabled={(pagination?.page ?? 1) <= 1}
          isNextDisabled={
            (pagination?.page ?? 1) >= (pagination?.totalPages ?? 1)
          }
          toolbar={
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                数据来自 /api/v1/audit-logs
              </span>
              {auditQuery.error ? (
                <span className="text-sm text-red-600">
                  {asErrorMessage(auditQuery.error)}
                </span>
              ) : null}
            </div>
          }
        />
      </div>
    </PageContainer>
  );
}
