class NotificationService {
    constructor() {
        this.notifications = [];
        this.subscribers = new Set();
        this.init();
    }

    async init() {
        // 请求通知权限
        if ('Notification' in window) {
            await Notification.requestPermission();
        }

        // 从 IndexedDB 加载未读通知
        this.loadNotifications();
    }

    async loadNotifications() {
        try {
            const userId = localStorage.getItem('currentUserId');
            if (!userId) return;

            const allNotifications = await dbService.getAll('notifications');
            this.notifications = allNotifications.filter(n => n.userId === userId);
            this.notifySubscribers();
        } catch (error) {
            console.error('加载通知失败:', error);
        }
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        callback(this.notifications);
        return () => this.subscribers.delete(callback);
    }

    notifySubscribers() {
        this.subscribers.forEach(callback => callback(this.notifications));
    }

    async addNotification(notification) {
        try {
            const newNotification = {
                ...notification,
                timestamp: new Date().toISOString(),
                read: false
            };

            // 保存到 IndexedDB
            await dbService.add('notifications', newNotification);
            this.notifications.push(newNotification);

            // 发送浏览器通知
            this.showBrowserNotification(newNotification);

            // 通知订阅者
            this.notifySubscribers();

            return newNotification;
        } catch (error) {
            console.error('添加通知失败:', error);
            throw error;
        }
    }

    async markAsRead(notificationId) {
        try {
            const notification = await dbService.get('notifications', notificationId);
            if (notification) {
                notification.read = true;
                await dbService.update('notifications', notification);
                
                const index = this.notifications.findIndex(n => n.id === notificationId);
                if (index !== -1) {
                    this.notifications[index] = notification;
                    this.notifySubscribers();
                }
            }
        } catch (error) {
            console.error('标记通知已读失败:', error);
            throw error;
        }
    }

    async markAllAsRead() {
        try {
            const promises = this.notifications
                .filter(n => !n.read)
                .map(n => this.markAsRead(n.id));
            
            await Promise.all(promises);
        } catch (error) {
            console.error('标记所有通知已读失败:', error);
            throw error;
        }
    }

    showBrowserNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/images/logo.png'
            });
        }
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }
}

const notificationService = new NotificationService();
export default notificationService;
