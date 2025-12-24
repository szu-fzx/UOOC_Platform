import homeService from './services/home.js';
import authService from './services/auth.js';

class HomePage {
    constructor() {
        this.currentCarouselIndex = 0;
        this.carouselInterval = null;
        this.initializeComponents();
        this.setupEventListeners();
    }

    initializeComponents() {
        // 初始化轮播图
        this.initializeCarousel();
        
        // 加载课程类别
        this.loadCategories();
        
        // 加载各类课程列表
        this.loadRecommendedCourses();
        this.loadHotCourses();
        this.loadNewCourses();
        
        // 初始化搜索功能
        this.initializeSearch();
        
        // 检查用户登录状态并更新UI
        this.updateAuthUI();
    }

    initializeCarousel() {
        homeService.on('carouselUpdated', (items) => {
            const carousel = document.querySelector('.carousel');
            carousel.innerHTML = items.map((item, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : ''}" 
                     style="background-image: url(${item.imageUrl})">
                    <div class="carousel-caption">
                        <h2>${item.title}</h2>
                        <p>${item.description}</p>
                    </div>
                </div>
            `).join('');

            // 启动轮播
            this.startCarousel();
        });
    }

    startCarousel() {
        if (this.carouselInterval) {
            clearInterval(this.carouselInterval);
        }

        this.carouselInterval = setInterval(() => {
            const items = document.querySelectorAll('.carousel-item');
            items[this.currentCarouselIndex].classList.remove('active');
            this.currentCarouselIndex = (this.currentCarouselIndex + 1) % items.length;
            items[this.currentCarouselIndex].classList.add('active');
        }, 5000);
    }

    loadCategories() {
        homeService.on('categoriesUpdated', (categories) => {
            const categoryList = document.querySelector('.category-list');
            categoryList.innerHTML = categories.map(category => `
                <div class="category-item" data-category-id="${category.id}">
                    ${category.name}
                </div>
            `).join('');
        });
    }

    loadRecommendedCourses() {
        homeService.on('recommendedCoursesUpdated', (courses) => {
            this.renderCourseSection('recommended-courses', courses);
        });
    }

    loadHotCourses() {
        homeService.on('hotCoursesUpdated', (courses) => {
            this.renderCourseSection('hot-courses', courses);
        });
    }

    loadNewCourses() {
        homeService.on('newCoursesUpdated', (courses) => {
            this.renderCourseSection('new-courses', courses);
        });
    }

    renderCourseSection(sectionId, courses) {
        const section = document.getElementById(sectionId);
        const courseGrid = section.querySelector('.course-grid');
        courseGrid.innerHTML = courses.map(course => this.createCourseCard(course)).join('');
    }

    createCourseCard(course) {
        return `
            <div class="course-card" data-course-id="${course.id}">
                <img src="${course.coverImage}" alt="${course.title}" class="course-image">
                <div class="course-info">
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-description">${course.description}</p>
                    <div class="course-meta">
                        <span class="teacher">${course.teacherName}</span>
                        <span class="students">${course.enrollmentCount} 学生</span>
                    </div>
                </div>
            </div>
        `;
    }

    initializeSearch() {
        const searchForm = document.querySelector('.search-form');
        const searchInput = document.querySelector('.search-input');
        
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (!query) {
                alert('请输入搜索关键词');
                searchInput.focus();
                return;
            }
            const results = await homeService.searchCourses(query);
            this.showSearchResults(results, query);
        });
    }

    showSearchResults(courses, searchQuery = '') {
        const resultsContainer = document.querySelector('.search-results');
        resultsContainer.innerHTML = '';
        
        // 如果有搜索关键词，显示搜索标题
        if (searchQuery) {
            const searchTitle = document.createElement('div');
            searchTitle.className = 'search-title';
            searchTitle.innerHTML = `
                <h2><i class="fas fa-search"></i> 搜索结果: "${searchQuery}"</h2>
                <p class="search-info">共找到 ${courses.length} 门相关课程</p>
            `;
            resultsContainer.appendChild(searchTitle);
        }
        
        if (courses.length === 0) {
            resultsContainer.innerHTML += '<p class="no-results">未找到相关课程</p>';
            return;
        }

        const courseGrid = document.createElement('div');
        courseGrid.className = 'course-grid';
        courseGrid.innerHTML = courses.map(course => this.createCourseCard(course)).join('');
        resultsContainer.appendChild(courseGrid);
    }

    updateAuthUI() {
        const authContainer = document.querySelector('.auth-container');
        const isLoggedIn = authService.isAuthenticated();
        
        if (isLoggedIn) {
            const user = authService.getCurrentUser();
            authContainer.innerHTML = `
                <span class="welcome">欢迎，${user.name}</span>
                <button class="logout-btn">退出</button>
            `;
        } else {
            authContainer.innerHTML = `
                <button class="login-btn">登录</button>
                <button class="register-btn">注册</button>
            `;
        }
    }

    setupEventListeners() {
        // 课程类别点击事件
        document.querySelector('.category-list').addEventListener('click', async (e) => {
            const categoryItem = e.target.closest('.category-item');
            if (categoryItem) {
                const categoryId = categoryItem.dataset.categoryId;
                const courses = await homeService.getCoursesByCategory(categoryId);
                this.showSearchResults(courses);
            }
        });

        // 课程卡片点击事件
        document.addEventListener('click', (e) => {
            const courseCard = e.target.closest('.course-card');
            if (courseCard) {
                const courseId = courseCard.dataset.courseId;
                window.location.href = `/course.html?id=${courseId}`;
            }
        });

        // 排序按钮点击事件
        document.querySelector('.sort-controls').addEventListener('click', async (e) => {
            const sortButton = e.target.closest('.sort-button');
            if (sortButton) {
                const sortBy = sortButton.dataset.sortBy;
                const categoryId = document.querySelector('.category-item.active')?.dataset.categoryId;
                const courses = await homeService.getCoursesByCategory(categoryId, sortBy);
                this.showSearchResults(courses);

                // 更新按钮状态
                document.querySelectorAll('.sort-button').forEach(btn => {
                    btn.classList.toggle('active', btn === sortButton);
                });
            }
        });

        // 登录/注册按钮点击事件
        document.querySelector('.auth-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('login-btn')) {
                this.showLoginModal();
            } else if (e.target.classList.contains('register-btn')) {
                this.showRegisterModal();
            } else if (e.target.classList.contains('logout-btn')) {
                authService.logout();
                this.updateAuthUI();
            }
        });

        // 监听用户认证状态变化
        authService.on('authStateChanged', () => {
            this.updateAuthUI();
        });
    }

    showLoginModal() {
        // 显示登录模态框
        const loginModal = document.getElementById('login-modal');
        loginModal.style.display = 'block';
    }

    showRegisterModal() {
        // 显示注册模态框
        const registerModal = document.getElementById('register-modal');
        registerModal.style.display = 'block';
    }
}

// 初始化首页
document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
});
