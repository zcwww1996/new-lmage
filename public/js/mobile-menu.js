// 移动菜单页面JavaScript功能

document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeSearch();
    initializeFloatingActions();
    initializeAnimations();
});

// 主题切换功能
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const switchInput = document.getElementById('switch');
    
    // 从localStorage加载主题设置
    const savedTheme = localStorage.getItem('theme');
    const isDarkMode = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        if (switchInput) switchInput.checked = true;
    }
    
    // 主题切换事件
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            if (switchInput) {
                switchInput.checked = isDark;
            }
            
            // 触发主题切换动画
            triggerThemeTransition();
        });
    }
}

// 主题切换动画
function triggerThemeTransition() {
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

// 搜索功能
function initializeSearch() {
    const searchInput = document.getElementById('menuSearch');
    const menuItems = document.querySelectorAll('.menu-item-card');
    const categoryTitles = document.querySelectorAll('.category-title');
    
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = this.value.toLowerCase().trim();
            
            if (searchTerm === '') {
                // 显示所有项目
                showAllItems();
                return;
            }
            
            let hasVisibleItems = false;
            
            menuItems.forEach(item => {
                const title = item.querySelector('.menu-item-title')?.textContent.toLowerCase() || '';
                const desc = item.querySelector('.menu-item-desc')?.textContent.toLowerCase() || '';
                const isMatch = title.includes(searchTerm) || desc.includes(searchTerm);
                
                if (isMatch) {
                    item.style.display = 'flex';
                    item.classList.add('search-highlight');
                    hasVisibleItems = true;
                    
                    // 高亮显示匹配的文本
                    highlightText(item, searchTerm);
                } else {
                    item.style.display = 'none';
                    item.classList.remove('search-highlight');
                }
            });
            
            // 显示/隐藏分类标题
            updateCategoryVisibility();
            
            // 如果没有匹配项，显示无结果提示
            showNoResultsMessage(!hasVisibleItems, searchTerm);
            
        }, 200);
    });
    
    // 点击搜索框时的动画效果
    searchInput.addEventListener('focus', function() {
        this.parentElement.classList.add('search-focused');
    });
    
    searchInput.addEventListener('blur', function() {
        this.parentElement.classList.remove('search-focused');
    });
}

// 显示所有项目
function showAllItems() {
    const menuItems = document.querySelectorAll('.menu-item-card');
    const categoryTitles = document.querySelectorAll('.category-title');
    const noResultsMessage = document.querySelector('.no-results-message');
    
    menuItems.forEach(item => {
        item.style.display = 'flex';
        item.classList.remove('search-highlight');
        removeHighlight(item);
    });
    
    categoryTitles.forEach(title => {
        title.parentElement.style.display = 'flex';
    });
    
    if (noResultsMessage) {
        noResultsMessage.remove();
    }
}

// 高亮匹配文本
function highlightText(item, searchTerm) {
    const title = item.querySelector('.menu-item-title');
    const desc = item.querySelector('.menu-item-desc');
    
    if (title) {
        title.innerHTML = highlightMatch(title.textContent, searchTerm);
    }
    
    if (desc) {
        desc.innerHTML = highlightMatch(desc.textContent, searchTerm);
    }
}

// 移除高亮
function removeHighlight(item) {
    const title = item.querySelector('.menu-item-title');
    const desc = item.querySelector('.menu-item-desc');
    
    if (title) {
        title.innerHTML = title.textContent;
    }
    
    if (desc) {
        desc.innerHTML = desc.textContent;
    }
}

// 高亮匹配的文本
function highlightMatch(text, searchTerm) {
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<mark class="search-match">$1</mark>');
}

// 转义正则表达式特殊字符
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 更新分类可见性
function updateCategoryVisibility() {
    const categories = document.querySelectorAll('.category-section');
    
    categories.forEach(category => {
        const visibleItems = category.querySelectorAll('.menu-item-card[style*="flex"]');
        if (visibleItems.length === 0) {
            category.style.display = 'none';
        } else {
            category.style.display = 'block';
        }
    });
}

