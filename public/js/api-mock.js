/**
 * API模拟系统
 * 为测试模式提供完整的API模拟
 */

// 模拟数据存储
const mockStorage = {
    tags: 'mockTags',
    images: 'mockImages',
    user: 'mockUser'
};

/**
 * 初始化模拟API
 */
function initMockAPI() {
    // 检查是否为测试模式
    const isTestMode = window.location.search.includes('test=true') || !window.location.protocol.startsWith('http');
    
    if (!isTestMode) return;
    
    // 初始化模拟数据
    initMockData();
    
    // 拦截fetch请求
    interceptFetch();
}

/**
 * 初始化模拟数据
 */
function initMockData() {
    // 初始化标签数据
    if (!localStorage.getItem(mockStorage.tags)) {
        const defaultTags = generateDefaultTags();
        localStorage.setItem(mockStorage.tags, JSON.stringify(defaultTags));
    }
    
    // 初始化图片数据
    if (!localStorage.getItem(mockStorage.images)) {
        const defaultImages = generateDefaultImages();
        localStorage.setItem(mockStorage.images, JSON.stringify(defaultImages));
    }
    
    // 初始化用户数据
    if (!localStorage.getItem(mockStorage.user)) {
        const defaultUser = {
            id: 'test_user_1',
            username: 'testuser',
            email: 'test@example.com',
            createdAt: new Date().toISOString()
        };
        localStorage.setItem(mockStorage.user, JSON.stringify(defaultUser));
    }
}

/**
 * 生成默认标签
 */
function generateDefaultTags() {
    const tagNames = [
        '风景', '美食', '动物', '建筑', '人物', '艺术', '自然', '生活',
        '旅行', '摄影', '城市', '可爱', '创意', '复古', '现代', '简约'
    ];
    
    const colors = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
        '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
        '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
    ];
    
    const descriptions = [
        '用于分类风景类型的图片',
        '包含各种美食图片',
        '动物和宠物相关的图片',
        '建筑物和城市景观',
        '人物肖像和生活照',
        '艺术作品和创意图片',
        '自然风光和景色',
        '日常生活场景',
        '旅行和探索主题',
        '摄影作品集合',
        '城市风貌和街景',
        '可爱和萌系图片',
        '创意设计和灵感',
        '复古风格图片',
        '现代简约风格',
        '简约设计风格'
    ];
    
    return tagNames.map((name, index) => ({
        id: `tag_${index + 1}`,
        name,
        description: descriptions[index] || '',
        color: colors[index % colors.length],
        imageCount: Math.floor(Math.random() * 20) + 1,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
    }));
}

/**
 * 生成默认图片
 */
function generateDefaultImages() {
    const images = [];
    const tags = JSON.parse(localStorage.getItem(mockStorage.tags) || '[]');
    
    for (let i = 1; i <= 20; i++) {
        const randomTags = tags
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 3) + 1)
            .map(tag => tag.name);
            
        images.push({
            id: `img_${i}`,
            fileName: `测试图片_${i}.jpg`,
            url: `https://picsum.photos/400/300?random=${i}`,
            thumbnailUrl: `https://picsum.photos/200/150?random=${i}`,
            fileSize: Math.floor(Math.random() * 2000000) + 100000, // 100KB - 2MB
            uploadTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            tags: randomTags,
            isFavorite: Math.random() > 0.7
        });
    }
    
    return images;
}

/**
 * 拦截fetch请求
 */
function interceptFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async function(url, options = {}) {
        // 检查是否为API请求
        if (typeof url === 'string' && url.startsWith('/api/')) {
            return handleMockAPI(url, options);
        }
        
        // 非API请求，使用原始fetch
        return originalFetch.apply(this, arguments);
    };
}

/**
 * 处理模拟API请求
 */
async function handleMockAPI(url, options) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    // 路由处理
    if (url.startsWith('/api/tags')) {
        return handleTagsAPI(url, method, body);
    } else if (url.startsWith('/api/images')) {
        return handleImagesAPI(url, method, body);
    }
    
    // 默认404响应
    return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * 处理标签API
 */
function handleTagsAPI(url, method, body) {
    const tags = JSON.parse(localStorage.getItem(mockStorage.tags) || '[]');
    
    switch (method) {
        case 'GET':
            return new Response(JSON.stringify({ tags }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
            
        case 'POST':
            const newTag = {
                id: `tag_${Date.now()}`,
                ...body,
                imageCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            tags.unshift(newTag);
            localStorage.setItem(mockStorage.tags, JSON.stringify(tags));
            
            return new Response(JSON.stringify({ tag: newTag }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            });
            
        case 'PUT':
            const tagId = url.split('/').pop();
            const tagIndex = tags.findIndex(tag => tag.id === tagId);
            
            if (tagIndex === -1) {
                return new Response(JSON.stringify({ error: 'Tag not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            tags[tagIndex] = {
                ...tags[tagIndex],
                ...body,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(mockStorage.tags, JSON.stringify(tags));
            
            return new Response(JSON.stringify({ tag: tags[tagIndex] }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
            
        case 'DELETE':
            const deleteTagId = url.split('/').pop();
            const filteredTags = tags.filter(tag => tag.id !== deleteTagId);
            localStorage.setItem(mockStorage.tags, JSON.stringify(filteredTags));
            
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
            
        default:
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json' }
            });
    }
}

/**
 * 处理图片API
 */
function handleImagesAPI(url, method, body) {
    const images = JSON.parse(localStorage.getItem(mockStorage.images) || '[]');
    
    switch (method) {
        case 'GET':
            return new Response(JSON.stringify({ images }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
            
        case 'PUT':
            const imageId = url.split('/').pop();
            const imageIndex = images.findIndex(img => img.id === imageId);
            
            if (imageIndex === -1) {
                return new Response(JSON.stringify({ error: 'Image not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            images[imageIndex] = {
                ...images[imageIndex],
                ...body,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(mockStorage.images, JSON.stringify(images));
            
            return new Response(JSON.stringify({ image: images[imageIndex] }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
            
        default:
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json' }
            });
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initMockAPI);
