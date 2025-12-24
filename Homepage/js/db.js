// IndexedDB数据库初始化和管理
class Database {
    constructor() {
        this.dbName = 'courseDB';
        this.dbVersion = 1;
        this.db = null;
    }

    // 初始化数据库
    async init() {
        try {
            await this.initDB();
            await this.initializeTestData();
            console.log('数据库初始化完成');
        } catch (error) {
            console.error('数据库初始化失败:', error);
        }
    }

    // 初始化数据库结构
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error('数据库错误:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('数据库连接成功');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 用户表
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                    userStore.createIndex('username', 'username', { unique: true });
                    userStore.createIndex('email', 'email', { unique: true });
                    userStore.createIndex('role', 'role', { unique: false });
                }

                // 课程表
                if (!db.objectStoreNames.contains('courses')) {
                    const courseStore = db.createObjectStore('courses', { keyPath: 'id', autoIncrement: true });
                    courseStore.createIndex('title', 'title', { unique: false });
                    courseStore.createIndex('categoryId', 'categoryId', { unique: false });
                    courseStore.createIndex('teacherId', 'teacherId', { unique: false });
                    courseStore.createIndex('createDate', 'createDate', { unique: false });
                    courseStore.createIndex('recommended', 'recommended', { unique: false });
                    courseStore.createIndex('enrollCount', 'enrollCount', { unique: false });
                }

                // 课程内容表
                if (!db.objectStoreNames.contains('courseContents')) {
                    const contentStore = db.createObjectStore('courseContents', { keyPath: 'id' });
                    contentStore.createIndex('courseId', 'courseId', { unique: false });
                    contentStore.createIndex('type', 'type', { unique: false });
                }

                // 用户课程关系表（用于记录学生选课信息）
                if (!db.objectStoreNames.contains('userCourses')) {
                    const userCourseStore = db.createObjectStore('userCourses', { keyPath: ['userId', 'courseId'] });
                    userCourseStore.createIndex('userId', 'userId', { unique: false });
                    userCourseStore.createIndex('courseId', 'courseId', { unique: false });
                    userCourseStore.createIndex('enrollDate', 'enrollDate', { unique: false });
                }

                // 评论表
                if (!db.objectStoreNames.contains('comments')) {
                    const commentStore = db.createObjectStore('comments', { keyPath: 'id' });
                    commentStore.createIndex('courseId', 'courseId', { unique: false });
                    commentStore.createIndex('userId', 'userId', { unique: false });
                    commentStore.createIndex('createTime', 'createTime', { unique: false });
                }

                console.log('数据库表和索引创建完成');
            };
        });
    }

    // 初始化测试数据
    async initializeTestData() {
        try {
            // 检查是否已有数据
            const existingCourses = await this.getAll('courses');
            if (existingCourses && existingCourses.length > 0) {
                console.log('已存在测试数据，跳过初始化');
                return;
            }

            // 添加测试课程
            const testCourses = [
                {
                    title: 'Python编程基础',
                    description: '从零开始学习Python编程语言，掌握编程思维和基础知识',
                    teacher: '张老师',
                    categoryId: 1,
                    coverImage: 'images/logo.png',
                    enrollCount: 128,
                    price: 199,
                    recommended: true,
                    createDate: new Date().toISOString()
                },
                {
                    title: 'Web开发入门',
                    description: '学习HTML、CSS和JavaScript，开启Web开发之旅',
                    teacher: '李老师',
                    categoryId: 1,
                    coverImage: 'images/logo.png',
                    enrollCount: 256,
                    price: 299,
                    recommended: true,
                    createDate: new Date().toISOString()
                },
                {
                    title: '数据结构与算法',
                    description: '深入学习计算机科学的核心知识，提升编程能力',
                    teacher: '王老师',
                    categoryId: 1,
                    coverImage: 'images/logo.png',
                    enrollCount: 64,
                    price: 399,
                    recommended: false,
                    createDate: new Date().toISOString()
                }
            ];

            // 添加课程数据
            for (const course of testCourses) {
                await this.add('courses', course);
            }

            console.log('测试数据初始化完成');
        } catch (error) {
            console.error('初始化测试数据失败:', error);
        }
    }

    // 通用添加方法
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 通用获取方法
    async get(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 通用更新方法
    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 通用删除方法
    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 通用查询方法
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 根据索引查询
    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// 创建数据库实例
const db = new Database();

// 初始化数据库
window.addEventListener('load', async () => {
    console.log(1)
    try {
        await db.init();
        console.log('数据库初始化完成');
    } catch (error) {
        console.error('数据库初始化失败:', error);
    }
});
