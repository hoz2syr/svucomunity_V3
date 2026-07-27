import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const VERSION_FILE = join(process.cwd(), 'src', 'lib', 'version.ts');

function bumpVersion() {
  const content = readFileSync(VERSION_FILE, 'utf-8');
  const match = content.match(/export\s+const\s+APP_VERSION\s*=\s*"([^"]+)"/);

  if (!match) {
    console.error('Could not find APP_VERSION in version.ts');
    process.exit(1);
  }

  const currentVersion = match[1];
  const versionNum = parseFloat(currentVersion.replace('v', ''));
  const nextVersion = `v${(versionNum + 0.01).toFixed(2)}`;

  const newContent = `export const APP_VERSION = "${nextVersion}";\n`;

  writeFileSync(VERSION_FILE, newContent);
  console.log(`Version bumped: ${currentVersion} -> ${nextVersion}`);
}

bumpVersion();
