class CourseFilter {
    constructor() {
        this.currentCategory = null;
        this.currentSort = 'newest';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // 课程分类点击事件
        document.querySelectorAll('.dropdown-content a[data-category]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryId = e.target.dataset.category;
                this.filterByCategory(categoryId);
            });
        });

        // 添加排序控件到DOM
        this.addSortControls();
    }

    addSortControls() {
        const sortControls = document.createElement('div');
        sortControls.className = 'sort-controls';
        sortControls.innerHTML = `
            <span>排序方式：</span>
            <button class="sort-btn active" data-sort="newest">最新发布</button>
            <button class="sort-btn" data-sort="enrollments">注册人数</button>
            <button class="sort-btn" data-sort="updated">最近更新</button>
            <button class="sort-btn" data-sort="likes">点赞数</button>
        `;

        // 将排序控件插入到合适的位置
        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(sortControls, mainContent.firstChild);

        // 添加排序按钮点击事件
        sortControls.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sortType = e.target.dataset.sort;
                this.sortCourses(sortType);
                
                // 更新按钮状态
                sortControls.querySelectorAll('.sort-btn').forEach(b => 
                    b.classList.toggle('active', b === e.target)
                );
            });
        });
    }

    async filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        await this.updateCourseList();
    }

    async sortCourses(sortType) {
        this.currentSort = sortType;
        await this.updateCourseList();
    }

    async updateCourseList() {
        try {
            // 从数据库获取课程
            const courses = await db.getAllCourses();
            
            // 应用分类过滤
            let filteredCourses = this.currentCategory ? 
                courses.filter(course => course.categoryId === this.currentCategory) : 
                courses;

            // 应用排序
            filteredCourses = this.applySorting(filteredCourses);

            // 更新显示
            await this.renderCourses(filteredCourses);
        } catch (error) {
            console.error('更新课程列表失败:', error);
        }
    }

    async renderCourses(courses) {
        const courseContainer = document.querySelector('.course-list');
        if (!courseContainer) return;

        courseContainer.innerHTML = courses.map(course => `
            <div class="course-card" data-course-id="${course.id}">
                <img src="${course.coverImage || 'images/default-course.jpg'}" alt="${course.title}" class="course-image">
                <div class="course-info">
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-teacher">${course.teacherName}</p>
                    <div class="course-stats">
                        <span><i class="fas fa-users"></i> ${course.enrollmentCount || 0}</span>
                        <span><i class="fas fa-heart"></i> ${course.likes || 0}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // 添加课程卡片点击事件
        document.querySelectorAll('.course-card').forEach(card => {
            card.addEventListener('click', () => {
                const courseId = card.dataset.courseId;
                window.location.href = `course.html?id=${courseId}`;
            });
        });
    }

    applySorting(courses) {
        switch (this.currentSort) {
            case 'newest':
                return courses.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
            case 'enrollments':
                return courses.sort((a, b) => 
                    b.enrollmentCount - a.enrollmentCount
                );
            case 'updated':
                return courses.sort((a, b) => 
                    new Date(b.updatedAt) - new Date(a.updatedAt)
                );
            case 'likes':
                return courses.sort((a, b) => 
                    b.likes - a.likes
                );
            default:
                return courses;
        }
    }
}

// 初始化课程过滤器
document.addEventListener('DOMContentLoaded', () => {
    new CourseFilter();
});
