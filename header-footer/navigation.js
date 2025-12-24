/**
 * 导航栏选中状态管理
 * 遵循SOLID原则，单一职责处理导航状态
 */

class NavigationManager {
    constructor() {
        this.init();
    }
    
    /**
     * 初始化导航栏功能
     */
    init() {
        this.setActiveNavigation();
        this.bindClickEvents();
    }
    
    /**
     * 根据当前页面URL设置激活状态
     */
    setActiveNavigation() {
        try {
            const currentPath = window.location.pathname;
            const fileName = this.extractFileName(currentPath);
            const navLinks = document.querySelectorAll('nav a');
            
            // 移除所有激活状态
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            
            // 根据文件名设置激活状态
            const activeMapping = this.getActiveMapping();
            const activeSelector = activeMapping[fileName];
            
            if (activeSelector) {
                const activeLink = document.querySelector(activeSelector);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        } catch (error) {
            console.warn('导航栏状态设置失败:', error);
        }
    }
    
    /**
     * 提取文件名
     * @param {string} path - 完整路径
     * @returns {string} - 文件名
     */
    extractFileName(path) {
        const segments = path.split('/');
        const fileName = segments[segments.length - 1];
        return fileName || 'index';
    }
    
    /**
     * 获取文件名与导航链接的映射关系
     * @returns {Object} - 映射对象
     */
    getActiveMapping() {
        return {
            'WebsiteHomepage.html': 'nav a[href*="WebsiteHomepage.html"]',
            'index.html': 'nav a[href*="WebsiteHomepage.html"]',
            '': 'nav a[href*="WebsiteHomepage.html"]', // 根路径
            'courseList.html': 'nav a[href*="courseList.html"]',
            'league.html': 'nav a[href*="league.html"]',
            'about-us.html': 'nav a[href*="about-us.html"]',
            'about.html': 'nav a[href*="about-us.html"]'
        };
    }
    
    /**
     * 绑定点击事件
     */
    bindClickEvents() {
        const navLinks = document.querySelectorAll('nav a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // 处理外部链接或特殊链接
                const href = link.getAttribute('href');
                if (!href || href.startsWith('#') || href.startsWith('http')) {
                    return;
                }
                
                // 如果是普通页面链接，设置临时激活状态
                this.setTemporaryActive(link);
            });
        });
    }
    
    /**
     * 设置临时激活状态（点击时的即时反馈）
     * @param {Element} clickedLink - 被点击的链接
     */
    setTemporaryActive(clickedLink) {
        try {
            const navLinks = document.querySelectorAll('nav a');
            
            // 移除所有激活状态
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            
            // 设置当前链接为激活状态
            clickedLink.classList.add('active');
        } catch (error) {
            console.warn('临时激活状态设置失败:', error);
        }
    }
    
    /**
     * 手动设置激活导航项
     * @param {string} selector - CSS选择器
     */
    setActiveItem(selector) {
        try {
            const navLinks = document.querySelectorAll('nav a');
            const targetLink = document.querySelector(selector);
            
            if (!targetLink) {
                console.warn('未找到目标导航项:', selector);
                return;
            }
            
            // 移除所有激活状态
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            
            // 设置目标链接为激活状态
            targetLink.classList.add('active');
        } catch (error) {
            console.error('手动设置激活状态失败:', error);
        }
    }
}

// 页面加载完成后初始化导航管理器
document.addEventListener('DOMContentLoaded', function() {
    // 确保导航栏存在后再初始化
    if (document.querySelector('nav')) {
        window.navigationManager = new NavigationManager();
    }
});

// 导出给其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
} 