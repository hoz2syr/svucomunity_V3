with open('src/hooks/useParticleCanvas.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "import { useEffect, useRef, useSyncExternalStore } from 'react';",
    "import { useEffect, useRef, useSyncExternalStore } from 'react';\nimport { DEFAULT_PARTICLE_COUNT, MOUSE_INTERACTION_MAX_DIST, LOOP_DURATION_MS } from '@/src/lib/constants';"
)
content = content.replace(
    'particleCount = 80,',
    'particleCount = DEFAULT_PARTICLE_COUNT,'
)
content = content.replace(
    'const maxDist = 200;',
    'const maxDist = MOUSE_INTERACTION_MAX_DIST;'
)
content = content.replace(
    'const LOOP_DURATION = 8000;',
    'const LOOP_DURATION = LOOP_DURATION_MS;'
)

with open('src/hooks/useParticleCanvas.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated useParticleCanvas.ts with constants')
