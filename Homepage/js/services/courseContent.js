import dbService from './indexedDB.js';
import fileStorage from './fileStorage.js';
import notificationService from './notification.js';

class CourseContentService {
    constructor() {
        this.currentCourse = null;
    }

    async createChapter(courseId, chapterData) {
        try {
            const chapter = {
                courseId,
                title: chapterData.title,
                description: chapterData.description,
                sequence: chapterData.sequence,
                createdAt: new Date().toISOString()
            };

            const chapterId = await dbService.add('chapters', chapter);
            notificationService.addNotification({
                type: 'course',
                title: '新章节添加',
                message: `课程添加了新章节: ${chapter.title}`,
                courseId
            });

            return chapterId;
        } catch (error) {
            console.error('创建章节失败:', error);
            throw error;
        }
    }

    async addContent(chapterId, contentData) {
        try {
            const content = {
                chapterId,
                title: contentData.title,
                type: contentData.type, // video, document, quiz
                content: contentData.content,
                duration: contentData.duration,
                sequence: contentData.sequence,
                createdAt: new Date().toISOString()
            };

            // 如果是文件类型的内容，先上传文件
            if (contentData.file) {
                const fileId = await fileStorage.saveFile(contentData.file);
                content.fileId = fileId;
            }

            return await dbService.add('courseContents', content);
        } catch (error) {
            console.error('添加课程内容失败:', error);
            throw error;
        }
    }

    async updateContent(contentId, contentData) {
        try {
            const content = await dbService.get('courseContents', contentId);
            if (!content) throw new Error('内容不存在');

            const updatedContent = {
                ...content,
                ...contentData,
                updatedAt: new Date().toISOString()
            };

            await dbService.update('courseContents', updatedContent);
            return updatedContent;
        } catch (error) {
            console.error('更新课程内容失败:', error);
            throw error;
        }
    }

    async getChapterContents(chapterId) {
        try {
            const contents = await dbService.getAll('courseContents');
            return contents
                .filter(content => content.chapterId === chapterId)
                .sort((a, b) => a.sequence - b.sequence);
        } catch (error) {
            console.error('获取章节内容失败:', error);
            throw error;
        }
    }

    async getCourseStructure(courseId) {
        try {
            const chapters = await dbService.getAll('chapters');
            const courseChapters = chapters
                .filter(chapter => chapter.courseId === courseId)
                .sort((a, b) => a.sequence - b.sequence);

            // 获取每个章节的内容
            const structure = await Promise.all(courseChapters.map(async chapter => {
                const contents = await this.getChapterContents(chapter.id);
                return {
                    ...chapter,
                    contents
                };
            }));

            return structure;
        } catch (error) {
            console.error('获取课程结构失败:', error);
            throw error;
        }
    }

    async recordProgress(userId, contentId, progress) {
        try {
            const progressData = {
                userId,
                contentId,
                progress, // 0-100
                lastAccessed: new Date().toISOString()
            };

            // 检查是否存在进度记录
            const existingProgress = await this.getProgress(userId, contentId);
            if (existingProgress) {
                progressData.id = existingProgress.id;
                await dbService.update('progress', progressData);
            } else {
                await dbService.add('progress', progressData);
            }

            // 检查是否完成学习
            if (progress === 100) {
                this.checkCourseCompletion(userId, contentId);
            }

            return progressData;
        } catch (error) {
            console.error('记录进度失败:', error);
            throw error;
        }
    }

    async getProgress(userId, contentId) {
        try {
            const allProgress = await dbService.getAll('progress');
            return allProgress.find(p => 
                p.userId === userId && p.contentId === contentId
            );
        } catch (error) {
            console.error('获取进度失败:', error);
            throw error;
        }
    }

    async checkCourseCompletion(userId, contentId) {
        try {
            // 获取内容所属的课程信息
            const content = await dbService.get('courseContents', contentId);
            const courseStructure = await this.getCourseStructure(content.courseId);
            
            // 计算总进度
            let totalContents = 0;
            let completedContents = 0;

            for (const chapter of courseStructure) {
                totalContents += chapter.contents.length;
                for (const content of chapter.contents) {
                    const progress = await this.getProgress(userId, content.id);
                    if (progress && progress.progress === 100) {
                        completedContents++;
                    }
                }
            }

            const courseProgress = Math.floor((completedContents / totalContents) * 100);

            // 更新课程总进度
            await this.updateCourseProgress(userId, content.courseId, courseProgress);

            // 如果完成课程，发送通知
            if (courseProgress === 100) {
                notificationService.addNotification({
                    userId,
                    type: 'achievement',
                    title: '课程完成',
                    message: '恭喜！你已完成课程学习。',
                    courseId: content.courseId
                });
            }

            return courseProgress;
        } catch (error) {
            console.error('检查课程完成状态失败:', error);
            throw error;
        }
    }

    async updateCourseProgress(userId, courseId, progress) {
        try {
            const progressData = {
                userId,
                courseId,
                progress,
                updatedAt: new Date().toISOString()
            };

            const existingProgress = await this.getCourseProgress(userId, courseId);
            if (existingProgress) {
                progressData.id = existingProgress.id;
                await dbService.update('courseProgress', progressData);
            } else {
                await dbService.add('courseProgress', progressData);
            }

            return progressData;
        } catch (error) {
            console.error('更新课程进度失败:', error);
            throw error;
        }
    }

    async getCourseProgress(userId, courseId) {
        try {
            const allProgress = await dbService.getAll('courseProgress');
            return allProgress.find(p => 
                p.userId === userId && p.courseId === courseId
            );
        } catch (error) {
            console.error('获取课程进度失败:', error);
            throw error;
        }
    }
}

const courseContentService = new CourseContentService();
export default courseContentService;
