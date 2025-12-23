# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2025-12-23

### Added
- New **Website URL** field in project creation/edit form for direct project link navigation
- New **Notes** field (textarea) for adding detailed project descriptions and notes
- Smart link routing: clicking project title prioritizes website URL over GitHub Pages URL
- Internationalization (i18n) support for new fields (English & Chinese)
- Updated all existing projects with web_url and notes fields in data.json

### Changed
- Enhanced project title link logic to prioritize custom website URLs
- Improved form UI with better field organization

### Technical
- Added web_url and notes properties to project schema
- Added textarea styling support
- Updated form submission and editing logic to handle new fields

## [1.4.0] - 2025-12-18

### Added
- Initial project management dashboard
- Project filtering by category and status
- GitHub import/export functionality
- Project status tracking (Initial, In Progress, Done)
- Responsive design with modern UI
- Dark theme with gradient backgrounds
- Multi-language support (English & Chinese)

### Features
- Create, edit, delete projects
- Organize projects by categories and subcategories
- Track project dates (start and end)
- Link to GitHub repositories
- Project progress statistics
- Settings for GitHub integration
