/**
 * AI助手悬浮按钮功能模块
 * 遵循SOLID原则和用户规则
 */

class AIAssistantFloatButton {
    constructor(options = {}) {
        this.options = {
            position: 'bottom-right',
            showTooltip: true,
            enablePulse: true,
            aiChatPath: '../ai-chat/ai-chat.html',
            ...options
        };
        
        this.init();
    }

    /**
     * 初始化悬浮按钮
     */
    init() {
        // 检查是否已存在悬浮按钮
        if (document.querySelector('.ai-assistant-float-btn')) {
            return;
        }

        this.createFloatButton();
        this.bindEvents();
        
        // 延迟添加脉冲效果，吸引用户注意
        if (this.options.enablePulse) {
            setTimeout(() => {
                this.addPulseEffect();
            }, 2000);
        }
    }

    /**
     * 创建悬浮按钮元素
     */
    createFloatButton() {
        const floatBtn = document.createElement('a');
        floatBtn.href = this.options.aiChatPath;
        floatBtn.className = 'ai-assistant-float-btn';
        floatBtn.setAttribute('title', 'AI学习助手');
        floatBtn.setAttribute('aria-label', 'AI学习助手');
        
        // 添加机器人图标SVG
        floatBtn.innerHTML = `
            <svg class="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17C15.24 5.06 14.25 5 13.17 5H10.83C9.75 5 8.76 5.06 7.83 5.17L10.5 2.5L9 1L3 7V9C3 10.1 3.9 11 5 11V16C5 17.1 5.9 18 7 18H9L9.5 20V22H14.5V20L15 18H17C18.1 18 19 17.1 19 16V11C20.1 11 21 10.1 21 9ZM11 9H13V11H11V9ZM7 9H9V11H7V9ZM15 9H17V11H15V9Z"/>
            </svg>
        `;

        document.body.appendChild(floatBtn);
        this.floatBtn = floatBtn;
    }

    /**
     * 绑定事件监听
     */
    bindEvents() {
        if (!this.floatBtn) return;

        // 点击事件处理
        this.floatBtn.addEventListener('click', (e) => this.handleClick(e));
        
        // 悬停效果
        this.floatBtn.addEventListener('mouseenter', () => this.handleMouseEnter());
        this.floatBtn.addEventListener('mouseleave', () => this.handleMouseLeave());
        
        // 移动端触摸事件
        this.floatBtn.addEventListener('touchstart', () => this.handleTouchStart());
    }

    /**
     * 处理点击事件
     */
    handleClick(e) {
        // 阻止默认行为，使用JavaScript导航
        e.preventDefault();
        
        // 添加点击动画
        this.floatBtn.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            this.floatBtn.style.transform = '';
            // 导航到AI聊天页面
            this.navigateToAIChat();
        }, 150);
    }

    /**
     * 导航到AI聊天页面
     */
    navigateToAIChat() {
        // 检测当前页面路径，调整AI聊天页面的相对路径
        const currentPath = window.location.pathname;
        let aiChatPath = this.options.aiChatPath;
        
        // 根据当前路径调整相对路径
        if (currentPath.includes('/Homepage/')) {
            aiChatPath = '../ai-chat/ai-chat.html';
        } else if (currentPath.includes('/course/') || 
                   currentPath.includes('/student/') || 
                   currentPath.includes('/teacher/') ||
                   currentPath.includes('/account/')) {
            aiChatPath = '../ai-chat/ai-chat.html';
        } else if (currentPath === '/' || currentPath.includes('index.html')) {
            aiChatPath = 'ai-chat/ai-chat.html';
        }
        
        // 在新窗口/标签页中打开AI聊天页面
        window.open(aiChatPath, '_blank');
    }

    /**
     * 处理鼠标进入事件
     */
    handleMouseEnter() {
        this.removePulseEffect();
    }

    /**
     * 处理鼠标离开事件
     */
    handleMouseLeave() {
        // 可以在这里添加其他逻辑
    }

    /**
     * 处理触摸开始事件
     */
    handleTouchStart() {
        this.removePulseEffect();
    }

    /**
     * 添加脉冲动画效果
     */
    addPulseEffect() {
        if (this.floatBtn && !this.floatBtn.classList.contains('pulse')) {
            this.floatBtn.classList.add('pulse');
        }
    }

    /**
     * 移除脉冲动画效果
     */
    removePulseEffect() {
        if (this.floatBtn && this.floatBtn.classList.contains('pulse')) {
            this.floatBtn.classList.remove('pulse');
        }
    }

    /**
     * 销毁悬浮按钮
     */
    destroy() {
        if (this.floatBtn) {
            this.floatBtn.remove();
            this.floatBtn = null;
        }
    }

    /**
     * 更新按钮配置
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }
}

// 自动初始化悬浮按钮
document.addEventListener('DOMContentLoaded', () => {
    try {
        // 检查是否在AI聊天页面，如果是则不显示悬浮按钮
        if (window.location.pathname.includes('ai-chat.html')) {
            return;
        }
        
        // 创建AI助手悬浮按钮实例
        window.aiAssistantFloat = new AIAssistantFloatButton({
            enablePulse: true,
            showTooltip: true
        });
        
        console.log('AI助手悬浮按钮已初始化');
    } catch (error) {
        console.error('AI助手悬浮按钮初始化失败:', error);
    }
});

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAssistantFloatButton;
}