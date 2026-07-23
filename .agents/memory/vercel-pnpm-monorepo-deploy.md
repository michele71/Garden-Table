---
name: Vercel + pnpm monorepo deploy (Expo PWA)
description: Lessons from deploying an Expo web PWA from a pnpm monorepo to Vercel
---

## Rules

1. **Do NOT set a Root Directory in Vercel dashboard** — leave it blank (repo root). Setting it to a package subdirectory breaks pnpm's workspace binary resolution (expo CLI not found, pnpm run can't find scripts).

2. **`pnpm --filter <pkg> run <script>` changes CWD to the package directory** inside the build. So `expo export --output-dir dist` writes to `<pkg>/dist`, not the repo root. Vercel's `outputDirectory` must account for this — OR use the copy trick below.

3. **`dist` was in `.gitignore`** — Vercel respects `.gitignore` when verifying the output directory. Remove `dist` from all `.gitignore` files (root and package-level) if using `dist` as the Expo export folder.

4. **`npx expo` pulls the wrong version** — always use `pnpm exec expo` or `pnpm run <script>` (never `npx`) to ensure the workspace's installed expo version is used.

5. **`pnpm exec expo` fails with `Command "expo" not found`** in Vercel's isolated build — use `pnpm run <script>` instead, which adds `node_modules/.bin` to PATH correctly.

6. **The working build command** (vercel.json):
```json
{
  "buildCommand": "pnpm install --frozen-lockfile && pnpm --filter @workspace/garden-table run build:web && (cp -r artifacts/garden-table/dist dist 2>/dev/null || true) && ls dist",
  "outputDirectory": "dist",
  "installCommand": "echo skip",
  "framework": null
}
```
The `cp -r artifacts/garden-table/dist dist` copies the expo output to the repo root so Vercel finds it at the simple `dist` path.

**Why:** Vercel output directory resolution + pnpm workspace CWD changes + gitignore filtering all interact in non-obvious ways. The copy step is the safest workaround.
