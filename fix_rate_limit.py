with open('src/hooks/useRateLimit.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "import { useState, useEffect } from 'react';",
    "import { useState, useEffect } from 'react';\nimport { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_POLL_INTERVAL_MS } from '@/src/lib/constants';"
)
content = content.replace(
    'const windowMs = options.windowMs ?? 5 * 60 * 1000;',
    'const windowMs = options.windowMs ?? RATE_LIMIT_WINDOW_MS;'
)
content = content.replace(
    '}, 1000);',
    '}, RATE_LIMIT_POLL_INTERVAL_MS);'
)

with open('src/hooks/useRateLimit.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated useRateLimit.ts with constants')
