/**
 * dataManager.js - Data Management Module
 * Handles all project data CRUD operations and persistence
 */

export const APP_VERSION = 'v2.0.0';

// Category and subcategory icons
export const categoryIcons = {
    '元产品': '🧬',
    '工作': '💼',
    '生活': '🌱',
    '旅行': '✈️',
    '学习': '📚',
    '读书': '📖'
};

export const subcategoryIcons = {
    'AI Marketing': '🎯',
    'Yang Study': '👦'
};

// Initial project data
const initialProjects = [
    { id: 1, name: '产品开发方法论分析', nameEn: 'product-design-methodology-generator', category: '元产品', subcategory: '', status: 'done', repo: 'https://github.com/flyzhenghao/product-design-methodology-generator', web_url: '', notes: '', startDate: '', endDate: '' },
    { id: 2, name: '竞品分析', nameEn: 'competitor-analysis', category: '元产品', subcategory: '', status: 'initial', repo: '', web_url: '', notes: '', startDate: '', endDate: '' },
    { id: 3, name: '产品开发计划一览表', nameEn: 'product-dev-overview', category: '元产品', subcategory: '', status: 'done', repo: 'https://github.com/flyzhenghao/AI-Project-List', web_url: '', notes: '', startDate: '', endDate: '2025-12-05' },
    { id: 4, name: 'Next Gen AI Agent', nameEn: 'next-gen-ai-agent', category: '工作', subcategory: '', status: 'initial', repo: '', web_url: '', notes: '', startDate: '', endDate: '' },
    { id: 5, name: 'Business Website', nameEn: 'business-website', category: '工作', subcategory: '', status: 'initial', repo: '', web_url: '', notes: '', startDate: '', endDate: '' },
    { id: 6, name: 'Street Hip-hop Video', nameEn: 'street-hiphop-video', category: '工作', subcategory: 'AI Marketing', status: 'initial', repo: '', web_url: '', notes: '', startDate: '', endDate: '' },
    { id: 7, name: 'AI Impact On Real Estate', nameEn: 'ai-real-estate', category: '工作', subcategory: '', status: 'ing', repo: '', web_url: '', notes: '', startDate: '', endDate: '' },
    { id: 8, name: '个人复盘，人生日记', nameEn: 'life-review-diary', category: '生活', subcategory: '', status: 'initial', repo: '', web_url: '', notes: '', startDate: '', endDate: '' },
    { id: 9, name: '时间记录', nameEn: 'time-tracking', category: '生活', subcategory: '', status: 'initial', repo: '', web_url: '', notes: '', startDate: '', endDate: '' },
    { id: 10, name: '你一生的旅程', nameEn: 'life-journey', category: '生活', subcategory: '', status: 'ing', repo: 'https://github.com/flyzhenghao/life-journey', web_url: '', notes: '', startDate: '', endDate: '' },
    { id: 11, name: '奇特的一生', nameEn: 'extraordinary-life', category: '生活', subcategory: '', status: 'initial', repo: '', web_url: '', notes: '', startDate: '', endDate: '' },
    { id: 12, name: '2025 Xmas Camping', nameEn: '2025-xmas-camping', category: '旅行', subcategory: '', status: 'done', repo: 'https://github.com/flyzhenghao/2025-Xmas-Camping', web_url: '', notes: '', startDate: '', endDate: '' },
    { id: 13, name: '2025 Xmas Trip', nameEn: '2025-xmas-trip', category: '旅行', subcategory: '', status: 'done', repo: 'https://github.com/flyzhenghao/2025-Xmas-Trip', web_url: '', notes: '', startDate: '', endDate: '' },
    { id: 14, name: 'Yang 学习作业', nameEn: 'rangitoto-review-Y9', category: '学习', subcategory: 'Yang Study', status: 'done', repo: '', web_url: '', notes: '', startDate: '', endDate: '' },
    { id: 15, name: '书籍核心内容提取，动态演示', nameEn: 'vant-emergence', category: '读书', subcategory: '', status: 'done', repo: 'https://github.com/flyzhenghao/vant-emergence', web_url: '', notes: '', startDate: '', endDate: '' },
    { id: 16, name: '学以致用：决策系统', nameEn: 'decision-making-system', category: '读书', subcategory: '', status: 'done', repo: 'https://github.com/flyzhenghao/decision-making-system', web_url: '', notes: '', startDate: '', endDate: '' }
];

