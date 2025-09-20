# Changelog

All notable changes to this project will be documented in this file.

---

## [1.0.0] - 2025-09-20

### Changed

- Migrated from `renderLink` patch to new `drawLinkPath` patch (`ExtraLinks.js`), compatible with ComfyUI frontend ≥ 1.27.1.
- Updated link renderers to use `{x, y}` objects (`link.startPoint` / `link.endPoint`) instead of `[x, y]` arrays.
- Patched `calculateCenterPoint` to align markers with custom paths.
- Improved patching lifecycle: now waits for `app.canvas.linkRenderer.pathRenderer` before applying.
- Preserved all extension settings (Enable, Shape, Radius, Offset, Curvature).

### Breaking

- **Requires ComfyUI frontend ≥ 1.27.1.**
- ExtraLinks is no longer compatible with earlier frontend builds. Users on older ComfyUI must stay on **ExtraLinks v0.0.2**.

---

## [0.0.2] - 2025-07-15

### Added

- Initial implementation of custom link shapes (`Curved`, `Rounded`).
- Configurable Radius, Offset, and Curvature.
- Toggle Enable/Disable from settings panel.
- Basic marker rendering at link midpoints.

---
