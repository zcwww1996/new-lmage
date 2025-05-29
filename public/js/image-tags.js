/**
 * 图片标签管理模块
 * 用于在图片编辑中管理标签
 */

// 当前图片的标签
let currentTags = [];
// 所有可用标签
let availableTags = [];

/**
 * 初始化图片标签管理
 */
function initImageTagsManagement() {
    loadAvailableTags();
    initTagInput();
    initQuickTagsSelector();
    initRefreshButton();
}

/**
 * 加载可用标签
 */
async function loadAvailableTags() {
    try {
        const isTestMode = window.location.search.includes('test=true') || !window.location.protocol.startsWith('http');
        
        if (isTestMode) {
            // 测试模式：从本地存储加载
            const storedTags = localStorage.getItem('testTags');
            availableTags = storedTags ? JSON.parse(storedTags) : [];
        } else {
            // 生产模式：从API加载
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/tags', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                availableTags = data.tags || [];
            }
        }
        
        updateQuickTagsList();
    } catch (error) {
        console.error('加载标签失败:', error);
        availableTags = [];
    }
}

/**
 * 初始化标签输入
 */
function initTagInput() {
    const tagInput = document.getElementById('tagInput');
    const tagsSuggestions = document.getElementById('tagsSuggestions');
    
    if (!tagInput) return;

    // 输入事件
    tagInput.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        if (value) {
            showTagSuggestions(value);
        } else {
            hideTagSuggestions();
        }
    });

    // 回车添加标签
    tagInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = e.target.value.trim();
            if (value) {
                addTag(value);
                e.target.value = '';
                hideTagSuggestions();
            }
        }
    });

    // 失去焦点隐藏建议
    tagInput.addEventListener('blur', () => {
        setTimeout(() => hideTagSuggestions(), 200);
    });
}

/**
 * 初始化快速标签选择器
 */
function initQuickTagsSelector() {
    const quickTagsList = document.getElementById('quickTagsList');
    if (!quickTagsList) return;

    quickTagsList.addEventListener('click', (e) => {
        const tagOption = e.target.closest('.quick-tag-option');
        if (tagOption) {
            const tagName = tagOption.dataset.tagName;
            if (tagOption.classList.contains('selected')) {
                removeTag(tagName);
            } else {
                addTag(tagName);
            }
        }
    });
}

/**
 * 初始化刷新按钮
 */
function initRefreshButton() {
    const refreshBtn = document.getElementById('refreshTagsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadAvailableTags();
        });
    }
}

/**
 * 显示标签建议
 */
function showTagSuggestions(query) {
    const tagsSuggestions = document.getElementById('tagsSuggestions');
    if (!tagsSuggestions) return;

    const filteredTags = availableTags.filter(tag => 
        tag.name.toLowerCase().includes(query.toLowerCase()) &&
        !currentTags.includes(tag.name)
    );

    if (filteredTags.length > 0) {
        tagsSuggestions.innerHTML = filteredTags.map(tag => `
            <div class="tag-suggestion" data-tag-name="${tag.name}">
                <span class="quick-tag-color" style="background-color: ${tag.color}"></span>
                ${tag.name}
            </div>
        `).join('');
        
        tagsSuggestions.style.display = 'block';
        
        // 绑定点击事件
        tagsSuggestions.querySelectorAll('.tag-suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                const tagName = suggestion.dataset.tagName;
                addTag(tagName);
                document.getElementById('tagInput').value = '';
                hideTagSuggestions();
            });
        });
    } else {
        hideTagSuggestions();
    }
}

/**
 * 隐藏标签建议
 */
function hideTagSuggestions() {
    const tagsSuggestions = document.getElementById('tagsSuggestions');
    if (tagsSuggestions) {
        tagsSuggestions.style.display = 'none';
    }
}

/**
 * 添加标签
 */
function addTag(tagName) {
    if (!tagName || currentTags.includes(tagName)) return;
    
    currentTags.push(tagName);
    updateTagsDisplay();
    updateQuickTagsList();
}

/**
 * 移除标签
 */
function removeTag(tagName) {
    currentTags = currentTags.filter(tag => tag !== tagName);
    updateTagsDisplay();
    updateQuickTagsList();
}

/**
 * 更新标签显示
 */
function updateTagsDisplay() {
    const tagsInput = document.getElementById('tagsInput');
    const tagInput = document.getElementById('tagInput');
    
    if (!tagsInput || !tagInput) return;

    // 清除现有标签元素
    const existingTags = tagsInput.querySelectorAll('.tag');
    existingTags.forEach(tag => tag.remove());

    // 添加新标签元素
    currentTags.forEach(tagName => {
        const tagElement = createTagElement(tagName);
        tagsInput.insertBefore(tagElement, tagInput);
    });
}

/**
 * 创建标签元素
 */
function createTagElement(tagName) {
    const tag = availableTags.find(t => t.name === tagName);
    const tagElement = document.createElement('div');
    tagElement.className = 'tag';
    tagElement.style.backgroundColor = tag ? tag.color : '#6b7280';
    
    tagElement.innerHTML = `
        <span>${tagName}</span>
        <button type="button" class="tag-remove" onclick="removeTag('${tagName}')">
            <i class="ri-close-line"></i>
        </button>
    `;
    
    return tagElement;
}

/**
 * 更新快速标签列表
 */
function updateQuickTagsList() {
    const quickTagsList = document.getElementById('quickTagsList');
    if (!quickTagsList) return;

    if (availableTags.length === 0) {
        quickTagsList.innerHTML = '<div style="color: var(--text-light); font-size: 0.9rem;">暂无可用标签</div>';
        return;
    }

    quickTagsList.innerHTML = availableTags.map(tag => `
        <div class="quick-tag-option ${currentTags.includes(tag.name) ? 'selected' : ''}" 
             data-tag-name="${tag.name}">
            <span class="quick-tag-color" style="background-color: ${tag.color}"></span>
            <span class="quick-tag-name">${tag.name}</span>
            <span class="quick-tag-count">${tag.imageCount || 0}</span>
        </div>
    `).join('');
}

/**
 * 设置当前图片标签
 */
function setCurrentImageTags(tags) {
    currentTags = Array.isArray(tags) ? [...tags] : [];
    updateTagsDisplay();
    updateQuickTagsList();
}

/**
 * 获取当前图片标签
 */
function getCurrentImageTags() {
    return [...currentTags];
}

/**
 * 清空当前标签
 */
function clearCurrentTags() {
    currentTags = [];
    updateTagsDisplay();
    updateQuickTagsList();
}

// 导出函数供其他模块使用
window.imageTagsManager = {
    init: initImageTagsManagement,
    setTags: setCurrentImageTags,
    getTags: getCurrentImageTags,
    clear: clearCurrentTags,
    refresh: loadAvailableTags
};
