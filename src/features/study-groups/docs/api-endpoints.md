# واجهات Backend - المجموعات الدراسية

## Base URL

```
/api/study-groups
```

## المصادقة

جميع الـ endpoints تتطلب مصادقة عبر JWT Token في Header:

```
Authorization: Bearer <token>
```

---

## 1. GET /api/study-groups

جلب جميع المجموعات مع معلومات المنشئين.

### الاستجابة الناجحة (200)

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "مجموعة مراجعة C1",
      "courseName": "الرياضيات",
      "courseCode": "MATH101",
      "classNumber": "C1",
      "doctorName": "د. أحمد",
      "major": "علوم الحاسب",
      "maxMembers": 10,
      "currentMembers": 5,
      "whatsappLink": "https://chat.whatsapp.com/...",
      "groupLink": "https://teams.microsoft.com/...",
      "isFull": false,
      "creatorId": "uuid",
      "creatorName": "Ali Hassan",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

### معاملات الاستعلام

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `search` | string? | بحث في الاسم/المادة/الدكتور |
| `major` | string? | تصفية حسب التخصص |
| `courseCode` | string? | تصفية حسب كود المادة |
| `classNumber` | string? | تصفية حسب الفصل |
| `status` | 'all' \| 'available' \| 'full'? | تصفية حسب الحالة |
| `page` | number? | رقم الصفحة (افتراضي: 1) |
| `limit` | number? | عدد النتائج (افتراضي: 20) |

### أمثلة

```
GET /api/study-groups?major=CS&status=available
GET /api/study-groups?search=رياضيات&classNumber=C1
```

---

## 2. POST /api/study-groups

إنشاء مجموعة دراسية جديدة.

### الطلب

```json
{
  "name": "مجموعة مراجعة الخوارزميات",
  "courseName": "الخوارزميات",
  "courseCode": "CS201",
  "classNumber": "C3",
  "major": "علوم الحاسب",
  "maxMembers": 10,
  "whatsappLink": "https://chat.whatsapp.com/...",
  "groupLink": "https://teams.microsoft.com/...",
  "doctorName": "د. محمد"
}
```

### القواعد والقيود

| الحقل | القواعد |
|--------|---------|
| `name` | مطلوب، 3-100 حرف |
| `courseName` | مطلوب |
| `courseCode` | مطلوب، حروف كبيرة |
| `major` | مطلوب |
| `maxMembers` | مطلوب، بين 2 و 20 |
| `whatsappLink` | مطلوب، صالح كـ URL |
| `groupLink` | اختياري، صالح كـ URL |

### الاستجابة الناجحة (201)

