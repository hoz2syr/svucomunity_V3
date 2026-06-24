# مخططات UML - المجموعات الدراسية

## 1. مخطط الحالات (State Diagram)

```mermaid
stateDiagram-v2
  [*] --> Loading
  Loading --> Empty : no groups
  Loading --> Success : groups loaded
  Loading --> Error : fetch failed
  Empty --> Loading : reload
  Success --> Loading : filters changed
  Success --> Error : fetch failed
  Error --> Loading : retry clicked

  state Success {
    [*] --> Idle
    Idle --> Filtering : search/change filter
    Filtering --> Idle : filter applied
  }
```

## 2. مخطط الفصل (Component Diagram)

```mermaid
graph TB
  subgraph Frontend
    Home[StudyGroupsHome]
    Filters[StudyGroupsFilters]
    Card[GroupCard]
    Skeleton[StudyGroupCardSkeleton]
    ErrorComp[ErrorBoundary]
    ErrorState[ErrorState]
    CreateModal[CreateGroupModal]
    DetailsModal[GroupDetailsModal]
    ModalShell[ModalShell]
    Button[PrimaryButton]
    Progress[ProgressBar]
    Dropdown[Dropdown]
  end

  subgraph Hooks
    useStudyGroups[useStudyGroups]
    useActions[useStudyGroupsActions]
    usePage[useStudyGroupsPage]
    useDebounce[useDebounce]
  end

  subgraph Services
    SBService[studyGroup.supabase]
    Catalog[courseCatalog]
  end

  subgraph Backend
    API[Supabase API]
    GroupsTable[groups]
    MembersTable[group_members]
    UsersTable[users]
  end

  Home --> Filters
  Home --> Card
  Home --> Skeleton
  Home --> ErrorState
  Home --> CreateModal
  Home --> DetailsModal

  Card --> Progress
  Filters --> Dropdown

  CreateModal --> ModalShell
  DetailsModal --> ModalShell

  Home --> usePage
  usePage --> useStudyGroups
  usePage --> useActions

  useStudyGroups --> useDebounce
  useStudyGroups --> SBService
  useActions --> SBService

  SBService --> Catalog
  SBService --> API

  API --> GroupsTable
  API --> MembersTable
  API --> UsersTable
```

## 3. مخطط التسلسل - إنشاء مجموعة (Create Group)

```mermaid
sequenceDiagram
  participant U as User
  participant M as CreateGroupModal
  participant H as useStudyGroupsPage
  participant A as useStudyGroupsActions
  participant S as studyGroupService
  participant DB as Supabase

  U->>M: يملأ النموذج ويضغط إنشاء
  M->>M: validate() البيانات
  M->>H: onSubmit(data)
  H->>A: handleCreateGroup(data)
  A->>S: createGroup(data)
  S->>DB: INSERT INTO groups
  DB-->>S: group created
  S->>DB: INSERT into group_members (creator)
  DB-->>S: member added
  S-->>A: return StudyGroup
  A->>H: reload()
  H->>S: getAllWithCreators()
  S-->>H: groups[]
  H-->>M: update state (optional close)
  M->>U: إغلاق النافذة + رسالة نجاح
```

## 4. مخطط التسلسل - الانضمام لمجموعة

```mermaid
sequenceDiagram
  participant U as User
  participant D as GroupDetailsModal
  participant H as useStudyGroupsPage
  participant A as useStudyGroupsActions
  participant S as studyGroupService
  participant DB as Supabase

  U->>D: يضغط "انضم للمجموعة"
  D->>H: onJoin(groupId)
  H->>A: handleJoinGroup(groupId)
  A->>S: checkMembership(groupId, userId)
  S-->>A: false
  A->>S: joinGroup(groupId, userId)
  S->>DB: INSERT INTO group_members
  S->>DB: UPDATE groups (current_members+1)
  S-->>A: success
  A->>H: reload()
  H->>S: getAllWithCreators()
  S-->>H: updated groups[]
  A-->>H: setIsMember(true)
  H-->>D: isMember = true
  D->>U: عرض "أنت عضو في هذه المجموعة"
```

## 5. مخطط البيانات (Entity Relationship)

```mermaid
erDiagram
  groups ||--o{ group_members : has
  groups }|--|| users : created_by

  groups {
    uuid id PK
    string name
    string course_name
    string course_code
    string class_number
    string doctor_name
    string major
    int max_members
    int current_members
    text whatsapp_link
    text group_link
    boolean is_full
    uuid creator_id FK
    string creator_name
    datetime created_at
  }

  group_members {
    uuid id PK
    uuid group_id FK
    uuid user_id FK
    datetime joined_at
  }

  users {
    uuid id PK
    string first_name
    string last_name
    string username
    string email
    boolean is_admin
  }
```

## 6. مخطط تدفق المستخدم - المجموعات

