// 数据库表结构定义
const dbSchema = {
    users: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        username: 'TEXT NOT NULL UNIQUE',
        password: 'TEXT NOT NULL',
        role: 'TEXT NOT NULL', // 'guest', 'student', 'teacher', 'admin'
        email: 'TEXT UNIQUE',
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    },
    courses: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        title: 'TEXT NOT NULL',
        description: 'TEXT',
        courseIntro:'TEXT',
        teacher_id: 'INTEGER',
        category_id: 'INTEGER',
        cover_image: 'TEXT',
        status: 'TEXT', // 'draft', 'published', 'archived'
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    },
    course_content: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        course_id: 'INTEGER',
        title: 'TEXT NOT NULL',
        content_type: 'TEXT', // 'video', 'document', 'quiz'
        content: 'TEXT',
        sequence: 'INTEGER',
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    },
    enrollments: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        user_id: 'INTEGER',
        course_id: 'INTEGER',
        status: 'TEXT', // 'active', 'completed', 'dropped'
        progress: 'INTEGER DEFAULT 0',
        enrolled_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    },
    assignments: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        course_id: 'INTEGER',
        title: 'TEXT NOT NULL',
        description: 'TEXT',
        due_date: 'TIMESTAMP',
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    },
    submissions: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        assignment_id: 'INTEGER',
        user_id: 'INTEGER',
        content: 'TEXT',
        score: 'INTEGER',
        submitted_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    },
    categories: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        name: 'TEXT NOT NULL',
        description: 'TEXT'
    }
};

export default dbSchema;
