# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-12-24

### Changed
- **Architecture Overhaul**: Refactored monolithic index.html (2600+ lines) into modular structure
- Extracted inline CSS into src/css/ (main.css, components.css, responsive.css)
- Extracted inline JS into ES Modules in src/js/ (app.js + 5 modules)
- Replaced all inline event handlers (onclick, onchange) with data-action delegation
- Moved translations to JSON files in src/locales/ (en.json, zh.json)

### Added
- ES Module architecture with clear separation of concerns:
  - dataManager.js - Data operations and localStorage/fetch
  - renderer.js - DOM rendering with XSS-safe escapeHtml
  - i18n.js - Internationalization management
  - github.js - GitHub API integration
  - ui.js - UI event handling and modals

### Technical
- index.html reduced from 2600+ lines to ~450 lines (83% reduction)
- All JavaScript now uses ES modules for better maintainability
- Event delegation pattern for cleaner, more efficient event handling

## [1.5.0] - 2025-12-23

### Added
- New Website URL field in project creation/edit form
- New Notes field (textarea) for project descriptions
- Smart link routing: prioritizes website URL over GitHub Pages

### Changed
- Enhanced project title link logic

## [1.4.0] - 2025-12-18

### Added
- Initial project management dashboard
- Project filtering by category and status
- GitHub import/export functionality
- Multi-language support (English and Chinese)
