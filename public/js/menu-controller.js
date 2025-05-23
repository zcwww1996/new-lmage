// 菜单控制器
class MenuController {
    constructor() {
        this.activeDropdown = null;
        this.init();
    }

    init() {
        this.initThemeSwitches();
        this.initDropdownMenus();
        this.initTabMenu();
        this.initContextMenu();
        this.initSearchMenu();
        this.initFabMenu();
        this.initKeyboardShortcuts();
        this.bindEvents();
    }

    // 初始化主题切换器
    initThemeSwitches() {
        const themeSwitches = document.querySelectorAll('.theme-switch');
        
        themeSwitches.forEach(themeSwitch => {
            themeSwitch.addEventListener('click', () => {
                this.toggleTheme(themeSwitch);
            });
        });

        // 初始化主题状态
        this.updateThemeSwitches();
    }

    // 切换主题
    toggleTheme(switchElement) {
        const body = document.body;
        const isDark = body.classList.contains('dark-mode');
        
        // 添加切换动画
        switchElement.classList.add('switching');
        setTimeout(() => {
            switchElement.classList.remove('switching');
        }, 300);
        
        if (isDark) {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        }
        
        this.updateThemeSwitches();
        this.showNotification(isDark ? '已切换到亮色模式' : '已切换到暗色模式', 'success');
    }

    // 更新所有主题切换器状态
    updateThemeSwitches() {
        const isDark = document.body.classList.contains('dark-mode');
        const themeSwitches = document.querySelectorAll('.theme-switch');
        
        themeSwitches.forEach(themeSwitch => {
            if (isDark) {
                themeSwitch.classList.add('dark');
            } else {
                themeSwitch.classList.remove('dark');
            }
        });
    }

