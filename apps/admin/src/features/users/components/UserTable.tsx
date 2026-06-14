"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Download,
  Loader2,
  ShieldCheck,
  ShieldOff,
  UserCircle2,
  UserRound,
  UserRoundCheck,
  UserRoundX,
  View,
} from "lucide-react";
import {
  Row,
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

export interface UsersFilters {
  search: string;
  role: UserRole | "all";
  status: UserStatus | "all";
}

export interface UsersPagination {
  page: number;
  pageSize: number;
}

export interface UsersQuery extends UsersFilters, UsersPagination {}

export interface UsersTableProps {
  users: UserRecord[];
  pagination: UsersPagination;
  totalItems: number;
  onPaginationChange: (next: UsersPagination) => void;
  onFiltersChange: (next: UsersFilters) => void;
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
  new Intl.DateTimeFormat("en", {
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

function UsersTableComponent({
  users,
  pagination,
  totalItems,
  onPaginationChange,
  onFiltersChange,
  onBulkExport,
  onToggleAdmin,
  onToggleStatus,
  onViewDetails,
  selectedIds,
  onSelectedIdsChange,
  isLoading = false,
}: UsersTableProps) {
  const [filters, setFilters] = useState<UsersFilters>({
    search: "",
    role: "all",
    status: "all",
  });

  const startIndex = (pagination.page - 1) * pagination.pageSize;
  const paginatedUsers = useMemo(
    () => users.slice(startIndex, startIndex + pagination.pageSize),
    [users, startIndex, pagination.pageSize],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(totalItems, users.length) / pagination.pageSize),
  );

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

  const handleFiltersChange = useCallback(
    (update: Partial<UsersFilters>) => {
      const next = { ...filters, ...update };
      setFilters(next);
      onFiltersChange(next);
      onPaginationChange({ ...pagination, page: 1 });
    },
    [filters, onFiltersChange, onPaginationChange, pagination],
  );

  const handlePaginationChange = useCallback(
    (update: Partial<UsersPagination>) => {
      const next = { ...pagination, ...update };
      onPaginationChange(next);
    },
    [onPaginationChange, pagination],
  );

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

  const handleToggleAdmin = useCallback(
    (user: UserRecord) => {
      onToggleAdmin(user, user.role !== "admin");
    },
    [onToggleAdmin],
  );

  const handleToggleStatus = useCallback(
    (user: UserRecord) => {
      onToggleStatus(user, user.status === "active" ? "inactive" : "active");
    },
    [onToggleStatus],
  );

  useEffect(() => {
    setFilters({
      search: "",
      role: "all",
      status: "all",
    });
  }, [users]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-sm text-slate-300">
          Search
          <input
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400"
            placeholder="Email or username"
            value={filters.search}
            onChange={(event) =>
              handleFiltersChange({ search: event.target.value })
            }
          />
        </label>

        <label className="flex min-w-[160px] flex-col gap-1 text-sm text-slate-300">
          Role
          <div className="relative">
            <select
              className="h-full w-full appearance-none rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={filters.role}
              onChange={(event) =>
                handleFiltersChange({
                  role: event.target.value as UsersFilters["role"],
                })
              }
            >
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          </div>
        </label>

        <label className="flex min-w-[160px] flex-col gap-1 text-sm text-slate-300">
          Status
          <div className="relative">
            <select
              className="h-full w-full appearance-none rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={filters.status}
              onChange={(event) =>
                handleFiltersChange({
                  status: event.target.value as UsersFilters["status"],
                })
              }
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          </div>
        </label>

        <button
          className="inline-flex items-center gap-2 self-end rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={filteredSelectedCount === 0 || isLoading}
          onClick={handleExport}
        >
          <Download className="size-4" />
          Export CSV
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
            <UiTableHead>Email</UiTableHead>
            <UiTableHead>Username</UiTableHead>
            <UiTableHead>Full name</UiTableHead>
            <UiTableHead>Role</UiTableHead>
            <UiTableHead>Status</UiTableHead>
            <UiTableHead>Created</UiTableHead>
            <UiTableHead className="text-right">Actions</UiTableHead>
          </UiTableRow>
        </UiTableHeader>
        <UiTableBody>
          {isLoading ? (
            Array.from({ length: pagination.pageSize }).map((_, index) => (
              <SkeletonRow key={`skeleton-${index}`} />
            ))
          ) : paginatedUsers.length === 0 ? (
            <UiTableRow>
              <UiTableCell colSpan={8} className="h-40 text-center text-sm text-slate-400">
                No users match the current filters.
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
                        title="View details"
                        type="button"
                      >
                        <View className="size-3.5" />
                        View
                      </button>
                      <button
                        className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white transition-colors hover:bg-white/10"
                        onClick={() => handleToggleAdmin(user)}
                        title={admin ? "Revoke admin access" : "Promote to admin"}
                        type="button"
                      >
                        {admin ? (
                          <>
                            <ShieldOff className="size-3.5" />
                            Revoke admin
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="size-3.5" />
                            Make admin
                          </>
                        )}
                      </button>
                      <button
                        className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white transition-colors hover:bg-white/10"
                        onClick={() => handleToggleStatus(user)}
                        title={active ? "Deactivate user" : "Activate user"}
                        type="button"
                      >
                        {active ? (
                          <>
                            <UserRoundX className="size-3.5" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserRoundCheck className="size-3.5" />
                            Activate
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
        <UiTableFooter>
          <UiTableRow>
            <UiTableCell colSpan={8} className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
              <span>
                Showing {isLoading ? "..." : `${startIndex + 1}-${Math.min(startIndex + pagination.pageSize, users.length)}`} of{" "}
                {users.length} users
                {filteredSelectedCount > 0
                  ? ` • ${filteredSelectedCount} selected`
                  : ""}
              </span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  Rows per page
                  <select
                    className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
                    value={pagination.pageSize}
                    onChange={(event) =>
                      handlePaginationChange({
                        pageSize: Number(event.target.value),
                        page: 1,
                      })
                    }
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
                    disabled={pagination.page <= 1 || isLoading}
                    onClick={() =>
                      handlePaginationChange({ page: pagination.page - 1 })
                    }
                    type="button"
                  >
                    Previous
                  </button>
                  <span className="px-2 text-xs text-slate-300">
                    {isLoading ? "..." : `${pagination.page} / ${totalPages}`}
                  </span>
                  <button
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={pagination.page >= totalPages || isLoading}
                    onClick={() =>
                      handlePaginationChange({ page: pagination.page + 1 })
                    }
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </div>
            </UiTableCell>
          </UiTableRow>
        </UiTableFooter>
      </UiTable>
    </div>
  );
}

export const UserTable = UsersTableComponent;
