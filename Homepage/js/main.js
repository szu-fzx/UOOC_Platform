// 主应用类
class App {
    constructor() {
        // 等待DOM加载完成后初始化
        document.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
    }

    async init() {
        try {
            // 等待数据库初始化
            await this.waitForDB();
            
            // 初始化页面组件
            this.setupComponents();
            
            // 设置全局事件监听
            this.setupEventListeners();
            
            // 初始化课程数据
            this.initializeCourses();
        } catch (error) {
            console.error('初始化失败:', error);
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

    // 设置页面组件
    setupComponents() {
        // 存储上次访问时的课程数据
        this.lastCoursesData = JSON.parse(localStorage.getItem('lastCoursesData') || '{}');
        
        // 初始化页面滚动监听
        this.setupScrollListener();
    }

    // 设置全局事件监听
    setupEventListeners() {
        // 注册课程按钮点击事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('enroll-btn')) {
                const courseId = e.target.dataset.courseId;
                courseManager.enrollCourse(courseId);
            }
        });

        // 我的内容菜单点击事件
        document.getElementById('myCourses')?.addEventListener('click', () => this.showMyCourses());
        document.getElementById('myNotes')?.addEventListener('click', () => this.showMyNotes());
        document.getElementById('myAssignments')?.addEventListener('click', () => this.showMyAssignments());
        document.getElementById('myProgress')?.addEventListener('click', () => this.showMyProgress());
    }

    // 设置页面滚动监听
    setupScrollListener() {
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const st = window.pageYOffset || document.documentElement.scrollTop;
            
            // 向下滚动时隐藏header，向上滚动时显示header
            const header = document.querySelector('header');
            if (st > lastScrollTop) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            lastScrollTop = st;
        });
    }

    // 显示课程详情
    async showCourseDetail(courseId) {
        try {
            console.log('显示课程详情:', courseId);
            const courseDetail = await courseManager.getCourseDetail(courseId);
            
            // 移除已存在的模态框
            const existingModal = document.querySelector('.modal-overlay');
            if (existingModal) {
                existingModal.remove();
            }
            
            // 创建模态框
            const modalHtml = `
                <div class="modal-overlay">
                    <div class="modal-content course-detail">
                        <button class="close-modal">&times;</button>
                        <div class="course-header">
                            <h2>${courseDetail.title}</h2>
                            <div class="course-meta">
                                <span><i class="fas fa-user"></i> ${courseDetail.teacher || '未知讲师'}</span>
                                <span><i class="fas fa-users"></i> ${courseDetail.enrollCount || 0}人已报名</span>
                                <span class="course-price">${courseDetail.price ? `￥${courseDetail.price}` : '免费'}</span>
                            </div>
                        </div>
                        
                        <div class="course-body">
                            <div class="course-description">
                                <h3>课程简介</h3>
                                <p>${courseDetail.description}</p>
                            </div>
                            
                            <div class="course-contents">
                                <h3>课程内容</h3>
                                <div class="content-list">
                                    ${courseDetail.contents.map(content => `
                                        <div class="content-item">
                                            <i class="fas ${this.getContentTypeIcon(content.type)}"></i>
                                            <span>${content.title}</span>
                                        </div>
                                    `).join('') || '<p>暂无内容</p>'}
                                </div>
                            </div>
                            
                            <div class="course-comments">
                                <h3>学员评价</h3>
                                <div class="comments-list">
                                    ${courseDetail.comments.map(comment => `
                                        <div class="comment-item">
                                            <div class="comment-header">
                                                <span class="comment-user">${comment.username}</span>
                                                <span class="comment-time">${comment.createTime}</span>
                                            </div>
                                            <p>${comment.content}</p>
                                        </div>
                                    `).join('') || '<p>暂无评价</p>'}
                                </div>
                            </div>
                        </div>
                        
                        <div class="course-actions">
                            <button class="enroll-btn" data-course-id="${courseDetail.id}">立即报名</button>
                        </div>
                    </div>
                </div>
            `;

            // 添加模态框到页面
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // 绑定关闭事件
            const modal = document.querySelector('.modal-overlay');
            const closeBtn = modal.querySelector('.close-modal');
            
            closeBtn.onclick = () => {
                modal.remove();
            };

            // 点击模态框外部关闭
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            };

            // 防止模态框内部点击事件冒泡
            modal.querySelector('.modal-content').onclick = (e) => {
                e.stopPropagation();
            };

            // 绑定报名按钮事件
            const enrollBtn = modal.querySelector('.enroll-btn');
            if (enrollBtn) {
                enrollBtn.onclick = () => {
                    courseManager.enrollCourse(courseId);
                };
            }

        } catch (error) {
            console.error('加载课程详情失败:', error);
        }
    }

    // 获取内容类型图标
    getContentTypeIcon(type) {
        switch (type) {
            case 'video':
                return 'fa-play-circle';
            case 'document':
                return 'fa-file-alt';
            case 'audio':
                return 'fa-volume-up';
            default:
                return 'fa-file';
        }
    }

    // 显示我的课程
    async showMyCourses() {
        const user = auth.getCurrentUser();
        if (!user) return;

        try {
            const enrollments = await db.getByIndex('userCourses', 'userId', user.id);
            const courseIds = enrollments.map(e => e.courseId);
            const courses = [];
            
            for (const id of courseIds) {
                const course = await db.get('courses', id);
                if (course) courses.push(course);
            }

            const mainContent = document.querySelector('main');
            mainContent.innerHTML = `
                <section class="my-courses">
                    <h2>我的课程</h2>
                    <div class="course-list">
                        ${courses.map(course => courseManager.createCourseCard(course)).join('')}
                    </div>
                </section>
            `;
        } catch (error) {
            console.error('加载我的课程失败:', error);
        }
    }

    // 显示我的笔记
    async showMyNotes() {
        const user = auth.getCurrentUser();
        if (!user) return;

        try {
            const notes = await db.getByIndex('notes', 'userId', user.id);
            const mainContent = document.querySelector('main');
            mainContent.innerHTML = `
                <section class="my-notes">
                    <h2>我的笔记</h2>
                    <div class="notes-list">
                        ${notes.map(note => `
                            <div class="note-item">
                                <h3>${note.courseTitle || '未命名课程'}</h3>
                                <p>${note.content}</p>
                                <div class="note-meta">
                                    <span>更新时间：${new Date(note.updateDate).toLocaleString()}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        } catch (error) {
            console.error('加载我的笔记失败:', error);
        }
    }

    // 显示我的作业
    async showMyAssignments() {
        const user = auth.getCurrentUser();
        if (!user) return;

        try {
            const assignments = await db.getByIndex('assignments', 'userId', user.id);
            const mainContent = document.querySelector('main');
            mainContent.innerHTML = `
                <section class="my-assignments">
                    <h2>我的作业</h2>
                    <div class="assignments-list">
                        ${assignments.map(assignment => `
                            <div class="assignment-item">
                                <h3>${assignment.title}</h3>
                                <p>${assignment.description}</p>
                                <div class="assignment-meta">
                                    <span class="status ${assignment.status}">
                                        ${assignment.status === 'completed' ? '已完成' : '未完成'}
                                    </span>
                                    <span>截止日期：${new Date(assignment.dueDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        } catch (error) {
            console.error('加载我的作业失败:', error);
        }
    }

    // 显示学习进度
    async showMyProgress() {
        const user = auth.getCurrentUser();
        if (!user) return;

        try {
            const enrollments = await db.getByIndex('userCourses', 'userId', user.id);
            const mainContent = document.querySelector('main');
            mainContent.innerHTML = `
                <section class="my-progress">
                    <h2>学习进度</h2>
                    <div class="progress-list">
                        ${enrollments.map(enrollment => `
                            <div class="progress-item">
                                <h3>${enrollment.courseTitle || '未命名课程'}</h3>
                                <div class="progress-bar">
                                    <div class="progress" style="width: ${enrollment.progress}%"></div>
                                </div>
                                <span class="progress-text">${enrollment.progress}%</span>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        } catch (error) {
            console.error('加载学习进度失败:', error);
        }
    }

    // 初始化课程数据
    async initializeCourses() {
        try {
            // 获取所有课程
            const allCourses = await db.getAll('courses') || [];
            
            // 筛选推荐课程
            const recommendedCourses = allCourses.filter(course => course.recommended);
            this.renderCourses('.recommended-courses', recommendedCourses);

            // 加载热门课程
            const hotCourses = [...allCourses]
                .sort((a, b) => (b.enrollCount || 0) - (a.enrollCount || 0))
                .slice(0, 6);
            this.renderCourses('.hot-courses', hotCourses);

            // 加载最新课程
            const newCourses = [...allCourses]
                .sort((a, b) => new Date(b.createDate) - new Date(a.createDate))
                .slice(0, 6);
            this.renderCourses('.new-courses', newCourses);
        } catch (error) {
            console.error('加载课程数据失败:', error);
        }
    }

    // 渲染课程列表
    renderCourses(sectionClass, courses) {
        const section = document.querySelector(sectionClass);
        if (!section) return;

        const courseList = section.querySelector('.course-list');
        if (!courseList) return;

        courseList.innerHTML = courses.map(course => this.createCourseCard(course)).join('');
    }

    // 创建课程卡片HTML
    createCourseCard(course) {
        return `
            <div class="course-card" data-id="${course.id}">
                <div class="course-image">
                    <img src="${course.coverImage}" alt="${course.title}">
                </div>
                <div class="course-info">
                    <h3 class="course-title">
                        <a href="javascript:void(0)" class="course-title-link">${course.title}</a>
                    </h3>
                    <p class="course-description">${course.description}</p>
                    <div class="course-meta">
                        <span class="course-teacher">
                            <i class="fas fa-user"></i> ${course.teacher}
                        </span>
                        <span class="course-students">
                            <i class="fas fa-users"></i> ${course.enrollCount || 0}人
                        </span>
                        <span class="course-price">
                            ${course.price ? `￥${course.price}` : '免费'}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }
}

// 创建应用实例
const app = new App();
