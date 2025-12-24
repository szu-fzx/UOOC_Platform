class CourseUpdater {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 监听课程相关事件
        document.addEventListener('courseEnrollment', this.handleCourseEnrollment.bind(this));
        document.addEventListener('courseComment', this.handleCourseComment.bind(this));
        document.addEventListener('courseCreated', this.handleNewCourse.bind(this));
        document.addEventListener('courseRecommended', this.handleRecommendedCourse.bind(this));
    }

    async handleCourseEnrollment(event) {
        const { courseId } = event.detail;
        await this.updateHotCourses();
    }

    async handleCourseComment(event) {
        const { courseId } = event.detail;
        await this.updateHotCourses();
    }

    async handleNewCourse(event) {
        const { course } = event.detail;
        await this.updateNewCourses();
    }

    async handleRecommendedCourse(event) {
        const { course } = event.detail;
        await this.updateRecommendedCourses();
    }

    async updateHotCourses() {
        try {
            const courses = await db.getAllCourses();
            
            // 计算热度分数
            const coursesWithScore = courses.map(course => ({
                ...course,
                hotScore: this.calculateHotScore(course)
            }));

            // 排序并获取前6个最热门的课程
            const hotCourses = coursesWithScore
                .sort((a, b) => b.hotScore - a.hotScore)
                .slice(0, 6);

            // 更新热门课程显示
            this.renderHotCourses(hotCourses);
        } catch (error) {
            console.error('更新热门课程失败:', error);
        }
    }

    calculateHotScore(course) {
        // 热度计算公式：
        // 注册人数 * 10 + 评论数 * 3 + 点赞数 * 2
        return (course.enrollmentCount * 10) + 
               (course.commentCount * 3) + 
               (course.likes * 2);
    }

    async updateNewCourses() {
        try {
            const courses = await db.getAllCourses();
            
            // 获取最新的6个课程
            const newCourses = courses
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 6);

            // 更新最新课程显示
            this.renderNewCourses(newCourses);
        } catch (error) {
            console.error('更新最新课程失败:', error);
        }
    }

    async updateRecommendedCourses() {
        try {
            const courses = await db.getAllCourses();
            
            // 获取被推荐的课程
            const recommendedCourses = courses
                .filter(course => course.isRecommended)
                .sort((a, b) => new Date(b.recommendedAt) - new Date(a.recommendedAt))
                .slice(0, 6);

            // 更新推荐课程显示
            this.renderRecommendedCourses(recommendedCourses);
        } catch (error) {
            console.error('更新推荐课程失败:', error);
        }
    }

    renderHotCourses(courses) {
        const container = document.querySelector('.hot-courses .course-list');
        if (container) {
            this.renderCourseList(container, courses);
        }
    }

    renderNewCourses(courses) {
        const container = document.querySelector('.new-courses .course-list');
        if (container) {
            this.renderCourseList(container, courses);
        }
    }

    renderRecommendedCourses(courses) {
        const container = document.querySelector('.recommended-courses .course-list');
        if (container) {
            this.renderCourseList(container, courses);
        }
    }

    renderCourseList(container, courses) {
        container.innerHTML = courses.map(course => `
            <div class="course-card" data-course-id="${course.id}">
                <img src="${course.coverImage}" alt="${course.title}" class="course-image">
                <div class="course-info">
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                    <div class="course-meta">
                        <span><i class="fas fa-user"></i> ${course.enrollmentCount} 名学生</span>
                        <span><i class="fas fa-thumbs-up"></i> ${course.likes}</span>
                        <span><i class="fas fa-clock"></i> ${new Date(course.updatedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // 添加课程卡片点击事件
        container.querySelectorAll('.course-card').forEach(card => {
            card.addEventListener('click', () => {
                const courseId = card.dataset.courseId;
                window.location.href = `/course-detail.html?id=${courseId}`;
            });
        });
    }
}

// 创建课程更新器实例
const courseUpdater = new CourseUpdater();
export default courseUpdater;
