class AuthService {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // 检查本地存储中的用户会话
        const userSession = localStorage.getItem('userSession');
        if (userSession) {
            this.currentUser = JSON.parse(userSession);
            this.updateUIForRole(this.currentUser.role);
        }
    }

    async login(username, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error('登录失败');
            }

            const userData = await response.json();
            this.currentUser = userData;
            localStorage.setItem('userSession', JSON.stringify(userData));
            this.updateUIForRole(userData.role);
            return userData;
        } catch (error) {
            console.error('登录错误:', error);
            throw error;
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('userSession');
        this.updateUIForRole('guest');
        window.location.href = '/';
    }

    updateUIForRole(role) {
        // 更新UI显示基于用户角色
        const studentElements = document.querySelectorAll('.student-only');
        const teacherElements = document.querySelectorAll('.teacher-only');
        const adminElements = document.querySelectorAll('.admin-only');
        const guestElements = document.querySelectorAll('.guest-only');

        switch (role) {
            case 'student':
                this.showElements(studentElements);
                this.hideElements(teacherElements);
                this.hideElements(adminElements);
                this.hideElements(guestElements);
                break;
            case 'teacher':
                this.showElements(teacherElements);
                this.hideElements(studentElements);
                this.hideElements(adminElements);
                this.hideElements(guestElements);
                break;
            case 'admin':
                this.showElements(adminElements);
                this.showElements(teacherElements);
                this.hideElements(studentElements);
                this.hideElements(guestElements);
                break;
            default: // guest
                this.showElements(guestElements);
                this.hideElements(studentElements);
                this.hideElements(teacherElements);
                this.hideElements(adminElements);
        }
    }

    showElements(elements) {
        elements.forEach(el => el.style.display = '');
    }

    hideElements(elements) {
        elements.forEach(el => el.style.display = 'none');
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

const authService = new AuthService();
export default authService;
