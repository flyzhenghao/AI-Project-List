/**
 * renderer.js - UI Rendering Module
 * Handles all project rendering and UI updates
 */

import { categoryIcons, subcategoryIcons } from './dataManager.js';

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Convert GitHub repo URL to GitHub Pages URL
 */
function getGitHubPagesUrl(repoUrl) {
    if (!repoUrl) return null;
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
    if (match) {
        const owner = match[1];
        const repo = match[2];
        return `https://${owner}.github.io/${repo}`;
    }
    return null;
}

/**
 * Calculate progress statistics for a list of projects
 */
function calculateProgress(projectList) {
    const total = projectList.length;
    if (total === 0) {
        return {
            initial: 0,
            ing: 0,
            done: 0,
            initialPct: 0,
            ingPct: 0,
            donePct: 0
        };
    }

    const initial = projectList.filter(p => p.status === 'initial').length;
    const ing = projectList.filter(p => p.status === 'ing').length;
    const done = projectList.filter(p => p.status === 'done').length;

    return {
        initial,
        ing,
        done,
        initialPct: ((initial / total) * 100).toFixed(1),
        ingPct: ((ing / total) * 100).toFixed(1),
        donePct: ((done / total) * 100).toFixed(1)
    };
}

/**
 * Render progress bar HTML
 */
function renderProgressBar(stats, i18n) {
    if (stats.initial === 0 && stats.ing === 0 && stats.done === 0) {
        return '';
    }

    return `
        <div class="progress-bar-container" title="${i18n.t('statusInitial')}: ${stats.initial} | ${i18n.t('statusInProgress')}: ${stats.ing} | ${i18n.t('statusDone')}: ${stats.done}">
            ${stats.initial > 0 ? `<div class="progress-segment initial" style="width: ${stats.initialPct}%"></div>` : ''}
            ${stats.ing > 0 ? `<div class="progress-segment ing" style="width: ${stats.ingPct}%"></div>` : ''}
            ${stats.done > 0 ? `<div class="progress-segment done" style="width: ${stats.donePct}%"></div>` : ''}
        </div>
    `;
}

export class Renderer {
    constructor(dataManager, i18nManager) {
        this.dataManager = dataManager;
        this.i18n = i18nManager;
    }

    /**
     * Get category display name with translation
     */
    getCategoryDisplayName(cat) {
        const key = 'cat_' + cat;
        return this.i18n.t(key);
    }

    /**
     * Get subcategory display name with translation
     */
    getSubcategoryDisplayName(subcat) {
        if (!subcat) return '';
        const key = 'subcat_' + subcat;
        return this.i18n.t(key);
    }

    /**
     * Update statistics display
     */
    updateStats() {
        const stats = this.dataManager.getStats();
        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-done').textContent = stats.done;
        document.getElementById('stat-ing').textContent = stats.ing;
        document.getElementById('stat-initial').textContent = stats.initial;
    }

    /**
     * Update category filter dropdown
     */
    updateCategoryFilter() {
        const select = document.getElementById('filter-category');
        const categorySelect = document.getElementById('project-category');
        const categories = this.dataManager.getCategories();

        select.innerHTML = `<option value="all">${this.i18n.t('allCategories')}</option>`;
        categorySelect.innerHTML = '';

        categories.forEach(cat => {
            const icon = categoryIcons[cat] || '📁';
            const displayName = this.getCategoryDisplayName(cat);
            select.innerHTML += `<option value="${escapeHtml(cat)}">${icon} ${escapeHtml(displayName)}</option>`;
            categorySelect.innerHTML += `<option value="${escapeHtml(cat)}">${icon} ${escapeHtml(displayName)}</option>`;
        });
    }

    /**
     * Update filter status dropdown options
     */
    updateFilterStatusOptions() {
        const select = document.getElementById('filter-status');
        const currentValue = select.value;
        select.innerHTML = `
            <option value="all">${this.i18n.t('allStatus')}</option>
            <option value="done">✅ ${this.i18n.t('statusDone')}</option>
            <option value="ing">🔄 ${this.i18n.t('statusInProgress')}</option>
            <option value="initial">📋 ${this.i18n.t('statusInitial')}</option>
        `;
        select.value = currentValue;
    }

