import dbService from './indexedDB.js';
import { EventEmitter } from './eventEmitter.js';

class HomeService extends EventEmitter {
    constructor() {
        super();
        this.carouselItems = [];
        this.categories = [];
        this.recommendedCourses = [];
        this.hotCourses = [];
        this.newCourses = [];
        this.initializeHomeData();
    }

    async initializeHomeData() {
        try {
            await this.loadCarouselItems();
            await this.loadCategories();
            await this.updateCourseListings();
        } catch (error) {
            console.error('初始化首页数据失败:', error);
        }
    }

    async loadCarouselItems() {
        try {
            const carouselData = await dbService.getAll('carouselItems');
            this.carouselItems = carouselData;
            this.emit('carouselUpdated', this.carouselItems);
        } catch (error) {
            console.error('加载轮播图数据失败:', error);
        }
    }

    async loadCategories() {
        try {
            const categories = await dbService.getAll('categories');
            this.categories = categories;
            this.emit('categoriesUpdated', this.categories);
        } catch (error) {
            console.error('加载课程类别失败:', error);
        }
    }

    async updateCourseListings() {
        await Promise.all([
            this.updateRecommendedCourses(),
            this.updateHotCourses(),
            this.updateNewCourses()
        ]);
    }

    async updateRecommendedCourses() {
        try {
            const courses = await dbService.getAll('courses');
            this.recommendedCourses = courses
                .filter(course => course.isRecommended)
                .sort((a, b) => b.recommendedAt - a.recommendedAt)
                .slice(0, 6);
            this.emit('recommendedCoursesUpdated', this.recommendedCourses);
        } catch (error) {
            console.error('更新推荐课程失败:', error);
        }
    }

    async updateHotCourses() {
        try {
            const courses = await dbService.getAll('courses');
            const enrollments = await dbService.getAll('enrollments');
            
            // 计算每个课程的热度分数
            const courseScores = courses.map(course => {
                const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
                const enrollmentScore = courseEnrollments.length * 10;
                const likeScore = course.likes * 2;
                const commentScore = course.commentCount * 3;
                
                return {
                    ...course,
                    hotScore: enrollmentScore + likeScore + commentScore
                };
            });

            this.hotCourses = courseScores
                .sort((a, b) => b.hotScore - a.hotScore)
                .slice(0, 6);
            
            this.emit('hotCoursesUpdated', this.hotCourses);
        } catch (error) {
            console.error('更新热门课程失败:', error);
        }
    }

    async updateNewCourses() {
        try {
            const courses = await dbService.getAll('courses');
            this.newCourses = courses
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 6);
            this.emit('newCoursesUpdated', this.newCourses);
        } catch (error) {
            console.error('更新最新课程失败:', error);
        }
    }

    async searchCourses(query, filters = {}) {
        try {
            let courses = await dbService.getAll('courses');
            
            // 应用搜索查询
            if (query) {
                const searchTerms = query.toLowerCase().split(' ');
                courses = courses.filter(course => {
                    const searchText = `${course.title} ${course.description} ${course.teacherName}`.toLowerCase();
                    return searchTerms.every(term => searchText.includes(term));
                });
            }

            // 应用类别筛选
            if (filters.categoryId) {
                courses = courses.filter(course => course.categoryId === filters.categoryId);
            }

            // 应用排序
            if (filters.sortBy) {
                switch (filters.sortBy) {
                    case 'newest':
                        courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        break;
                    case 'enrollments':
                        const enrollments = await dbService.getAll('enrollments');
                        courses.sort((a, b) => {
                            const aCount = enrollments.filter(e => e.courseId === a.id).length;
                            const bCount = enrollments.filter(e => e.courseId === b.id).length;
                            return bCount - aCount;
                        });
                        break;
                    case 'updated':
                        courses.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                        break;
                    case 'likes':
                        courses.sort((a, b) => b.likes - a.likes);
                        break;
                }
            }

            return courses;
        } catch (error) {
            console.error('搜索课程失败:', error);
            throw error;
        }
    }

    async getCoursesByCategory(categoryId, sortBy = 'newest') {
        return this.searchCourses('', { categoryId, sortBy });
    }

    // 监听课程变化
    setupCourseChangeListeners() {
        // 监听新课程发布
        dbService.on('courseAdded', () => {
            this.updateNewCourses();
            this.updateHotCourses();
        });

        // 监听课程更新
        dbService.on('courseUpdated', () => {
            this.updateCourseListings();
        });

        // 监听推荐课程变化
        dbService.on('courseRecommended', () => {
            this.updateRecommendedCourses();
        });

        // 监听注册人数变化
        dbService.on('enrollmentAdded', () => {
            this.updateHotCourses();
        });

        // 监听评论变化
        dbService.on('commentAdded', () => {
            this.updateHotCourses();
        });
    }
}

const homeService = new HomeService();
export default homeService;
