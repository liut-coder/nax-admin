import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  createCrudApi,
  type ListQuery,
  type PageResult,
} from "@/lib/api";
import type {
  AuditLogRecord,
  CreateDictionaryItemPayload,
  CreateDictionaryPayload,
  CreateRolePayload,
  CreateUserPayload,
  DictionaryItemRecord,
  DictionaryRecord,
  FileRecord,
  PermissionRecord,
  RoleRecord,
  SettingRecord,
  UpdateDictionaryItemPayload,
  UpdateDictionaryPayload,
  UpdateRolePayload,
  UpdateSettingPayload,
  UpdateUserPayload,
  UserRecord,
} from "./types";

export interface HealthStatus {
  status: string;
  uptime: number;
  timestamp: string;
}

export function getHealth() {
  return apiGet<HealthStatus>("/health/");
}

export const usersApi = createCrudApi<
  UserRecord,
  CreateUserPayload,
  UpdateUserPayload
>("/users");

export const rolesApi = createCrudApi<
  RoleRecord,
  CreateRolePayload,
  UpdateRolePayload
>("/roles");

export const dictionariesApi = createCrudApi<
  DictionaryRecord,
  CreateDictionaryPayload,
  UpdateDictionaryPayload
>("/dictionaries");

export function listDictionaries(
  params?: ListQuery & { enabled?: boolean },
): Promise<PageResult<DictionaryRecord>> {
  return apiGet<PageResult<DictionaryRecord>>("/dictionaries", { params });
}

export function getDictionaryByKey(key: string) {
  return apiGet<DictionaryRecord>(`/dictionaries/key/${key}`);
}

export function createDictionaryItem(
  dictionaryId: string,
  body: CreateDictionaryItemPayload,
) {
  return apiPost<DictionaryItemRecord, CreateDictionaryItemPayload>(
    `/dictionaries/${dictionaryId}/items`,
    body,
  );
}

export function updateDictionaryItem(
  itemId: string,
  body: UpdateDictionaryItemPayload,
) {
  return apiPatch<DictionaryItemRecord, UpdateDictionaryItemPayload>(
    `/dictionaries/items/${itemId}`,
    body,
  );
}

export function deleteDictionaryItem(itemId: string) {
  return apiDelete<{ deleted: true }>(`/dictionaries/items/${itemId}`);
}

export function listPermissions(
  params?: ListQuery & { resource?: string },
): Promise<PageResult<PermissionRecord>> {
  return apiGet<PageResult<PermissionRecord>>("/permissions", { params });
}

export function listSettings(
  params?: ListQuery,
): Promise<PageResult<SettingRecord>> {
  return apiGet<PageResult<SettingRecord>>("/settings", { params });
}

export function updateSetting(key: string, body: UpdateSettingPayload) {
  return apiPut<SettingRecord, UpdateSettingPayload>(`/settings/${key}`, body);
}

export function listAuditLogs(
  params?: ListQuery & {
    actorUserId?: string;
    resource?: string;
    action?: string;
  },
): Promise<PageResult<AuditLogRecord>> {
  return apiGet<PageResult<AuditLogRecord>>("/audit-logs", { params });
}

export function listFiles(params?: ListQuery): Promise<PageResult<FileRecord>> {
  return apiGet<PageResult<FileRecord>>("/files", { params });
}

export function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiPost<FileRecord, FormData>("/files/upload", formData);
}
