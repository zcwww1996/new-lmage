// 导航系统控制器
class NavigationController {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.isLoggedIn = this.checkLoginStatus();
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateActiveNav();
        this.updateUserInfo();
        this.handleMobileNav();
    }

    // 获取当前页面
    getCurrentPage() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html') return 'home';
        return path.replace('/', '').replace('.html', '');
    }

    // 检查登录状态
    checkLoginStatus() {
        return localStorage.getItem('userToken') !== null;
    }

    // 绑定事件
    bindEvents() {
        // 导航项点击事件
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleNavClick(e);
            });
        });

        // 移动端菜单切换
        const mobileToggle = document.getElementById('mobileNavToggle');
        const mobileOverlay = document.getElementById('mobileNavOverlay');
        const navigation = document.querySelector('.main-navigation');

        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                this.toggleMobileNav();
            });
        }

        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', () => {
                this.closeMobileNav();
            });
        }

        // 主题切换
        const themeToggle = document.getElementById('themeToggleNav');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // 退出登录
        const logoutBtn = document.getElementById('logoutBtnNav');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // 监听登录状态变化
        window.addEventListener('storage', () => {
            this.isLoggedIn = this.checkLoginStatus();
            this.updateUserInfo();
        });
    }

    // 处理导航点击
    handleNavClick(e) {
        const target = e.currentTarget;
        const page = target.getAttribute('data-page');
        
        if (page) {
            // 更新活动状态
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            target.classList.add('active');

            // 页面跳转动画
            this.navigateWithAnimation(target.href);
            e.preventDefault();
        }
    }

    // 带动画的页面跳转
    navigateWithAnimation(href) {
        // 添加页面过渡效果
        const transition = document.createElement('div');
        transition.className = 'page-transition-overlay';
        transition.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(transition);
        
        // 触发动画
        setTimeout(() => {
            transition.style.opacity = '1';
        }, 10);

        // 页面跳转
        setTimeout(() => {
            window.location.href = href;
        }, 300);
    }

    // 更新活动导航项
    updateActiveNav() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            const page = item.getAttribute('data-page');
            if (page === this.currentPage) {
                item.classList.add('active');
            }
        });
    }

    // 更新用户信息
    updateUserInfo() {
        const userInfo = this.getUserInfo();
        const userNameEl = document.getElementById('navUserName');
        const userStatusEl = document.getElementById('navUserStatus');
        const userInitialEl = document.getElementById('userInitial');
        const logoutBtn = document.getElementById('logoutBtnNav');

        if (userNameEl && userStatusEl && userInitialEl) {
            if (this.isLoggedIn && userInfo) {
                userNameEl.textContent = userInfo.name || '用户';
                userStatusEl.textContent = '已登录';
                userInitialEl.textContent = (userInfo.name || 'U').charAt(0).toUpperCase();
                
                if (logoutBtn) {
                    logoutBtn.style.display = 'flex';
                }
            } else {
                userNameEl.textContent = '未登录';
                userStatusEl.textContent = '访客模式';
                userInitialEl.textContent = 'U';
                
                if (logoutBtn) {
                    logoutBtn.style.display = 'none';
                }
            }
        }
    }

    // 获取用户信息
    getUserInfo() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    }

    // 移动端导航处理
    handleMobileNav() {
        if (window.innerWidth <= 768) {
            this.closeMobileNav();
        }
    }

    // 切换移动端导航
    toggleMobileNav() {
        const navigation = document.querySelector('.main-navigation');
        const overlay = document.getElementById('mobileNavOverlay');
        const toggle = document.getElementById('mobileNavToggle');

        if (navigation && overlay && toggle) {
            const isActive = navigation.classList.contains('active');
            
            if (isActive) {
                this.closeMobileNav();
            } else {
                this.openMobileNav();
            }
        }
    }

    // 打开移动端导航
    openMobileNav() {
        const navigation = document.querySelector('.main-navigation');
        const overlay = document.getElementById('mobileNavOverlay');
        const toggle = document.getElementById('mobileNavToggle');

        if (navigation && overlay && toggle) {
            navigation.classList.add('active');
            overlay.classList.add('active');
            toggle.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // 关闭移动端导航
    closeMobileNav() {
        const navigation = document.querySelector('.main-navigation');
        const overlay = document.getElementById('mobileNavOverlay');
        const toggle = document.getElementById('mobileNavToggle');

        if (navigation && overlay && toggle) {
            navigation.classList.remove('active');
            overlay.classList.remove('active');
            toggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // 处理窗口大小变化
    handleResize() {
        if (window.innerWidth > 768) {
            this.closeMobileNav();
        }
    }

    // 切换主题
    toggleTheme() {
        const body = document.body;
        const themeIcon = document.querySelector('#themeToggleNav .nav-icon');
        
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            if (themeIcon) themeIcon.textContent = '🌙';
        } else {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            if (themeIcon) themeIcon.textContent = '☀️';
        }
    }

    // 处理退出登录
    handleLogout() {
        if (confirm('确定要退出登录吗？')) {
            localStorage.removeItem('userToken');
            localStorage.removeItem('userInfo');
            this.isLoggedIn = false;
            this.updateUserInfo();
            
            // 显示退出成功提示
            this.showNotification('已成功退出登录', 'success');
            
            // 跳转到首页
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // 触发动画
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // 自动移除
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // 初始化主题
    initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const themeIcon = document.querySelector('#themeToggleNav .nav-icon');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            if (themeIcon) themeIcon.textContent = '☀️';
        } else {
            if (themeIcon) themeIcon.textContent = '🌙';
        }
    }

    // 添加导航徽章（用于显示未读消息等）
    addNavBadge(navItem, count) {
        const badge = document.createElement('span');
        badge.className = 'nav-badge';
        badge.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: #ef4444;
            color: white;
            font-size: 0.7rem;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 10px;
            min-width: 18px;
            text-align: center;
            line-height: 1;
        `;
        badge.textContent = count > 99 ? '99+' : count.toString();
        
        const existingBadge = navItem.querySelector('.nav-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        navItem.appendChild(badge);
    }

    // 移除导航徽章
    removeNavBadge(navItem) {
        const badge = navItem.querySelector('.nav-badge');
        if (badge) {
            badge.remove();
        }
    }
}

// 初始化导航系统
document.addEventListener('DOMContentLoaded', () => {
    const navigation = new NavigationController();
    navigation.initTheme();
    
    // 全局导航实例
    window.navigationController = navigation;
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationController;
} 