```mermaid
flowchart TD
  Start([البداية]) --> Load[تحميل المجموعات]
  Load --> CheckAuth{مستخدم مسجل؟}
  CheckAuth -->|لا| AuthError[خطأ مصادقة]
  CheckAuth -->|نعم| FetchGroups[إحضار المجموعات]

  FetchGroups --> CheckLoading{جاري التحميل؟}
  CheckLoading -->|نعم| ShowSkeleton[عرض 8 skeletons]
  CheckLoading -->|لا| CheckError{هناك خطأ؟}

  CheckError -->|نعم| ShowError[عرض رسالة خطأ]
  CheckError -->|لا| CheckEmpty{مجموعات فارغة؟}

  CheckEmpty -->|نعم| ShowEmpty[عرض "لا توجد مجموعات"]
  CheckEmpty -->|لا| RenderGrid[عرض شبكة البطاقات]

  ShowSkeleton --> Wait[انتظار]
  Wait --> FetchGroups

  ShowError --> Retry[إعادة المحاولة]
  Retry --> FetchGroups

  ShowEmpty --> CreateBtn[زر إنشاء مجموعة]
  CreateBtn --> OpenCreateModal[فتح نافذة الإنشاء]

  RenderGrid --> ClickCard[نقر على بطاقة]
  ClickCard --> OpenDetails[فتح نافذة التفاصيل]

  OpenCreateModal --> SubmitForm[إرسال النموذج]
  SubmitForm --> Validate{صحيح؟}
  Validate -->|لا| ShowErrors[عرض أخطاء]
  Validate -->|نعم| CreateGroup[إنشاء المجموعة]
  CreateGroup --> CloseModal[إغلاق + إعادة تحميل]

  OpenDetails --> CheckMember{عضو؟}
  CheckMember -->|نعم| ShowMember[عرض "عضو"]
  CheckMember -->|لا| ShowJoin[عرض زر انضمام]

  ShowJoin --> JoinClick[نقر انضم]
  JoinClick --> ConfirmJoin{تأكيد؟}
  ConfirmJoin -->|نعم| JoinGroup[الانضمام]
  ConfirmJoin -->|لا| Close
  JoinGroup --> Close[إغلاق]
```

## 7. مخطط Hooks - التبعيات

```mermaid
flowchart LR
  subgraph Container
    Page[useStudyGroupsPage]
    Study[useStudyGroups]
    Actions[useStudyGroupsActions]
    Debounce[useDebounce]
    Stored[useStoredUser]
  end

  Page --> Study
  Page --> Actions
  Actions --> Stored
  Study --> Debounce

  Study -.->|يعتمد على| SB1[studyGroupService]
  Actions -.->|يعتمد على| SB2[studyGroupService]
  Page -.->|يعتمد على| SB3[studyGroupService]
```

## 8. مخطط اختبار التغطية

```mermaid
pie title تغطية الاختبارات - المجموعات الدراسية
  "المكونات (11)" : 11
  "الصفحات (1)" : 1
  "Hooks (3)" : 2
  "الخدمات (2)" : 2
  "الأنواع (1)" : 1
  "المفقود (useStudyGroupsPage)" : 1
```

## 9. حالات الفلترة

```mermaid
flowchart TB
  Input[إدخال المستخدم] --> Search{نوع الفلتر}
  Search -->|نص| Debounce[debounce 300ms]
  Search -->|قائمة| Immediate[تطبيق فوري]

  Debounce --> UpdateFilter[updateFilter]
  Immediate --> UpdateFilter

  UpdateFilter --> SetFilters[setFilters]
  SetFilters --> Recompute[recompute filteredGroups]

  Recompute --> Status{status}
  Status -->|loading| LoadingSkeleton
  Status -->|error| ErrorState
  Status -->|empty| EmptyState
  Status -->|success| RenderGrid
```

## 10. خريطة رحلة المستخدم (User Journey)

```mermaid
journey
  title رحلة المستخدم للمجموعات الدراسية
  section Discovery
    فتح التطبيق: 5: User
    رؤية قائمة المجموعات: 5: User
    تصفية حسب التخصص: 4: User
    البحث عن مادة: 5: User
  section Engagement
    فتح تفاصيل مجموعة: 5: User
    مراجعة المعلومات: 4: User
    الانضمام للمجموعة: 5: User
  section Creation
    فتح نافذة الإنشاء: 5: User
    ملء النموذج: 3: User
    إنشاء المجموعة: 5: User
  section Management
    حذف مجموعة: 3: User(admin)
    متابعة الأعضاء: 4: User
```

## 11. مخطط بنية الملفات

```mermaid
graph TD
  Root["study-groups/"]
  Components["components/"]
  Src["src/"]
  Tests["tests/"]
  Docs["docs/"]

  Root --> Components
  Root --> Src
  Root --> Tests
  Root --> Docs

  Src --> Core["core/"]
  Src --> Hooks["hooks/"]
  Src --> Pages["pages/"]
  Src --> Services["services/"]
  Src --> Types["types/"]
  Src --> Constants["constants.ts"]

  Core --> CoreServices["services/"]
  Core --> CoreStorage["storage/"]

  Hooks --> H1["useDebounce.ts"]
  Hooks --> H2["useStudyGroups.ts"]
  Hooks --> H3["useStudyGroupsActions.ts"]
  Hooks --> H4["useStudyGroupsPage.ts"]
  Hooks --> Hindex["index.ts"]

  Components --> C1..C13["13 .tsx files"]

  Tests --> TC["components/"]
  Tests --> TH["hooks/"]
  Tests --> TP["pages/"]
  Tests --> TS["services/"]
  Tests --> TT["types/"]

  Docs --> D1["index.md"]
  Docs --> D2["README.md"]
  Docs --> D3["user-stories.md"]
  Docs --> D4["diagrams.md"]
  Docs --> D5["api-endpoints.md"]
```

---

**ملاحظة:** كل المخططات بصيغة Mermaid ويمكن عرضها في GitHub أو أي أداة تدعم Mermaid.
