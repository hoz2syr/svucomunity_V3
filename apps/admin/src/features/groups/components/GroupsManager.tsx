"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Trash2, Search, Loader2, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@svu-community/ui/components/ui/table";
import { Button } from "@svu-community/ui/components/ui/button";
import { Input } from "@svu-community/ui/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@svu-community/ui/components/ui/alert-dialog";
import { Skeleton } from "@svu-community/ui/components/ui/skeleton";
import type { Group } from "@svu-community/types";
import { getGroups, deleteGroup } from "../../../services/api";

const PAGE_SIZE = 10;

interface EnrichedGroup extends Group {
  courseCode?: string;
  courseName?: string;
  courseMajor?: string;
}

export function GroupsManager() {
  const [groups, setGroups] = useState<EnrichedGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const deleteTarget = groups.find((g) => g.id === deleteTargetId) ?? null;

  const fetchGroups = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getGroups();
      const enriched: EnrichedGroup[] = data.map((g) => ({
        ...g,
        courseCode: (g as unknown as { courses?: { code: string } }).courses?.code,
        courseName: (g as unknown as { courses?: { name: string } }).courses?.name,
        courseMajor: (g as unknown as { courses?: { major: string } }).courses?.major,
      }));
      setGroups(enriched);
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل تحميل المجموعات";
      setFetchError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchGroups();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.courseCode ?? "").toLowerCase().includes(q) ||
        (g.courseName ?? "").toLowerCase().includes(q) ||
        (g.courseMajor ?? "").toLowerCase().includes(q),
    );
  }, [groups, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await deleteGroup(deleteTargetId);
      setGroups((prev) => prev.filter((g) => g.id !== deleteTargetId));
      toast.success("تم حذف المجموعة بنجاح");
      setDeleteTargetId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل حذف المجموعة";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const renderPaginationItems = () => {
    const items: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (safePage > 2) items.push("ellipsis");
      if (safePage > 1) items.push(safePage - 1);
      items.push(safePage);
      if (safePage < totalPages) items.push(safePage + 1);
      if (safePage < totalPages - 1) items.push("ellipsis");
      items.push(totalPages);
    }
    return items;
  };

  return (
    <div dir="rtl" className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="بحث عن مجموعة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {fetchError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {fetchError}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم المجموعة</TableHead>
              <TableHead>المقرر</TableHead>
              <TableHead>رمز المقرر</TableHead>
              <TableHead>التخصص</TableHead>
              <TableHead>الأعضاء</TableHead>
              <TableHead>تاريخ الإنشاء</TableHead>
              <TableHead className="text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  {search ? "لا توجد نتائج مطابقة للبحث" : "لا توجد مجموعات بعد"}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((group) => {
                const memberCount =
                  (group as unknown as { member_count?: number }).member_count ?? 0;
                return (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{group.courseName ?? group.course_id}</TableCell>
                    <TableCell className="font-mono">{group.courseCode ?? "—"}</TableCell>
                    <TableCell>{group.courseMajor ?? "—"}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm text-slate-300">
                        <Users className="size-3.5 text-slate-400" />
                        {memberCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(group.created_at).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTargetId(group.id)}
                          aria-label="حذف"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {deleteTarget && (
        <AlertDialog
          open
          onOpenChange={(open) => {
            if (!open) setDeleteTargetId(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف المجموعة {deleteTarget.name}؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> جاري الحذف...
                  </>
                ) : (
                  "حذف"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
