"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Download,
  Loader2,
  ShieldCheck,
  ShieldOff,
  UserRound,
  UserRoundCheck,
  UserRoundX,
  View,
} from "lucide-react";
import {
  Table as UiTable,
  TableBody as UiTableBody,
  TableCell as UiTableCell,
  TableFooter as UiTableFooter,
  TableHead as UiTableHead,
  TableHeader as UiTableHeader,
  TableRow as UiTableRow,
} from "@svu-community/ui/components/ui/table";

export type UserStatus = "active" | "inactive";
export type UserRole = "admin" | "user";

export interface UserRecord {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface UsersTableProps {
  users: UserRecord[];
  onBulkExport: (selectedIds: string[]) => void;
  onToggleAdmin: (user: UserRecord, admin: boolean) => void;
  onToggleStatus: (user: UserRecord, status: UserStatus) => void;
  onViewDetails: (user: UserRecord) => void;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  isLoading?: boolean;
}

const PAGE_SIZES = [5, 10, 25];

const STATUS_VARIANTS: Record<UserStatus, string> = {
  active: "border-emerald-400 bg-emerald-500/10 text-emerald-500",
  inactive: "border-rose-400 bg-rose-500/10 text-rose-500",
};

const ROLE_VARIANTS: Record<UserRole, string> = {
  admin: "border-sky-400 bg-sky-500/10 text-sky-500",
  user: "border-slate-400 bg-slate-500/10 text-slate-500",
};

const toSentenceCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const isRecordSelected = (id: string, selectedIds: string[]) =>
  selectedIds.includes(id);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ar-SA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

function SkeletonRow() {
  return (
    <UiTableRow>
      <UiTableCell>
        <span className="inline-flex h-4 w-4 animate-pulse rounded-full border border-white/10" />
      </UiTableCell>
      <UiTableCell>
        <span className="inline-flex h-4 w-40 animate-pulse rounded-full bg-white/5" />
      </UiTableCell>
      <UiTableCell>
        <span className="inline-flex h-4 w-24 animate-pulse rounded-full bg-white/5" />
      </UiTableCell>
      <UiTableCell>
        <span className="inline-flex h-4 w-28 animate-pulse rounded-full bg-white/5" />
      </UiTableCell>
      <UiTableCell>
        <span className="inline-flex h-4 w-16 animate-pulse rounded-full bg-white/5" />
      </UiTableCell>
      <UiTableCell>
        <span className="inline-flex h-4 w-20 animate-pulse rounded-full bg-white/5" />
      </UiTableCell>
      <UiTableCell>
        <span className="inline-flex h-4 w-24 animate-pulse rounded-full bg-white/5" />
      </UiTableCell>
    </UiTableRow>
  );
}

export function UserTable({
  users,
  onBulkExport,
  onToggleAdmin,
  onToggleStatus,
  onViewDetails,
  selectedIds,
  onSelectedIdsChange,
  isLoading = false,
}: UsersTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [users, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));

  const allOnPageSelected =
    paginatedUsers.length > 0 &&
    paginatedUsers.every((user) => isRecordSelected(user.id, selectedIds));

  const someOnPageSelected =
    paginatedUsers.some((user) => isRecordSelected(user.id, selectedIds)) &&
    !allOnPageSelected;

  const filteredSelectedCount = useMemo(
    () => selectedIds.filter((id) => users.some((user) => user.id === id)).length,
    [selectedIds, users],
  );

  const handlePageSizeChange = (nextSize: number) => {
    setPageSize(nextSize);
    setPage(1);
  };

  const handleToggleAllOnPage = useCallback(() => {
    if (allOnPageSelected) {
      const idsToRemove = new Set(paginatedUsers.map((user) => user.id));
      const next = selectedIds.filter((id) => !idsToRemove.has(id));
      onSelectedIdsChange(next);
      return;
    }

    const idsToAdd = paginatedUsers
      .map((user) => user.id)
      .filter((id) => !isRecordSelected(id, selectedIds));
    onSelectedIdsChange([...selectedIds, ...idsToAdd]);
  }, [allOnPageSelected, onSelectedIdsChange, paginatedUsers, selectedIds]);

  const handleToggleRow = useCallback(
    (id: string) => {
      if (isRecordSelected(id, selectedIds)) {
        onSelectedIdsChange(selectedIds.filter((existing) => existing !== id));
      } else {
        onSelectedIdsChange([...selectedIds, id]);
      }
    },
    [onSelectedIdsChange, selectedIds],
  );

