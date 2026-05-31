import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { Button } from "@/components/ui/button";
import { listFiles, uploadFile } from "@/features/admin/api";
import type { FileRecord } from "@/features/admin/types";
import { asErrorMessage } from "@/lib/api";
import { formatBytes, formatDateTime } from "@/lib/format";

export function AdminFilesPage() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filesQuery = useQuery({
    queryKey: ["admin", "files", page, search],
    queryFn: () => listFiles({ page, pageSize: 10, q: search || undefined }),
  });

  const uploadMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: () => {
      if (inputRef.current) inputRef.current.value = "";
      void queryClient.invalidateQueries({ queryKey: ["admin", "files"] });
    },
  });

  const rows = filesQuery.data?.items ?? [];
  const pagination = filesQuery.data?.pagination;

  const columns = useMemo<ColumnDef<FileRecord>[]>(
    () => [
      {
        accessorKey: "originalName",
        header: "文件名",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.originalName}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.storedName}
            </div>
          </div>
        ),
      },
      { accessorKey: "mimeType", header: "类型" },
      {
        accessorKey: "sizeBytes",
        header: "大小",
        cell: ({ row }) => formatBytes(row.original.sizeBytes),
      },
      {
        accessorKey: "uploadedBy",
        header: "上传者",
        cell: ({ row }) => row.original.uploadedBy || "-",
      },
      {
        accessorKey: "createdAt",
        header: "上传时间",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
    ],
    [],
  );

  return (
    <PageContainer>
      <PageHeader
        title="文件管理"
        description="上传文件并查看后端文件记录"
        actions={
          <PermissionGate permission="file:upload" fallback={null}>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadMutation.mutate(file);
              }}
            />
            <Button onClick={() => inputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              {uploadMutation.isPending ? "上传中" : "上传文件"}
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
          placeholder="搜索文件名"
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
                数据来自 /api/v1/files
              </span>
              {filesQuery.error || uploadMutation.error ? (
                <span className="text-sm text-red-600">
                  {asErrorMessage(filesQuery.error || uploadMutation.error)}
                </span>
              ) : null}
            </div>
          }
        />
      </div>
    </PageContainer>
  );
}
