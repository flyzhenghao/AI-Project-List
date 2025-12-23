# Skill: Modularize a Single-File SPA (HTML + CSS + JS)

Purpose: Convert a monolithic `index.html` (inline CSS/JS) into a maintainable, modular structure with externalized assets and clear responsibilities—preserving behavior.

## When to Use
- `index.html` grows >800 lines with embedded `<style>` and `<script>`.
- Inline `onclick`/`onchange` handlers create tight coupling and hamper testability.
- You need reusable i18n, data, UI, and GitHub integration modules.

## Target Structure
```
src/
  css/
    main.css
    components.css
    responsive.css
  js/
    app.js                 # entry
    modules/
      dataManager.js      # data CRUD + persistence
      renderer.js         # DOM rendering + XSS-safe output
      i18n.js             # translations + UI updates
      github.js           # GitHub API integration
      ui.js               # events, modals, delegation
  locales/
    en.json
    zh.json
```

## Step-by-Step
1) Extract CSS
- Move global, component, and responsive rules into `src/css/*`.
- Replace `<style>...</style>` with `<link>` tags.

2) Extract JS
- Move logic into ES modules under `src/js/modules/` and an entry `src/js/app.js`.
- Replace `<script>...</script>` with `<script type="module" src="src/js/app.js"></script>`.

3) Replace Inline Handlers
- Remove `onclick`, `onchange`, `onsubmit` attributes from HTML.
- Use `data-action` on clickable elements; delegate in `UIController`.
- Keep stable IDs/classes used by modules (e.g., `#projects-container`, `#filter-status`).

4) Internationalization
- Move translations into `src/locales/*.json`.
- `I18nManager` loads JSON, updates `[data-i18n]` and `[data-i18n-placeholder]`.

5) Data + Persistence
- `DataManager` handles localStorage + `data.json` with timestamp comparison.
- Keep schema evolution safe by defaulting new fields (e.g., `web_url`, `notes`).

6) Rendering
- `Renderer` produces HTML safely: always escape text content.
- Provide helper: GitHub repo URL → GitHub Pages URL.

7) GitHub Integration
- `GitHubManager` updates `data.json` via GitHub Contents API (requires token).
- Encode content, fetch SHA, PUT to update; handle errors clearly.

8) UI Controller
- Centralize all events: search/filter, modal open/close, form submit, status changes.
- Event delegation on `#projects-container` using `[data-action]` + `data-*`.

## Checklist
- [ ] No inline `<style>` or `<script>` in `index.html`.
- [ ] All buttons/inputs wired via event listeners (no inline handlers).
- [ ] `link` tags include `src/css/main.css`, `components.css`, `responsive.css`.
- [ ] `script type="module" src="src/js/app.js"` present at end of body.
- [ ] i18n keys exist in both `en.json` and `zh.json`.
- [ ] Footer displays correct app version; `data.json.version` matches.
- [ ] XSS-safe text rendering via `textContent`/escaping utility.

## Pitfalls & Tips
- Keep IDs and class names stable to avoid breaking selectors.
- After splitting, test language switch, filters, CRUD, and GitHub save.
- Avoid direct `innerHTML` with user input; escape dynamic content.
- Cache-bust JSON fetches (`?t=${Date.now()}`) to avoid stale `data.json`.

## Done Criteria
- App works identically with smaller `index.html`.
- Code is readable, testable, and ready for future features.
