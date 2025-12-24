import dbService from './indexedDB.js';
import notificationService from './notification.js';

class ProgressService {
    constructor() {
        this.progressCache = new Map();
    }

    async trackProgress(userId, courseId, activityData) {
        try {
            const timestamp = new Date().toISOString();
            const activity = {
                userId,
                courseId,
                type: activityData.type, // video_watch, document_read, quiz_complete, assignment_submit
                contentId: activityData.contentId,
                duration: activityData.duration || 0,
                progress: activityData.progress || 0,
                timestamp
            };

            await dbService.add('learningActivities', activity);
            await this.updateOverallProgress(userId, courseId);
            return activity;
        } catch (error) {
            console.error('记录学习活动失败:', error);
            throw error;
        }
    }

    async updateOverallProgress(userId, courseId) {
        try {
            const activities = await this.getUserActivities(userId, courseId);
            const courseContents = await this.getCourseContents(courseId);

            let totalProgress = 0;
            let completedItems = 0;

            for (const content of courseContents) {
                const contentActivities = activities.filter(a => a.contentId === content.id);
                if (contentActivities.length > 0) {
                    const maxProgress = Math.max(...contentActivities.map(a => a.progress));
                    if (maxProgress >= 100) {
                        completedItems++;
                    }
                    totalProgress += maxProgress;
                }
            }

            const overallProgress = courseContents.length > 0
                ? Math.floor(totalProgress / courseContents.length)
                : 0;

            // 更新总进度
            const progressData = {
                userId,
                courseId,
                progress: overallProgress,
                completedItems,
                totalItems: courseContents.length,
                lastUpdated: new Date().toISOString()
            };

            const existingProgress = await this.getOverallProgress(userId, courseId);
            if (existingProgress) {
                progressData.id = existingProgress.id;
                await dbService.update('overallProgress', progressData);
            } else {
                await dbService.add('overallProgress', progressData);
            }

            // 检查是否达到里程碑
            this.checkMilestones(userId, courseId, overallProgress);

            return progressData;
        } catch (error) {
            console.error('更新总进度失败:', error);
            throw error;
        }
    }

    async checkMilestones(userId, courseId, progress) {
        const milestones = [25, 50, 75, 100];
        const course = await dbService.get('courses', courseId);

        for (const milestone of milestones) {
            if (progress >= milestone) {
                const existingMilestone = await this.getMilestone(userId, courseId, milestone);
                if (!existingMilestone) {
                    // 记录新的里程碑
                    await dbService.add('milestones', {
                        userId,
                        courseId,
                        milestone,
                        achievedAt: new Date().toISOString()
                    });

                    // 发送成就通知
                    notificationService.addNotification({
                        userId,
                        type: 'achievement',
                        title: '学习里程碑',
                        message: `恭喜！你已完成课程 "${course.title}" ${milestone}% 的内容`,
                        courseId
                    });
                }
            }
        }
    }

    async getMilestone(userId, courseId, milestone) {
        const milestones = await dbService.getAll('milestones');
        return milestones.find(m => 
            m.userId === userId && 
            m.courseId === courseId && 
            m.milestone === milestone
        );
    }

    async getUserActivities(userId, courseId) {
        try {
            const activities = await dbService.getAll('learningActivities');
            return activities.filter(a => 
                a.userId === userId && 
                a.courseId === courseId
            );
        } catch (error) {
            console.error('获取用户活动失败:', error);
            throw error;
        }
    }

    async getCourseContents(courseId) {
        try {
            const contents = await dbService.getAll('courseContents');
            return contents.filter(c => c.courseId === courseId);
        } catch (error) {
            console.error('获取课程内容失败:', error);
            throw error;
        }
    }

    async getOverallProgress(userId, courseId) {
        try {
            const progress = await dbService.getAll('overallProgress');
            return progress.find(p => 
                p.userId === userId && 
                p.courseId === courseId
            );
        } catch (error) {
            console.error('获取总进度失败:', error);
            throw error;
        }
    }

    async generateProgressReport(userId, courseId) {
        try {
            const activities = await this.getUserActivities(userId, courseId);
            const overallProgress = await this.getOverallProgress(userId, courseId);
            const course = await dbService.get('courses', courseId);

            // 按类型分组活动
            const groupedActivities = activities.reduce((groups, activity) => {
                const group = groups[activity.type] || [];
                group.push(activity);
                groups[activity.type] = group;
                return groups;
            }, {});

            // 计算每种类型的统计信息
            const typeStats = {};
            for (const [type, acts] of Object.entries(groupedActivities)) {
                typeStats[type] = {
                    count: acts.length,
                    totalDuration: acts.reduce((sum, a) => sum + a.duration, 0),
                    averageProgress: acts.reduce((sum, a) => sum + a.progress, 0) / acts.length
                };
            }

            return {
                courseTitle: course.title,
                overallProgress: overallProgress?.progress || 0,
                completedItems: overallProgress?.completedItems || 0,
                totalItems: overallProgress?.totalItems || 0,
                activityStats: typeStats,
                lastActive: activities.length > 0 
                    ? Math.max(...activities.map(a => new Date(a.timestamp)))
                    : null
            };
        } catch (error) {
            console.error('生成进度报告失败:', error);
            throw error;
        }
    }
}

const progressService = new ProgressService();
export default progressService;
