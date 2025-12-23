/**
 * app.js - Main Application Entry Point
 * Coordinates all modules and initializes the application
 */

import { I18nManager } from './modules/i18n.js';
import { DataManager } from './modules/dataManager.js';
import { Renderer } from './modules/renderer.js';
import { GitHubManager } from './modules/github.js';
import { UIController } from './modules/ui.js';

/**
 * Application State Management
 */
class AppState {
    constructor() {
        this.i18n = null;
        this.dataManager = null;
        this.renderer = null;
        this.githubManager = null;
        this.uiController = null;
    }

    /**
     * Initialize all modules
     */
    async init() {
        // Initialize I18n first
        this.i18n = new I18nManager();
        await this.i18n.init();

        // Initialize Data Manager
        this.dataManager = new DataManager();
        await this.dataManager.loadProjects();

        // Initialize Renderer
        this.renderer = new Renderer(this.dataManager, this.i18n);

        // Initialize GitHub Manager
        this.githubManager = new GitHubManager(this.dataManager);

        // Initialize UI Controller
        this.uiController = new UIController(
            this.dataManager,
            this.renderer,
            this.i18n,
            this.githubManager
        );

        // Setup UI
        this.setupUI();

        // Initialize UI controller event listeners
        this.uiController.init();

        // Initial render
        this.renderer.renderProjects();
        this.renderer.updateCategoryFilter();
        
        // Apply language to UI
        await this.i18n.setLanguage(this.i18n.getCurrentLang());
        this.renderer.updateFilterStatusOptions();
    }

    /**
     * Setup UI - map data-action attributes to prevent inline onclick
     */
    setupUI() {
        console.log('🔧 Setting up UI event handlers...');
        
        // Click action handlers
        const clickActionMap = {
            // Header buttons
            'set-lang-en': async () => {
                await this.i18n.setLanguage('en');
                this.renderer.updateFilterStatusOptions();
                this.renderer.updateCategoryFilter();
                this.renderer.renderProjects();
            },
            'set-lang-zh': async () => {
                await this.i18n.setLanguage('zh');
                this.renderer.updateFilterStatusOptions();
                this.renderer.updateCategoryFilter();
                this.renderer.renderProjects();
            },
            'reset': () => this.uiController.handleReset(),
            'save-github': (e) => this.uiController.handleSaveToGitHub(e),
            'settings': () => this.uiController.openSettingsModal(),
            'export': () => this.uiController.handleExport(),
            'new-project': () => this.uiController.openProjectModal(),
            
            // Project modal
            'close-modal': (e) => this.uiController.closeProjectModal(e),
            'stop-propagation': (e) => e.stopPropagation(),
            'select-status-initial': () => this.uiController.selectStatus('initial'),
            'select-status-ing': () => this.uiController.selectStatus('ing'),
            'select-status-done': () => this.uiController.selectStatus('done'),
            
            // Settings modal
            'close-settings-modal': (e) => this.uiController.closeSettingsModal(e),
            'save-settings': () => this.uiController.handleSaveSettings()
        };

        // Attach click action handlers
        document.querySelectorAll('[data-action]').forEach(el => {
            const action = el.getAttribute('data-action');
            if (clickActionMap[action]) {
                el.addEventListener('click', clickActionMap[action]);
                console.log(`  ✓ Bound click handler for "${action}"`);
            }
        });

        // Import file input (change event)
        const importInput = document.querySelector('[data-action="import"]');
        if (importInput) {
            importInput.addEventListener('change', (e) => {
                this.uiController.handleImport(e);
            });
            console.log('  ✓ Bound import handler');
        }

        // Filter inputs (input/change events)
        document.querySelectorAll('[data-action="filter-change"]').forEach(el => {
            const eventType = el.tagName === 'INPUT' ? 'input' : 'change';
            el.addEventListener(eventType, () => {
                this.renderer.renderProjects();
            });
            console.log(`  ✓ Bound filter handler for #${el.id}`);
        });

        // Project form submit
        const projectForm = document.getElementById('project-form');
        if (projectForm) {
            projectForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.uiController.handleSaveProject(e);
            });
            console.log('  ✓ Bound project form submit handler');
        }

        console.log('✅ UI event handlers setup complete');
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 App initializing...');
    const app = new AppState();
    await app.init();
    console.log('✅ App initialized successfully');
    
    // Make app available globally for debugging (optional)
    window.app = app;
});
