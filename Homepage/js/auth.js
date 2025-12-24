// 用户角色枚举
const UserRole = {
    VISITOR: 'visitor',
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin'
};

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // 从localStorage检查登录状态
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUIForUser();
        }
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 登录按钮事件
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showLoginModal();
        });

        // 注册按钮事件
        document.getElementById('registerBtn').addEventListener('click', () => {
            this.showRegisterModal();
        });
    }

    // 显示登录模态框
    showLoginModal() {
        const modal = document.getElementById('loginModal');
        modal.style.display = 'block';
        
        // 动态创建登录表单
        modal.querySelector('.modal-content').innerHTML = `
            <h2>登录</h2>
            <form id="loginForm">
                <div class="form-group">
                    <label for="username">用户名</label>
                    <input type="text" id="username" required>
                </div>
                <div class="form-group">
                    <label for="password">密码</label>
                    <input type="password" id="password" required>
                </div>
                <button type="submit">登录</button>
                <button type="button" class="close-modal">取消</button>
            </form>
        `;

        // 添加表单提交事件
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // 添加关闭按钮事件
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // 显示注册模态框
    showRegisterModal() {
        const modal = document.getElementById('registerModal');
        modal.style.display = 'block';

        // 动态创建注册表单
        modal.querySelector('.modal-content').innerHTML = `
            <h2>注册</h2>
            <form id="registerForm">
                <div class="form-group">
                    <label for="regUsername">用户名</label>
                    <input type="text" id="regUsername" required>
                </div>
                <div class="form-group">
                    <label for="regEmail">邮箱</label>
                    <input type="email" id="regEmail" required>
                </div>
                <div class="form-group">
                    <label for="regPassword">密码</label>
                    <input type="password" id="regPassword" required>
                </div>
                <div class="form-group">
                    <label for="regRole">角色</label>
                    <select id="regRole">
                        <option value="student">学生</option>
                        <option value="teacher">教师</option>
                    </select>
                </div>
                <button type="submit">注册</button>
                <button type="button" class="close-modal">取消</button>
            </form>
        `;

        // 添加表单提交事件
        const registerForm = document.getElementById('registerForm');
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // 添加关闭按钮事件
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // 登录处理
    async login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // 从数据库查询用户
            const users = await db.getByIndex('users', 'username', username);
            const user = users[0];

            if (user && user.password === password) { // 实际应用中应该使用加密密码
                this.currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.updateUIForUser();
                document.getElementById('loginModal').style.display = 'none';
            } else {
                alert('用户名或密码错误');
            }
        } catch (error) {
            console.error('登录失败:', error);
            alert('登录失败，请重试');
        }
    }

    // 注册处理
    async register() {
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const role = document.getElementById('regRole').value;

        try {
            // 检查用户名是否已存在
            const existingUsers = await db.getByIndex('users', 'username', username);
            if (existingUsers.length > 0) {
                alert('用户名已存在');
                return;
            }

            // 创建新用户
            const newUser = {
                username,
                email,
                password, // 实际应用中应该加密存储
                role,
                createDate: new Date().toISOString()
            };

            await db.add('users', newUser);
            alert('注册成功，请登录');
            document.getElementById('registerModal').style.display = 'none';
        } catch (error) {
            console.error('注册失败:', error);
            alert('注册失败，请重试');
        }
    }

    // 更新UI显示
    updateUIForUser() {
        const userActions = document.querySelector('.user-actions');
        if (this.currentUser) {
            userActions.innerHTML = `
                <span>欢迎，${this.currentUser.username}</span>
                <button id="logoutBtn">退出</button>
            `;
            document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
            
            // 根据用户角色显示/隐藏相关功能
            this.updateUIByRole();
        } else {
            userActions.innerHTML = `
                <button id="loginBtn">登录</button>
                <button id="registerBtn">注册</button>
            `;
            this.setupEventListeners();
        }
    }

    // 根据用户角色更新UI
    updateUIByRole() {
        const role = this.currentUser ? this.currentUser.role : UserRole.VISITOR;
        
        // 隐藏所有角色特定的元素
        document.querySelectorAll('.role-specific').forEach(el => el.style.display = 'none');

        // 根据角色显示特定元素
        switch (role) {
            case UserRole.ADMIN:
                document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
                // fall through
            case UserRole.TEACHER:
                document.querySelectorAll('.teacher-only').forEach(el => el.style.display = 'block');
                // fall through
            case UserRole.STUDENT:
                document.querySelectorAll('.student-only').forEach(el => el.style.display = 'block');
                break;
            case UserRole.VISITOR:
                // 游客只能看到基本内容
                break;
        }
    }

    // 退出登录
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUIForUser();
        window.location.reload(); // 刷新页面以重置所有状态
    }

    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    }

    // 检查用户权限
    hasPermission(requiredRole) {
        if (!this.currentUser) return false;
        
        const roles = [UserRole.VISITOR, UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN];
        const currentRoleIndex = roles.indexOf(this.currentUser.role);
        const requiredRoleIndex = roles.indexOf(requiredRole);
        
        return currentRoleIndex >= requiredRoleIndex;
    }
}

// 创建身份验证管理器实例
const auth = new AuthManager();