    // 初始化下拉菜单
    initDropdownMenus() {
        document.querySelectorAll('.menu-item').forEach(menuItem => {
            const dropdown = menuItem.querySelector('.dropdown-menu');
            if (dropdown) {
                menuItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleDropdown(dropdown);
                });
            }
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-item')) {
                this.closeAllDropdowns();
            }
        });
    }

    // 切换下拉菜单
    toggleDropdown(dropdown) {
        if (this.activeDropdown && this.activeDropdown !== dropdown) {
            this.closeDropdown(this.activeDropdown);
        }

        if (dropdown.classList.contains('active')) {
            this.closeDropdown(dropdown);
        } else {
            this.openDropdown(dropdown);
        }
    }

    // 打开下拉菜单
    openDropdown(dropdown) {
        dropdown.classList.add('active');
        this.activeDropdown = dropdown;
    }

    // 关闭下拉菜单
    closeDropdown(dropdown) {
        dropdown.classList.remove('active');
        if (this.activeDropdown === dropdown) {
            this.activeDropdown = null;
        }
    }

    // 关闭所有下拉菜单
    closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu.active').forEach(dropdown => {
            this.closeDropdown(dropdown);
        });
    }

    // 初始化标签页菜单
    initTabMenu() {
        document.querySelectorAll('.tab-item').forEach(tabItem => {
            tabItem.addEventListener('click', () => {
                const tabId = tabItem.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    }

    // 切换标签页
    switchTab(tabId) {
        // 更新标签按钮状态
        document.querySelectorAll('.tab-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // 更新面板显示
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabId}Panel`).classList.add('active');
    }

    // 初始化右键菜单
    initContextMenu() {
        const contextMenu = document.getElementById('contextMenu');
        
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e.clientX, e.clientY);
        });

        document.addEventListener('click', () => {
            this.hideContextMenu();
        });

        // 绑定右键菜单项事件
        contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = item.getAttribute('data-action');
                this.handleContextAction(action);
                this.hideContextMenu();
            });
        });
    }

    // 显示右键菜单
    showContextMenu(x, y) {
        const contextMenu = document.getElementById('contextMenu');
        const rect = contextMenu.getBoundingClientRect();
        
        // 确保菜单不会超出屏幕边界
        const adjustedX = Math.min(x, window.innerWidth - rect.width);
        const adjustedY = Math.min(y, window.innerHeight - rect.height);
        
        contextMenu.style.left = `${adjustedX}px`;
        contextMenu.style.top = `${adjustedY}px`;
        contextMenu.classList.add('active');
    }

    // 隐藏右键菜单
    hideContextMenu() {
        document.getElementById('contextMenu').classList.remove('active');
    }

    // 处理右键菜单操作
    handleContextAction(action) {
        switch (action) {
            case 'copy':
                document.execCommand('copy');
                this.showNotification('已复制到剪贴板', 'success');
                break;
            case 'paste':
                this.handlePasteImage();
                break;
            case 'refresh':
                window.location.reload();
                break;
            case 'fullscreen':
                this.toggleFullscreen();
                break;
            case 'console':
                console.log('打开开发者控制台');
                break;
            case 'inspector':
                console.log('打开元素检查器');
                break;
        }
    }

    // 处理粘贴图片
    handlePasteImage() {
        navigator.clipboard.read().then(clipboardItems => {
            for (const clipboardItem of clipboardItems) {
                for (const type of clipboardItem.types) {
                    if (type.startsWith('image/')) {
                        clipboardItem.getType(type).then(blob => {
                            this.processImageFile(blob);
                        });
                        return;
                    }
                }
            }
            this.showNotification('剪贴板中没有图片', 'warning');
        }).catch(() => {
            this.showNotification('无法访问剪贴板', 'error');
        });
    }

    // 处理图片文件
    processImageFile(file) {
        // 这里可以触发上传逻辑
        this.showNotification('检测到图片，准备上传...', 'info');
        // 可以触发现有的文件上传逻辑
        if (window.app && typeof window.app.handleFiles === 'function') {
            window.app.handleFiles([file]);
        }
    }

    // 切换全屏模式
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                this.showNotification('已进入全屏模式，按 ESC 退出', 'info');
            });
        } else {
            document.exitFullscreen().then(() => {
                this.showNotification('已退出全屏模式', 'info');
            });
        }
    }

    // 初始化搜索菜单
    initSearchMenu() {
        const searchInput = document.getElementById('globalSearch');
        const searchSuggestions = document.getElementById('searchSuggestions');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });

            searchInput.addEventListener('focus', () => {
                if (searchInput.value === '') {
                    searchSuggestions.classList.add('active');
                }
            });

            searchInput.addEventListener('blur', () => {
                setTimeout(() => {
                    searchSuggestions.classList.remove('active');
                }, 200);
            });
        }

        // 绑定搜索建议点击事件
        searchSuggestions.querySelectorAll('.search-suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                const action = suggestion.getAttribute('data-action');
                this.handleSearchAction(action);
            });
        });
    }

    // 处理搜索
    handleSearch(query) {
        const searchSuggestions = document.getElementById('searchSuggestions');
        
        if (query.length > 0) {
            // 这里可以实现搜索逻辑
            searchSuggestions.classList.add('active');
        } else {
            searchSuggestions.classList.remove('active');
        }
    }

    // 处理搜索操作
    handleSearchAction(action) {
        switch (action) {
            case 'upload':
                this.switchTab('upload');
                break;
            case 'gallery':
                window.location.href = '/gallery.html';
                break;
            case 'manage':
                window.location.href = '/manage.html';
                break;
            case 'analytics':
                window.location.href = '/analytics.html';
                break;
        }
    }

    // 初始化浮动操作菜单
    initFabMenu() {
        const fabMain = document.getElementById('fabMain');
        const fabSubmenu = document.getElementById('fabSubmenu');
        
        if (fabMain) {
            fabMain.addEventListener('click', () => {
                fabMain.classList.toggle('active');
                fabSubmenu.classList.toggle('active');
            });
        }

        // 点击外部关闭FAB菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.fab-menu')) {
                fabMain.classList.remove('active');
                fabSubmenu.classList.remove('active');
            }
        });
    }

    // 初始化键盘快捷键
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + 组合键
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'u':
                        e.preventDefault();
                        document.getElementById('fileInput').click();
                        break;
                    case 'g':
                        e.preventDefault();
                        window.location.href = '/gallery.html';
                        break;
                    case 'm':
                        e.preventDefault();
                        window.location.href = '/manage.html';
                        break;
                    case 'd':
                        e.preventDefault();
                        this.toggleTheme(document.querySelector('.theme-switch'));
                        break;
                }
            }

            // F键
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }

            // ESC键
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
                this.hideContextMenu();
                
                const fabMain = document.getElementById('fabMain');
                const fabSubmenu = document.getElementById('fabSubmenu');
                fabMain.classList.remove('active');
                fabSubmenu.classList.remove('active');
            }
        });
    }

    // 绑定其他事件
    bindEvents() {
        // 绑定菜单项特定功能
        this.bindMenuActions();
        
        // 滚动时调整FAB菜单位置
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // 监听主题变化
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
        this.updateThemeSwitches();
    }

    // 绑定菜单操作
    bindMenuActions() {
        // 全屏切换
        const fullscreenToggle = document.getElementById('fullscreenToggle');
        if (fullscreenToggle) {
            fullscreenToggle.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }

        // 暗色模式切换
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                this.toggleTheme(document.querySelector('.theme-switch'));
            });
        }

        // 放大缩小
        const zoomIn = document.getElementById('zoomIn');
        const zoomOut = document.getElementById('zoomOut');
        
        if (zoomIn) {
            zoomIn.addEventListener('click', () => {
                this.adjustZoom(1.1);
            });
        }
        
        if (zoomOut) {
            zoomOut.addEventListener('click', () => {
                this.adjustZoom(0.9);
            });
        }

        // 快捷键帮助
        const keyboardShortcuts = document.getElementById('keyboardShortcuts');
        if (keyboardShortcuts) {
            keyboardShortcuts.addEventListener('click', () => {
                this.showKeyboardShortcuts();
            });
        }

        // 关于对话框
        const aboutDialog = document.getElementById('aboutDialog');
        if (aboutDialog) {
            aboutDialog.addEventListener('click', () => {
                this.showAboutDialog();
            });
        }
    }

    // 调整缩放
    adjustZoom(factor) {
        const currentZoom = parseFloat(document.body.style.zoom || 1);
        const newZoom = Math.max(0.5, Math.min(2, currentZoom * factor));
        document.body.style.zoom = newZoom;
        
        this.showNotification(`缩放: ${Math.round(newZoom * 100)}%`, 'info');
    }

    // 处理滚动
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const fabMenu = document.querySelector('.fab-menu');
        
        if (scrollTop > 100) {
            fabMenu.style.opacity = '0.8';
        } else {
            fabMenu.style.opacity = '1';
        }
    }

    // 显示快捷键帮助
    showKeyboardShortcuts() {
        const shortcuts = [
            'Ctrl + U: 上传图片',
            'Ctrl + G: 图片画廊',
            'Ctrl + M: 图片管理',
            'Ctrl + D: 切换主题',
            'F11: 全屏模式',
            'ESC: 关闭菜单/对话框'
        ];
        
        alert('键盘快捷键:\n\n' + shortcuts.join('\n'));
    }

    // 显示关于对话框
    showAboutDialog() {
        const aboutInfo = `
TG-Image 免费图床服务

版本: 1.0.0
基于: Telegram
开发者: TG-Image Team

© 2024-2025 TG-Image
        `;
        
        alert(aboutInfo);
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 复用 NavigationController 的通知系统
        if (window.navigationController) {
            window.navigationController.showNotification(message, type);
        } else {
            // 备用通知系统
            const notification = document.createElement('div');
            notification.className = `menu-notification menu-notification-${type}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                z-index: 10001;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                max-width: 300px;
                word-wrap: break-word;
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
    }

    // 添加菜单项徽章
    addMenuBadge(menuSelector, count, color = '#ef4444') {
        const menuItem = document.querySelector(menuSelector);
        if (menuItem) {
            const existingBadge = menuItem.querySelector('.menu-badge');
            if (existingBadge) {
                existingBadge.remove();
            }

            const badge = document.createElement('span');
            badge.className = 'menu-badge';
            badge.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                background: ${color};
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
            
            menuItem.style.position = 'relative';
            menuItem.appendChild(badge);
        }
    }

    // 移除菜单项徽章
    removeMenuBadge(menuSelector) {
        const menuItem = document.querySelector(menuSelector);
        if (menuItem) {
            const badge = menuItem.querySelector('.menu-badge');
            if (badge) {
                badge.remove();
            }
        }
    }

    // 更新用户菜单状态
    updateUserMenu(isLoggedIn, userInfo = null) {
        const userMenuName = document.getElementById('userMenuName');
        const userProfile = document.getElementById('userProfile');
        const userSettings = document.getElementById('userSettings');
        const userLogout = document.getElementById('userLogout');
        const loginLink = document.querySelector('#userDropdownMenu a[href="/login.html"]');
        const registerLink = document.querySelector('#userDropdownMenu a[href="/register.html"]');

        if (isLoggedIn && userInfo) {
            userMenuName.textContent = userInfo.name || '用户';
            userProfile.style.display = 'flex';
            userSettings.style.display = 'flex';
            userLogout.style.display = 'flex';
            loginLink.style.display = 'none';
            registerLink.style.display = 'none';
        } else {
            userMenuName.textContent = '访客';
            userProfile.style.display = 'none';
            userSettings.style.display = 'none';
            userLogout.style.display = 'none';
            loginLink.style.display = 'flex';
            registerLink.style.display = 'flex';
        }
    }
}

// 初始化菜单控制器
document.addEventListener('DOMContentLoaded', () => {
    window.menuController = new MenuController();
    
    // 示例：添加一些徽章
    setTimeout(() => {
        window.menuController.addMenuBadge('#helpMenu', 2, '#3b82f6');
    }, 2000);
});

// 导出菜单控制器供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuController;
} 