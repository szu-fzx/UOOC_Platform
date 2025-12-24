import dbService from './indexedDB.js';

class StatisticsService {
    async calculateCourseStatistics(courseId) {
        try {
            const enrollments = await this.getCourseEnrollments(courseId);
            const submissions = await this.getCourseSubmissions(courseId);
            const activities = await this.getCourseActivities(courseId);
            const progress = await this.getCourseProgress(courseId);

            return {
                enrollmentStats: this.analyzeEnrollments(enrollments),
                submissionStats: this.analyzeSubmissions(submissions),
                activityStats: this.analyzeActivities(activities),
                progressStats: this.analyzeProgress(progress)
            };
        } catch (error) {
            console.error('计算课程统计数据失败:', error);
            throw error;
        }
    }

    async getCourseEnrollments(courseId) {
        const enrollments = await dbService.getAll('enrollments');
        return enrollments.filter(e => e.courseId === courseId);
    }

    async getCourseSubmissions(courseId) {
        const assignments = await dbService.getAll('assignments');
        const courseAssignments = assignments.filter(a => a.courseId === courseId);
        const submissions = await dbService.getAll('submissions');
        return submissions.filter(s => 
            courseAssignments.some(a => a.id === s.assignmentId)
        );
    }

    async getCourseActivities(courseId) {
        const activities = await dbService.getAll('learningActivities');
        return activities.filter(a => a.courseId === courseId);
    }

    async getCourseProgress(courseId) {
        const progress = await dbService.getAll('overallProgress');
        return progress.filter(p => p.courseId === courseId);
    }

