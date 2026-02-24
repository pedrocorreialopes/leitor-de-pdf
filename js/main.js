/**
 * ADVANCED PDF READER - MAIN JAVASCRIPT
 * Author: Senior Frontend Architect
 * Version: 1.0.0
 * 
 * Features:
 * - PDF.js integration with advanced rendering
 * - Realistic page flip 3D animations
 * - Dark/Light theme toggle
 * - LocalStorage persistence
 * - Keyboard navigation
 * - Responsive design
 * - Accessibility features
 */

class AdvancedPDFReader {
    constructor() {
        // Core elements
        this.elements = {
            // Main containers
            welcomeScreen: document.getElementById('welcomeScreen'),
            readerContainer: document.getElementById('readerContainer'),
            bookContainer: document.getElementById('bookContainer'),
            book: document.getElementById('book'),
            
            // Navigation
            uploadBtn: document.getElementById('uploadBtn'),
            fileInput: document.getElementById('fileInput'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            
            // UI Elements
            themeToggle: document.getElementById('themeToggle'),
            fullscreenBtn: document.getElementById('fullscreenBtn'),
            currentPage: document.getElementById('currentPage'),
            totalPages: document.getElementById('totalPages'),
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            bookTitle: document.getElementById('bookTitle'),
            
            // State elements
            loadingState: document.getElementById('loadingState'),
            errorState: document.getElementById('errorState'),
            errorMessage: document.getElementById('errorMessage'),
            retryBtn: document.getElementById('retryBtn'),
            
            // Welcome screen
            welcomeUploadBtn: document.getElementById('welcomeUploadBtn')
        };

        // Check if PDF.js is available
        if (typeof pdfjsLib === 'undefined') {
            console.error('❌ PDF.js library not loaded');
            this.showError('Biblioteca PDF.js não carregada. Verifique sua conexão com a internet.');
            return;
        }

        // Set PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        // Application state
        this.state = {
            pdf: null,
            currentPageNum: 1,
            totalPageCount: 0,
            isDarkMode: false,
            isFullscreen: false,
            isRendering: false,
            currentFile: null,
            pageCache: new Map(),
            bookTitle: 'Leitor Avançado'
        };

        // Configuration
        this.config = {
            pageScale: 1.5,
            pageQuality: 2.0,
            enableCache: true,
            maxCacheSize: 50,
            animationDuration: 600,
            keyboardNavigation: true,
            autoSave: true
        };

        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            await this.loadSettings();
            this.setupEventListeners();
            this.setupKeyboardNavigation();
            this.setupTheme();
            this.setupIntersectionObserver();
            this.showWelcomeScreen();
            
            console.log('✅ Advanced PDF Reader initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize PDF Reader:', error);
            this.showError('Falha ao inicializar o leitor. Por favor, recarregue a página.');
        }
    }

