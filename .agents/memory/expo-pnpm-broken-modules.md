---
name: Expo pnpm broken native modules
description: Expo modules that resolve to undefined in pnpm workspace web builds and must be avoided
---

In this pnpm monorepo + Expo SDK 54 setup, certain Expo native modules export `undefined` at runtime in the web build, causing "Element type is invalid: expected a string but got undefined" React render crashes.

**Known broken modules (do not import in source files):**
- `expo-symbols` — `SymbolView` resolves to `undefined`
- `expo-blur` — `BlurView` resolves to `undefined`

**Why:** pnpm symlinks + Metro's module resolution fails to pick up the correct platform-specific export for these packages.

**How to apply:**
- Replace `expo-symbols` icons with `Feather` from `@expo/vector-icons`
- Replace `expo-blur` `BlurView` usages with a plain `View` + solid background color
- Before adding any new Expo UI module, test in the web build — if it crashes with "undefined element type", apply the same pattern
