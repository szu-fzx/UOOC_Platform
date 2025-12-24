// 课程详情页面脚本
class CourseDetail {
    constructor() {
        this.courseId = new URLSearchParams(window.location.search).get('id');
        this.init();
    }

    async init() {
        try {
            // 等待数据库初始化
            await this.waitForDB();
            
            // 加载课程详情
            await this.loadCourseDetail();
            
            // 设置事件监听
            this.setupEventListeners();
        } catch (error) {
            console.error('初始化失败:', error);
            // 如果没有courseId或加载失败，重定向到首页
            window.location.href = 'index.html';
        }
    }

    // 等待数据库初始化
    async waitForDB() {
        return new Promise(resolve => {
            const checkDB = setInterval(() => {
                if (db.db) {
                    clearInterval(checkDB);
                    resolve();
                }
            }, 100);
        });
    }

    // 加载课程详情
    async loadCourseDetail() {
        try {
            const courseDetail = await courseManager.getCourseDetail(this.courseId);
            if (!courseDetail) {
                throw new Error('课程不存在');
            }
            
            // 更新页面元素
            document.getElementById('course-cover').src = courseDetail.coverImage;
            document.getElementById('course-title').textContent = courseDetail.title;
            document.getElementById('course-teacher').textContent = `讲师：${courseDetail.teacher}`;
            document.getElementById('course-students').textContent = `${courseDetail.enrollCount || 0}人已报名`;
            document.getElementById('course-update-time').textContent = `最后更新：${new Date(courseDetail.updateTime).toLocaleDateString()}`;
            document.getElementById('course-description').textContent = courseDetail.description;

            // 加载课程内容
            this.loadCourseContents(courseDetail.contents);
            
            // 加载评论
            this.loadComments(courseDetail.comments);
            
            // 加载学习进度
            this.loadProgress();
            
        } catch (error) {
            console.error('加载课程详情失败:', error);
            throw error;
        }
    }

    // 加载课程内容
    loadCourseContents(contents) {
        const chapterList = document.getElementById('chapter-list');
        chapterList.innerHTML = contents.map((chapter, index) => `
            <div class="chapter-item">
                <div class="chapter-header">
                    <span class="chapter-title">
                        第${index + 1}章：${chapter.title}
                    </span>
                    <span class="chapter-info">${chapter.lessons?.length || 0}课时</span>
                </div>
                <div class="chapter-content">
                    ${chapter.lessons?.map(lesson => `
                        <div class="lesson-item" data-lesson-id="${lesson.id}">
                            <i class="fas ${this.getContentTypeIcon(lesson.type)}"></i>
                            <span class="lesson-title">${lesson.title}</span>
                            <span class="lesson-duration">${lesson.duration || ''}</span>
                        </div>
                    `).join('') || ''}
                </div>
            </div>
        `).join('');

        // 默认展开第一章
        const firstChapter = chapterList.querySelector('.chapter-content');
        if (firstChapter) {
            firstChapter.classList.add('active');
        }
    }

