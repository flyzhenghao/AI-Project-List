/**
 * ui.js - UI Controller Module
 * Handles all UI interactions, events, and modal management
 */

export class UIController {
    constructor(dataManager, renderer, i18nManager, githubManager) {
        this.dataManager = dataManager;
        this.renderer = renderer;
        this.i18n = i18nManager;
        this.github = githubManager;
        this.editingProjectId = null;
    }

    /**
     * Initialize event listeners
     */
    init() {
        // Event delegation for project cards
        document.getElementById('projects-container').addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const projectId = parseInt(target.dataset.projectId);

            switch (action) {
                case 'edit':
                    this.handleEdit(projectId);
                    break;
                case 'delete':
                    this.handleDelete(projectId);
                    break;
                case 'toggle-status':
                    this.toggleStatusSelector(projectId);
                    break;
                case 'change-status':
                    const status = target.dataset.status;
                    this.handleChangeStatus(projectId, status);
                    break;
            }
        });
    }

    /**
     * Toggle status selector for a project
     */
    toggleStatusSelector(projectId) {
        const selector = document.getElementById(`status-selector-${projectId}`);
        if (selector) {
            const isActive = selector.classList.contains('active');

            // Close all other selectors
            document.querySelectorAll('.status-selector.active').forEach(s => {
                s.classList.remove('active');
            });

            // Toggle current selector
            if (!isActive) {
                selector.classList.add('active');
            }
        }
    }

    /**
     * Handle status change
     */
    handleChangeStatus(projectId, newStatus) {
        this.dataManager.changeStatus(projectId, newStatus);
        this.toggleStatusSelector(projectId);
        this.renderer.renderProjects();
    }

    /**
     * Handle project edit
     */
    handleEdit(projectId) {
        const project = this.dataManager.getProjectById(projectId);
        if (!project) return;

        this.editingProjectId = projectId;
        document.getElementById('modal-title').textContent = this.i18n.t('editProject');
        document.getElementById('modal-title').setAttribute('data-i18n', 'editProject');
        document.getElementById('submit-btn').textContent = this.i18n.t('saveChanges');
        document.getElementById('submit-btn').setAttribute('data-i18n', 'saveChanges');

        document.getElementById('project-name').value = project.name;
        document.getElementById('project-name-en').value = project.nameEn;
        document.getElementById('project-category').value = project.category;
        document.getElementById('new-category').value = '';
        document.getElementById('project-subcategory').value = project.subcategory || '';
        document.getElementById('project-repo').value = project.repo;
        document.getElementById('project-web-url').value = project.web_url || '';
        document.getElementById('project-notes').value = project.notes || '';
        document.getElementById('project-start-date').value = project.startDate;
        document.getElementById('project-end-date').value = project.endDate;
        this.selectStatus(project.status);

        document.getElementById('modal-overlay').classList.add('active');
    }

    /**
     * Handle project delete
     */
    handleDelete(projectId) {
        if (confirm(this.i18n.t('confirmDelete'))) {
            this.dataManager.deleteProject(projectId);
            this.renderer.renderProjects();
            this.renderer.updateCategoryFilter();
        }
    }

    /**
     * Open project modal (new project)
     */
    openProjectModal() {
        this.editingProjectId = null;
        document.getElementById('modal-title').textContent = this.i18n.t('newProject');
        document.getElementById('modal-title').setAttribute('data-i18n', 'newProject');
        document.getElementById('submit-btn').textContent = this.i18n.t('createProject');
        document.getElementById('submit-btn').setAttribute('data-i18n', 'createProject');

        // Clear form
        document.getElementById('project-name').value = '';
        document.getElementById('project-name-en').value = '';
        document.getElementById('new-category').value = '';
        document.getElementById('project-subcategory').value = '';
        document.getElementById('project-repo').value = '';
        document.getElementById('project-web-url').value = '';
        document.getElementById('project-notes').value = '';
        document.getElementById('project-start-date').value = '';
        document.getElementById('project-end-date').value = '';
        this.selectStatus('initial');

        this.renderer.updateCategoryFilter();
        document.getElementById('modal-overlay').classList.add('active');
    }

    /**
     * Close project modal
     */
    closeProjectModal(event) {
        // If called from overlay click, only close if clicking on overlay itself
        if (event && event.target && event.currentTarget) {
            if (event.target !== event.currentTarget) {
                return;
            }
        }
        document.getElementById('modal-overlay').classList.remove('active');
    }

    /**
     * Select status in modal form
     */
    selectStatus(status) {
        document.querySelectorAll('.status-radio').forEach(el => {
            el.classList.remove('selected');
            el.querySelector('input').checked = false;
        });
        const selected = document.querySelector(`.status-radio.${status}`);
        if (selected) {
            selected.classList.add('selected');
            selected.querySelector('input').checked = true;
        }
    }

    /**
     * Handle save project (create or update)
     */
    handleSaveProject(event) {
        if (event) {
            event.preventDefault();
        }

        const name = document.getElementById('project-name').value.trim();
        if (!name) {
            alert(this.i18n.getCurrentLang() === 'zh' ? '请输入项目名称' : 'Please enter project name');
            return;
        }

        const newCategory = document.getElementById('new-category').value.trim();
        const category = newCategory || document.getElementById('project-category').value;
        const status = document.querySelector('.status-radio.selected input')?.value || 'initial';

        const projectData = {
            name,
            nameEn: document.getElementById('project-name-en').value.trim(),
            category,
            subcategory: document.getElementById('project-subcategory').value.trim(),
            status,
            repo: document.getElementById('project-repo').value.trim(),
            web_url: document.getElementById('project-web-url').value.trim(),
            notes: document.getElementById('project-notes').value.trim(),
            startDate: document.getElementById('project-start-date').value,
            endDate: document.getElementById('project-end-date').value
        };

        if (this.editingProjectId) {
            this.dataManager.updateProject(this.editingProjectId, projectData);
        } else {
            this.dataManager.addProject(projectData);
        }

        this.renderer.renderProjects();
        this.renderer.updateCategoryFilter();
        this.closeProjectModal();
    }

    /**
     * Handle export
     */
    handleExport() {
        const dataStr = this.dataManager.exportData();
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai-projects-backup.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Handle import
     */
    handleImport(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const success = this.dataManager.importData(e.target.result);
                if (success) {
                    this.renderer.renderProjects();
                    this.renderer.updateCategoryFilter();
                    alert(this.i18n.t('importSuccess'));
                } else {
                    alert(this.i18n.t('importFailed'));
                }
            };
            reader.readAsText(file);
        }
        event.target.value = '';
    }

    /**
     * Handle reset data
     */
    handleReset() {
        if (confirm(this.i18n.t('confirmReset'))) {
            this.dataManager.resetData();
            this.renderer.renderProjects();
            this.renderer.updateCategoryFilter();
            alert(this.i18n.t('resetSuccess'));
        }
    }

    /**
     * Handle save to GitHub
     */
    async handleSaveToGitHub(event) {
        const button = event.target.closest('button');
        const originalText = button ? button.innerHTML : null;

        if (!this.github.hasToken()) {
            if (confirm(this.i18n.t('tokenRequired') + '\n\n' + 
                (this.i18n.getCurrentLang() === 'zh' ? '现在打开设置？' : 'Open settings now?'))) {
                this.openSettingsModal();
            }
            return;
        }

        try {
            if (button) {
                button.innerHTML = '<span>⏳ ' + this.i18n.t('savingToGithub') + '</span>';
                button.disabled = true;
            }

            await this.github.saveToGitHub();

            if (button) {
                button.innerHTML = originalText;
                button.disabled = false;
            }
            alert(this.i18n.t('savedToGithub'));
        } catch (error) {
            if (button) {
                button.innerHTML = originalText;
                button.disabled = false;
            }
            alert(this.i18n.t('saveToGithubError') + '\n\n' + error.message);
        }
    }

    /**
     * Open settings modal
     */
    openSettingsModal() {
        const token = this.github.getToken() || '';
        document.getElementById('github-token').value = token;
        document.getElementById('settings-modal-overlay').classList.add('active');
    }

    /**
     * Close settings modal
     */
    closeSettingsModal(event) {
        // If called from overlay click, only close if clicking on overlay itself
        if (event && event.target && event.currentTarget) {
            if (event.target !== event.currentTarget) {
                return;
            }
        }
        document.getElementById('settings-modal-overlay').classList.remove('active');
    }

    /**
     * Handle save settings
     */
    handleSaveSettings() {
        const token = document.getElementById('github-token').value.trim();
        if (token) {
            this.github.saveToken(token);
            alert(this.i18n.getCurrentLang() === 'zh' ? '设置已保存！' : 'Settings saved!');
            this.closeSettingsModal();
        } else {
            alert(this.i18n.getCurrentLang() === 'zh' ? 
                '请输入有效的 GitHub Token' : 'Please enter a valid GitHub Token');
        }
    }
}