    analyzeEnrollments(enrollments) {
        const totalEnrollments = enrollments.length;
        const enrollmentDates = enrollments.map(e => new Date(e.enrolledAt));
        const latestEnrollment = enrollmentDates.length > 0 ? 
            Math.max(...enrollmentDates) : null;
        
        // 按月份统计注册趋势
        const monthlyTrend = enrollments.reduce((acc, curr) => {
            const month = new Date(curr.enrolledAt).toISOString().slice(0, 7);
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {});

        return {
            totalEnrollments,
            latestEnrollment,
            monthlyTrend
        };
    }

    analyzeSubmissions(submissions) {
        const totalSubmissions = submissions.length;
        const gradedSubmissions = submissions.filter(s => s.status === 'graded');
        const scores = gradedSubmissions.map(s => s.score);

        return {
            totalSubmissions,
            gradedCount: gradedSubmissions.length,
            averageScore: scores.length > 0 ? 
                scores.reduce((a, b) => a + b) / scores.length : 0,
            highestScore: scores.length > 0 ? Math.max(...scores) : 0,
            lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
            scoreDistribution: this.calculateDistribution(scores, 10) // 10个分数区间
        };
    }

    analyzeActivities(activities) {
        const totalActivities = activities.length;
        const activityTypes = new Set(activities.map(a => a.type));
        
        // 按类型统计活动
        const typeStats = {};
        activityTypes.forEach(type => {
            const typeActivities = activities.filter(a => a.type === type);
            typeStats[type] = {
                count: typeActivities.length,
                totalDuration: typeActivities.reduce((sum, a) => sum + a.duration, 0),
                averageProgress: typeActivities.reduce((sum, a) => sum + a.progress, 0) / 
                    typeActivities.length
            };
        });

        // 活动趋势（按天）
        const dailyTrend = activities.reduce((acc, curr) => {
            const day = new Date(curr.timestamp).toISOString().slice(0, 10);
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        }, {});

        return {
            totalActivities,
            typeStats,
            dailyTrend
        };
    }

    analyzeProgress(progress) {
        const totalStudents = progress.length;
        const completionRates = progress.map(p => p.progress);
        
        return {
            totalStudents,
            averageCompletion: completionRates.length > 0 ?
                completionRates.reduce((a, b) => a + b) / completionRates.length : 0,
            completionDistribution: this.calculateDistribution(completionRates, 5), // 5个进度区间
            completedCount: completionRates.filter(r => r >= 100).length
        };
    }

    calculateDistribution(values, bins) {
        if (values.length === 0) return {};
        
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = (max - min) / bins;
        
        const distribution = {};
        for (let i = 0; i < bins; i++) {
            const binStart = min + (range * i);
            const binEnd = binStart + range;
            const binLabel = `${Math.round(binStart)}-${Math.round(binEnd)}`;
            distribution[binLabel] = values.filter(v => 
                v >= binStart && (i === bins - 1 ? v <= binEnd : v < binEnd)
            ).length;
        }
        
        return distribution;
    }

    async generatePerformanceReport(courseId, userId) {
        try {
            // 获取课程信息
            const course = await dbService.get('courses', courseId);
            
            // 获取用户在该课程的所有活动
            const activities = (await this.getCourseActivities(courseId))
                .filter(a => a.userId === userId);
            
            // 获取用户在该课程的所有提交
            const submissions = (await this.getCourseSubmissions(courseId))
                .filter(s => s.userId === userId);
            
            // 获取用户的进度信息
            const progress = (await this.getCourseProgress(courseId))
                .find(p => p.userId === userId);

            // 计算活动统计
            const activityStats = {
                totalTime: activities.reduce((sum, a) => sum + a.duration, 0),
                lastActive: activities.length > 0 ?
                    Math.max(...activities.map(a => new Date(a.timestamp))) : null,
                activityCount: activities.length
            };

            // 计算作业统计
            const submissionStats = {
                totalSubmissions: submissions.length,
                averageScore: submissions.filter(s => s.status === 'graded')
                    .reduce((sum, s) => sum + s.score, 0) / submissions.length || 0,
                completionRate: submissions.length / 
                    (await dbService.getAll('assignments'))
                        .filter(a => a.courseId === courseId).length
            };

            return {
                courseTitle: course.title,
                studentProgress: progress?.progress || 0,
                activityStats,
                submissionStats,
                strengths: this.identifyStrengths(activities, submissions),
                recommendations: this.generateRecommendations(
                    activities, 
                    submissions, 
                    progress?.progress || 0
                )
            };
        } catch (error) {
            console.error('生成表现报告失败:', error);
            throw error;
        }
    }

    identifyStrengths(activities, submissions) {
        const strengths = [];
        
        // 基于活动频率
        if (activities.length > 10) {
            strengths.push('积极参与课程活动');
        }
        
        // 基于作业成绩
        const grades = submissions
            .filter(s => s.status === 'graded')
            .map(s => s.score);
        if (grades.length > 0 && 
            grades.reduce((a, b) => a + b) / grades.length >= 80) {
            strengths.push('作业成绩优秀');
        }
        
        // 基于提交及时性
        const onTimeSubmissions = submissions.filter(s => 
            new Date(s.submittedAt) <= new Date(s.dueDate)
        );
        if (onTimeSubmissions.length === submissions.length && 
            submissions.length > 0) {
            strengths.push('按时完成所有作业');
        }
        
        return strengths;
    }

    generateRecommendations(activities, submissions, progress) {
        const recommendations = [];
        
        // 基于活动参与
        if (activities.length < 5) {
            recommendations.push('建议增加课程参与度，多观看课程视频和阅读材料');
        }
        
        // 基于作业完成情况
        const gradedSubmissions = submissions.filter(s => s.status === 'graded');
        if (gradedSubmissions.length > 0) {
            const avgScore = gradedSubmissions.reduce((sum, s) => sum + s.score, 0) / 
                gradedSubmissions.length;
            if (avgScore < 70) {
                recommendations.push('建议复习已完成的作业，特别关注得分较低的部分');
            }
        }
        
        // 基于进度
        if (progress < 50) {
            recommendations.push('建议制定学习计划，确保按时完成课程内容');
        }
        
        return recommendations;
    }
}

const statisticsService = new StatisticsService();
export default statisticsService;
