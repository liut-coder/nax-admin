import type { ColumnDef } from "@tanstack/react-table";
import { Download, Plus, Trash2, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/lib/format";
import { serverRows } from "@/mocks/data";

type ServerRow = (typeof serverRows)[number];

export function TableExamplePage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const rows = useMemo(() => {
    return serverRows.filter((item) => {
      const matchesText =
        `${item.name} ${item.ip} ${item.region} ${item.tags.join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesStatus = status === "all" || item.status === status;
      return matchesText && matchesStatus;
    });
  }, [search, status]);

  const columns: ColumnDef<ServerRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(Boolean(value))
          }
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        />
      ),
    },
    {
      accessorKey: "name",
      header: "名称",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.id}</div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => (
        <StatusBadge
          tone={
            row.original.status === "online"
              ? "online"
              : row.original.status === "warning"
                ? "warning"
                : "offline"
          }
        >
          {row.original.status === "online"
            ? "在线"
            : row.original.status === "warning"
              ? "警告"
              : "离线"}
        </StatusBadge>
      ),
    },
    { accessorKey: "ip", header: "公网 IP" },
    {
      accessorKey: "region",
      header: "区域",
      cell: ({ row }) => (
        <span>
          {row.original.flag} {row.original.region}
        </span>
      ),
    },
    {
      accessorKey: "tags",
      header: "标签",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          {row.original.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border bg-muted px-2 py-1 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "expiresAt",
      header: "到期时间",
      cell: ({ row }) => formatDateTime(row.original.expiresAt),
    },
    {
      id: "actions",
      header: "操作",
      cell: () => (
        <div className="flex gap-3 text-sm">
          <button className="font-medium text-primary">查看</button>
          <button className="text-muted-foreground">编辑</button>
          <button className="text-muted-foreground">更多</button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="服务器管理"
        description="管理服务器资产、状态与基础信息"
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            添加服务器
          </Button>
        }
      />
      <div className="mt-6 space-y-5">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="搜索服务器名称、IP 或标签"
        >
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">状态：全部</SelectItem>
              <SelectItem value="online">在线</SelectItem>
              <SelectItem value="warning">警告</SelectItem>
              <SelectItem value="offline">离线</SelectItem>
            </SelectContent>
          </Select>
        </FilterBar>
        <DataTable
          data={rows}
          columns={columns}
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-sm">已选择 2 项</span>
              <Button variant="secondary" size="sm">
                <Wrench className="h-4 w-4" />
                批量巡检
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4" />
                导出
              </Button>
              <Button variant="secondary" size="sm" className="text-red-600">
                <Trash2 className="h-4 w-4" />
                删除
              </Button>
            </div>
          }
        />
      </div>
    </PageContainer>
  );
}
