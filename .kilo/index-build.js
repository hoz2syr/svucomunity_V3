const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const outPath = path.join(__dirname, "index.json");
const include = [".ts", ".tsx", ".js", ".jsx", ".json", ".md"];
const excludeDirs = new Set([".git", "node_modules", "dist", "build", "storybook-static", ".kilo"]);
const files = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!excludeDirs.has(entry.name)) walk(full);
      continue;
    }
    if (!include.includes(path.extname(entry.name))) continue;
    files.push(full);
  }
}

walk(projectRoot);

const index = files.map((file) => {
  const rel = path.relative(projectRoot, file).replace(/\\/g, "/");
  const content = fs.readFileSync(file, "utf8");
  return { path: rel, size: content.length, mtime: fs.statSync(file).mtimeMs };
});

fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), count: index.length, files: index }, null, 2));
console.log(`Wrote ${index.length} entries to ${outPath}`);
