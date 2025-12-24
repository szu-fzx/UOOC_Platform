class AssessmentService {
    constructor() {
        this.currentAssessment = null;
    }

    async createAssessment(assessmentData) {
        try {
            const assessment = {
                ...assessmentData,
                createdAt: new Date().toISOString(),
                status: 'draft'
            };

            return await dbService.add('assessments', assessment);
        } catch (error) {
            console.error('创建测评失败:', error);
            throw error;
        }
    }

    async startAssessment(assessmentId) {
        try {
            const assessment = await dbService.get('assessments', assessmentId);
            if (!assessment) throw new Error('测评不存在');

            this.currentAssessment = {
                ...assessment,
                startTime: new Date().toISOString(),
                answers: {},
                timeSpent: 0
            };

            // 开始计时
            this.startTimer();

            return this.currentAssessment;
        } catch (error) {
            console.error('开始测评失败:', error);
            throw error;
        }
    }

    startTimer() {
        this.timer = setInterval(() => {
            if (this.currentAssessment) {
                this.currentAssessment.timeSpent += 1;
                // 检查是否超时
                if (this.currentAssessment.timeLimit && 
                    this.currentAssessment.timeSpent >= this.currentAssessment.timeLimit) {
                    this.submitAssessment();
                }
            }
        }, 1000);
    }

    async submitAnswer(questionId, answer) {
        if (!this.currentAssessment) throw new Error('没有正在进行的测评');

        this.currentAssessment.answers[questionId] = {
            answer,
            submittedAt: new Date().toISOString()
        };
    }

    async submitAssessment() {
        try {
            if (!this.currentAssessment) throw new Error('没有正在进行的测评');

            clearInterval(this.timer);

            const submission = {
                assessmentId: this.currentAssessment.id,
                userId: localStorage.getItem('currentUserId'),
                answers: this.currentAssessment.answers,
                timeSpent: this.currentAssessment.timeSpent,
                submittedAt: new Date().toISOString()
            };

            // 自动评分
            const score = await this.gradeAssessment(submission);
            submission.score = score;

            // 保存提交结果
            await dbService.add('submissions', submission);

            // 清理当前测评状态
            this.currentAssessment = null;

            return submission;
        } catch (error) {
            console.error('提交测评失败:', error);
            throw error;
        }
    }

    async gradeAssessment(submission) {
        try {
            const assessment = await dbService.get('assessments', submission.assessmentId);
            let totalScore = 0;

            // 遍历每个问题进行评分
            Object.entries(submission.answers).forEach(([questionId, answer]) => {
                const question = assessment.questions.find(q => q.id === parseInt(questionId));
                if (!question) return;

                switch (question.type) {
                    case 'multiple-choice':
                    case 'single-choice':
                        if (this.compareAnswers(answer.answer, question.correctAnswer)) {
                            totalScore += question.score;
                        }
                        break;
                    case 'coding':
                        // 运行代码测试用例
                        totalScore += this.gradeCodingQuestion(answer.answer, question);
                        break;
                }
            });

            return totalScore;
        } catch (error) {
            console.error('评分失败:', error);
            throw error;
        }
    }

    compareAnswers(userAnswer, correctAnswer) {
        if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
            return userAnswer.length === correctAnswer.length &&
                   userAnswer.every(a => correctAnswer.includes(a));
        }
        return userAnswer === correctAnswer;
    }

    gradeCodingQuestion(code, question) {
        try {
            let score = 0;
            // 创建安全的执行环境
            const testFunction = new Function('return ' + code)();
            
            // 运行测试用例
            for (const testCase of question.testCases) {
                try {
                    const result = testFunction(...testCase.input);
                    if (this.compareAnswers(result, testCase.output)) {
                        score += testCase.score;
                    }
                } catch (e) {
                    console.error('测试用例执行失败:', e);
                }
            }
            
            return score;
        } catch (error) {
            console.error('代码评分失败:', error);
            return 0;
        }
    }

    async getAssessmentResults(userId) {
        try {
            const submissions = await dbService.getAll('submissions');
            return submissions.filter(s => s.userId === userId);
        } catch (error) {
            console.error('获取测评结果失败:', error);
            throw error;
        }
    }
}

const assessmentService = new AssessmentService();
export default assessmentService;
