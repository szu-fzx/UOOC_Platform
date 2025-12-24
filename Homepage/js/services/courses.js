import authService from './auth.js';

class CourseService {
    async getAllCourses() {
        try {
            const response = await fetch('/api/courses');
            return await response.json();
        } catch (error) {
            console.error('获取课程列表失败:', error);
            throw error;
        }
    }

    async getCourseById(courseId) {
        try {
            const response = await fetch(`/api/courses/${courseId}`);
            return await response.json();
        } catch (error) {
            console.error('获取课程详情失败:', error);
            throw error;
        }
    }

    async createCourse(courseData) {
        if (!authService.hasRole('teacher') && !authService.hasRole('admin')) {
            throw new Error('没有权限创建课程');
        }

        try {
            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(courseData)
            });
            return await response.json();
        } catch (error) {
            console.error('创建课程失败:', error);
            throw error;
        }
    }

    async updateCourse(courseId, courseData) {
        if (!authService.hasRole('teacher') && !authService.hasRole('admin')) {
            throw new Error('没有权限更新课程');
        }

        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(courseData)
            });
            return await response.json();
        } catch (error) {
            console.error('更新课程失败:', error);
            throw error;
        }
    }

    async enrollCourse(courseId) {
        if (!authService.hasRole('student')) {
            throw new Error('只有学生可以注册课程');
        }

        try {
            const response = await fetch(`/api/courses/${courseId}/enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error('课程注册失败:', error);
            throw error;
        }
    }

    async getEnrolledCourses() {
        if (!authService.hasRole('student')) {
            throw new Error('只有学生可以查看已注册课程');
        }

        try {
            const response = await fetch('/api/courses/enrolled');
            return await response.json();
        } catch (error) {
            console.error('获取已注册课程失败:', error);
            throw error;
        }
    }

    async submitAssignment(assignmentId, content) {
        if (!authService.hasRole('student')) {
            throw new Error('只有学生可以提交作业');
        }

        try {
            const response = await fetch(`/api/assignments/${assignmentId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });
            return await response.json();
        } catch (error) {
            console.error('作业提交失败:', error);
            throw error;
        }
    }

    async getCourseStatistics(courseId) {
        if (!authService.hasRole('teacher') && !authService.hasRole('admin')) {
            throw new Error('没有权限查看课程统计信息');
        }

        try {
            const response = await fetch(`/api/courses/${courseId}/statistics`);
            return await response.json();
        } catch (error) {
            console.error('获取课程统计信息失败:', error);
            throw error;
        }
    }
}

const courseService = new CourseService();
export default courseService;
