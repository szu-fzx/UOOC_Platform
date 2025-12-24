class IndexedDBService {
    constructor() {
        this.dbName = 'OnlineCourseDB';
        this.dbVersion = 1;
        this.db = null;
        this.init();
    }

    async init() {
        try {
            return await new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.dbVersion);

                request.onerror = () => {
                    reject('数据库打开失败');
                };

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    resolve(this.db);
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;

                    // 用户表
                    if (!db.objectStoreNames.contains('users')) {
                        const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                        userStore.createIndex('username', 'username', { unique: true });
                        userStore.createIndex('email', 'email', { unique: true });
                    }

                    // 课程表
                    if (!db.objectStoreNames.contains('courses')) {
                        const courseStore = db.createObjectStore('courses', { keyPath: 'id', autoIncrement: true });
                        courseStore.createIndex('teacherId', 'teacherId', { unique: false });
                        courseStore.createIndex('category', 'category', { unique: false });
                    }

                    // 课程内容表
                    if (!db.objectStoreNames.contains('courseContents')) {
                        const contentStore = db.createObjectStore('courseContents', { keyPath: 'id', autoIncrement: true });
                        contentStore.createIndex('courseId', 'courseId', { unique: false });
                    }

                    // 课程注册表
                    if (!db.objectStoreNames.contains('enrollments')) {
                        const enrollStore = db.createObjectStore('enrollments', { keyPath: 'id', autoIncrement: true });
                        enrollStore.createIndex('userId', 'userId', { unique: false });
                        enrollStore.createIndex('courseId', 'courseId', { unique: false });
                    }

                    // 作业表
                    if (!db.objectStoreNames.contains('assignments')) {
                        const assignmentStore = db.createObjectStore('assignments', { keyPath: 'id', autoIncrement: true });
                        assignmentStore.createIndex('courseId', 'courseId', { unique: false });
                    }

                    // 作业提交表
                    if (!db.objectStoreNames.contains('submissions')) {
                        const submissionStore = db.createObjectStore('submissions', { keyPath: 'id', autoIncrement: true });
                        submissionStore.createIndex('assignmentId', 'assignmentId', { unique: false });
                        submissionStore.createIndex('userId', 'userId', { unique: false });
                    }

                    // 通知表
                    if (!db.objectStoreNames.contains('notifications')) {
                        const notificationStore = db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
                        notificationStore.createIndex('userId', 'userId', { unique: false });
                        notificationStore.createIndex('read', 'read', { unique: false });
                    }
                };
            });
        } catch (error) {
            console.error('初始化数据库失败:', error);
            throw error;
        }
    }

    async add(storeName, data) {
        return await this.performTransaction(storeName, 'readwrite', (store) => {
            return store.add(data);
        });
    }

    async get(storeName, id) {
        return await this.performTransaction(storeName, 'readonly', (store) => {
            return store.get(id);
        });
    }

    async getAll(storeName) {
        return await this.performTransaction(storeName, 'readonly', (store) => {
            return store.getAll();
        });
    }

    async update(storeName, data) {
        return await this.performTransaction(storeName, 'readwrite', (store) => {
            return store.put(data);
        });
    }

    async delete(storeName, id) {
        return await this.performTransaction(storeName, 'readwrite', (store) => {
            return store.delete(id);
        });
    }

    async performTransaction(storeName, mode, operation) {
        try {
            return await new Promise((resolve, reject) => {
                if (!this.db) {
                    reject('数据库未初始化');
                    return;
                }

                const transaction = this.db.transaction(storeName, mode);
                const store = transaction.objectStore(storeName);

                const request = operation(store);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error(`数据库操作失败 (${storeName}):`, error);
            throw error;
        }
    }
}

const dbService = new IndexedDBService();
export default dbService;
