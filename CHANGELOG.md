# Changelog

All notable changes to this project will be documented in this file.

---

## [1.0.2] - 2025-09-26

### Fixed

- Change patched method from `app.canvas.linkRenderer.pathRenderer.drawLinkPath` to `app.canvas.linkRenderer.pathRenderer.constructor.prototype.drawLinkPath` in order to patch each instance instead of just the first one. ([#5](https://github.com/edoardocarmignani/extralinks/issues/5))
- Store original prototype method to restore them when needed.

---

## [1.0.1] - 2025-09-23

### Fixed

- Safely resolve link objects when computing output slot and origin id: look up the link via `app.graph.links[linkId]` to access `origin_slot` and `origin_id`.
- Corrected `Icon` URL in `pyproject.toml` to point to `imgs/extralinks_logo_square.png`.

### Changed

- Added/updated repository logo file `imgs/extralinks_logo_square.png` (ensure it's tracked in the repository).

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
