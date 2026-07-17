---
name: Expo pnpm broken native modules
description: Expo/RN modules that resolve to undefined in pnpm workspace web builds and must be avoided or guarded
---

In this pnpm monorepo + Expo SDK 54 setup, certain native modules export `undefined` at runtime in the web build, causing "Element type is invalid: expected a string but got undefined" React render crashes.

**Known broken modules (do not import as JSX components in source files):**
- `expo-symbols` — `SymbolView` → undefined
- `expo-blur` — `BlurView` → undefined
- `expo-linear-gradient` — `LinearGradient` → undefined
- `react-native-keyboard-controller` — `KeyboardProvider` → undefined (safe to remove; `KeyboardAwareScrollView` is guarded by Platform check so its import is tolerated)

**Why:** pnpm symlinks + Metro's module resolution fails to pick up the correct platform-specific export for these packages in the web build.

**How to apply:**
- Replace `expo-symbols` icons → `Feather` from `@expo/vector-icons`
- Replace `expo-blur` `BlurView` → plain `View` + solid background color
- Replace `expo-linear-gradient` `LinearGradient` → plain `View` with a semi-transparent `backgroundColor` overlay
- Remove `KeyboardProvider` from root layout; keyboard avoidance still works via `KeyboardAwareScrollViewCompat` on native
- Before adding any new Expo UI module, verify it has a working web export in this pnpm layout
