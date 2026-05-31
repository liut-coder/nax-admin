import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit2, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FormDrawer } from "@/components/shared/FormDrawer";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listPermissions, rolesApi } from "@/features/admin/api";
import type { PermissionRecord, RoleRecord } from "@/features/admin/types";
import { asErrorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

const roleSchema = z.object({
  key: z.string().min(2, "角色标识至少 2 位"),
  name: z.string().min(1, "请输入角色名称"),
  description: z.string().default(""),
  permissionIds: z.array(z.string()).default([]),
});

type RoleFormValues = z.infer<typeof roleSchema>;

const defaultValues: RoleFormValues = {
  key: "",
  name: "",
  description: "",
  permissionIds: [],
};

export function AdminRolesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);
  const [deleteRole, setDeleteRole] = useState<RoleRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const rolesQuery = useQuery({
    queryKey: ["admin", "roles", page, search],
    queryFn: () =>
      rolesApi.list({ page, pageSize: 10, q: search || undefined }),
  });
  const permissionsQuery = useQuery({
    queryKey: ["admin", "permissions", "all"],
    queryFn: () => listPermissions({ page: 1, pageSize: 100 }),
  });

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues,
  });

  const saveMutation = useMutation({
    mutationFn: (values: RoleFormValues) => {
      if (editingRole) {
        return rolesApi.update(editingRole.id, {
          name: values.name,
          description: values.description,
          permissionIds: values.permissionIds,
        });
      }
      return rolesApi.create(values);
    },
    onSuccess: () => {
      setDrawerOpen(false);
      setEditingRole(null);
      form.reset(defaultValues);
      void queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rolesApi.remove(id),
    onSuccess: () => {
      setDeleteRole(null);
      void queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
    },
  });

  function openCreate() {
    setEditingRole(null);
    form.reset(defaultValues);
    setDrawerOpen(true);
  }

  const openEdit = useCallback(
    async (role: RoleRecord) => {
      setEditingRole(role);
      const detail = await rolesApi.get(role.id);
      form.reset({
        key: detail.key,
        name: detail.name,
        description: detail.description,
        permissionIds:
          detail.permissions?.map((permission) => permission.id) ?? [],
      });
      setDrawerOpen(true);
    },
    [form],
  );

  const rows = rolesQuery.data?.items ?? [];
  const pagination = rolesQuery.data?.pagination;
  const permissions = permissionsQuery.data?.items ?? [];
  const groupedPermissions = groupPermissions(permissions);

  const columns = useMemo<ColumnDef<RoleRecord>[]>(
    () => [
      {
        accessorKey: "name",
        header: "角色",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.key}
            </div>
          </div>
        ),
      },
      { accessorKey: "description", header: "描述" },
      {
        accessorKey: "isSystem",
        header: "类型",
        cell: ({ row }) =>
          row.original.isSystem ? (
            <StatusBadge tone="info">系统内置</StatusBadge>
          ) : (
            <StatusBadge tone="offline">自定义</StatusBadge>
          ),
      },
      {
        accessorKey: "updatedAt",
        header: "更新时间",
        cell: ({ row }) => formatDateTime(row.original.updatedAt),
      },
      {
        id: "actions",
        header: "操作",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void openEdit(row.original)}
            >
              <Edit2 className="h-4 w-4" />
              编辑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600"
              disabled={row.original.isSystem}
              onClick={() => setDeleteRole(row.original)}
            >
              <Trash2 className="h-4 w-4" />
              删除
            </Button>
          </div>
        ),
      },
    ],
    [openEdit],
  );

  return (
    <PageContainer>
      <PageHeader
        title="角色管理"
        description="维护角色、权限集合和访问边界"
        actions={
          <PermissionGate permission="role:create" fallback={null}>
            <Button onClick={openCreate}>
              <ShieldCheck className="h-4 w-4" />
              新建角色
            </Button>
          </PermissionGate>
        }
      />
      <div className="mt-6 space-y-5">
        <FilterBar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="搜索角色标识或名称"
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
                数据来自 /api/v1/roles
              </span>
              {rolesQuery.error ? (
                <span className="text-sm text-red-600">
                  {asErrorMessage(rolesQuery.error)}
                </span>
              ) : null}
            </div>
          }
        />
      </div>

      <FormDrawer
        open={drawerOpen}
        title={editingRole ? "编辑角色" : "新建角色"}
        description="权限勾选会同步到 role_permissions 关系"
        onClose={() => setDrawerOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              取消
            </Button>
            <Button
              onClick={form.handleSubmit((values) =>
                saveMutation.mutate(values),
              )}
              disabled={saveMutation.isPending}
            >
              <Plus className="h-4 w-4" />
              {saveMutation.isPending ? "保存中" : "保存"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <Field label="角色标识" error={form.formState.errors.key?.message}>
            <Input disabled={Boolean(editingRole)} {...form.register("key")} />
          </Field>
          <Field label="角色名称" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <Field label="描述">
            <Textarea rows={3} {...form.register("description")} />
          </Field>
          <div className="grid gap-2">
            <Label>权限</Label>
            <div className="max-h-[360px] overflow-auto rounded-md border p-3">
              {Object.entries(groupedPermissions).map(([resource, items]) => (
                <div
                  key={resource}
                  className="border-b py-3 first:pt-0 last:border-0"
                >
                  <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                    {resource}
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {items.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-center gap-3 text-sm"
                      >
                        <Checkbox
                          checked={form
                            .watch("permissionIds")
                            .includes(permission.id)}
                          onCheckedChange={(checked) => {
                            const current = form.getValues("permissionIds");
                            form.setValue(
                              "permissionIds",
                              checked
                                ? [...current, permission.id]
                                : current.filter(
                                    (item) => item !== permission.id,
                                  ),
                              { shouldValidate: true },
                            );
                          }}
                        />
                        <span>{permission.key}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {saveMutation.error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {asErrorMessage(saveMutation.error)}
            </div>
          ) : null}
        </div>
      </FormDrawer>

      <ConfirmDialog
        open={Boolean(deleteRole)}
        title="删除角色"
        description={`确认删除 ${deleteRole?.name ?? ""}？系统内置角色不会允许删除。`}
        confirmText={deleteMutation.isPending ? "删除中" : "删除"}
        onOpenChange={(open) => !open && setDeleteRole(null)}
        onConfirm={() => deleteRole && deleteMutation.mutate(deleteRole.id)}
      />
    </PageContainer>
  );
}

function groupPermissions(items: PermissionRecord[]) {
  return items.reduce<Record<string, PermissionRecord[]>>((groups, item) => {
    groups[item.resource] ??= [];
    groups[item.resource].push(item);
    return groups;
  }, {});
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <div className="text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
