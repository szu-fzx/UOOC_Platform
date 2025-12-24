class CoursePage {
    constructor() {
        this.courseId = new URLSearchParams(window.location.search).get('id');
        this.currentUser = null;
        this.currentChapter = null;
        this.currentContent = null;

        this.initializeComponents();
        this.loadCourseData();
    }

    async initializeComponents() {
        // 检查用户登录状态
        this.currentUser = await this.checkAuthStatus();
        
        // 初始化标签页
        this.initializeTabs();
        
        // 设置事件监听器
        this.setupEventListeners();
        
        // 根据用户状态更新UI
        this.updateUIBasedOnAuth();
    }

    async checkAuthStatus() {
        try {
            const user = await db.getCurrentUser();
            this.updateUserMenu(user);
            return user;
        } catch (error) {
            console.error('检查用户状态失败:', error);
            return null;
        }
    }

    updateUserMenu(user) {
        const userMenu = document.querySelector('.user-menu');
        if (user) {
            userMenu.innerHTML = `
                <span class="user-name">${user.name}</span>
                <button id="logoutBtn">退出</button>
            `;
        } else {
            userMenu.innerHTML = `
                <button id="loginBtn">登录</button>
                <button id="registerBtn">注册</button>
            `;
        }
    }

    async loadCourseData() {
        try {
            // 加载课程基本信息
            const course = await db.getCourse(this.courseId);
            if (!course) {
                window.location.href = '/index.html';
                return;
            }

            // 更新页面标题
            document.title = `${course.title} - 在线课程教学平台`;

            // 更新课程信息
            this.updateCourseInfo(course);

            // 加载章节列表
            await this.loadChapters();

            // 加载第一个内容
            if (course.chapters && course.chapters.length > 0) {
                await this.loadContent(course.chapters[0].contents[0].id);
            }

            // 更新报名按钮状态
            this.updateEnrollStatus();
        } catch (error) {
            console.error('加载课程数据失败:', error);
        }
    }

    updateCourseInfo(course) {
        document.getElementById('courseTitle').textContent = course.title;
        document.getElementById('courseTeacher').innerHTML = `
            <i class="fas fa-user"></i> ${course.teacherName}
        `;
        document.getElementById('courseCategory').innerHTML = `
            <i class="fas fa-folder"></i> ${course.categoryName}
        `;
        document.getElementById('courseStudents').innerHTML = `
            <i class="fas fa-users"></i> ${course.enrollmentCount} 名学生
        `;
        document.getElementById('courseUpdateTime').innerHTML = `
            <i class="fas fa-clock"></i> 最后更新: ${new Date(course.updatedAt).toLocaleDateString()}
        `;
        document.getElementById('courseDescription').textContent = course.description;
    }

    async loadChapters() {
        try {
            const chapters = await db.getCourseChapters(this.courseId);
            const chapterList = document.getElementById('chapterList');
            
            chapterList.innerHTML = chapters.map(chapter => `
                <div class="chapter-item">
                    <div class="chapter-header" data-chapter-id="${chapter.id}">
                        <span>${chapter.title}</span>
                        <span>${chapter.contents.length} 课时</span>
                    </div>
                    <div class="chapter-content">
                        ${chapter.contents.map(content => `
                            <div class="lesson-item" data-content-id="${content.id}">
                                <img src="images/${content.type}-icon.svg" class="lesson-icon" alt="${content.type}">
                                <span>${content.title}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');

            // 默认展开第一个章节
            const firstChapter = chapterList.querySelector('.chapter-content');
            if (firstChapter) {
                firstChapter.classList.add('active');
            }
        } catch (error) {
            console.error('加载章节失败:', error);
        }
    }

    async loadContent(contentId) {
        try {
            const content = await db.getContent(contentId);
            this.currentContent = content;
            const contentViewer = document.querySelector('.content-viewer');

            switch (content.type) {
                case 'video':
                    contentViewer.innerHTML = `
                        <video class="video-player" controls>
                            <source src="${content.url}" type="video/mp4">
                            您的浏览器不支持视频播放
                        </video>
                        <h2>${content.title}</h2>
                        <div class="content-description">${content.description}</div>
                    `;
                    break;

                case 'document':
                    contentViewer.innerHTML = `
                        <iframe class="document-viewer" src="${content.url}"></iframe>
                        <h2>${content.title}</h2>
                        <div class="content-description">${content.description}</div>
                    `;
                    break;

                default:
                    contentViewer.innerHTML = `
                        <h2>${content.title}</h2>
                        <div class="content-text">${content.content}</div>
                    `;
            }

            // 如果用户已登录，记录学习进度
            if (this.currentUser) {
                await this.recordProgress(contentId);
            }
        } catch (error) {
            console.error('加载内容失败:', error);
        }
    }

    async loadDiscussions() {
        try {
            const discussions = await db.getCourseDiscussions(this.courseId);
            const discussionList = document.getElementById('discussionList');
            
            discussionList.innerHTML = discussions.map(discussion => `
                <div class="discussion-item">
                    <div class="discussion-header">
                        <span class="discussion-author">${discussion.userName}</span>
                        <span class="discussion-time">
                            ${new Date(discussion.createdAt).toLocaleString()}
                        </span>
                    </div>
                    <div class="discussion-content">${discussion.content}</div>
                </div>
            `).join('');

            // 根据用户状态显示/隐藏评论框
            const discussionForm = document.getElementById('discussionForm');
            discussionForm.style.display = this.currentUser ? 'block' : 'none';
        } catch (error) {
            console.error('加载讨论失败:', error);
        }
    }

    async loadNotes() {
        if (!this.currentUser) {
            document.getElementById('noteList').innerHTML = `
                <div class="login-prompt">登录后可以查看和记录笔记</div>
            `;
            document.getElementById('noteForm').style.display = 'none';
            return;
        }

        try {
            const notes = await db.getCourseNotes(this.courseId, this.currentUser.id);
            const noteList = document.getElementById('noteList');
            
            noteList.innerHTML = notes.map(note => `
                <div class="note-item">
                    <div class="note-time">
                        ${new Date(note.createdAt).toLocaleString()}
                    </div>
                    <div class="note-content">${note.content}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('加载笔记失败:', error);
        }
    }

    async recordProgress(contentId) {
        try {
            await db.recordProgress(this.courseId, contentId, this.currentUser.id);
        } catch (error) {
            console.error('记录进度失败:', error);
        }
    }

    async updateEnrollStatus() {
        const enrollButton = document.getElementById('enrollButton');
        if (!this.currentUser) {
            enrollButton.textContent = '登录后报名';
            enrollButton.onclick = () => window.location.href = '/login.html';
            return;
        }

        try {
            const isEnrolled = await db.checkEnrollment(this.courseId, this.currentUser.id);
            if (isEnrolled) {
                enrollButton.textContent = '已报名';
                enrollButton.disabled = true;
            } else {
                enrollButton.textContent = '立即报名';
                enrollButton.onclick = () => this.enrollCourse();
            }
        } catch (error) {
            console.error('检查报名状态失败:', error);
        }
    }

    async enrollCourse() {
        try {
            await db.enrollCourse(this.courseId, this.currentUser.id);
            this.updateEnrollStatus();
            // 触发课程更新事件
            document.dispatchEvent(new CustomEvent('courseEnrollment', {
                detail: { courseId: this.courseId }
            }));
        } catch (error) {
            console.error('报名课程失败:', error);
        }
    }

    initializeTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 移除所有活动状态
                tabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => 
                    c.classList.add('hidden')
                );
                
                // 设置当前标签为活动状态
                tab.classList.add('active');
                const contentId = tab.dataset.tab + 'Tab';
                document.getElementById(contentId).classList.remove('hidden');
                
                // 加载对应内容
                switch (tab.dataset.tab) {
                    case 'discussion':
                        this.loadDiscussions();
                        break;
                    case 'notes':
                        this.loadNotes();
                        break;
                }
            });
        });
    }

    setupEventListeners() {
        // 章节点击事件
        document.getElementById('chapterList').addEventListener('click', (e) => {
            const chapterHeader = e.target.closest('.chapter-header');
            if (chapterHeader) {
                const content = chapterHeader.nextElementSibling;
                content.classList.toggle('active');
            }

            const lessonItem = e.target.closest('.lesson-item');
            if (lessonItem) {
                const contentId = lessonItem.dataset.contentId;
                this.loadContent(contentId);
            }
        });

        // 讨论发布事件
        document.getElementById('postDiscussion')?.addEventListener('click', async () => {
            if (!this.currentUser) {
                alert('请先登录');
                return;
            }

            const input = document.getElementById('discussionInput');
            const content = input.value.trim();
            if (content) {
                try {
                    await db.addDiscussion(this.courseId, this.currentUser.id, content);
                    input.value = '';
                    await this.loadDiscussions();
                } catch (error) {
                    console.error('发布评论失败:', error);
                }
            }
        });

        // 笔记保存事件
        document.getElementById('saveNote')?.addEventListener('click', async () => {
            if (!this.currentUser) {
                alert('请先登录');
                return;
            }

            const input = document.getElementById('noteInput');
            const content = input.value.trim();
            if (content) {
                try {
                    await db.addNote(this.courseId, this.currentUser.id, content);
                    input.value = '';
                    await this.loadNotes();
                } catch (error) {
                    console.error('保存笔记失败:', error);
                }
            }
        });

        // 收藏课程事件
        document.getElementById('favoriteButton').addEventListener('click', async () => {
            if (!this.currentUser) {
                alert('请先登录');
                return;
            }

            try {
                const isFavorited = await db.toggleFavorite(this.courseId, this.currentUser.id);
                const button = document.getElementById('favoriteButton');
                button.innerHTML = `
                    <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
                    ${isFavorited ? '已收藏' : '收藏课程'}
                `;
            } catch (error) {
                console.error('收藏课程失败:', error);
            }
        });
    }

    updateUIBasedOnAuth() {
        // 更新讨论区
        const discussionForm = document.getElementById('discussionForm');
        discussionForm.style.display = this.currentUser ? 'block' : 'none';

        // 更新笔记区
        const noteForm = document.getElementById('noteForm');
        noteForm.style.display = this.currentUser ? 'block' : 'none';

        // 如果用户未登录，显示登录提示
        if (!this.currentUser) {
            const noteList = document.getElementById('noteList');
            noteList.innerHTML = '<div class="login-prompt">登录后可以查看和记录笔记</div>';
        }
    }
}

// 初始化课程页面
document.addEventListener('DOMContentLoaded', () => {
    new CoursePage();
});
