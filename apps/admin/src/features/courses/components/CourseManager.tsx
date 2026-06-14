"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@svu-community/ui/components/ui/table";
import { Button } from "@svu-community/ui/components/ui/button";
import { Input } from "@svu-community/ui/components/ui/input";
import { Badge } from "@svu-community/ui/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@svu-community/ui/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@svu-community/ui/components/ui/alert-dialog";
import { Skeleton } from "@svu-community/ui/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@svu-community/ui/components/ui/pagination";
import type { Course } from "@svu-community/types";
import { getCourses, createCourse, updateCourse, deleteCourse } from "../../../services/api";

const PAGE_SIZE = 10;

interface CourseFormData {
  code: string;
  name: string;
  name_ar: string;
  major: string;
  description: string;
  credits: string;
  semester: string;
  is_active: boolean;
}

const emptyForm: CourseFormData = {
  code: "",
  name: "",
  name_ar: "",
  major: "",
  description: "",
  credits: "",
  semester: "",
  is_active: true,
};

function isRecord(value: Partial<Course> | CourseFormData): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export default function CourseManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل تحميل المقررات";
      setFetchError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCourses();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.name_ar ?? "").toLowerCase().includes(q) ||
        c.major.toLowerCase().includes(q),
    );
  }, [courses, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingId(course.id);
    setForm({
      code: course.code,
      name: course.name,
      name_ar: course.name_ar ?? "",
      major: course.major,
      description: course.description ?? "",
      credits: String(course.credits ?? ""),
      semester: String(course.semester ?? ""),
      is_active: course.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.name || !form.major) {
      toast.error("يرجى ملء الحقول المطلوبة: رمز المقرر، الاسم، والتخصص");
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<Course> = {
        code: form.code,
        name: form.name,
        name_ar: form.name_ar || null,
        major: form.major,
        description: form.description || null,
        is_active: form.is_active,
      };
      if (editingId) {
        const updated = await updateCourse(editingId, payload);
        setCourses((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
        toast.success("تم تعديل المقرر بنجاح");
      } else {
        const created = await createCourse(payload);
        setCourses((prev) => [created, ...prev]);
        toast.success("تم إضافة المقرر بنجاح");
      }
      setDialogOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشلت العملية";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (course: Course) => {
    try {
      const updated = await updateCourse(course.id, { is_active: !course.is_active });
      setCourses((prev) => prev.map((c) => (c.id === course.id ? updated : c)));
      toast.success(updated.is_active ? "تم تفعيل المقرر" : "تم تعطيل المقرر");
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل تغيير الحالة";
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCourse(deleteTarget.id);
      setCourses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success("تم حذف المقرر بنجاح");
      setDeleteTarget(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل حذف المقرر";
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن مقرر..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="size-4" />
          إضافة مقرر
        </Button>
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
              <TableHead>رمز المقرر</TableHead>
              <TableHead>الاسم (عربي)</TableHead>
              <TableHead>الاسم (إنجليزي)</TableHead>
              <TableHead>التخصص</TableHead>
              <TableHead>الساعات</TableHead>
              <TableHead>الفصل</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                  {search ? "لا توجد نتائج مطابقة للبحث" : "لا توجد مقررات بعد"}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-mono font-medium">{course.code}</TableCell>
                  <TableCell>{course.name_ar ?? "—"}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.major}</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>
                    <Badge
                      variant={course.is_active ? "default" : "secondary"}
                      className="cursor-pointer select-none"
                      onClick={() => handleToggle(course)}
                    >
                      {course.is_active ? "نشط" : "معطل"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(course)}
                        aria-label="تعديل"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <AlertDialog open={deleteTarget?.id === course.id} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(course)}
                            aria-label="حذف"
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف المقرر {course.code} - {course.name}؟ لا يمكن التراجع عن هذا الإجراء.
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
                                <><Loader2 className="size-4 animate-spin" /> جاري الحذف...</>
                              ) : (
                                "حذف"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && filtered.length > PAGE_SIZE && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
                className={safePage <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {renderPaginationItems().map((item, idx) => (
              <PaginationItem key={idx}>
                {item === "ellipsis" ? (
                  <span className="flex size-9 items-center justify-center">…</span>
                ) : (
                  <PaginationLink
                    href="#"
                    isActive={item === safePage}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(item);
                    }}
                  >
                    {item}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
                className={safePage >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "تعديل مقرر" : "إضافة مقرر جديد"}</DialogTitle>
            <DialogDescription>
              {editingId ? "قم بتعديل بيانات المقرر" : "أدخل بيانات المقرر الجديد"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">رمز المقرر *</label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="CS101"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">التخصص *</label>
                <Input
                  value={form.major}
                  onChange={(e) => setForm({ ...form, major: e.target.value })}
                  placeholder="Computer Science"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الاسم (إنجليزي) *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Introduction to Programming"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الاسم (عربي)</label>
              <Input
                value={form.name_ar}
                onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                placeholder="مقدمة في البرمجة"
                dir="rtl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">الساعات</label>
                <Input
                  value={form.credits}
                  onChange={(e) => setForm({ ...form, credits: e.target.value })}
                  placeholder="3"
                  type="number"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الفصل</label>
                <Input
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  placeholder="1"
                  type="number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الوصف</label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف المقرر (اختياري)"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="size-4 rounded border-gray-300"
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                المقرر نشط
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <><Loader2 className="size-4 animate-spin" /> جاري الحفظ...</>
              ) : editingId ? (
                "حفظ التعديلات"
              ) : (
                "إضافة"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