// 显示无结果消息
function showNoResultsMessage(show, searchTerm) {
    let noResultsMessage = document.querySelector('.no-results-message');
    
    if (show && !noResultsMessage) {
        noResultsMessage = document.createElement('div');
        noResultsMessage.className = 'no-results-message';
        noResultsMessage.innerHTML = `
            <div class="no-results-content">
                <div class="no-results-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                </div>
                <h3>未找到相关功能</h3>
                <p>没有找到与 "${searchTerm}" 相关的功能，请尝试其他关键词</p>
                <button class="clear-search-btn" onclick="clearSearch()">清除搜索</button>
            </div>
        `;
        
        // 添加样式
        noResultsMessage.style.cssText = `
            text-align: center;
            padding: 3rem 1.5rem;
            color: var(--text-light);
        `;
        
        document.querySelector('.menu-categories').appendChild(noResultsMessage);
    } else if (!show && noResultsMessage) {
        noResultsMessage.remove();
    }
}

// 清除搜索
function clearSearch() {
    const searchInput = document.getElementById('menuSearch');
    if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();
    }
}

// 浮动操作按钮功能
function initializeFloatingActions() {
    const fabs = document.querySelectorAll('.fab');
    
    fabs.forEach(fab => {
        fab.addEventListener('click', function(e) {
            // 添加点击动画
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // 处理返回顶部
            if (this.getAttribute('href') === '#top') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 滚动时显示/隐藏返回顶部按钮
    const backToTopFab = document.querySelector('.fab[href="#top"]');
    if (backToTopFab) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopFab.style.opacity = '1';
                backToTopFab.style.pointerEvents = 'auto';
            } else {
                backToTopFab.style.opacity = '0.5';
                backToTopFab.style.pointerEvents = 'none';
            }
        });
        
        // 初始状态
        backToTopFab.style.opacity = '0.5';
        backToTopFab.style.pointerEvents = 'none';
        backToTopFab.style.transition = 'opacity 0.3s ease';
    }
}

// 初始化动画
function initializeAnimations() {
    // 为菜单项添加滚动动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // 观察所有菜单项
    document.querySelectorAll('.menu-item-card').forEach(item => {
        observer.observe(item);
    });
    
    // 为分类标题添加动画
    document.querySelectorAll('.category-header').forEach(header => {
        observer.observe(header);
    });
}

// 添加CSS动画样式
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    .search-match {
        background: rgba(79, 70, 229, 0.2);
        border-radius: 2px;
        padding: 0 2px;
        font-weight: 600;
    }
    
    body.dark-mode .search-match {
        background: rgba(124, 58, 237, 0.3);
    }
    
    .search-highlight {
        border-color: var(--primary-color) !important;
        box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1) !important;
    }
    
    .menu-search.search-focused {
        transform: scale(1.02);
    }
    
    .menu-item-card,
    .category-header {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease;
    }
    
    .menu-item-card.animate-in,
    .category-header.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .no-results-content {
        max-width: 300px;
        margin: 0 auto;
    }
    
    .no-results-icon {
        width: 80px;
        height: 80px;
        background: rgba(79, 70, 229, 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        color: var(--primary-color);
    }
    
    .no-results-content h3 {
        margin: 0 0 0.5rem 0;
        color: var(--text-color);
    }
    
    .no-results-content p {
        margin: 0 0 1.5rem 0;
        font-size: 0.875rem;
        line-height: 1.5;
    }
    
    .clear-search-btn {
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .clear-search-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }
    
    body.dark-mode .no-results-content h3 {
        color: var(--dark-text);
    }
    
    body.dark-mode .no-results-icon {
        background: rgba(79, 70, 229, 0.2);
    }
`;

document.head.appendChild(animationStyles);

// 触摸手势支持
if ('ontouchstart' in window) {
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleGesture();
    });
    
    function handleGesture() {
        const threshold = 50;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // 向上滑动 - 可以添加相关功能
            } else {
                // 向下滑动 - 可以添加相关功能
            }
        }
    }
}

// 键盘快捷键支持
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K 打开搜索
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('menuSearch');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    // ESC 清除搜索
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('menuSearch');
        if (searchInput && searchInput.value) {
            clearSearch();
        }
    }
});

// 性能优化：防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 