import os

# Fix ProfileSettingsForm.tsx
with open('src/components/dashboard/ProfileSettingsForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace(
    "import { useProfileSettings } from './useProfileSettings';",
    "import { useProfileSettings } from '@/src/hooks/useProfileSettings';"
)
with open('src/components/dashboard/ProfileSettingsForm.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Fix SecuritySettingsForm.tsx
with open('src/components/dashboard/SecuritySettingsForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace(
    "import { useSecuritySettings } from './useSecuritySettings';",
    "import { useSecuritySettings } from '@/src/hooks/useSecuritySettings';"
)
with open('src/components/dashboard/SecuritySettingsForm.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated hook imports to use canonical versions')