    /**
     * Render a single project card
     */
    renderProjectCard(project, hasSubcategory = false) {
        const statusLabels = {
            done: this.i18n.t('statusDone'),
            ing: this.i18n.t('statusInProgress'),
            initial: this.i18n.t('statusInitial')
        };

        const statusIcons = {
            done: '✅',
            ing: '🔄',
            initial: '📋'
        };

        // Prioritize web_url over GitHub Pages URL
        const pagesUrl = project.web_url || getGitHubPagesUrl(project.repo);
        
        // Render project name as link if URL exists, otherwise as plain text
        const projectNameHtml = pagesUrl
            ? `<a href="${escapeHtml(pagesUrl)}" target="_blank" class="project-name-link" title="Open Project">
                 ${escapeHtml(project.name)}
                 <span class="link-icon">🔗</span>
               </a>`
            : `<h3 class="project-name">${escapeHtml(project.name)}</h3>`;

        return `
            <div class="project-card ${hasSubcategory ? 'has-subcategory' : ''}" data-project-id="${project.id}">
                <div class="card-header">
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                        ${projectNameHtml}
                        <span class="status-badge ${project.status}"
                              data-action="toggle-status"
                              data-project-id="${project.id}"
                              title="Click to change status">
                            <span class="status-badge-icon">${statusIcons[project.status]}</span>
                            ${statusLabels[project.status]}
                        </span>
                    </div>
                    <div class="card-actions">
                        <button class="action-btn" data-action="edit" data-project-id="${project.id}" title="Edit">✏️</button>
                        <button class="action-btn" data-action="delete" data-project-id="${project.id}" title="Delete">🗑️</button>
                    </div>
                </div>
                <p class="project-name-en">${escapeHtml(project.nameEn)}</p>
                ${project.subcategory ? `<span class="project-subcategory-tag">${escapeHtml(this.getSubcategoryDisplayName(project.subcategory))}</span>` : ''}
                <div class="status-selector" id="status-selector-${project.id}">
                    ${['initial', 'ing', 'done'].map(status => `
                        <button class="status-btn ${status} ${project.status === status ? 'active' : ''}"
                                data-action="change-status"
                                data-project-id="${project.id}"
                                data-status="${status}">
                            ${project.status === status ? '<span class="pulse-dot">●</span>' : ''}
                            ${statusLabels[status]}
                        </button>
                    `).join('')}
                </div>
                ${project.repo ? `
                    <a href="${escapeHtml(project.repo)}" target="_blank" class="repo-link">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                        ${this.i18n.t('githubRepo')}
                    </a>
                ` : ''}
                <div class="date-row">
                    <div class="date-item">
                        <span class="date-label">${this.i18n.t('start')}</span>
                        <span class="date-value">${escapeHtml(project.startDate || '—')}</span>
                    </div>
                    <div class="date-item">
                        <span class="date-label">${this.i18n.t('end')}</span>
                        <span class="date-value">${escapeHtml(project.endDate || '—')}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render all projects with filtering and grouping
     */
    renderProjects() {
        const container = document.getElementById('projects-container');
        const search = document.getElementById('search-input').value.toLowerCase();
        const categoryFilter = document.getElementById('filter-category').value;
        const statusFilter = document.getElementById('filter-status').value;

        const projects = this.dataManager.getProjects();
        const filtered = projects.filter(p => {
            const matchSearch = 
                p.name.toLowerCase().includes(search) ||
                p.nameEn.toLowerCase().includes(search) ||
                (p.subcategory && p.subcategory.toLowerCase().includes(search));
            const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
            const matchStatus = statusFilter === 'all' || p.status === statusFilter;
            return matchSearch && matchCategory && matchStatus;
        });

        // Group by category, then by subcategory
        const grouped = {};
        filtered.forEach(p => {
            if (!grouped[p.category]) {
                grouped[p.category] = { noSub: [], subs: {} };
            }
            if (p.subcategory) {
                if (!grouped[p.category].subs[p.subcategory]) {
                    grouped[p.category].subs[p.subcategory] = [];
                }
                grouped[p.category].subs[p.subcategory].push(p);
            } else {
                grouped[p.category].noSub.push(p);
            }
        });

        if (Object.keys(grouped).length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p>${this.i18n.t('noProjects')}</p>
                </div>
            `;
        } else {
            container.innerHTML = Object.entries(grouped).map(([category, data]) => {
                const totalCount = data.noSub.length + 
                    Object.values(data.subs).reduce((sum, arr) => sum + arr.length, 0);
                const categoryDisplayName = this.getCategoryDisplayName(category);

                // Calculate progress for all projects in this category
                const allCategoryProjects = [...data.noSub, ...Object.values(data.subs).flat()];
                const categoryProgress = calculateProgress(allCategoryProjects);

                let html = `
                    <div class="category-section">
                        <div class="category-header">
                            <h2 class="category-title">
                                <span class="category-icon">${categoryIcons[category] || '📁'}</span>
                                ${escapeHtml(categoryDisplayName)}
                                <span class="category-count">${totalCount}</span>
                            </h2>
                            ${renderProgressBar(categoryProgress, this.i18n)}
                        </div>
                `;

                // Render projects without subcategory
                if (data.noSub.length > 0) {
                    html += `
                        <div class="projects-grid">
                            ${data.noSub.map(p => this.renderProjectCard(p)).join('')}
                        </div>
                    `;
                }

                // Render subcategories
                Object.entries(data.subs).forEach(([subcat, subProjects]) => {
                    const subcatDisplayName = this.getSubcategoryDisplayName(subcat);
                    const subcatProgress = calculateProgress(subProjects);
                    html += `
                        <div class="subcategory-section">
                            <div class="category-header">
                                <h3 class="subcategory-title">
                                    <span class="subcategory-icon">${subcategoryIcons[subcat] || '📂'}</span>
                                    ${escapeHtml(subcatDisplayName)}
                                    <span class="category-count">${subProjects.length}</span>
                                </h3>
                                ${renderProgressBar(subcatProgress, this.i18n)}
                            </div>
                            <div class="projects-grid">
                                ${subProjects.map(p => this.renderProjectCard(p, true)).join('')}
                            </div>
                        </div>
                    `;
                });

                html += '</div>';
                return html;
            }).join('');
        }

        this.updateStats();
    }
}
