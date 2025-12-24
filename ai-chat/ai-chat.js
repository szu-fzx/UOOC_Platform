/**
 * AI聊天应用主要功能模块
 * 遵循SOLID原则，每个类和函数只负责单一职责
 */

/**
 * Markdown解析器
 * 负责将markdown文本转换为HTML，并处理代码高亮和安全性
 */
class MarkdownParser {
    constructor() {
        this.initMarked();
    }

    /**
     * 初始化marked配置
     */
    initMarked() {
        // 配置marked选项
        marked.setOptions({
            highlight: function(code, lang) {
                // 使用highlight.js进行代码高亮
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, {language: lang}).value;
                    } catch (err) {
                        console.warn('代码高亮失败:', err);
                    }
                }
                return hljs.highlightAuto(code).value;
            },
            langPrefix: 'hljs language-',
            breaks: true,  // 支持换行
            gfm: true,     // 支持GitHub风格markdown
            tables: true,  // 支持表格
            sanitize: false, // 我们自己处理安全性
            smartLists: true,
            smartypants: false
        });
    }

    /**
     * 解析markdown文本为HTML
     * @param {string} content - markdown文本
     * @returns {string} - 安全的HTML字符串
     */
    parse(content) {
        try {
            if (!content || typeof content !== 'string') {
                return '';
            }

            // 使用marked解析markdown
            let html = marked.parse(content);
            
            // 安全性处理：清理潜在的XSS内容
            html = this.sanitizeHtml(html);
            
            // 为代码块添加复制功能
            html = this.addCodeCopyButtons(html);
            
            return html;
        } catch (error) {
            console.error('Markdown解析失败:', error);
            // 如果解析失败，返回转义的纯文本
            return this.escapeHtml(content);
        }
    }

    /**
     * 安全清理HTML内容
     * @param {string} html - 原始HTML
     * @returns {string} - 清理后的安全HTML
     */
    sanitizeHtml(html) {
        // 创建临时DOM元素进行清理
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // 移除危险的属性和事件
        const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus'];
        const allowedTags = ['p', 'br', 'strong', 'em', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                           'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr'];
        
        // 递归清理所有元素
        this.cleanElement(tempDiv, allowedTags, dangerousAttributes);
        
        return tempDiv.innerHTML;
    }

    /**
     * 递归清理DOM元素
     */
    cleanElement(element, allowedTags, dangerousAttributes) {
        const children = Array.from(element.children);
        
        children.forEach(child => {
            // 检查标签是否允许
            if (!allowedTags.includes(child.tagName.toLowerCase())) {
                // 如果不允许，用span替换但保留内容
                const span = document.createElement('span');
                span.innerHTML = child.innerHTML;
                child.parentNode.replaceChild(span, child);
                return;
            }
            
            // 移除危险属性
            dangerousAttributes.forEach(attr => {
                child.removeAttribute(attr);
            });
            
            // 处理链接安全性
            if (child.tagName.toLowerCase() === 'a') {
                child.setAttribute('target', '_blank');
                child.setAttribute('rel', 'noopener noreferrer');
                
                // 确保链接是安全的
                const href = child.getAttribute('href');
                if (href && !href.match(/^https?:\/\//)) {
                    child.removeAttribute('href');
                }
            }
            
            // 递归处理子元素
            this.cleanElement(child, allowedTags, dangerousAttributes);
        });
    }

    /**
     * 为代码块添加复制按钮
     */
    addCodeCopyButtons(html) {
        // 为代码块添加包装器和复制按钮
        return html.replace(
            /<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g,
            '<div class="code-block-wrapper"><button class="copy-code-btn" onclick="copyCode(this)">复制</button><pre><code$1>$2</code></pre></div>'
        );
    }

    /**
     * 转义HTML特殊字符
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
}

/**
 * 复制代码到剪贴板的全局函数
 */
window.copyCode = function(button) {
    try {
        const codeBlock = button.nextElementSibling.querySelector('code');
        const text = codeBlock.textContent;
        
        // 使用现代浏览器的Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                button.textContent = '已复制!';
                setTimeout(() => {
                    button.textContent = '复制';
                }, 2000);
            }).catch(err => {
                console.error('复制失败:', err);
                fallbackCopyTextToClipboard(text, button);
            });
        } else {
            // 降级方案
            fallbackCopyTextToClipboard(text, button);
        }
    } catch (error) {
        console.error('复制代码时出错:', error);
    }
};