    /**
     * Handle page visibility changes
     */
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('📄 Page hidden, pausing operations');
            this.saveSettings();
        } else {
            console.log('📄 Page visible, resuming operations');
            this.restoreReadingState();
        }
    }

    /**
     * Restore reading state when page becomes visible
     */
    restoreReadingState() {
        if (this.state.pdf && this.state.currentPageNum) {
            this.updatePageDisplay();
        }
    }

    /**
     * Load saved settings from localStorage
     */
    async loadSettings() {
        try {
            const savedSettings = localStorage.getItem('pdfReaderSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.state.isDarkMode = settings.isDarkMode || false;
                this.state.currentFile = settings.currentFile || null;
                this.state.bookTitle = settings.bookTitle || 'Leitor Avançado';
                
                // Apply theme immediately
                this.applyTheme(this.state.isDarkMode);
            }
        } catch (error) {
            console.warn('⚠️ Could not load settings:', error);
        }
    }

    /**
     * Save current settings to localStorage
     */
    async saveSettings() {
        try {
            const settings = {
                isDarkMode: this.state.isDarkMode,
                currentFile: this.state.currentFile,
                bookTitle: this.state.bookTitle,
                currentPage: this.state.currentPageNum,
                timestamp: Date.now()
            };
            localStorage.setItem('pdfReaderSettings', JSON.stringify(settings));
        } catch (error) {
            console.warn('⚠️ Could not save settings:', error);
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // File upload
        this.elements.uploadBtn.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.welcomeUploadBtn.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // Navigation
        this.elements.prevBtn.addEventListener('click', () => this.goToPreviousPage());
        this.elements.nextBtn.addEventListener('click', () => this.goToNextPage());

        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Fullscreen
        this.elements.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // Error retry
        this.elements.retryBtn.addEventListener('click', () => this.retry());

        // Window events
        window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        
        // Visibility change for performance
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        if (!this.config.keyboardNavigation) return;

        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key) {
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    this.goToPreviousPage();
                    break;
                case 'ArrowRight':
                case 'PageDown':
                case ' ':
                    e.preventDefault();
                    this.goToNextPage();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToPage(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToPage(this.state.totalPageCount);
                    break;
                case 'f':
                case 'F11':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 't':
                    e.preventDefault();
                    this.toggleTheme();
                    break;
                case 'Escape':
                    if (this.state.isFullscreen) {
                        e.preventDefault();
                        this.exitFullscreen();
                    }
                    break;
            }
        });
    }

    /**
     * Setup Intersection Observer for performance optimization
     */
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Page is visible, ensure it's rendered
                        const pageNum = parseInt(entry.target.dataset.page);
                        if (pageNum && !this.state.pageCache.has(pageNum)) {
                            this.renderPage(pageNum);
                        }
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });
        }
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        if (!file.type || !file.type.includes('pdf')) {
            this.showError('Por favor, selecione um arquivo PDF válido.');
            return;
        }

        // Check file size (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            this.showError('O arquivo é muito grande. O tamanho máximo é 50MB.');
            return;
        }

        try {
            this.showLoadingState();
            await this.loadPDF(file);
            this.state.currentFile = {
                name: file.name,
                size: file.size,
                lastModified: file.lastModified
            };
            this.state.bookTitle = file.name.replace(/\.pdf$/i, '');
            
            if (this.config.autoSave) {
                await this.saveSettings();
            }
            
            this.hideLoadingState();
            this.showReader();
            
            console.log(`✅ PDF loaded: ${file.name}`);
        } catch (error) {
            console.error('❌ Failed to load PDF:', error);
            this.showError(`Erro ao carregar PDF: ${error.message}`);
        }
    }

    /**
     * Load PDF file using PDF.js
     */
    async loadPDF(file) {
        try {
            // Read file as ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            
            // Load PDF document
            const pdf = await pdfjsLib.getDocument({
                data: arrayBuffer,
                // Improve performance
                disableAutoFetch: true,
                disableStream: false,
                disableFontFace: false
            }).promise;

            this.state.pdf = pdf;
            this.state.totalPageCount = pdf.numPages;
            this.state.currentPageNum = 1;
            this.state.pageCache.clear();

            // Update UI
            this.updateNavigation();
            this.updateProgress();
            this.elements.bookTitle.textContent = this.state.bookTitle;
            this.elements.totalPages.textContent = this.state.totalPageCount;

            // Render first pages
            await this.renderInitialPages();

        } catch (error) {
            throw new Error(`Falha ao processar PDF: ${error.message}`);
        }
    }

    /**
     * Render initial pages
     */
    async renderInitialPages() {
        if (!this.state.pdf) return;

        try {
            // Render first page to show immediately
            await this.renderPage(1);
            
            // Pre-render next few pages for better UX
            const pagesToPreRender = Math.min(3, this.state.totalPageCount);
            for (let i = 2; i <= pagesToPreRender; i++) {
                this.renderPage(i);
            }
        } catch (error) {
            console.error('❌ Failed to render initial pages:', error);
        }
    }

    /**
     * Render a specific page
     */
    async renderPage(pageNum) {
        if (!this.state.pdf || pageNum < 1 || pageNum > this.state.totalPageCount) {
            return null;
        }

        // Check cache first
        if (this.config.enableCache && this.state.pageCache.has(pageNum)) {
            return this.state.pageCache.get(pageNum);
        }

        try {
            const page = await this.state.pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: this.config.pageScale });

            // Create canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            canvas.width = viewport.width * this.config.pageQuality;
            canvas.height = viewport.height * this.config.pageQuality;
            canvas.style.width = viewport.width + 'px';
            canvas.style.height = viewport.height + 'px';
            canvas.className = 'pdf-page-canvas';

            // Render page
            const renderContext = {
                canvasContext: context,
                viewport: viewport,
                transform: [this.config.pageQuality, 0, 0, this.config.pageQuality, 0, 0],
                enableWebGL: false
            };

            await page.render(renderContext).promise;

            // Cache the rendered page
            if (this.config.enableCache) {
                this.state.pageCache.set(pageNum, canvas);
                
                // Manage cache size
                if (this.state.pageCache.size > this.config.maxCacheSize) {
                    const firstKey = this.state.pageCache.keys().next().value;
                    this.state.pageCache.delete(firstKey);
                }
            }

            return canvas;
        } catch (error) {
            console.error(`❌ Failed to render page ${pageNum}:`, error);
            return null;
        }
    }

    /**
     * Navigate to previous page with flip animation
     */
    async goToPreviousPage() {
        if (this.state.currentPageNum <= 1 || this.state.isRendering) return;

        this.state.isRendering = true;
        const targetPage = this.state.currentPageNum - 1;

        try {
            // Create page flip animation
            await this.animatePageFlip('prev', targetPage);
            
            this.state.currentPageNum = targetPage;
            this.updateNavigation();
            this.updateProgress();
            
            if (this.config.autoSave) {
                await this.saveSettings();
            }
            
            // Pre-render adjacent pages
            this.preRenderAdjacentPages(targetPage);
            
        } catch (error) {
            console.error('❌ Failed to navigate to previous page:', error);
        } finally {
            this.state.isRendering = false;
        }
    }

    /**
     * Navigate to next page with flip animation
     */
    async goToNextPage() {
        if (this.state.currentPageNum >= this.state.totalPageCount || this.state.isRendering) return;

        this.state.isRendering = true;
        const targetPage = this.state.currentPageNum + 1;

        try {
            // Create page flip animation
            await this.animatePageFlip('next', targetPage);
            
            this.state.currentPageNum = targetPage;
            this.updateNavigation();
            this.updateProgress();
            
            if (this.config.autoSave) {
                await this.saveSettings();
            }
            
            // Pre-render adjacent pages
            this.preRenderAdjacentPages(targetPage);
            
        } catch (error) {
            console.error('❌ Failed to navigate to next page:', error);
        } finally {
            this.state.isRendering = false;
        }
    }

    /**
     * Navigate to specific page
     */
    async goToPage(pageNum) {
        if (pageNum < 1 || pageNum > this.state.totalPageCount || pageNum === this.state.currentPageNum) {
            return;
        }

        const direction = pageNum > this.state.currentPageNum ? 'next' : 'prev';
        
        if (direction === 'next') {
            await this.goToNextPage();
        } else {
            await this.goToPreviousPage();
        }
    }

    /**
     * Animate page flip with 3D effect
     */
    async animatePageFlip(direction, targetPage) {
        return new Promise((resolve) => {
            const book = this.elements.book;
            
            // Create page elements if they don't exist
            this.createPageElements(targetPage, direction);
            
            const currentPage = book.querySelector('.page--current');
            const newPage = book.querySelector('.page--new');
            
            if (!currentPage || !newPage) {
                resolve();
                return;
            }

            // Add flip animation classes
            if (direction === 'next') {
                currentPage.classList.add('page--flipping-next');
                newPage.classList.add('page--entering-next');
            } else {
                currentPage.classList.add('page--flipping-prev');
                newPage.classList.add('page--entering-prev');
            }
            
            // After animation completes, clean up and update
            setTimeout(() => {
                try {
                    // Clean up old page
                    const oldPage = book.querySelector('.page--current');
                    if (oldPage) {
                        oldPage.remove();
                    }
                    
                    // Make new page current
                    newPage.classList.remove('page--new', 'page--entering-next', 'page--entering-prev');
                    newPage.classList.add('page--current');
                    
                } catch (error) {
                    console.error('❌ Failed to complete page flip:', error);
                }
                
                resolve();
            }, this.config.animationDuration);
        });
    }

    /**
     * Create page elements for flip animation
     */
    async createPageElements(pageNum, direction) {
        const book = this.elements.book;
        
        // Clear any existing new pages
        const existingNewPage = book.querySelector('.page--new');
        if (existingNewPage) {
            existingNewPage.remove();
        }
        
        // Create new page container
        const newPage = document.createElement('div');
        newPage.className = 'page page--new';
        newPage.dataset.page = pageNum;
        
        // Create page content
        const pageContent = document.createElement('div');
        pageContent.className = 'page__content';
        
        // Render the page
        const canvas = await this.renderPage(pageNum);
        if (canvas) {
            pageContent.appendChild(canvas);
        } else {
            pageContent.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
                    <div>Página ${pageNum}</div>
                </div>
            `;
        }
        
        // Add page number
        const pageNumber = document.createElement('div');
        pageNumber.className = 'page__number';
        pageNumber.textContent = `Página ${pageNum}`;
        
        newPage.appendChild(pageContent);
        newPage.appendChild(pageNumber);
        
        // Position the new page based on direction
        if (direction === 'next') {
            newPage.classList.add('page--right');
        } else {
            newPage.classList.add('page--left');
        }
        
        book.appendChild(newPage);
        
        // Force reflow
        newPage.offsetHeight;
    }

    /**
     * Pre-render adjacent pages for better performance
     */
    preRenderAdjacentPages(currentPage) {
        const pagesToPreRender = 2;
        
        for (let i = 1; i <= pagesToPreRender; i++) {
            const nextPage = currentPage + i;
            const prevPage = currentPage - i;
            
            if (nextPage <= this.state.totalPageCount) {
                this.renderPage(nextPage);
            }
            
            if (prevPage > 0) {
                this.renderPage(prevPage);
            }
        }
    }

    /**
     * Update navigation buttons state
     */
    updateNavigation() {
        this.elements.prevBtn.disabled = this.state.currentPageNum <= 1;
        this.elements.nextBtn.disabled = this.state.currentPageNum >= this.state.totalPageCount;
        this.elements.currentPage.textContent = this.state.currentPageNum;
    }

    /**
     * Update progress bar
     */
    updateProgress() {
        const progress = this.state.totalPageCount > 0 
            ? (this.state.currentPageNum / this.state.totalPageCount) * 100 
            : 0;
        
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressText.textContent = `${this.state.currentPageNum} / ${this.state.totalPageCount}`;
    }

    /**
     * Toggle between light and dark theme
     */
    toggleTheme() {
        this.state.isDarkMode = !this.state.isDarkMode;
        this.applyTheme(this.state.isDarkMode);
        this.saveSettings();
    }

    /**
     * Apply theme
     */
    applyTheme(isDark) {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        
        // Update theme toggle button
        const themeIcon = this.elements.themeToggle.querySelector('.nav__btn-icon');
        const themeText = this.elements.themeToggle.querySelector('.nav__btn-text');
        
        if (themeIcon) {
            themeIcon.textContent = isDark ? '☀️' : '🌙';
        }
        
        if (themeText) {
            themeText.textContent = isDark ? 'Modo Claro' : 'Modo Noturno';
        }
    }

    /**
     * Setup theme from system preference
     */
    setupTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (this.state.isDarkMode === undefined) {
            this.state.isDarkMode = prefersDark;
        }
        
        this.applyTheme(this.state.isDarkMode);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (this.state.isDarkMode === undefined) {
                this.applyTheme(e.matches);
            }
        });
    }

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    /**
     * Enter fullscreen mode
     */
    async enterFullscreen() {
        try {
            await document.documentElement.requestFullscreen();
            this.state.isFullscreen = true;
            this.updateFullscreenButton();
        } catch (error) {
            console.warn('⚠️ Failed to enter fullscreen:', error);
        }
    }

    /**
     * Exit fullscreen mode
     */
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            this.state.isFullscreen = false;
            this.updateFullscreenButton();
        }
    }

    /**
     * Update fullscreen button state
     */
    updateFullscreenButton() {
        const fullscreenIcon = this.elements.fullscreenBtn.querySelector('.nav__btn-icon');
        const fullscreenText = this.elements.fullscreenBtn.querySelector('.nav__btn-text');
        
        if (fullscreenIcon) {
            fullscreenIcon.textContent = this.state.isFullscreen ? '⛶' : '⛶';
        }
        
        if (fullscreenText) {
            fullscreenText.textContent = this.state.isFullscreen ? 'Sair Tela Cheia' : 'Tela Cheia';
        }
    }

    /**
     * Handle fullscreen change
     */
    handleFullscreenChange() {
        this.state.isFullscreen = !!document.fullscreenElement;
        this.updateFullscreenButton();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Re-render current page if needed
        if (this.state.pdf && this.state.currentPageNum > 0) {
            // Clear cache for current page to force re-render
            this.state.pageCache.delete(this.state.currentPageNum);
            this.renderPage(this.state.currentPageNum);
        }
    }

    /**
     * Handle visibility change for performance
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden, pause any intensive operations
            console.log('📄 Page hidden, pausing operations');
        } else {
            // Page is visible again
            console.log('📄 Page visible, resuming operations');
        }
    }

    /**
     * Show welcome screen
     */
    showWelcomeScreen() {
        console.log('🎉 Showing welcome screen');
        this.elements.welcomeScreen.style.display = 'flex';
        this.elements.welcomeScreen.hidden = false;
        this.elements.readerContainer.style.display = 'none';
        this.elements.readerContainer.hidden = true;
        this.elements.loadingState.style.display = 'none';
        this.elements.loadingState.hidden = true;
        this.elements.errorState.style.display = 'none';
        this.elements.errorState.hidden = true;
    }

    /**
     * Show reader interface
     */
    showReader() {
        this.elements.welcomeScreen.hidden = true;
        this.elements.readerContainer.hidden = false;
        this.elements.loadingState.hidden = true;
        this.elements.errorState.hidden = true;
        
        // Create initial page structure
        this.createInitialPageStructure();
    }

    /**
     * Create initial page structure for flip animation
     */
    createInitialPageStructure() {
        const book = this.elements.book;
        book.innerHTML = '';
        
        // Create left and right pages
        const leftPage = document.createElement('div');
        leftPage.className = 'page page--left page--current';
        leftPage.dataset.page = this.state.currentPageNum;
        
        const rightPage = document.createElement('div');
        rightPage.className = 'page page--right page--current';
        rightPage.dataset.page = this.state.currentPageNum + 1;
        
        // Add content containers
        const leftContent = document.createElement('div');
        leftContent.className = 'page__content';
        
        const rightContent = document.createElement('div');
        rightContent.className = 'page__content';
        
        // Add page numbers
        const leftNumber = document.createElement('div');
        leftNumber.className = 'page__number';
        leftNumber.textContent = `Página ${this.state.currentPageNum}`;
        
        const rightNumber = document.createElement('div');
        rightNumber.className = 'page__number';
        rightNumber.textContent = `Página ${this.state.currentPageNum + 1}`;
        
        leftPage.appendChild(leftContent);
        leftPage.appendChild(leftNumber);
        
        rightPage.appendChild(rightContent);
        rightPage.appendChild(rightNumber);
        
        book.appendChild(leftPage);
        book.appendChild(rightPage);
        
        // Render content
        this.renderPageContent(leftContent, this.state.currentPageNum);
        if (this.state.currentPageNum + 1 <= this.state.totalPageCount) {
            this.renderPageContent(rightContent, this.state.currentPageNum + 1);
        }
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        this.elements.loadingState.hidden = false;
        this.elements.welcomeScreen.hidden = true;
        this.elements.readerContainer.hidden = true;
        this.elements.errorState.hidden = true;
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        this.elements.loadingState.hidden = true;
    }

    /**
     * Show error state
     */
    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorState.hidden = false;
        this.elements.welcomeScreen.hidden = true;
        this.elements.readerContainer.hidden = true;
        this.elements.loadingState.hidden = true;
    }

    /**
     * Retry current operation
     */
    retry() {
        if (this.state.currentFile) {
            // Try to reload the current file
            this.loadPDF(this.state.currentFile);
        } else {
            this.showWelcomeScreen();
        }
    }

    /**
     * Debounce function for performance
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Render page content
     */
    async renderPageContent(container, pageNum) {
        if (!this.state.pdf || pageNum > this.state.totalPageCount) {
            container.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; color: var(--text-muted);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
                    <div>Página ${pageNum}</div>
                </div>
            `;
            return;
        }

        try {
            const canvas = await this.renderPage(pageNum);
            if (canvas) {
                container.innerHTML = '';
                container.appendChild(canvas);
            } else {
                container.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; color: var(--text-muted);">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
                        <div>Página ${pageNum}</div>
                    </div>
                `;
            }
        } catch (error) {
            console.error(`❌ Failed to render page ${pageNum}:`, error);
            container.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; color: var(--color-error);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <div>Erro ao renderizar página ${pageNum}</div>
                </div>
            `;
        }
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        // Clear page cache
        this.state.pageCache.clear();
        
        // Destroy PDF document
        if (this.state.pdf) {
            this.state.pdf.destroy();
            this.state.pdf = null;
        }
        
        // Disconnect observer
        if (this.observer) {
            this.observer.disconnect();
        }
        
        console.log('🧹 Cleanup completed');
    }
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check for browser compatibility
    if (!window.pdfjsLib) {
        console.error('❌ PDF.js library not loaded');
        document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">' +
            '<h1>Erro</h1><p>Biblioteca PDF.js não carregada. Verifique sua conexão com a internet.</p></div>';
        return;
    }

    // Configure PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // Initialize the reader
    window.pdfReader = new AdvancedPDFReader();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.pdfReader) {
        window.pdfReader.cleanup();
    }
});

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
    if (window.pdfReader) {
        window.pdfReader.handleVisibilityChange();
    }
});