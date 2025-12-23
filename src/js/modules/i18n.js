/**
 * i18n.js - Internationalization Module
 * Handles multi-language support for the application
 */

export class I18nManager {
    constructor() {
        this.currentLang = localStorage.getItem('lang') || 'en';
        this.translations = {};
        this.loadedLanguages = new Set();
    }

    /**
     * Load translation file for a specific language
     */
    async loadLanguage(lang) {
        if (this.loadedLanguages.has(lang)) {
            return this.translations[lang];
        }

        try {
            const response = await fetch(`src/locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load language: ${lang}`);
            }
            this.translations[lang] = await response.json();
            this.loadedLanguages.add(lang);
            return this.translations[lang];
        } catch (error) {
            console.error('Error loading language file:', error);
            return {};
        }
    }

    /**
     * Get translated text for a key
     */
    t(key) {
        const currentTranslations = this.translations[this.currentLang];
        return currentTranslations?.[key] || key;
    }

    /**
     * Get current language
     */
    getCurrentLang() {
        return this.currentLang;
    }

    /**
     * Set language and update UI
     */
    async setLanguage(lang) {
        await this.loadLanguage(lang);
        this.currentLang = lang;
        localStorage.setItem('lang', lang);
        this.updateUI();
    }

    /**
     * Update all translatable elements in the DOM
     */
    updateUI() {
        // Update language toggle buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if ((this.currentLang === 'en' && btn.textContent === 'EN') ||
                (this.currentLang === 'zh' && btn.textContent === '中文')) {
                btn.classList.add('active');
            }
        });

        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
    }

    /**
     * Initialize i18n system
     */
    async init() {
        await this.loadLanguage(this.currentLang);
        // Load the other language in background for faster switching
        const otherLang = this.currentLang === 'en' ? 'zh' : 'en';
        this.loadLanguage(otherLang);
    }
}
