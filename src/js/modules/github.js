/**
 * github.js - GitHub Integration Module
 * Handles saving data to GitHub repository
 */

export class GitHubManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.owner = 'flyzhenghao';
        this.repo = 'AI-Project-List';
        this.branch = 'main';
        this.filePath = 'data.json';
    }

    /**
     * Get GitHub token from localStorage
     */
    getToken() {
        return localStorage.getItem('githubToken');
    }

    /**
     * Save GitHub token
     */
    saveToken(token) {
        localStorage.setItem('githubToken', token);
    }

    /**
     * Check if token is configured
     */
    hasToken() {
        return !!this.getToken();
    }

    /**
     * Save data to GitHub repository
     */
    async saveToGitHub() {
        const token = this.getToken();
        if (!token) {
            throw new Error('TOKEN_REQUIRED');
        }

        try {
            // Prepare data
            const dataObj = {
                version: this.dataManager.constructor.APP_VERSION || 'v2.0.0',
                lastUpdated: new Date().toISOString(),
                projects: this.dataManager.getProjects()
            };
            const content = JSON.stringify(dataObj, null, 2);
            const encodedContent = btoa(unescape(encodeURIComponent(content)));

            // Get current file SHA (with cache busting)
            const timestamp = Date.now();
            const getResponse = await fetch(
                `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.filePath}?ref=${this.branch}&t=${timestamp}`,
                {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    },
                    cache: 'no-cache'
                }
            );

            if (!getResponse.ok) {
                throw new Error('Failed to get current file');
            }

            const fileData = await getResponse.json();
            const sha = fileData.sha;

            // Update file
            const updateResponse = await fetch(
                `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.filePath}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Update project data - ${new Date().toISOString()}`,
                        content: encodedContent,
                        sha: sha,
                        branch: this.branch
                    })
                }
            );

            if (updateResponse.ok) {
                // Update local timestamp to match the one we just successfully sent
                localStorage.setItem('aiProjectsLastUpdated', dataObj.lastUpdated);
                console.log('Successfully saved to GitHub');
                return true;
            } else {
                const errorData = await updateResponse.json();
                console.error('GitHub API Error:', errorData);
                throw new Error(errorData.message || 'Failed to update file');
            }
        } catch (error) {
            console.error('Error saving to GitHub:', error);
            throw error;
        }
    }
}
