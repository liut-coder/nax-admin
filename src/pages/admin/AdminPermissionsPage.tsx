import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { KeyRound } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listPermissions } from "@/features/admin/api";
import type { PermissionRecord } from "@/features/admin/types";
import { asErrorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export function AdminPermissionsPage() {
  const [search, setSearch] = useState("");
  const [resource, setResource] = useState("all");
  const [page, setPage] = useState(1);

  const permissionsQuery = useQuery({
    queryKey: ["admin", "permissions", page, search, resource],
    queryFn: () =>
      listPermissions({
        page,
        pageSize: 12,
        q: search || undefined,
        resource: resource === "all" ? undefined : resource,
      }),
  });

  const rows = permissionsQuery.data?.items ?? [];
  const pagination = permissionsQuery.data?.pagination;
  const resources = Array.from(new Set(rows.map((item) => item.resource)));

  const columns = useMemo<ColumnDef<PermissionRecord>[]>(
    () => [
      {
        accessorKey: "key",
        header: "权限 Key",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.key}</div>
        ),
      },
      {
        accessorKey: "resource",
        header: "资源",
        cell: ({ row }) => (
          <StatusBadge tone="info">{row.original.resource}</StatusBadge>
        ),
      },
      {
        accessorKey: "action",
        header: "动作",
        cell: ({ row }) => (
          <StatusBadge tone="offline">{row.original.action}</StatusBadge>
        ),
      },
      { accessorKey: "description", header: "描述" },
      {
        accessorKey: "createdAt",
        header: "创建时间",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
    ],
    [],
  );

  return (
    <PageContainer>
      <PageHeader
        title="权限字典"
        description="展示后端已注册的权限资源和动作，作为 RBAC 配置基础"
        actions={
          <div className="flex h-10 items-center gap-2 rounded-md border bg-surface px-3 text-sm">
            <KeyRound className="h-4 w-4" />
            只读字典
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
          placeholder="搜索权限 key 或描述"
        >
          <Select
            value={resource}
            onValueChange={(value) => {
              setResource(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">资源：全部</SelectItem>
              {resources.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                数据来自 /api/v1/permissions
              </span>
              {permissionsQuery.error ? (
                <span className="text-sm text-red-600">
                  {asErrorMessage(permissionsQuery.error)}
                </span>
              ) : null}
            </div>
          }
        />
      </div>
    </PageContainer>
  );
}
