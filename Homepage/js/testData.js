// 测试数据
const testData = {
    courses: [
        {
            id: 1,
            title: 'Python编程基础',
            description: '零基础入门Python编程，掌握编程基础知识',
            coverImage: 'images/courses/python.jpg',
            teacher: '张老师',
            enrollCount: 1200,
            price: 0,
            recommended: true,
            createDate: '2025-01-01'
        },
        {
            id: 2,
            title: 'Web开发入门',
            description: '学习HTML、CSS和JavaScript基础',
            coverImage: 'images/courses/web.jpg',
            teacher: '李老师',
            enrollCount: 980,
            price: 0,
            recommended: true,
            createDate: '2025-01-02'
        },
        {
            id: 3,
            title: '高等数学',
            description: '大学数学基础课程，微积分与线性代数',
            coverImage: 'images/courses/math.jpg',
            teacher: '王老师',
            enrollCount: 750,
            price: 0,
            recommended: false,
            createDate: '2025-01-03'
        }
    ],
    courseContents: [
        {
            id: 1,
            courseId: 1,
            title: 'Python环境搭建',
            type: 'video',
            url: 'videos/python/setup.mp4'
        },
        {
            id: 2,
            courseId: 1,
            title: 'Python基础语法',
            type: 'document',
            url: 'docs/python/basics.pdf'
        }
    ],
    comments: [
        {
            id: 1,
            courseId: 1,
            userId: 1,
            username: '小明',
            content: '课程讲解很清晰，非常适合入门！',
            createTime: '2025-01-05 10:30:00'
        }
    ]
};

// 测试数据生成器
class TestDataGenerator {
    constructor() {
        this.init();
    }

    async init() {
        await this.generateUsers();
        await this.generateCourses();
        await this.generateCourseContents();
        await this.generateComments();
        await initTestData();
    }

    // 生成用户数据
    async generateUsers() {
        const users = [
            {
                username: 'admin',
                password: 'admin123',
                email: 'admin@example.com',
                role: 'admin',
                createDate: '2025-01-01T00:00:00.000Z'
            },
            {
                username: 'teacher1',
                password: 'teacher123',
                email: 'teacher1@example.com',
                role: 'teacher',
                createDate: '2025-01-02T00:00:00.000Z'
            },
            {
                username: 'teacher2',
                password: 'teacher123',
                email: 'teacher2@example.com',
                role: 'teacher',
                createDate: '2025-01-03T00:00:00.000Z'
            },
            {
                username: 'student1',
                password: 'student123',
                email: 'student1@example.com',
                role: 'student',
                createDate: '2025-01-04T00:00:00.000Z'
            },
            {
                username: 'student2',
                password: 'student123',
                email: 'student2@example.com',
                role: 'student',
                createDate: '2025-01-05T00:00:00.000Z'
            }
        ];

        for (const user of users) {
            try {
                await db.add('users', user);
            } catch (error) {
                console.log('用户已存在:', user.username);
            }
        }
    }

    // 生成课程数据
    async generateCourses() {
        const courses = [
            {
                id: 1,
                title: 'Python编程基础',
                description: '零基础入门Python编程，掌握编程基础知识',
                coverImage: 'images/courses/cs-1.jpg',
                teacher: '张老师',
                enrollCount: 1200,
                price: 0,
                recommended: true,
                createDate: '2025-01-01'
            },
            {
                id: 2,
                title: 'Web开发入门',
                description: '学习HTML、CSS和JavaScript基础',
                coverImage: 'images/courses/cs-2.jpg',
                teacher: '李老师',
                enrollCount: 980,
                price: 0,
                recommended: true,
                createDate: '2025-01-02'
            },
            {
                id: 3,
                title: '高等数学',
                description: '大学数学基础课程，微积分与线性代数',
                coverImage: 'images/courses/math-1.jpg',
                teacher: '王老师',
                enrollCount: 750,
                price: 0,
                recommended: false,
                createDate: '2025-01-03'
            }
        ];

        for (const course of courses) {
            try {
                const existingCourse = await db.get('courses', course.id);
                if (!existingCourse) {
                    await db.add('courses', course);
                }
            } catch (error) {
                console.error('添加课程失败:', error);
            }
        }
    }

    // 生成课程内容数据
    async generateCourseContents() {
        const courseContents = [
            {
                id: 1,
                courseId: 1,
                title: 'Python环境搭建',
                type: 'video',
                url: 'videos/python/setup.mp4'
            },
            {
                id: 2,
                courseId: 1,
                title: 'Python基础语法',
                type: 'document',
                url: 'docs/python/basics.pdf'
            },
            {
                id: 3,
                courseId: 2,
                title: 'HTML基础',
                type: 'video',
                url: 'videos/web/html.mp4'
            },
            {
                id: 4,
                courseId: 2,
                title: 'CSS样式',
                type: 'document',
                url: 'docs/web/css.pdf'
            },
            {
                id: 5,
                courseId: 3,
                title: '极限与连续',
                type: 'video',
                url: 'videos/math/limit.mp4'
            },
            {
                id: 6,
                courseId: 3,
                title: '导数与微分',
                type: 'document',
                url: 'docs/math/derivative.pdf'
            }
        ];

        for (const content of courseContents) {
            try {
                const existingContent = await db.get('courseContents', content.id);
                if (!existingContent) {
                    await db.add('courseContents', content);
                }
            } catch (error) {
                console.error('添加课程内容失败:', error);
            }
        }
    }

    // 生成评论数据
    async generateComments() {
        const comments = [
            {
                id: 1,
                courseId: 1,
                userId: 1,
                username: 'student1',
                content: 'Python课程讲解很清晰，非常适合入门！',
                createTime: '2025-01-05 10:30:00'
            },
            {
                id: 2,
                courseId: 2,
                userId: 2,
                username: 'student2',
                content: 'Web开发课程内容很实用，学到了很多。',
                createTime: '2025-01-06 15:20:00'
            },
            {
                id: 3,
                courseId: 3,
                userId: 1,
                username: 'student1',
                content: '数学讲解深入浅出，配套习题很有帮助。',
                createTime: '2025-01-07 09:45:00'
            }
        ];

        for (const comment of comments) {
            try {
                const existingComment = await db.get('comments', comment.id);
                if (!existingComment) {
                    await db.add('comments', comment);
                }
            } catch (error) {
                console.error('添加评论失败:', error);
            }
        }
    }
}

// 初始化测试数据
async function initTestData() {
    try {
        // 等待数据库初始化
        while (!db.db) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 检查并添加课程数据
        for (const course of testData.courses) {
            const existingCourse = await db.get('courses', course.id);
            if (!existingCourse) {
                await db.add('courses', course);
            }
        }
        
        // 检查并添加课程内容
        for (const content of testData.courseContents) {
            const existingContent = await db.get('courseContents', content.id);
            if (!existingContent) {
                await db.add('courseContents', content);
            }
        }
        
        // 检查并添加评论
        for (const comment of testData.comments) {
            const existingComment = await db.get('comments', comment.id);
            if (!existingComment) {
                await db.add('comments', comment);
            }
        }

        console.log('测试数据初始化完成');
    } catch (error) {
        console.error('初始化测试数据失败:', error);
    }
}

// 初始化测试数据
window.addEventListener('load', () => {
    setTimeout(() => {
        new TestDataGenerator();
    }, 1000); // 等待数据库初始化完成
});