```json
{
  "id": "uuid",
  "name": "مجموعة مراجعة الخوارزميات",
  "courseName": "الخوارزميات",
  "courseCode": "CS201",
  "classNumber": "C3",
  "major": "علوم الحاسب",
  "maxMembers": 10,
  "currentMembers": 1,
  "whatsappLink": "https://chat.whatsapp.com/...",
  "groupLink": "https://teams.microsoft.com/...",
  "isFull": false,
  "creatorId": "uuid",
  "creatorName": "Ali Hassan",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### الأخطاء المحتملة

| الحالة | الكود | الوصف |
|--------|-------|-------|
| 400 |VALIDATION_ERROR | بيانات غير صحيحة |
| 401 | UNAUTHORIZED | لم يتم تسجيل الدخول |
| 500 | INTERNAL_ERROR | خطأ في الخادم |

---

## 3. POST /api/study-groups/:id/join

الانضمام لمجموعة دراسية.

### الاستجابة الناجحة (200)

```json
{
  "groupId": "uuid",
  "userId": "uuid",
  "joinedAt": "2024-01-15T10:30:00Z",
  "currentMembers": 6
}
```

### الأخطاء المحتملة

| الحالة | الكود | الوصف |
|--------|-------|-------|
| 400 | GROUP_FULL | المجموعة ممتلئة |
| 401 | UNAUTHORIZED | لم يتم تسجيل الدخول |
| 409 | ALREADY_MEMBER | المستخدم عضو مسبقاً |
| 404 | NOT_FOUND | المجموعة غير موجودة |

---

## 4. DELETE /api/study-groups/:id

حذف مجموعة دراسية.

### شروط الصلاحية

- المنشئ فقط
- المدير العام (`isAdmin = true`)

### الاستجابة الناجحة (204)

لا يوجد محتوى.

### الأخطاء المحتملة

| الحالة | الكود | الوصف |
|--------|-------|-------|
| 401 | UNAUTHORIZED | لم يتم تسجيل الدخول |
| 403 | FORBIDDEN | ليس لديك صلاحية الحذف |
| 404 | NOT_FOUND | المجموعة غير موجودة |

---

## 5. GET /api/study-groups/majors

جلب قائمة التخصصات المتاحة.

### الاستجابة الناجحة (200)

```json
{
  "data": [
    "علوم الحاسب",
    "الهندسة",
    "الطب",
    "الصيدلة",
    "إدارة الأعمال"
  ]
}
```

---

## 6. GET /api/study-groups/courses

جلب المواد حسب التخصص.

### معاملات الاستعلام

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `major` | string | مطلوب - اسم التخصص |

### الاستجابة الناجحة (200)

```json
{
  "data": [
    {
      "code": "CS101",
      "name": "مقدمة في علوم الحاسب"
    },
    {
      "code": "CS201",
      "name": "هياكل البيانات"
    }
  ]
}
```

---

## نماذج الطلبات والاستجابات

### نموذج CreateGroupData

```typescript
interface CreateGroupData {
  name: string;
  courseName: string;
  courseCode: string;
  classNumber: string;
  major: string;
  maxMembers: number;
  whatsappLink: string;
  groupLink?: string;
  doctorName?: string;
}
```

### نموذج StudyGroup

```typescript
interface StudyGroup {
  id: string;
  name: string;
  courseName: string;
  courseCode: string;
  classNumber?: string;
  doctorName?: string;
  major: string;
  maxMembers: number;
  currentMembers: number;
  whatsappLink: string;
  groupLink?: string;
  isFull: boolean;
  creatorId: string;
  creatorName: string;
  createdAt: string;
}
```

### نموذج GroupMember

```typescript
interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  joinedAt: string;
}
```

---

## قواعد الأمان

### صلاحيات القراءة

- ✅ الجميع يمكنهم رؤية المجموعات
- ✅ البحث والفلترة متاحة للجميع

### صلاحيات الإنشاء

- ✅ المستخدمون المسجلون فقط يمكنهم إنشاء مجموعات
- ✅ المنشئ يصبح عضو تلقائياً

### صلاحيات الحذف

- ✅ المنشئ فقط
- ✅ المدير العام (`isAdmin = true`)

### صلاحيات الانضمام

- ✅ المستخدم المسجل فقط
- ❌ لا يمكن الانضمام أكثر من مرة لنفس المجموعة
- ❌ لا يمكن الانضمام لمجموعة ممتلئة

---

## ملاحظات التطوير

### التنفيذ المقترح

1. **Phase 1**: GET جميع المجموعات + GET مواد + GET تخصصات
2. **Phase 2**: POST إنشاء مجموعة + POST انضمام
3. **Phase 3**: DELETE حذف مجموعة

### التحقق من الصحة

- استخدام Zod أو Joi للتحقق من المدخلات
- التحقق من صحة URLs (whatsappLink و groupLink)

### الأمان

- جميع الـ endpoints محمية بـ JWT
- استخدام RLS (Row Level Security) في Supabase
- التحقق من `is_admin` على مستوى الخدمة

### الأداء

- إضافة índices على:
  - `groups.major`
  - `groups.course_code`
  - `groups.created_at`
  - `group_members.group_id`
  - `group_members.user_id`

---

## ملخص الـ Endpoints

| Method | المسار | الوصف | المصادقة |
|--------|---------|-------|----------|
| GET | /api/study-groups | جلب جميع المجموعات | مطلوبة |
| POST | /api/study-groups | إنشاء مجموعة | مطلوبة |
| POST | /api/study-groups/:id/join | الانضمام لمجموعة | مطلوبة |
| DELETE | /api/study-groups/:id | حذف مجموعة | مطلوبة |
| GET | /api/study-groups/majors | جلب التخصصات | مطلوبة |
| GET | /api/study-groups/courses | جلب المواد | مطلوبة |
