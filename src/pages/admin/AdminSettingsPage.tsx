import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit2, Save } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FormDrawer } from "@/components/shared/FormDrawer";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listSettings, updateSetting } from "@/features/admin/api";
import type { SettingRecord } from "@/features/admin/types";
import { asErrorMessage } from "@/lib/api";
import { formatDateTime, formatJsonValue } from "@/lib/format";

const settingSchema = z.object({
  key: z.string(),
  value: z.string().min(1, "请输入配置值"),
  description: z.string().optional(),
});

type SettingFormValues = z.infer<typeof settingSchema>;

export function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingSetting, setEditingSetting] = useState<SettingRecord | null>(
    null,
  );

  const settingsQuery = useQuery({
    queryKey: ["admin", "settings", page, search],
    queryFn: () => listSettings({ page, pageSize: 10, q: search || undefined }),
  });

  const form = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema),
    defaultValues: { key: "", value: "", description: "" },
  });

  const updateMutation = useMutation({
    mutationFn: (values: SettingFormValues) =>
      updateSetting(values.key, {
        value: parseSettingValue(values.value),
        description: values.description || "",
      }),
    onSuccess: () => {
      setEditingSetting(null);
      void queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });

  const openEdit = useCallback(
    (setting: SettingRecord) => {
      setEditingSetting(setting);
      form.reset({
        key: setting.key,
        value: formatEditableValue(setting.value),
        description: setting.description,
      });
    },
    [form],
  );

  const rows = settingsQuery.data?.items ?? [];
  const pagination = settingsQuery.data?.pagination;

  const columns = useMemo<ColumnDef<SettingRecord>[]>(
    () => [
      {
        accessorKey: "key",
        header: "配置 Key",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.key}</div>
        ),
      },
      {
        accessorKey: "value",
        header: "值",
        cell: ({ row }) => (
          <code className="rounded bg-muted px-2 py-1 text-xs">
            {formatJsonValue(row.original.value)}
          </code>
        ),
      },
      { accessorKey: "description", header: "说明" },
      {
        accessorKey: "updatedAt",
        header: "更新时间",
        cell: ({ row }) => formatDateTime(row.original.updatedAt),
      },
      {
        id: "actions",
        header: "操作",
        cell: ({ row }) => (
          <PermissionGate permission="setting:update" fallback={null}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEdit(row.original)}
            >
              <Edit2 className="h-4 w-4" />
              编辑
            </Button>
          </PermissionGate>
        ),
      },
    ],
    [openEdit],
  );

  return (
    <PageContainer>
      <PageHeader
        title="系统设置"
        description="读取和更新后端系统配置，支持字符串、数字、布尔和 JSON"
      />
      <div className="mt-6 space-y-5">
        <FilterBar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="搜索配置 key 或说明"
        />
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
                数据来自 /api/v1/settings
              </span>
              {settingsQuery.error ? (
                <span className="text-sm text-red-600">
                  {asErrorMessage(settingsQuery.error)}
                </span>
              ) : null}
            </div>
          }
        />
      </div>

      <FormDrawer
        open={Boolean(editingSetting)}
        title="编辑系统设置"
        description="保存后会调用 PUT /api/v1/settings/{key}"
        onClose={() => setEditingSetting(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditingSetting(null)}>
              取消
            </Button>
            <Button
              disabled={updateMutation.isPending}
              onClick={form.handleSubmit((values) =>
                updateMutation.mutate(values),
              )}
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? "保存中" : "保存"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>配置 Key</Label>
            <Input disabled {...form.register("key")} />
          </div>
          <div className="grid gap-2">
            <Label>配置值</Label>
            <Textarea rows={5} {...form.register("value")} />
            {form.formState.errors.value ? (
              <div className="text-xs text-red-600">
                {form.formState.errors.value.message}
              </div>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label>说明</Label>
            <Textarea rows={3} {...form.register("description")} />
          </div>
          {updateMutation.error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {asErrorMessage(updateMutation.error)}
            </div>
          ) : null}
        </div>
      </FormDrawer>
    </PageContainer>
  );
}

function formatEditableValue(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function parseSettingValue(value: string) {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed !== "" && !Number.isNaN(Number(trimmed))) return Number(trimmed);
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    return JSON.parse(trimmed) as unknown;
  }
  return value;
}
