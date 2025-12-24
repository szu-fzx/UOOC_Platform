import dbService from './indexedDB.js';
import fileStorage from './fileStorage.js';
import notificationService from './notification.js';

class AssignmentService {
    constructor() {
        this.currentAssignment = null;
    }

    async createAssignment(courseId, assignmentData) {
        try {
            const assignment = {
                courseId,
                title: assignmentData.title,
                description: assignmentData.description,
                dueDate: assignmentData.dueDate,
                totalScore: assignmentData.totalScore,
                attachments: [],
                createdAt: new Date().toISOString()
            };

            // 处理附件
            if (assignmentData.attachments && assignmentData.attachments.length > 0) {
                for (const file of assignmentData.attachments) {
                    const fileId = await fileStorage.saveFile(file);
                    assignment.attachments.push(fileId);
                }
            }

            const assignmentId = await dbService.add('assignments', assignment);

            // 发送通知给所有选课学生
            const enrollments = await dbService.getAll('enrollments');
            const courseStudents = enrollments
                .filter(e => e.courseId === courseId)
                .map(e => e.userId);

            for (const studentId of courseStudents) {
                notificationService.addNotification({
                    userId: studentId,
                    type: 'assignment',
                    title: '新作业发布',
                    message: `课程发布了新作业: ${assignment.title}`,
                    courseId,
                    assignmentId
                });
            }

            return assignmentId;
        } catch (error) {
            console.error('创建作业失败:', error);
            throw error;
        }
    }

    async submitAssignment(assignmentId, userId, submissionData) {
        try {
            const assignment = await dbService.get('assignments', assignmentId);
            if (!assignment) throw new Error('作业不存在');

            const submission = {
                assignmentId,
                userId,
                content: submissionData.content,
                attachments: [],
                submittedAt: new Date().toISOString(),
                status: 'submitted', // submitted, graded
                score: null,
                feedback: null
            };

            // 处理附件
            if (submissionData.attachments && submissionData.attachments.length > 0) {
                for (const file of submissionData.attachments) {
                    const fileId = await fileStorage.saveFile(file);
                    submission.attachments.push(fileId);
                }
            }

            const submissionId = await dbService.add('submissions', submission);

            // 通知教师有新的作业提交
            const course = await dbService.get('courses', assignment.courseId);
            notificationService.addNotification({
                userId: course.teacherId,
                type: 'submission',
                title: '新作业提交',
                message: `有学生提交了作业: ${assignment.title}`,
                courseId: course.id,
                assignmentId,
                submissionId
            });

            return submissionId;
        } catch (error) {
            console.error('提交作业失败:', error);
            throw error;
        }
    }

    async gradeSubmission(submissionId, gradeData) {
        try {
            const submission = await dbService.get('submissions', submissionId);
            if (!submission) throw new Error('提交记录不存在');

            const updatedSubmission = {
                ...submission,
                score: gradeData.score,
                feedback: gradeData.feedback,
                status: 'graded',
                gradedAt: new Date().toISOString()
            };

            await dbService.update('submissions', updatedSubmission);

            // 通知学生作业已批改
            const assignment = await dbService.get('assignments', submission.assignmentId);
            notificationService.addNotification({
                userId: submission.userId,
                type: 'grade',
                title: '作业已批改',
                message: `你的作业 "${assignment.title}" 已批改完成`,
                courseId: assignment.courseId,
                assignmentId: assignment.id,
                submissionId
            });

            return updatedSubmission;
        } catch (error) {
            console.error('批改作业失败:', error);
            throw error;
        }
    }

    async getAssignmentSubmissions(assignmentId) {
        try {
            const submissions = await dbService.getAll('submissions');
            return submissions.filter(s => s.assignmentId === assignmentId);
        } catch (error) {
            console.error('获取作业提交记录失败:', error);
            throw error;
        }
    }

    async getStudentSubmissions(userId) {
        try {
            const submissions = await dbService.getAll('submissions');
            return submissions.filter(s => s.userId === userId);
        } catch (error) {
            console.error('获取学生提交记录失败:', error);
            throw error;
        }
    }

    async getAssignmentStatistics(assignmentId) {
        try {
            const submissions = await this.getAssignmentSubmissions(assignmentId);
            const gradedSubmissions = submissions.filter(s => s.status === 'graded');

            return {
                totalSubmissions: submissions.length,
                gradedCount: gradedSubmissions.length,
                averageScore: gradedSubmissions.length > 0
                    ? gradedSubmissions.reduce((sum, s) => sum + s.score, 0) / gradedSubmissions.length
                    : 0,
                highestScore: gradedSubmissions.length > 0
                    ? Math.max(...gradedSubmissions.map(s => s.score))
                    : 0,
                lowestScore: gradedSubmissions.length > 0
                    ? Math.min(...gradedSubmissions.map(s => s.score))
                    : 0
            };
        } catch (error) {
            console.error('获取作业统计信息失败:', error);
            throw error;
        }
    }
}

const assignmentService = new AssignmentService();
export default assignmentService;
