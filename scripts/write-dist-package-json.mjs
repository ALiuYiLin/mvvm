import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const outDir = "dist";

const rootPkgPath = path.join(rootDir, "package.json");
const rootPkg = JSON.parse(await readFile(rootPkgPath, "utf8"));

const distPkg = {
  name: "actview",
  version: rootPkg.version ?? "0.0.0",
  description:
    "Configuration-driven MVVM born for Campaign/Marketing single pages: selector + config for automatic data binding, supporting reactive/ref, computed, watch/watchEffect, JSX rendering, and quick event mounting.",
  keywords: ["mvvm", "h5", "campaign", "promo", "reactive", "jsx"],
  license: "MIT",
};

await mkdir(path.join(rootDir, outDir), { recursive: true });
await writeFile(
  path.join(rootDir, outDir, "package.json"),
  `${JSON.stringify(distPkg, null, 2)}\n`,
  "utf8"
);