  const handleExport = useCallback(() => {
    const selectedUsers = users.filter((user) =>
      isRecordSelected(user.id, selectedIds),
    );
    onBulkExport(selectedUsers.map((user) => user.id));
  }, [onBulkExport, selectedIds, users]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <button
          className="inline-flex items-center gap-2 self-end rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={filteredSelectedCount === 0 || isLoading}
          onClick={handleExport}
        >
          <Download className="size-4" />
          تصدير CSV
        </button>
      </div>

      <UiTable>
        <UiTableHeader>
          <UiTableRow>
            <UiTableHead className="w-10">
              <input
                aria-label="Select all users on this page"
                checked={allOnPageSelected}
                ref={(element) => {
                  if (element) element.indeterminate = someOnPageSelected;
                }}
                className="size-4 rounded border border-white/20 bg-white/5 accent-white"
                onChange={handleToggleAllOnPage}
                type="checkbox"
              />
            </UiTableHead>
            <UiTableHead>البريد الإلكتروني</UiTableHead>
            <UiTableHead>اسم المستخدم</UiTableHead>
            <UiTableHead>الاسم الكامل</UiTableHead>
            <UiTableHead>الصلاحية</UiTableHead>
            <UiTableHead>الحالة</UiTableHead>
            <UiTableHead>تاريخ الإنشاء</UiTableHead>
            <UiTableHead className="text-right">الإجراءات</UiTableHead>
          </UiTableRow>
        </UiTableHeader>
        <UiTableBody>
          {isLoading ? (
            Array.from({ length: pageSize }).map((_, index) => (
              <SkeletonRow key={`skeleton-${index}`} />
            ))
          ) : paginatedUsers.length === 0 ? (
            <UiTableRow>
              <UiTableCell colSpan={8} className="h-40 text-center text-sm text-slate-400">
                لا يوجد مستخدمون مطابقون.
              </UiTableCell>
            </UiTableRow>
          ) : (
            paginatedUsers.map((user) => {
              const selected = isRecordSelected(user.id, selectedIds);
              const admin = user.role === "admin";
              const active = user.status === "active";

              return (
                <UiTableRow key={user.id} data-state={selected ? "selected" : undefined}>
                  <UiTableCell>
                    <input
                      aria-label={`Select ${user.email}`}
                      checked={selected}
                      className="size-4 rounded border border-white/20 bg-white/5 accent-white"
                      onChange={() => handleToggleRow(user.id)}
                      type="checkbox"
                    />
                  </UiTableCell>
                  <UiTableCell>{user.email}</UiTableCell>
                  <UiTableCell>{user.username}</UiTableCell>
                  <UiTableCell>{user.fullName}</UiTableCell>
                  <UiTableCell>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${ROLE_VARIANTS[user.role]}`}
                    >
                      {admin ? <ShieldCheck className="size-3" /> : <UserRound className="size-3" />}
                      {toSentenceCase(user.role)}
                    </span>
                  </UiTableCell>
                  <UiTableCell>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${STATUS_VARIANTS[user.status]}`}
                    >
                      {active ? (
                        <UserRoundCheck className="size-3" />
                      ) : (
                        <UserRoundX className="size-3" />
                      )}
                      {toSentenceCase(user.status)}
                    </span>
                  </UiTableCell>
                  <UiTableCell>{formatDate(user.createdAt)}</UiTableCell>
                  <UiTableCell>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white transition-colors hover:bg-white/10"
                        onClick={() => onViewDetails(user)}
                        title="عرض التفاصيل"
                        type="button"
                      >
                        <View className="size-3.5" />
                        عرض
                      </button>
                      <button
                        className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white transition-colors hover:bg-white/10"
                        onClick={() => onToggleAdmin(user, !admin)}
                        title={admin ? "إزالة صلاحية الأدمن" : "منح صلاحية الأدمن"}
                        type="button"
                      >
                        {admin ? (
                          <>
                            <ShieldOff className="size-3.5" />
                            إزالة أدمن
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="size-3.5" />
                            منح أدمن
                          </>
                        )}
                      </button>
                      <button
                        className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white transition-colors hover:bg-white/10"
                        onClick={() => onToggleStatus(user, active ? "inactive" : "active")}
                        title={active ? "تعطيل المستخدم" : "تفعيل المستخدم"}
                        type="button"
                      >
                        {active ? (
                          <>
                            <UserRoundX className="size-3.5" />
                            تعطيل
                          </>
                        ) : (
                          <>
                            <UserRoundCheck className="size-3.5" />
                            تفعيل
                          </>
                        )}
                      </button>
                    </div>
                  </UiTableCell>
                </UiTableRow>
              );
            })
          )}
        </UiTableBody>
        {!isLoading && users.length > pageSize && (
          <UiTableFooter>
            <UiTableRow>
              <UiTableCell colSpan={8} className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
                <span>
                  {`عرض ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, users.length)} من ${users.length} مستخدم`}
                  {filteredSelectedCount > 0
                    ? ` • ${filteredSelectedCount} محدد`
                    : ""}
                </span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    صفوف في الصفحة
                    <select
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
                      value={pageSize}
                      onChange={(event) => handlePageSizeChange(Number(event.target.value))}
                    >
                      {PAGE_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={page <= 1 || isLoading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      type="button"
                    >
                      السابق
                    </button>
                    <span className="px-2 text-xs text-slate-300">
                      {isLoading ? "..." : `${page} / ${totalPages}`}
                    </span>
                    <button
                      className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={page >= totalPages || isLoading}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      type="button"
                    >
                      التالي
                    </button>
                  </div>
                </div>
              </UiTableCell>
            </UiTableRow>
          </UiTableFooter>
        )}
      </UiTable>
    </div>
  );
}
