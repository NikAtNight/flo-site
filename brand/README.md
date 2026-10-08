# Flo icon assets

The dotted wave uses 19 larger dots so it remains visible at app icon sizes. Light appearance uses black on white. Dark appearance uses white on black. The favicon uses 13 thicker dots for small browser tabs.

- `AppIcon.icon/` is the import-ready Icon Composer package. It contains one vector artwork layer and explicit light and dark colors. Open it in Icon Composer or add it to an Xcode app target as `AppIcon`.
- `native/Assets.car` contains the compiled light and dark icon stacks for macOS 26 and later. `native/AppIcon.icns` is the default light fallback for older macOS releases. That ICNS file does not switch appearances.
- `native/partial.plist` contains the icon keys emitted by the compiler. Merge those two keys into an app's existing Info.plist if using the compiled resources directly.
- `icon-light-1024.png` and `icon-dark-1024.png` are opaque, square PNG artwork exports. The platform supplies the app icon mask.
- `icon-light.svg` and `icon-dark.svg` are fixed-appearance web previews. The site's root `icon.svg` and `favicon.svg` switch automatically with `prefers-color-scheme`.

The matching icon package and compiled resources are now applied in the localflow app checkout. They have not been tested inside a running app or installed in the Dock.

## Rebuild

From the site root:

```sh
swift brand/generate-icon.swift
xcrun actool brand/AppIcon.icon --compile brand/native --app-icon AppIcon --platform macosx --minimum-deployment-target 14.0 --output-partial-info-plist brand/native/partial.plist --output-format human-readable-text
```

Use Xcode 26 or later. The Swift generator keeps the web previews, vector layer, and PNG exports in sync. Package the exports after rebuilding:

```sh
cd brand
zip -qr Flo-icons.zip AppIcon.icon native icon-light.svg icon-dark.svg icon-light-1024.png icon-dark-1024.png README.md
```

Validation on October 8, 2026 passed native compilation, inspection of Aqua and Dark Aqua icon stacks with `assetutil`, 1024px PNG dimensions, and web appearance switching. The light fallback was inspected at 32px and 256px. The browser preview and source SVGs were checked in light and dark appearances.