export class DataManager {
    constructor() {
        this.projects = [];
    }

    /**
     * Load projects from localStorage and data.json
     */
    async loadProjects() {
        // Try to load from localStorage first
        let localData = null;
        const saved = localStorage.getItem('aiProjects');
        const savedTimestamp = localStorage.getItem('aiProjectsLastUpdated');

        if (saved) {
            try {
                localData = JSON.parse(saved);
            } catch (e) {
                console.error('Local data parse error', e);
            }
        }

        // Try to load from data.json
        try {
            const response = await fetch('data.json?t=' + Date.now());
            if (response.ok) {
                const data = await response.json();
                if (data.projects && Array.isArray(data.projects)) {
                    const remoteTimestamp = data.lastUpdated ? new Date(data.lastUpdated).getTime() : 0;
                    const localTime = savedTimestamp ? new Date(savedTimestamp).getTime() : 0;

                    // If local data is newer, keep local
                    if (localData && localTime > remoteTimestamp) {
                        console.log('Local changes are newer than remote. Keeping local data.');
                        this.projects = localData;
                    } else {
                        console.log('Loading projects from data.json');
                        this.projects = data.projects;
                        this.saveToStorage();
                        return;
                    }
                }
            }
        } catch (error) {
            console.log('Could not load data.json, using localStorage fallback', error);
        }

        // Fallback to localStorage or initial data
        if (localData) {
            this.projects = localData;
        } else {
            this.projects = [...initialProjects];
            this.saveToStorage();
        }
    }

    /**
     * Save projects to localStorage
     */
    saveToStorage() {
        localStorage.setItem('aiProjects', JSON.stringify(this.projects));
        localStorage.setItem('aiProjectsLastUpdated', new Date().toISOString());
        localStorage.setItem('aiProjectsVersion', APP_VERSION);
    }

    /**
     * Get all projects
     */
    getProjects() {
        return this.projects;
    }

    /**
     * Get unique categories
     */
    getCategories() {
        return [...new Set(this.projects.map(p => p.category))];
    }

    /**
     * Add a new project
     */
    addProject(projectData) {
        const newProject = {
            ...projectData,
            id: Date.now()
        };
        this.projects.push(newProject);
        this.saveToStorage();
        return newProject;
    }

    /**
     * Update an existing project
     */
    updateProject(id, projectData) {
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            this.projects[index] = { ...projectData, id };
            this.saveToStorage();
            return this.projects[index];
        }
        return null;
    }

    /**
     * Delete a project
     */
    deleteProject(id) {
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            this.projects.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Get project by ID
     */
    getProjectById(id) {
        return this.projects.find(p => p.id === id);
    }

    /**
     * Change project status
     */
    changeStatus(id, newStatus) {
        const project = this.getProjectById(id);
        if (project) {
            project.status = newStatus;
            this.saveToStorage();
            return project;
        }
        return null;
    }

    /**
     * Export data as JSON
     */
    exportData() {
        return JSON.stringify(this.projects, null, 2);
    }

    /**
     * Import data from JSON
     */
    importData(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            if (Array.isArray(imported)) {
                // Ensure all required fields exist
                this.projects = imported.map(p => ({
                    ...p,
                    subcategory: p.subcategory || '',
                    web_url: p.web_url || '',
                    notes: p.notes || ''
                }));
                this.saveToStorage();
                return true;
            }
        } catch (err) {
            console.error('Import error:', err);
        }
        return false;
    }

    /**
     * Reset data to initial state
     */
    resetData() {
        localStorage.removeItem('aiProjects');
        localStorage.removeItem('aiProjectsVersion');
        this.projects = [...initialProjects];
        this.saveToStorage();
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            total: this.projects.length,
            done: this.projects.filter(p => p.status === 'done').length,
            ing: this.projects.filter(p => p.status === 'ing').length,
            initial: this.projects.filter(p => p.status === 'initial').length
        };
    }
}