/**
 * 降级的复制文本函数
 */
function fallbackCopyTextToClipboard(text, button) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            button.textContent = '已复制!';
            setTimeout(() => {
                button.textContent = '复制';
            }, 2000);
        }
    } catch (err) {
        console.error('降级复制失败:', err);
    }
    
    document.body.removeChild(textArea);
}

// 应用配置常量
const CONFIG = {
    API_URL: "http://localhost:3001/v2/chat/completions",
    DEFAULT_API_KEY: "Bearer CjPbtFyHkOexDpDmuowR:HlhyHoIrUuSmqEQqzuQR",
    DEFAULT_MODEL: "x1",
    DEFAULT_TOP_K: 6,
    DEFAULT_SYSTEM_PROMPT: "你是一位专业的课程学习助手，致力于帮助学生提高学习效率和理解能力。你能够解答各种学科问题，提供学习方法建议，协助制定学习计划，并鼓励学生主动思考和探索。请以耐心、友善、专业的态度回答问题，并适时提供相关的学习资源和建议。",
    MAX_MESSAGE_LENGTH: 2000,
    STORAGE_KEY: "ai_chat_data",
    TOAST_DURATION: 3000
};

/**
 * 本地存储管理器
 * 负责数据的持久化存储和检索
 */
class StorageManager {
    constructor() {
        this.storageKey = CONFIG.STORAGE_KEY;
        this.checkStorageAvailability();
    }

    /**
     * 检查LocalStorage是否可用
     */
    checkStorageAvailability() {
        try {
            const testKey = 'test_storage_' + Date.now();
            localStorage.setItem(testKey, 'test');
            localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            console.log('LocalStorage可用性检查通过');
            return true;
        } catch (error) {
            console.error('LocalStorage不可用:', error);
            console.error('可能原因: 隐私模式、存储已满、浏览器设置等');
            return false;
        }
    }

    /**
     * 获取存储的所有数据
     */
    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : this.getDefaultData();
        } catch (error) {
            console.error('获取存储数据失败:', error);
            return this.getDefaultData();
        }
    }

    /**
     * 保存数据到本地存储
     */
    saveData(data) {
        try {
            console.log('正在保存数据到localStorage:', data);
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            console.log('数据保存成功');
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            console.error('错误详情:', error.message);
            console.error('尝试保存的数据大小:', JSON.stringify(data).length, '字符');
            return false;
        }
    }

    /**
     * 获取默认数据结构
     */
    getDefaultData() {
        return {
            chatSessions: [],
            currentSessionId: null,
            settings: {
                apiKey: CONFIG.DEFAULT_API_KEY,
                topK: CONFIG.DEFAULT_TOP_K,
                systemPrompt: CONFIG.DEFAULT_SYSTEM_PROMPT,
                autoSave: true
            }
        };
    }

    /**
     * 清除所有存储数据
     */
    clearData() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('清除数据失败:', error);
            return false;
        }
    }
}

/**
 * API通信管理器
 * 负责与AI服务的通信
 */
class APIManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
    }

    /**
     * 发送消息到AI服务
     */
    async sendMessage(userMessage, messageHistory = [], onChunkReceived) {
        const settings = this.storageManager.getData().settings;
        
        try {
            const requestData = this.buildRequestData(userMessage, messageHistory, settings);
            const response = await this.makeAPIRequest(requestData, settings.apiKey);
            
            if (!response.ok) {
                throw new Error(`HTTP错误! 状态: ${response.status}`);
            }
            
            // 使用更简单的流处理方式
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    console.log('流式传输完成');
                    break;
                }

                // 立即解码并处理数据
                const chunk = decoder.decode(value, { stream: true });
                console.log('原始数据块:', chunk);
                
                // 按行分割数据
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    
                    if (trimmedLine === '') continue;
                    
                    // 处理 data: 开头的行
                    if (trimmedLine.startsWith('data:')) {
                        const jsonStr = trimmedLine.substring(5).trim();
                        
                        if (jsonStr === '[DONE]') {
                            console.log('收到结束标志');
                            return;
                        }
                        
                        if (jsonStr === '') continue;
                        
                        try {
                            const data = JSON.parse(jsonStr);
                            if (data.choices && data.choices[0] && data.choices[0].delta) {
                                const delta = data.choices[0].delta;
                                
                                // 处理推理内容和回复内容
                                if (delta.reasoning_content) {
                                    console.log('提取到推理内容:', delta.reasoning_content);
                                    onChunkReceived(delta.reasoning_content, 'reasoning');
                                } else if (delta.content) {
                                    console.log('提取到回复内容:', delta.content);
                                    onChunkReceived(delta.content, 'content');
                                }
                            }
                        } catch (parseError) {
                            console.warn('解析JSON失败:', jsonStr, parseError);
                        }
                    }
                    // 处理直接的JSON行（没有data:前缀）
                    else if (trimmedLine.startsWith('{')) {
                        try {
                            const data = JSON.parse(trimmedLine);
                            if (data.choices && data.choices[0] && data.choices[0].delta) {
                                const delta = data.choices[0].delta;
                                
                                // 处理推理内容和回复内容
                                if (delta.reasoning_content) {
                                    console.log('提取到推理内容:', delta.reasoning_content);
                                    onChunkReceived(delta.reasoning_content, 'reasoning');
                                } else if (delta.content) {
                                    console.log('提取到回复内容:', delta.content);
                                    onChunkReceived(delta.content, 'content');
                                }
                            }
                        } catch (parseError) {
                            console.warn('解析直接JSON失败:', trimmedLine, parseError);
                        }
                    }
                }
            }
            
        } catch (error) {
            console.error('API调用失败:', error);
            throw this.handleAPIError(error);
        }
    }

    /**
     * 构建API请求数据
     */
    buildRequestData(userMessage, messageHistory, settings) {
        const messages = [
            {
                role: "system",
                content: settings.systemPrompt
            },
            ...messageHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            {
                role: "user",
                content: userMessage
            }
        ];

        return {
            model: CONFIG.DEFAULT_MODEL,
            messages: messages,
            top_k: settings.topK,
            stream: true
        };
    }

    /**
     * 发起API请求
     */
    async makeAPIRequest(data, apiKey) {
        const headers = {
            "Authorization": apiKey,
            "Content-Type": "application/json"
        };

        return fetch(CONFIG.API_URL, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(data)
        });
    }

    /**
     * 提取响应中的消息内容
     */
    extractMessageContent(result) {
        if (result.choices && result.choices[0] && result.choices[0].message) {
            return result.choices[0].message.content;
        }
        throw new Error('响应格式错误');
    }

    /**
     * 处理API错误
     */
    handleAPIError(error) {
        if (error.message.includes('401')) {
            return new Error('API密钥无效，请检查设置');
        } else if (error.message.includes('429')) {
            return new Error('请求过于频繁，请稍后再试');
        } else if (error.message.includes('网络')) {
            return new Error('网络连接失败，请检查网络');
        }
        return error;
    }
}

/**
 * 聊天会话管理器
 * 负责管理聊天会话和消息记录
 */
class ChatSessionManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
    }

    /**
     * 创建新的聊天会话
     */
    createNewSession() {
        console.log('正在创建新会话');
        
        const data = this.storageManager.getData();
        const sessionId = this.generateSessionId();
        
        const newSession = {
            id: sessionId,
            title: '新对话',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        data.chatSessions.unshift(newSession);
        data.currentSessionId = sessionId;
        
        console.log('新会话创建完成，准备保存:', { sessionId, autoSave: data.settings.autoSave });
        
        if (data.settings.autoSave) {
            const saveResult = this.storageManager.saveData(data);
            console.log('新会话保存结果:', saveResult);
            
            if (!saveResult) {
                console.error('新会话保存失败!');
            }
        }
        
        return newSession;
    }

    /**
     * 获取当前活动会话
     */
    getCurrentSession() {
        const data = this.storageManager.getData();
        
        if (!data.currentSessionId) {
            return this.createNewSession();
        }
        
        const session = data.chatSessions.find(s => s.id === data.currentSessionId);
        return session || this.createNewSession();
    }

    /**
     * 切换到指定会话
     */
    switchToSession(sessionId) {
        const data = this.storageManager.getData();
        const session = data.chatSessions.find(s => s.id === sessionId);
        
        if (session) {
            data.currentSessionId = sessionId;
            if (data.settings.autoSave) {
                this.storageManager.saveData(data);
            }
            return session;
        }
        
        return null;
    }

    /**
     * 添加消息到当前会话
     */
    addMessage(role, content) {
        console.log('开始添加消息:', { role, content: content.substring(0, 50) + '...' });
        
        const session = this.getCurrentSession();
        const message = {
            id: this.generateMessageId(),
            role: role,
            content: content,
            timestamp: new Date().toISOString()
        };

        session.messages.push(message);
        session.updatedAt = new Date().toISOString();
        
        // 更新会话标题
        if (session.messages.length === 1 && role === 'user') {
            session.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
        }

        // 获取最新的数据并更新
        const data = this.storageManager.getData();
        
        // 确保当前会话在数据中得到了更新
        const sessionIndex = data.chatSessions.findIndex(s => s.id === session.id);
        if (sessionIndex !== -1) {
            data.chatSessions[sessionIndex] = session;
        } else {
            console.warn('未找到当前会话，将其添加到会话列表');
            data.chatSessions.unshift(session);
        }
        
        console.log('准备保存数据，autoSave:', data.settings.autoSave);
        
        if (data.settings.autoSave) {
            const saveResult = this.storageManager.saveData(data);
            console.log('保存结果:', saveResult);
            
            if (!saveResult) {
                console.error('消息保存失败!');
                // 显示保存失败的提示
                if (typeof window !== 'undefined' && window.aiChatApp && window.aiChatApp.uiManager) {
                    window.aiChatApp.uiManager.showToast('消息保存失败，请检查浏览器存储设置', 'error');
                    window.aiChatApp.uiManager.updateSaveStatus('error');
                }
            } else {
                console.log('消息保存成功，当前会话消息数:', session.messages.length);
                // 更新保存状态显示
                if (typeof window !== 'undefined' && window.aiChatApp && window.aiChatApp.uiManager) {
                    window.aiChatApp.uiManager.updateSaveStatus('success');
                }
            }
        } else {
            console.log('自动保存已禁用');
        }

        return message;
    }

    /**
     * 获取所有聊天会话
     */
    getAllSessions() {
        const data = this.storageManager.getData();
        return data.chatSessions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    /**
     * 删除指定会话
     */
    deleteSession(sessionId) {
        const data = this.storageManager.getData();
        data.chatSessions = data.chatSessions.filter(s => s.id !== sessionId);
        
        if (data.currentSessionId === sessionId) {
            data.currentSessionId = data.chatSessions.length > 0 ? data.chatSessions[0].id : null;
        }
        
        if (data.settings.autoSave) {
            this.storageManager.saveData(data);
        }
    }

    /**
     * 清空所有会话
     */
    clearAllSessions() {
        const data = this.storageManager.getData();
        data.chatSessions = [];
        data.currentSessionId = null;
        
        if (data.settings.autoSave) {
            this.storageManager.saveData(data);
        }
    }

    /**
     * 生成唯一的会话ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 生成唯一的消息ID
     */
    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

/**
 * UI管理器
 * 负责界面的渲染和用户交互
 */
class UIManager {
    constructor(sessionManager) {
        this.sessionManager = sessionManager;
        this.elements = {};
        this.isLoading = false;
        this.markdownParser = new MarkdownParser();
        this.init();
    }

    /**
     * 初始化UI元素引用
     */
    init() {
        this.elements = {
            // 主要容器
            welcomeMessage: document.getElementById('welcomeMessage'),
            messagesContainer: document.getElementById('messagesContainer'),
            chatHistoryList: document.getElementById('chatHistoryList'),
            
            // 输入相关
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            charCount: document.getElementById('charCount'),
            
            // 按钮
            newChatBtn: document.getElementById('newChatBtn'),
            clearHistoryBtn: document.getElementById('clearHistoryBtn'),
            exportHistoryBtn: document.getElementById('exportHistoryBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            closeSettingsBtn: document.getElementById('closeSettingsBtn'),
            
            // 设置面板
            settingsPanel: document.getElementById('settingsPanel'),
            apiKeyInput: document.getElementById('apiKeyInput'),
            topKSlider: document.getElementById('topKSlider'),
            topKValue: document.getElementById('topKValue'),
            systemPromptInput: document.getElementById('systemPromptInput'),
            autoSaveToggle: document.getElementById('autoSaveToggle'),
            
            // 加载和通知
            loadingOverlay: document.getElementById('loadingOverlay'),
            toast: document.getElementById('toast'),
            saveStatus: document.getElementById('saveStatus')
        };

        this.bindEvents();
        this.loadInitialData();
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 输入框事件
        this.elements.messageInput.addEventListener('input', () => this.handleInputChange());
        this.elements.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // 按钮点击事件
        this.elements.sendBtn.addEventListener('click', () => this.handleSendMessage());
        this.elements.newChatBtn.addEventListener('click', () => this.handleNewChat());
        this.elements.clearHistoryBtn.addEventListener('click', () => this.handleClearHistory());
        this.elements.exportHistoryBtn.addEventListener('click', () => this.handleExportHistory());
        this.elements.settingsBtn.addEventListener('click', () => this.toggleSettings());
        this.elements.closeSettingsBtn.addEventListener('click', () => this.toggleSettings());
        
        // 设置面板事件
        this.elements.topKSlider.addEventListener('input', () => this.updateTopKValue());
        
        // 快速操作按钮
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-btn')) {
                const prompt = e.target.getAttribute('data-prompt');
                this.elements.messageInput.value = prompt;
                this.handleInputChange();
                this.handleSendMessage();
            }
        });
    }

    /**
     * 加载初始数据
     */
    loadInitialData() {
        this.loadSettings();
        this.renderChatHistory();
        this.renderCurrentSession();
        
        // 检查保存设置并更新状态显示
        const data = this.sessionManager.storageManager.getData();
        if (!data.settings.autoSave) {
            this.updateSaveStatus('disabled');
        }
    }

    /**
     * 加载设置数据
     */
    loadSettings() {
        const data = this.sessionManager.storageManager.getData();
        const settings = data.settings;
        
        this.elements.apiKeyInput.value = settings.apiKey;
        this.elements.topKSlider.value = settings.topK;
        this.elements.topKValue.textContent = settings.topK;
        this.elements.systemPromptInput.value = settings.systemPrompt;
        this.elements.autoSaveToggle.checked = settings.autoSave;
    }

    /**
     * 保存设置
     */
    saveSettings() {
        const data = this.sessionManager.storageManager.getData();
        
        data.settings = {
            apiKey: this.elements.apiKeyInput.value,
            topK: parseInt(this.elements.topKSlider.value),
            systemPrompt: this.elements.systemPromptInput.value,
            autoSave: this.elements.autoSaveToggle.checked
        };
        
        const saveResult = this.sessionManager.storageManager.saveData(data);
        
        if (saveResult) {
            this.showToast('设置已保存', 'success');
            // 更新保存状态显示
            if (!data.settings.autoSave) {
                this.updateSaveStatus('disabled');
            } else {
                this.updateSaveStatus('success');
            }
        } else {
            this.showToast('设置保存失败', 'error');
            this.updateSaveStatus('error');
        }
    }

    /**
     * 处理输入框变化
     */
    handleInputChange() {
        const input = this.elements.messageInput;
        const length = input.value.length;
        
        // 更新字符计数
        this.elements.charCount.textContent = `${length}/${CONFIG.MAX_MESSAGE_LENGTH}`;
        
        // 启用/禁用发送按钮（除非明确禁用）
        if (!this.elements.sendBtn.textContent.includes('发送中')) {
            this.elements.sendBtn.disabled = length === 0 || length > CONFIG.MAX_MESSAGE_LENGTH;
        }
        
        // 自动调整高度
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    }

    /**
     * 处理键盘事件
     */
    handleKeyDown(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            this.handleSendMessage();
        }
    }

    /**
     * 处理发送消息
     */
    async handleSendMessage() {
        const message = this.elements.messageInput.value.trim();
        
        if (!message || this.elements.sendBtn.disabled) {
            return;
        }

        // 创建AI消息容器，但先不设置loading状态，避免阻止渲染
        this.hideWelcomeMessage();
        
        // 添加用户消息
        this.addMessageToUI('user', message);
        this.sessionManager.addMessage('user', message);
        
        // 清空输入框
        this.elements.messageInput.value = '';
        this.handleInputChange();
        
        // 创建AI消息元素
        const thinkingMessage = this.addThinkingIndicator();
        const aiMessageBubble = thinkingMessage.querySelector('.message-bubble');
        console.log(aiMessageBubble)
        let fullResponse = '';
        let firstChunk = true;
        let hasReceivedData = false;

        // 获取消息历史
        const session = this.sessionManager.getCurrentSession();
        const messageHistory = session.messages.slice(0, -1).slice(-10);
        
        console.log('开始发送消息到API...', { message, messageHistory: messageHistory.length });
        
        try {
            // 禁用发送按钮，但不设置全局loading状态
            this.elements.sendBtn.disabled = true;
            this.elements.sendBtn.textContent = '发送中...';
            
            // 调用API
            const apiManager = new APIManager(this.sessionManager.storageManager);
            
            await apiManager.sendMessage(message, messageHistory, (chunk, type) => {
                console.log('前端收到数据块:', JSON.stringify(chunk), '类型:', type);
                hasReceivedData = true;
                
                if (firstChunk) {
                    console.log('处理第一个数据块，切换显示模式');
                    // 清除思考指示器，开始显示实际内容
                    aiMessageBubble.innerHTML = '';
                    thinkingMessage.classList.remove('thinking');
                    
                    // 创建推理内容区域
                    const reasoningDiv = document.createElement('div');
                    reasoningDiv.className = 'reasoning-content';
                    reasoningDiv.style.cssText = `
                        color: #666;
                        font-style: italic;
                        font-size: 0.9em;
                        border-left: 3px solid #e0e0e0;
                        padding-left: 10px;
                        margin-bottom: 10px;
                        white-space: pre-wrap;
                    `;
                    aiMessageBubble.appendChild(reasoningDiv);
                    
                    // 创建最终回复区域
                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'final-content markdown-content';
                    contentDiv.style.cssText = `
                        color: #333;
                        font-weight: normal;
                    `;
                    aiMessageBubble.appendChild(contentDiv);
                    
                    // 添加时间戳
                    const messageContent = thinkingMessage.querySelector('.message-content');
                    const time = document.createElement('div');
                    time.className = 'message-time';
                    time.textContent = this.formatTime(new Date());
                    messageContent.appendChild(time);
                    
                    firstChunk = false;
                }
                
                // 获取推理内容和最终回复区域
                const reasoningDiv = aiMessageBubble.querySelector('.reasoning-content');
                const contentDiv = aiMessageBubble.querySelector('.final-content');
                
                if (type === 'reasoning') {
                    // 累积推理内容
                    if (!reasoningDiv.textContent) {
                        reasoningDiv.textContent = '🤔 思考中: ';
                    }
                    reasoningDiv.textContent += chunk;
                    console.log('更新推理内容，当前长度:', reasoningDiv.textContent.length);
                } else if (type === 'content') {
                    // 累积最终回复内容
                    fullResponse += chunk;
                    // 实时解析并显示markdown内容
                    contentDiv.innerHTML = this.markdownParser.parse(fullResponse);
                    console.log('更新回复内容，当前长度:', fullResponse.length);
                }
                
                // 强制浏览器立即渲染
                aiMessageBubble.offsetHeight; // 触发重绘
                
                // 立即滚动
                this.scrollToBottomImmediate();
                
                // 强制刷新页面渲染
                requestAnimationFrame(() => {
                    this.scrollToBottomImmediate();
                });
            });
            
            console.log('API调用完成', { fullResponse, hasReceivedData });
            
            if (fullResponse && hasReceivedData) {
                // 添加AI回复到存储
                console.log('准备保存AI回复，长度:', fullResponse.length);
                const savedMessage = this.sessionManager.addMessage('assistant', fullResponse);
                console.log('AI消息已保存到会话:', savedMessage.id);
            } else {
                console.warn('没有收到有效的响应数据', { fullResponse, hasReceivedData });
                this.removeThinkingIndicator(thinkingMessage);
                this.showToast('没有收到AI回复，请重试', 'warning');
            }
            
            // 更新侧边栏
            this.renderChatHistory();
            
        } catch (error) {
            console.error('发送消息时出错:', error);
            this.removeThinkingIndicator();
            this.showToast(error.message, 'error');
        } finally {
            // 恢复发送按钮
            this.elements.sendBtn.disabled = false;
            this.elements.sendBtn.textContent = '发送';
            this.handleInputChange(); // 重新检查输入状态
        }
    }

    /**
     * 立即滚动到底部（不使用setTimeout）
     */
    scrollToBottomImmediate() {
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
    }

    /**
     * 添加消息到UI
     */
    addMessageToUI(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'user' ? '我' : 'AI';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        // 根据消息角色决定是否解析markdown
        if (role === 'assistant') {
            // AI回复使用markdown解析
            const markdownContent = document.createElement('div');
            markdownContent.className = 'markdown-content';
            markdownContent.innerHTML = this.markdownParser.parse(content);
            bubble.appendChild(markdownContent);
        } else {
            // 用户消息保持纯文本
            bubble.textContent = content;
        }
        
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = this.formatTime(new Date());
        
        messageContent.appendChild(bubble);
        messageContent.appendChild(time);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        this.elements.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    /**
     * 添加思考指示器
     */
    addThinkingIndicator() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant thinking';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = 'AI';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        
        bubble.appendChild(typingIndicator);
        messageContent.appendChild(bubble);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        this.elements.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    }

    /**
     * 移除思考指示器
     */
    removeThinkingIndicator(element = null) {
        if (element) {
            element.remove();
        } else {
            const thinkingElements = this.elements.messagesContainer.querySelectorAll('.thinking');
            thinkingElements.forEach(el => el.remove());
        }
    }

    /**
     * 渲染当前会话
     */
    renderCurrentSession() {
        const session = this.sessionManager.getCurrentSession();
        
        this.elements.messagesContainer.innerHTML = '';
        
        if (session.messages.length === 0) {
            this.showWelcomeMessage();
        } else {
            this.hideWelcomeMessage();
            session.messages.forEach(message => {
                this.addMessageToUI(message.role, message.content);
            });
        }
    }

    /**
     * 渲染聊天历史
     */
    renderChatHistory() {
        const sessions = this.sessionManager.getAllSessions();
        const currentSessionId = this.sessionManager.getCurrentSession().id;
        
        this.elements.chatHistoryList.innerHTML = '';
        
        sessions.forEach(session => {
            const itemDiv = document.createElement('div');
            itemDiv.className = `chat-history-item ${session.id === currentSessionId ? 'active' : ''}`;
            itemDiv.onclick = () => this.switchToSession(session.id);
            
            const title = document.createElement('div');
            title.className = 'chat-history-title';
            title.textContent = session.title;
            
            const time = document.createElement('div');
            time.className = 'chat-history-time';
            time.textContent = this.formatRelativeTime(new Date(session.updatedAt));
            
            itemDiv.appendChild(title);
            itemDiv.appendChild(time);
            
            this.elements.chatHistoryList.appendChild(itemDiv);
        });
    }

    /**
     * 切换会话
     */
    switchToSession(sessionId) {
        this.sessionManager.switchToSession(sessionId);
        this.renderCurrentSession();
        this.renderChatHistory();
    }

    /**
     * 显示/隐藏欢迎消息
     */
    showWelcomeMessage() {
        this.elements.welcomeMessage.style.display = 'flex';
    }

    hideWelcomeMessage() {
        this.elements.welcomeMessage.style.display = 'none';
    }

    /**
     * 处理新建聊天
     */
    handleNewChat() {
        this.sessionManager.createNewSession();
        this.renderCurrentSession();
        this.renderChatHistory();
        this.showToast('已创建新对话', 'success');
    }

    /**
     * 处理清空历史
     */
    handleClearHistory() {
        if (confirm('确定要清空所有聊天记录吗？此操作不可撤销。')) {
            this.sessionManager.clearAllSessions();
            this.renderCurrentSession();
            this.renderChatHistory();
            this.showToast('聊天记录已清空', 'success');
        }
    }

    /**
     * 处理导出历史
     */
    handleExportHistory() {
        try {
            const sessions = this.sessionManager.getAllSessions();
            const exportData = {
                exportTime: new Date().toISOString(),
                sessions: sessions
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-chat-history-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            this.showToast('对话记录已导出', 'success');
        } catch (error) {
            this.showToast('导出失败', 'error');
        }
    }

    /**
     * 切换设置面板
     */
    toggleSettings() {
        const isActive = this.elements.settingsPanel.classList.toggle('active');
        if (!isActive) {
            this.saveSettings();
        }
    }

    /**
     * 更新top_k值显示
     */
    updateTopKValue() {
        this.elements.topKValue.textContent = this.elements.topKSlider.value;
    }

    /**
     * 设置加载状态
     */
    setLoading(loading) {
        this.isLoading = loading;
        this.elements.loadingOverlay.classList.toggle('active', loading);
        this.handleInputChange(); // 更新发送按钮状态
    }

    /**
     * 显示Toast通知
     */
    showToast(message, type = 'info') {
        const toast = this.elements.toast;
        const messageSpan = toast.querySelector('.toast-message');
        
        messageSpan.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, CONFIG.TOAST_DURATION);
    }

    /**
     * 滚动到底部
     */
    scrollToBottom() {
        setTimeout(() => {
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        }, 100);
    }

    /**
     * 格式化时间
     */
    formatTime(date) {
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * 格式化相对时间
     */
    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        
        return date.toLocaleDateString('zh-CN');
    }

    /**
     * 更新保存状态显示
     */
    updateSaveStatus(status, message) {
        if (!this.elements.saveStatus) return;
        
        this.elements.saveStatus.className = 'save-status';
        
        switch (status) {
            case 'success':
                this.elements.saveStatus.textContent = '✓ 已保存';
                break;
            case 'error':
                this.elements.saveStatus.textContent = '✗ 保存失败';
                this.elements.saveStatus.classList.add('error');
                break;
            case 'warning':
                this.elements.saveStatus.textContent = '⚠ 未保存';
                this.elements.saveStatus.classList.add('warning');
                break;
            case 'disabled':
                this.elements.saveStatus.textContent = '○ 保存已禁用';
                this.elements.saveStatus.classList.add('warning');
                break;
            default:
                this.elements.saveStatus.textContent = '✓ 自动保存';
        }
    }
}

