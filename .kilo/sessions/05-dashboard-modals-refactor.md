# جلسة 05 — تفكيك Modals

## الهدف
فصل modal logic إلى ملفات ومكونات مستقلة.

## النطاق
- `LogoutModal`
- `DeleteAccountModal`
- `SettingsModal`
- `ProfileSettingsForm`
- `SecuritySettingsForm`
- `ModalOverlay`
- `InputField`

## الملفات المرتبطة
- `src/components/dashboard/ModalOverlay.tsx`
- `src/components/dashboard/LogoutModal.tsx`
- `src/components/dashboard/DeleteAccountModal.tsx`
- `src/components/dashboard/SettingsModal.tsx`
- `src/components/dashboard/ProfileSettingsForm.tsx`
- `src/components/dashboard/SecuritySettingsForm.tsx`
- `src/components/dashboard/useProfileSettings.ts`
- `src/components/dashboard/useSecuritySettings.ts`
- `src/components/dashboard/index.ts`
- `src/components/ui/InputField.tsx`

## الخطوات
1. فصل كل modal إلى ملف مستقل.
2. نقل forms إلى components منفصلة.
3. نقل Supabase operations إلى services.
4. إصلاح accessibility bug في `InputField`.
5. تحديث imports.

## التحقق
- `npm run lint`: نجح.
- `npm run test`: نجح.
- `npm run build`: نجح.
- `tests/dashboard/SettingsModal.test.tsx` يؤكد أن labels مرتبطة بحقول الإدخال.

## النتيجة
مكتملة. كل modal/form في ملف مستقل، و Supabase operations موجودة في services.

## المخاطر
- كسر modal state.
- تغيير validation behavior.
