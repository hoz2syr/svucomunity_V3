with open('src/lib/cva.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_until_empty = False
for i, line in enumerate(lines):
    if 'export function cn(' in line:
        skip_until_empty = True
        new_lines.append("import { cn } from './utils';\n")
        continue
    if skip_until_empty:
        if line.strip() == '}':
            skip_until_empty = False
            continue
        continue
    new_lines.append(line)

with open('src/lib/cva.ts', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Removed duplicate cn from cva.ts')
