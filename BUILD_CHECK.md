# Build Verification Guide

## Quick Check Before Pushing

To avoid build failures on Vercel, run this command before pushing:

```powershell
yarn precheck
```

This will:
1. Run TypeScript type checking (`tsc --noEmit`)
2. Run full Next.js build (includes ESLint)

## Manual Build Check

If you just want to test the build:

```powershell
yarn build
```

## Git Hook

A pre-push git hook is installed that will automatically run `yarn precheck` before pushing (if yarn is available in PATH). If the hook detects yarn isn't available, it will warn you to run checks manually.

## Common Issues

### ESLint Errors
- **Unescaped quotes**: Use `&quot;` for `"` and `&apos;` for `'` in JSX
- **Unused variables**: Remove them or prefix with underscore `_varName`
- **No explicit any**: Avoid `as any`, use proper types

### TypeScript Errors
- **Spread operators**: Add tuple types like `const color: [number, number, number] = [1, 2, 3]`
- **Invalid CSS properties**: Only use valid React CSSProperties
- **Missing types**: Import types or define interfaces

## PowerShell Build Script

You can also use the PowerShell script directly:

```powershell
.\check-build.ps1
```

This provides colored output and clear error messages.
