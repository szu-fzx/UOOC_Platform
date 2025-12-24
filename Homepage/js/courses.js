// 课程管理器类
class CourseManager {
    constructor() {
        this.init();
    }

    async init() {
        try {
            await this.initializeDatabase();
            this.setupEventListeners();
            await this.loadInitialData();
        } catch (error) {
            console.error('初始化课程管理器失败:', error);
        }
    }

    async initializeDatabase() {
        // 等待数据库初始化完成
        if (!db.isInitialized) {
            await new Promise(resolve => {
                const checkDb = setInterval(() => {
                    if (db.isInitialized) {
                        clearInterval(checkDb);
                        resolve();
                    }
                }, 100);
            });
        }
    }

    setupEventListeners() {
        // 使用事件委托处理所有课程相关的点击
        document.addEventListener('click', (e) => {
            const courseCard = e.target.closest('.course-card');
            if (courseCard) {
                e.preventDefault();
                const courseId = courseCard.dataset.courseId;
                if (courseId) {
                    window.location.href = `course-detail.html?id=${courseId}`;
                }
            }
        });

        // 搜索功能
        const searchBox = document.querySelector('.search-box input');
        const searchBtn = document.querySelector('.search-box button');
        if (searchBox && searchBtn) {
            searchBtn.addEventListener('click', () => {
                const query = searchBox.value.trim();
                if (!query) {
                    alert('请输入搜索关键词');
                    searchBox.focus();
                    return;
                }
                this.searchCourses(query);
            });
            searchBox.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = searchBox.value.trim();
                    if (!query) {
                        alert('请输入搜索关键词');
                        searchBox.focus();
                        return;
                    }
                    this.searchCourses(query);
                }
            });
        }
    }

    async loadInitialData() {
        await Promise.all([
            this.loadRecommendedCourses(),
            this.loadHotCourses(),
            this.loadNewCourses()
        ]);
    }

    // 处理课程点击
    async handleCourseClick(courseId) {
        try {
            console.log('课程点击:', courseId);
            const course = await this.getCourseDetail(courseId);
            if (course) {
                // 在新页面中打开课程详情
                window.location.href = `course-detail.html?id=${courseId}`;
            } else {
                console.error('未找到课程:', courseId);
            }
        } catch (error) {
            console.error('处理课程点击失败:', error);
        }
    }

    // 创建课程卡片
    createCourseCard(course) {
        if (!course || !course.id) {
            console.error('无效的课程数据:', course);
            return null;
        }

        const card = document.createElement('a');
        card.href = `course-detail.html?id=${course.id}`;
        card.className = 'course-card';
        card.dataset.courseId = course.id;
        
        // 使用 logo.png 作为默认图片
        card.innerHTML = `
            <div class="course-image">
                <img src="${course.coverImage || 'images/logo.png'}" 
                     alt="${course.title}" 
                     onerror="this.src='images/logo.png'">
            </div>
            <div class="course-info">
                <h3 class="course-title">${course.title}</h3>
                <p class="course-description">${course.description || '暂无描述'}</p>
                <div class="course-meta">
                    <span class="teacher">
                        <i class="fas fa-user"></i>
                        ${course.teacher || '未知讲师'}
                    </span>
                    <span class="students">
                        <i class="fas fa-users"></i>
                        ${course.enrollCount || 0}人已报名
                    </span>
                </div>
                <div class="course-footer">
                    <span class="price ${course.price ? '' : 'free'}">
                        ${course.price ? `￥${course.price}` : '免费'}
                    </span>
                    <span class="learn-more">了解更多 <i class="fas fa-arrow-right"></i></span>
                </div>
            </div>`;

        return card;
    }

    // 加载推荐课程
    async loadRecommendedCourses() {
        try {
            console.log('开始加载推荐课程');
            const courses = await db.getByIndex('courses', 'recommended', true) || [];
            console.log('获取到的推荐课程:', courses);
            
            const container = document.querySelector('.recommended-courses .course-list');
            if (container && courses.length > 0) {
                container.innerHTML = '';
                courses.forEach(course => {
                    const card = this.createCourseCard(course);
                    if (card) {
                        container.appendChild(card);
                    }
                });
            } else {
                console.log('没有找到推荐课程或容器');
            }
        } catch (error) {
            console.error('加载推荐课程失败:', error);
        }
    }

    // 加载热门课程
    async loadHotCourses() {
        try {
            console.log('开始加载热门课程');
            const courses = await db.getAll('courses') || [];
            const hotCourses = courses
                .sort((a, b) => (b.enrollCount || 0) - (a.enrollCount || 0))
                .slice(0, 6);
            console.log('获取到的热门课程:', hotCourses);

            const container = document.querySelector('.hot-courses .course-list');
            if (container && hotCourses.length > 0) {
                container.innerHTML = '';
                hotCourses.forEach(course => {
                    const card = this.createCourseCard(course);
                    if (card) {
                        container.appendChild(card);
                    }
                });
            } else {
                console.log('没有找到热门课程或容器');
            }
        } catch (error) {
            console.error('加载热门课程失败:', error);
        }
    }

    // 加载最新课程
    async loadNewCourses() {
        try {
            console.log('开始加载最新课程');
            const courses = await db.getAll('courses') || [];
            const newCourses = courses
                .sort((a, b) => new Date(b.createDate) - new Date(a.createDate))
                .slice(0, 6);
            console.log('获取到的最新课程:', newCourses);

            const container = document.querySelector('.new-courses .course-list');
            if (container && newCourses.length > 0) {
                container.innerHTML = '';
                newCourses.forEach(course => {
                    const card = this.createCourseCard(course);
                    if (card) {
                        container.appendChild(card);
                    }
                });
            } else {
                console.log('没有找到最新课程或容器');
            }
        } catch (error) {
            console.error('加载最新课程失败:', error);
        }
    }

    // 显示所有课程
    async showAllCourses() {
        try {
            const courses = await db.getAll('courses') || [];
            const mainContent = document.querySelector('main');
            const allCoursesSection = document.createElement('section');
            allCoursesSection.className = 'all-courses';
            
            allCoursesSection.innerHTML = `
                <h2>全部课程</h2>
                <div class="course-list"></div>
            `;
            
            mainContent.appendChild(allCoursesSection);
            
            const courseList = allCoursesSection.querySelector('.course-list');
            courses.forEach(course => {
                courseList.appendChild(this.createCourseCard(course));
            });

            // 滚动到全部课程部分
            allCoursesSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('显示所有课程失败:', error);
        }
    }

    // 搜索课程
    async searchCourses(keyword) {
        if (!keyword.trim()) return;

        try {
            const courses = await db.getAll('courses') || [];
            const results = courses.filter(course => 
                course.title.toLowerCase().includes(keyword.toLowerCase()) || 
                course.description.toLowerCase().includes(keyword.toLowerCase())
            );

            const mainContent = document.querySelector('main');
            const searchResultsSection = document.createElement('section');
            searchResultsSection.className = 'search-results';
            
            searchResultsSection.innerHTML = `
                <h2>搜索结果: "${keyword}"</h2>
                <div class="course-list"></div>
            `;
            
            mainContent.appendChild(searchResultsSection);
            
            const courseList = searchResultsSection.querySelector('.course-list');
            if (results.length > 0) {
                results.forEach(course => {
                    courseList.appendChild(this.createCourseCard(course));
                });
            } else {
                courseList.innerHTML = '<div class="no-results">未找到相关课程</div>';
            }

            // 滚动到搜索结果部分
            searchResultsSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('搜索课程失败:', error);
        }
    }

    // 按分类筛选课程
    async filterCoursesByCategory(categoryId) {
        try {
            const courses = await db.getByIndex('courses', 'categoryId', parseInt(categoryId)) || [];
            const categoryName = document.querySelector(`[data-category="${categoryId}"]`)?.textContent || '未知分类';
            
            const mainContent = document.querySelector('main');
            const categoryResultsSection = document.createElement('section');
            categoryResultsSection.className = 'category-results';
            
            categoryResultsSection.innerHTML = `
                <h2>${categoryName}</h2>
                <div class="course-list"></div>
            `;
            
            mainContent.appendChild(categoryResultsSection);
            
            const courseList = categoryResultsSection.querySelector('.course-list');
            if (courses.length > 0) {
                courses.forEach(course => {
                    courseList.appendChild(this.createCourseCard(course));
                });
            } else {
                courseList.innerHTML = '<div class="no-results">该分类下暂无课程</div>';
            }

            // 滚动到分类结果部分
            categoryResultsSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('筛选课程失败:', error);
        }
    }

    // 获取课程详情
    async getCourseDetail(courseId) {
        try {
            return await db.get('courses', parseInt(courseId));
        } catch (error) {
            console.error('获取课程详情失败:', error);
            return null;
        }
    }
}

// 创建并导出课程管理器实例
window.courseManager = new CourseManager();
