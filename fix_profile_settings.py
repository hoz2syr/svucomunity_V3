import os

# Update useProfileSettings.ts
with open('src/hooks/useProfileSettings.ts', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace(
    "import { useState } from 'react';",
    "import { useState } from 'react';\nimport { SUCCESS_MESSAGE_TIMEOUT_MS } from '@/src/lib/constants';"
)
content = content.replace(
    'setTimeout(() => setSuccessMsg(\x27\x27), 3000);',
    'setTimeout(() => setSuccessMsg(\x27\x27), SUCCESS_MESSAGE_TIMEOUT_MS);'
)
with open('src/hooks/useProfileSettings.ts', 'w', encoding='utf-8') as f:
    f.write(content)

# Update useSecuritySettings.ts
with open('src/hooks/useSecuritySettings.ts', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace(
    "import { useState } from 'react';",
    "import { useState } from 'react';\nimport { SUCCESS_MESSAGE_TIMEOUT_MS } from '@/src/lib/constants';"
)
content = content.replace(
    'setTimeout(() => setSuccessMsg(\x27\x27), 3000);',
    'setTimeout(() => setSuccessMsg(\x27\x27), SUCCESS_MESSAGE_TIMEOUT_MS);'
)
with open('src/hooks/useSecuritySettings.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated profile and security settings hooks with constants')