    // 加载评论
    async loadComments() {
        try {
            const comments = await db.getAll('comments', 'courseId', this.courseId);
            const commentList = document.getElementById('comment-list');
            commentList.innerHTML = comments.map(comment => `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-user">${comment.username}</span>
                        <span class="comment-time">${new Date(comment.createTime).toLocaleString()}</span>
                    </div>
                    <p class="comment-content">${comment.content}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('加载评论失败:', error);
        }
    }

    // 加载学习进度
    async loadProgress() {
        try {
            const user = auth.getCurrentUser();
            if (!user) return;

            const progress = await db.getOne('progress', ['userId', 'courseId'], [user.id, this.courseId]);
            if (progress) {
                const progressFill = document.getElementById('progress-fill');
                const progressText = document.getElementById('progress-text');
                
                progressFill.style.width = `${progress.percentage}%`;
                progressText.textContent = `完成度：${progress.percentage}%`;
            }
        } catch (error) {
            console.error('加载进度失败:', error);
        }
    }

    // 获取内容类型图标
    getContentTypeIcon(type) {
        switch (type) {
            case 'video':
                return 'fa-play-circle';
            case 'document':
                return 'fa-file-alt';
            case 'quiz':
                return 'fa-question-circle';
            default:
                return 'fa-file';
        }
    }

    // 设置事件监听
    setupEventListeners() {
        // 标签页切换
        const tabs = document.querySelectorAll('.tab-item');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 移除所有活动状态
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // 添加当前活动状态
                tab.classList.add('active');
                const tabId = `${tab.dataset.tab}-tab`;
                document.getElementById(tabId).classList.add('active');
            });
        });

        // 章节点击展开/收起
        document.getElementById('chapter-list').addEventListener('click', e => {
            const chapterHeader = e.target.closest('.chapter-header');
            if (chapterHeader) {
                const content = chapterHeader.nextElementSibling;
                content.classList.toggle('active');
            }

            const lessonItem = e.target.closest('.lesson-item');
            if (lessonItem) {
                this.loadLesson(lessonItem.dataset.lessonId);
            }
        });

        // 评论表单提交
        const commentForm = document.getElementById('comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const textarea = commentForm.querySelector('textarea');
                const content = textarea.value.trim();
                
                if (content) {
                    try {
                        const user = auth.getCurrentUser();
                        if (!user) {
                            alert('请先登录');
                            return;
                        }

                        const comment = {
                            courseId: this.courseId,
                            userId: user.id,
                            username: user.username,
                            content: content,
                            createTime: new Date().toISOString()
                        };

                        await db.add('comments', comment);
                        
                        // 重新加载评论
                        await this.loadComments();
                        
                        // 清空输入框
                        textarea.value = '';
                    } catch (error) {
                        console.error('添加评论失败:', error);
                        alert('添加评论失败，请重试');
                    }
                }
            });
        }

        // 笔记表单提交
        const noteForm = document.getElementById('note-form');
        if (noteForm) {
            noteForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const textarea = noteForm.querySelector('textarea');
                const content = textarea.value.trim();
                
                if (content) {
                    try {
                        const user = auth.getCurrentUser();
                        if (!user) {
                            alert('请先登录');
                            return;
                        }

                        const note = {
                            courseId: this.courseId,
                            userId: user.id,
                            content: content,
                            createTime: new Date().toISOString()
                        };

                        await db.add('notes', note);
                        
                        // 重新加载笔记
                        await this.loadNotes();
                        
                        // 清空输入框
                        textarea.value = '';
                    } catch (error) {
                        console.error('添加笔记失败:', error);
                        alert('添加笔记失败，请重试');
                    }
                }
            });
        }
    }

    // 加载课程内容
    async loadLesson(lessonId) {
        try {
            const lesson = await db.getOne('lessons', 'id', lessonId);
            if (!lesson) {
                throw new Error('课时不存在');
            }

            const contentViewer = document.getElementById('content-viewer');
            
            switch (lesson.type) {
                case 'video':
                    contentViewer.innerHTML = `
                        <video controls class="video-player">
                            <source src="${lesson.url}" type="video/mp4">
                            您的浏览器不支持视频播放
                        </video>
                    `;
                    break;
                    
                case 'document':
                    contentViewer.innerHTML = `
                        <iframe src="${lesson.url}" class="document-viewer"></iframe>
                    `;
                    break;
                    
                case 'quiz':
                    contentViewer.innerHTML = `
                        <div class="quiz-container">
                            <h2>${lesson.title}</h2>
                            <div class="quiz-content">${lesson.content}</div>
                        </div>
                    `;
                    break;
                    
                default:
                    contentViewer.innerHTML = `
                        <div class="content-text">${lesson.content}</div>
                    `;
            }

            // 更新学习进度
            await this.updateProgress(lessonId);
            
        } catch (error) {
            console.error('加载课时失败:', error);
        }
    }

    // 更新学习进度
    async updateProgress(lessonId) {
        try {
            const user = auth.getCurrentUser();
            if (!user) return;

            const progress = {
                userId: user.id,
                courseId: this.courseId,
                lastLessonId: lessonId,
                updateTime: new Date().toISOString()
            };

            await db.put('progress', progress);
            await this.loadProgress();
        } catch (error) {
            console.error('更新进度失败:', error);
        }
    }

    // 加载笔记
    async loadNotes() {
        try {
            const user = auth.getCurrentUser();
            if (!user) return;

            const notes = await db.getAll('notes', ['userId', 'courseId'], [user.id, this.courseId]);
            const noteList = document.getElementById('note-list');
            
            noteList.innerHTML = notes.map(note => `
                <div class="note-item">
                    <div class="note-time">${new Date(note.createTime).toLocaleString()}</div>
                    <div class="note-content">${note.content}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('加载笔记失败:', error);
        }
    }
}

// 创建课程详情页面实例
document.addEventListener('DOMContentLoaded', () => {
    const courseDetail = new CourseDetail();
});