/**
 * 应用主类
 * 负责协调各个管理器的工作
 */
class AIChat {
    constructor() {
        this.storageManager = new StorageManager();
        this.sessionManager = new ChatSessionManager(this.storageManager);
        this.uiManager = new UIManager(this.sessionManager);
        
        // 将实例绑定到全局，方便调试和错误处理
        window.aiChatApp = this;
        
        // 全局错误处理
        window.addEventListener('error', (e) => {
            console.error('全局错误:', e.error);
            this.uiManager.showToast('应用出现错误，请刷新页面', 'error');
        });
        
        // 页面卸载时保存数据
        window.addEventListener('beforeunload', () => {
            this.uiManager.saveSettings();
        });
        
        // 验证存储功能
        this.validateStorage();
    }

    /**
     * 验证存储功能是否正常
     */
    validateStorage() {
        try {
            const testData = this.storageManager.getData();
            console.log('存储验证成功，当前数据:', testData);
            
            if (!testData.settings.autoSave) {
                console.warn('自动保存已禁用，对话将不会被保存');
                this.uiManager.showToast('注意：自动保存已禁用', 'warning');
            }
        } catch (error) {
            console.error('存储验证失败:', error);
            this.uiManager.showToast('存储功能异常，对话可能无法保存', 'error');
        }
    }
}

// 应用初始化
document.addEventListener('DOMContentLoaded', () => {
    try {
        new AIChat();
    } catch (error) {
        console.error('应用初始化失败:', error);
        alert('应用启动失败，请刷新页面重试');
    }
}); 