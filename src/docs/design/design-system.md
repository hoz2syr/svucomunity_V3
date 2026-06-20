# Design System

## الهوية البصرية

### الطابع العام
- Dark UI
- Glassmorphism
- Motion-heavy
- Gradient accents
- RTL-first
- Campus/community tone

### الألوان الأساسية

| الاستخدام | القيمة |
|---|---|
| خلفية أساسية | `#060a1f` |
| خلفية داكنة | `#0a0f2e` |
| خلفية عميقة | `#030614` |
| Cyan accent | `cyan-400` / `#22d3ee` |
| Indigo accent | `indigo-500` / `#6366f1` |
| Purple accent | `purple-500` / `#a855f7` |
| Error | `red-500` / `#ef4444` |
| Success | `emerald-500` / `#10b981` |

### الخطوط

| النوع | القيمة |
|---|---|
| Sans | `Tajawal` |
| Display | `Space Grotesk` |

### المسافات

| الفئة | القيم الشائعة |
|---|---|
| صغير | `px-2` إلى `px-4` |
| متوسط | `px-5` إلى `px-8` |
| كبير | `py-24` |
| Hero | `min-h-screen` / `pt-28` |

### الحدود والحواف

| العنصر | القيمة |
|---|---|
| Border ناعم | `border-white/5` |
| Border متوسط | `border-white/10` |
| Radius كبير | `rounded-[2rem]` |
| Radius متوسط | `rounded-2xl` |
| Radius صغير | `rounded-xl` |

### الظلال

- `shadow-2xl`
- `shadow-[0_0_20px_rgba(34,211,238,0.3)]`
- `shadow-[0_0_40px_rgba(34,211,238,0.1)]`
- `shadow-[0_20px_40px_-15px_rgba(34,211,238,0.15)]`

### الحركة

| العنصر | السلوك |
|---|---|
| `motion/react` | reveal / scale / fade |
| `useInView` | ظهور عند الدخول إلى viewport |
| `useParticleCanvas` | particle animation |
| `animate-typewriter` | تأثير كتابة |
| `shimmer-sweep` | تأثير لمعان |

### Accessibility

- `prefers-reduced-motion` مدعوم.
- بعض المودالات تستخدم `aria-modal`, `aria-labelledby`, `aria-describedby`.
- `InputField` يدعم `aria-invalid` و `aria-describedby`.
- `Navbar` يدعم `aria-expanded` للقائمة المحمولة.
- هناك مجال لتحسين:
  - menuitem semantics
  - focus management
  - keyboard navigation
  - contrast checks لبعض الحالات

## ملاحظات التصميم

- التصميم بصرياً قوي ومتناسق.
- لا يوجد ملف tokens مركزي.
- كثير من القيم مكررة داخل Tailwind classes.
- الأفضل مستقبلاً إنشاء `tokens.css` أو `design-tokens.ts`.
