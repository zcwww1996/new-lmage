/**
 * TG-Image Dashboard Enhanced
 * 超级仪表盘增强功能模块
 * 
 * 功能包括：
 * - 拖拽上传
 * - 高级搜索和过滤
 * - 图片编辑器
 * - 社交分享
 * - 键盘快捷键
 * - 实时数据更新
 * - 图片懒加载
 * - 无限滚动
 * - 全屏查看器
 * - 导出功能
 */

class DashboardEnhanced {
    constructor() {
        this.images = [];
        this.filteredImages = [];
        this.selectedImages = new Set();
        this.currentView = 'grid';
        this.currentPage = 1;
        this.itemsPerPage = 24;
        this.isLoading = false;
        this.searchTimeout = null;
        this.sortable = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.initDragAndDrop();
        this.initKeyboardShortcuts();
        this.initTooltips();
        this.initLazyLoading();
        this.loadImages();
        this.startRealtimeUpdates();
    }

    // 绑定事件
    bindEvents() {
        // 搜索功能
        const searchInput = document.getElementById('smartSearch');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
            searchInput.addEventListener('keydown', this.handleSearchKeydown.bind(this));
        }

        // 过滤器
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', this.handleFilterClick.bind(this));
        });

        // 排序
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', this.handleSortChange.bind(this));
        }

        // 视图模式
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.addEventListener('click', this.handleViewChange.bind(this));
        });

        // 快速操作
        document.getElementById('uploadBtn')?.addEventListener('click', this.showUploadModal.bind(this));
        document.getElementById('bulkUploadBtn')?.addEventListener('click', this.showBulkUploadModal.bind(this));
        document.getElementById('createAlbumBtn')?.addEventListener('click', this.showCreateAlbumModal.bind(this));
        document.getElementById('exportBtn')?.addEventListener('click', this.showExportModal.bind(this));

        // 批量操作
        document.getElementById('selectAllBtn')?.addEventListener('click', this.toggleSelectAll.bind(this));
        document.getElementById('batchDownloadBtn')?.addEventListener('click', this.batchDownload.bind(this));
        document.getElementById('batchMoveBtn')?.addEventListener('click', this.showBatchMoveModal.bind(this));
        document.getElementById('batchTagBtn')?.addEventListener('click', this.showBatchTagModal.bind(this));
        document.getElementById('batchDeleteBtn')?.addEventListener('click', this.batchDelete.bind(this));
        document.getElementById('closeBatchBtn')?.addEventListener('click', this.clearSelection.bind(this));

        // 分页
        document.getElementById('prevBtn')?.addEventListener('click', () => this.changePage(this.currentPage - 1));
        document.getElementById('nextBtn')?.addEventListener('click', () => this.changePage(this.currentPage + 1));

        // 窗口事件
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    // 初始化拖拽上传
    initDragAndDrop() {
        const dropZone = document.body;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults.bind(this), false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.highlight.bind(this), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.unhighlight.bind(this), false);
        });

        dropZone.addEventListener('drop', this.handleDrop.bind(this), false);
    }

    // 初始化键盘快捷键
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + A: 全选
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.toggleSelectAll();
            }

            // Delete: 删除选中的图片
            if (e.key === 'Delete' && this.selectedImages.size > 0) {
                e.preventDefault();
                this.batchDelete();
            }

            // Ctrl/Cmd + F: 聚焦搜索框
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                document.getElementById('smartSearch')?.focus();
            }

            // Escape: 清除选择/关闭模态框
            if (e.key === 'Escape') {
                this.clearSelection();
                this.closeAllModals();
            }

            // 数字键切换视图
            if (e.key >= '1' && e.key <= '4' && !e.target.matches('input, textarea')) {
                const views = ['grid', 'list', 'masonry', 'timeline'];
                this.switchView(views[parseInt(e.key) - 1]);
            }
        });
    }

    // 初始化工具提示
    initTooltips() {
        // 为所有带有title属性的元素添加现代化工具提示
        document.querySelectorAll('[title]').forEach(element => {
            this.addTooltip(element);
        });
    }

    // 初始化懒加载
    initLazyLoading() {
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        this.imageObserver.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });
    }

    // 加载图片数据
    async loadImages() {
        this.showLoading();
        
        try {
            // 模拟API调用
            await this.simulateAPICall();
            
            // 生成模拟数据
            this.images = this.generateMockImages(100);
            this.filteredImages = [...this.images];
            
            this.renderImages();
            this.updateStats();
            this.hideLoading();
        } catch (error) {
            console.error('加载图片失败:', error);
            this.showNotification('加载图片失败，请稍后重试', 'error');
            this.hideLoading();
        }
    }

    // 生成模拟图片数据
    generateMockImages(count) {
        const images = [];
        const categories = ['风景', '人物', '动物', '建筑', '美食', '旅行', '艺术', '科技', '自然', '城市'];
        const formats = ['jpg', 'png', 'gif', 'webp'];
        
        for (let i = 1; i <= count; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const format = formats[Math.floor(Math.random() * formats.length)];
            const size = Math.random() * 10 + 0.5; // 0.5-10.5MB
            const uploadTime = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
            
            images.push({
                id: i,
                name: `image_${i}.${format}`,
                url: `https://picsum.photos/seed/${i}/800/600`,
                thumbnail: `https://picsum.photos/seed/${i}/400/300`,
                size: size.toFixed(1),
                format: format.toUpperCase(),
                uploadDate: uploadTime,
                views: Math.floor(Math.random() * 2000),
                downloads: Math.floor(Math.random() * 500),
                likes: Math.floor(Math.random() * 100),
                tags: this.generateRandomTags(category),
                favorite: Math.random() > 0.8,
                category: category,
                dimensions: {
                    width: 800 + Math.floor(Math.random() * 1200),
                    height: 600 + Math.floor(Math.random() * 900)
                },
                exif: {
                    camera: this.getRandomCamera(),
                    lens: this.getRandomLens(),
                    settings: this.getRandomSettings()
                }
            });
        }
        
        return images;
    }

    // 生成随机标签
    generateRandomTags(category) {
        const allTags = {
            '风景': ['山脉', '海景', '日落', '森林', '雪景', '湖泊'],
            '人物': ['肖像', '街拍', '婚纱', '儿童', '老人', '模特'],
            '动物': ['野生动物', '宠物', '鸟类', '海洋生物', '昆虫', '哺乳动物'],
            '建筑': ['现代建筑', '古建筑', '桥梁', '教堂', '摩天大楼', '民居'],
            '美食': ['中餐', '西餐', '甜品', '饮品', '水果', '烘焙'],
            '旅行': ['度假', '探险', '城市游', '自然游', '文化游', '美食游'],
            '艺术': ['绘画', '雕塑', '装置艺术', '街头艺术', '数字艺术', '摄影艺术'],
            '科技': ['电子产品', '机器人', '太空', '实验室', '创新', '未来科技'],
            '自然': ['花朵', '树木', '天空', '云彩', '岩石', '水流'],
            '城市': ['街道', '夜景', '交通', '商业区', '住宅区', '工业区']
        };
        
        const categoryTags = allTags[category] || [];
        const numTags = Math.floor(Math.random() * 3) + 1;
        const shuffled = [...categoryTags].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numTags);
    }

    // 获取随机相机
    getRandomCamera() {
        const cameras = ['Canon EOS R5', 'Nikon D850', 'Sony A7R IV', 'Fujifilm X-T4', 'Olympus OM-D E-M1'];
        return cameras[Math.floor(Math.random() * cameras.length)];
    }

    // 获取随机镜头
    getRandomLens() {
        const lenses = ['24-70mm f/2.8', '85mm f/1.4', '16-35mm f/2.8', '70-200mm f/2.8', '50mm f/1.8'];
        return lenses[Math.floor(Math.random() * lenses.length)];
    }

    // 获取随机设置
    getRandomSettings() {
        return {
            aperture: `f/${(Math.random() * 8 + 1).toFixed(1)}`,
            shutter: `1/${Math.floor(Math.random() * 1000 + 60)}`,
            iso: Math.floor(Math.random() * 3200 + 100),
            focalLength: `${Math.floor(Math.random() * 200 + 24)}mm`
        };
    }

    // 渲染图片
    renderImages() {
        const container = document.getElementById('imageGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;

        if (this.filteredImages.length === 0) {
            container.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';

        // 分页
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageImages = this.filteredImages.slice(startIndex, endIndex);

        container.innerHTML = pageImages.map(image => this.createImageCard(image)).join('');

        // 重新绑定事件
        this.bindImageEvents();
        
        // 启用懒加载
        container.querySelectorAll('img[data-src]').forEach(img => {
            this.imageObserver.observe(img);
        });

        // 更新分页
        this.updatePagination();

        // 如果是瀑布流视图，重新排列
        if (this.currentView === 'masonry') {
            setTimeout(() => this.arrangeMasonry(), 100);
        }
    }

    // 创建图片卡片
    createImageCard(image) {
        const isSelected = this.selectedImages.has(image.id);
        const formatDate = (date) => {
            return new Intl.DateTimeFormat('zh-CN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        };

        return `
            <div class="image-card ${isSelected ? 'selected' : ''}" data-id="${image.id}" data-category="${image.category}">
                <div class="image-select">
                    <div class="image-checkbox ${isSelected ? 'checked' : ''}" onclick="dashboard.toggleImageSelection(${image.id})"></div>
                </div>
                <div class="image-preview">
                    <img data-src="${image.thumbnail}" alt="${image.name}" loading="lazy">
                    <div class="image-overlay">
                        <div class="image-actions-overlay">
                            <button class="action-btn" onclick="dashboard.viewImage(${image.id})" title="查看大图">
                                <i class="ri-eye-line"></i>
                            </button>
                            <button class="action-btn" onclick="dashboard.editImage(${image.id})" title="编辑信息">
                                <i class="ri-edit-line"></i>
                            </button>
                            <button class="action-btn" onclick="dashboard.downloadImage(${image.id})" title="下载">
                                <i class="ri-download-line"></i>
                            </button>
                            <button class="action-btn" onclick="dashboard.shareImage(${image.id})" title="分享">
                                <i class="ri-share-line"></i>
                            </button>
                            <button class="action-btn ${image.favorite ? 'favorited' : ''}" onclick="dashboard.toggleFavorite(${image.id})" title="${image.favorite ? '取消收藏' : '收藏'}">
                                <i class="ri-heart-${image.favorite ? 'fill' : 'line'}"></i>
                            </button>
                            <button class="action-btn danger" onclick="dashboard.deleteImage(${image.id})" title="删除">
                                <i class="ri-delete-bin-line"></i>
                            </button>
                        </div>
                    </div>
                    <div class="image-stats">
                        <span class="stat-item">
                            <i class="ri-eye-line"></i>
                            ${image.views}
                        </span>
                        <span class="stat-item">
                            <i class="ri-download-line"></i>
                            ${image.downloads}
                        </span>
                        <span class="stat-item">
                            <i class="ri-heart-line"></i>
                            ${image.likes}
                        </span>
                    </div>
                </div>
                <div class="image-info">
                    <div class="image-name" title="${image.name}">${image.name}</div>
                    <div class="image-meta">
                        <span class="meta-item">
                            <i class="ri-file-line"></i>
                            ${image.size}MB
                        </span>
                        <span class="meta-item">
                            <i class="ri-aspect-ratio-line"></i>
                            ${image.dimensions.width}×${image.dimensions.height}
                        </span>
                        <span class="meta-item">
                            <i class="ri-time-line"></i>
                            ${formatDate(image.uploadDate)}
                        </span>
                    </div>
                    <div class="image-tags">
                        ${image.tags.map(tag => `<span class="image-tag" onclick="dashboard.searchByTag('${tag}')">${tag}</span>`).join('')}
                    </div>
                    <div class="image-exif" style="display: none;">
                        <div class="exif-item">📷 ${image.exif.camera}</div>
                        <div class="exif-item">🔍 ${image.exif.lens}</div>
                        <div class="exif-item">⚙️ ${image.exif.settings.aperture} ${image.exif.settings.shutter} ISO${image.exif.settings.iso}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // 绑定图片事件
    bindImageEvents() {
        // 双击查看大图
        document.querySelectorAll('.image-card').forEach(card => {
            card.addEventListener('dblclick', () => {
                const imageId = parseInt(card.dataset.id);
                this.viewImage(imageId);
            });

            // 右键菜单
            card.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const imageId = parseInt(card.dataset.id);
                this.showContextMenu(e, imageId);
            });

            // 悬停显示EXIF信息
            const exifInfo = card.querySelector('.image-exif');
            if (exifInfo) {
                card.addEventListener('mouseenter', () => {
                    exifInfo.style.display = 'block';
                });
                card.addEventListener('mouseleave', () => {
                    exifInfo.style.display = 'none';
                });
            }
        });
    }

    // 处理搜索
    handleSearch(e) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            const query = e.target.value.trim().toLowerCase();
            this.filterImages(query);
        }, 300);
    }

    // 处理搜索键盘事件
    handleSearchKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const suggestions = document.getElementById('searchSuggestions');
            const firstSuggestion = suggestions.querySelector('.suggestion-item');
            if (firstSuggestion) {
                firstSuggestion.click();
            }
        }
    }

    // 过滤图片
    filterImages(query = '', filters = {}) {
        this.filteredImages = this.images.filter(image => {
            // 文本搜索
            if (query) {
                const searchText = `${image.name} ${image.tags.join(' ')} ${image.category}`.toLowerCase();
                if (!searchText.includes(query)) return false;
            }

            // 分类过滤
            if (filters.category && image.category !== filters.category) return false;

            // 收藏过滤
            if (filters.favorite && !image.favorite) return false;

            // 日期过滤
            if (filters.dateRange) {
                const { start, end } = filters.dateRange;
                if (image.uploadDate < start || image.uploadDate > end) return false;
            }

            // 大小过滤
            if (filters.sizeRange) {
                const { min, max } = filters.sizeRange;
                const size = parseFloat(image.size);
                if (size < min || size > max) return false;
            }

            return true;
        });

        // 应用排序
        this.applySorting();
        
        // 重置到第一页
        this.currentPage = 1;
        
        // 重新渲染
        this.renderImages();
        
        // 更新统计
        this.updateFilterStats();
    }

    // 应用排序
    applySorting() {
        const sortBy = document.getElementById('sortSelect')?.value || 'newest';
        
        this.filteredImages.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.uploadDate) - new Date(a.uploadDate);
                case 'oldest':
                    return new Date(a.uploadDate) - new Date(b.uploadDate);
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'size':
                    return parseFloat(b.size) - parseFloat(a.size);
                case 'views':
                    return b.views - a.views;
                default:
                    return 0;
            }
        });
    }

    // 切换视图模式
    switchView(view) {
        this.currentView = view;
        const container = document.getElementById('imageGrid');
        if (container) {
            container.className = `image-grid ${view}-view`;
            
            // 更新按钮状态
            document.querySelectorAll('.view-mode-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === view);
            });
            
            // 特殊布局处理
            if (view === 'masonry') {
                setTimeout(() => this.arrangeMasonry(), 100);
            } else if (view === 'timeline') {
                this.arrangeTimeline();
            }
        }
    }

    // 瀑布流布局
    arrangeMasonry() {
        const container = document.getElementById('imageGrid');
        if (!container || this.currentView !== 'masonry') return;

        // 使用CSS Grid实现瀑布流
        const cards = container.querySelectorAll('.image-card');
        cards.forEach((card, index) => {
            const img = card.querySelector('img');
            if (img && img.complete) {
                const aspectRatio = img.naturalHeight / img.naturalWidth;
                const gridRowEnd = Math.ceil(aspectRatio * 10) + 1;
                card.style.gridRowEnd = `span ${gridRowEnd}`;
            }
        });
    }

    // 时间线布局
    arrangeTimeline() {
        const container = document.getElementById('imageGrid');
        if (!container || this.currentView !== 'timeline') return;

        // 按日期分组
        const groupedImages = this.groupImagesByDate(this.filteredImages);
        
        container.innerHTML = Object.entries(groupedImages).map(([date, images]) => `
            <div class="timeline-date-group">
                <div class="timeline-date">
                    <i class="ri-calendar-line"></i>
                    ${date}
                    <span class="image-count">${images.length} 张图片</span>
                </div>
                <div class="timeline-images">
                    ${images.map(image => this.createImageCard(image)).join('')}
                </div>
            </div>
        `).join('');

        this.bindImageEvents();
    }

    // 按日期分组图片
    groupImagesByDate(images) {
        const groups = {};
        images.forEach(image => {
            const date = new Intl.DateTimeFormat('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(image.uploadDate);
            
            if (!groups[date]) groups[date] = [];
            groups[date].push(image);
        });
        return groups;
    }

    // 图片操作方法
    toggleImageSelection(imageId) {
        if (this.selectedImages.has(imageId)) {
            this.selectedImages.delete(imageId);
        } else {
            this.selectedImages.add(imageId);
        }
        
        this.updateImageSelection(imageId);
        this.updateBatchToolbar();
    }

    updateImageSelection(imageId) {
        const card = document.querySelector(`[data-id="${imageId}"]`);
        const checkbox = card?.querySelector('.image-checkbox');
        
        if (card && checkbox) {
            const isSelected = this.selectedImages.has(imageId);
            card.classList.toggle('selected', isSelected);
            checkbox.classList.toggle('checked', isSelected);
        }
    }

    updateBatchToolbar() {
        const toolbar = document.getElementById('batchToolbar');
        const countSpan = document.getElementById('selectedCount');
        
        if (toolbar && countSpan) {
            const count = this.selectedImages.size;
            toolbar.classList.toggle('active', count > 0);
            countSpan.textContent = count;
        }
    }

    clearSelection() {
        this.selectedImages.clear();
        document.querySelectorAll('.image-card').forEach(card => {
            card.classList.remove('selected');
            card.querySelector('.image-checkbox')?.classList.remove('checked');
        });
        this.updateBatchToolbar();
    }

    toggleSelectAll() {
        const allImageIds = this.filteredImages.map(img => img.id);
        const isAllSelected = allImageIds.every(id => this.selectedImages.has(id));
        
        if (isAllSelected) {
            // 取消全选
            allImageIds.forEach(id => this.selectedImages.delete(id));
        } else {
            // 全选
            allImageIds.forEach(id => this.selectedImages.add(id));
        }
        
        // 更新UI
        document.querySelectorAll('.image-card').forEach(card => {
            const imageId = parseInt(card.dataset.id);
            this.updateImageSelection(imageId);
        });
        
        this.updateBatchToolbar();
    }

    // 图片查看器
    viewImage(imageId) {
        const image = this.images.find(img => img.id === imageId);
        if (!image) return;

        // 创建全屏查看器
        const viewer = this.createImageViewer(image);
        document.body.appendChild(viewer);
        
        // 更新浏览量
        image.views++;
        this.updateImageStats(imageId);
        
        // 键盘导航
        this.bindViewerKeyboard(imageId);
    }

    createImageViewer(image) {
        const viewer = document.createElement('div');
        viewer.className = 'image-viewer active';
        viewer.innerHTML = `
            <div class="viewer-content">
                <div class="viewer-header">
                    <div class="viewer-info">
                        <h3>${image.name}</h3>
                        <p>${image.dimensions.width} × ${image.dimensions.height} • ${image.size}MB • ${image.format}</p>
                    </div>
                    <div class="viewer-actions">
                        <button class="viewer-btn" onclick="dashboard.downloadImage(${image.id})" title="下载">
                            <i class="ri-download-line"></i>
                        </button>
                        <button class="viewer-btn" onclick="dashboard.shareImage(${image.id})" title="分享">
                            <i class="ri-share-line"></i>
                        </button>
                        <button class="viewer-btn" onclick="dashboard.toggleFavorite(${image.id})" title="收藏">
                            <i class="ri-heart-${image.favorite ? 'fill' : 'line'}"></i>
                        </button>
                        <button class="viewer-btn" onclick="this.closest('.image-viewer').remove()" title="关闭">
                            <i class="ri-close-line"></i>
                        </button>
                    </div>
                </div>
                <div class="viewer-main">
                    <img src="${image.url}" alt="${image.name}" class="viewer-image">
                </div>
                <div class="viewer-sidebar">
                    <div class="image-details">
                        <h4>图片信息</h4>
                        <div class="detail-item">
                            <span class="label">文件名:</span>
                            <span class="value">${image.name}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">大小:</span>
                            <span class="value">${image.size}MB</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">尺寸:</span>
                            <span class="value">${image.dimensions.width} × ${image.dimensions.height}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">格式:</span>
                            <span class="value">${image.format}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">上传时间:</span>
                            <span class="value">${new Intl.DateTimeFormat('zh-CN').format(image.uploadDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">浏览量:</span>
                            <span class="value">${image.views}</span>
                        </div>
                    </div>
                    <div class="exif-details">
                        <h4>拍摄信息</h4>
                        <div class="detail-item">
                            <span class="label">相机:</span>
                            <span class="value">${image.exif.camera}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">镜头:</span>
                            <span class="value">${image.exif.lens}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">光圈:</span>
                            <span class="value">${image.exif.settings.aperture}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">快门:</span>
                            <span class="value">${image.exif.settings.shutter}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">ISO:</span>
                            <span class="value">${image.exif.settings.iso}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">焦距:</span>
                            <span class="value">${image.exif.settings.focalLength}</span>
                        </div>
                    </div>
                    <div class="image-tags-detail">
                        <h4>标签</h4>
                        <div class="tags-list">
                            ${image.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return viewer;
    }

    // 工具方法
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="ri-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="ri-close-line"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        if (duration > 0) {
            setTimeout(() => {
                notification.remove();
            }, duration);
        }
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle-line',
            error: 'error-warning-line',
            warning: 'alert-line',
            info: 'information-line'
        };
        return icons[type] || icons.info;
    }

    showLoading() {
        const loader = document.getElementById('pageLoader');
        if (loader) loader.style.display = 'flex';
    }

    hideLoading() {
        const loader = document.getElementById('pageLoader');
        if (loader) loader.style.display = 'none';
    }

    simulateAPICall() {
        return new Promise(resolve => {
            setTimeout(resolve, 1000 + Math.random() * 2000);
        });
    }

    // 实时数据更新
    startRealtimeUpdates() {
        setInterval(() => {
            this.updateRealtimeStats();
        }, 30000); // 每30秒更新一次
    }

    updateRealtimeStats() {
        // 模拟实时数据更新
        this.images.forEach(image => {
            if (Math.random() > 0.95) { // 5%的概率更新
                image.views += Math.floor(Math.random() * 3);
                image.downloads += Math.floor(Math.random() * 2);
                image.likes += Math.floor(Math.random() * 2);
            }
        });
        
        this.updateStats();
    }

    updateStats() {
        const totalImages = this.images.length;
        const totalSize = this.images.reduce((sum, img) => sum + parseFloat(img.size), 0);
        const totalViews = this.images.reduce((sum, img) => sum + img.views, 0);
        const totalShares = this.images.reduce((sum, img) => sum + img.downloads, 0);
        
        this.animateNumber('totalImages', totalImages);
        this.animateNumber('totalStorage', totalSize.toFixed(1));
        this.animateNumber('totalViews', (totalViews / 1000).toFixed(1));
        this.animateNumber('totalShares', totalShares);
    }

    animateNumber(elementId, target) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const current = parseFloat(element.textContent) || 0;
        const diff = target - current;
        const steps = 20;
        const stepSize = diff / steps;
        let currentStep = 0;
        
        const timer = setInterval(() => {
            currentStep++;
            const newValue = current + (stepSize * currentStep);
            
            if (currentStep >= steps) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                if (elementId === 'totalStorage' || elementId === 'totalViews') {
                    element.textContent = newValue.toFixed(1);
                } else {
                    element.textContent = Math.floor(newValue).toLocaleString();
                }
            }
        }, 50);
    }

    // 拖拽相关方法
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlight(e) {
        document.body.classList.add('drag-hover');
    }

    unhighlight(e) {
        document.body.classList.remove('drag-hover');
    }

    handleDrop(e) {
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
            this.handleFileUpload(imageFiles);
        }
    }

    // 处理文件上传
    async handleFileUpload(files) {
        this.showNotification(`开始上传 ${files.length} 个文件...`, 'info');
        
        for (const file of files) {
            try {
                await this.uploadFile(file);
                this.showNotification(`${file.name} 上传成功`, 'success');
            } catch (error) {
                this.showNotification(`${file.name} 上传失败: ${error.message}`, 'error');
            }
        }
        
        // 重新加载图片列表
        await this.loadImages();
    }

    async uploadFile(file) {
        // 模拟文件上传
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90%成功率
                    resolve();
                } else {
                    reject(new Error('网络错误'));
                }
            }, 1000 + Math.random() * 2000);
        });
    }

    // 更多图片操作方法
    editImage(imageId) {
        const image = this.images.find(img => img.id === imageId);
        if (!image) return;
        
        this.showNotification('图片编辑器正在开发中...', 'info');
    }

    downloadImage(imageId) {
        const image = this.images.find(img => img.id === imageId);
        if (!image) return;
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = image.url;
        link.download = image.name;
        link.click();
        
        // 更新下载计数
        image.downloads++;
        this.updateImageStats(imageId);
        
        this.showNotification(`开始下载 ${image.name}`, 'success');
    }

    shareImage(imageId) {
        const image = this.images.find(img => img.id === imageId);
        if (!image) return;
        
        if (navigator.share) {
            navigator.share({
                title: image.name,
                text: `查看这张精美的图片: ${image.name}`,
                url: image.url
            });
        } else {
            // 复制链接到剪贴板
            navigator.clipboard.writeText(image.url).then(() => {
                this.showNotification('图片链接已复制到剪贴板', 'success');
            });
        }
    }

    toggleFavorite(imageId) {
        const image = this.images.find(img => img.id === imageId);
        if (!image) return;
        
        image.favorite = !image.favorite;
        
        // 更新UI
        const card = document.querySelector(`[data-id="${imageId}"]`);
        const favoriteBtn = card?.querySelector('.action-btn:nth-child(5)');
        if (favoriteBtn) {
            const icon = favoriteBtn.querySelector('i');
            icon.className = `ri-heart-${image.favorite ? 'fill' : 'line'}`;
            favoriteBtn.classList.toggle('favorited', image.favorite);
            favoriteBtn.title = image.favorite ? '取消收藏' : '收藏';
        }
        
        this.showNotification(
            image.favorite ? '已添加到收藏' : '已从收藏中移除',
            'success'
        );
    }

    deleteImage(imageId) {
        const image = this.images.find(img => img.id === imageId);
        if (!image) return;
        
        if (confirm(`确定要删除 "${image.name}" 吗？此操作不可撤销。`)) {
            // 从数组中移除
            this.images = this.images.filter(img => img.id !== imageId);
            this.filteredImages = this.filteredImages.filter(img => img.id !== imageId);
            
            // 从选择中移除
            this.selectedImages.delete(imageId);
            
            // 重新渲染
            this.renderImages();
            this.updateStats();
            this.updateBatchToolbar();
            
            this.showNotification('图片已删除', 'success');
        }
    }

    updateImageStats(imageId) {
        // 更新图片统计信息显示
        const card = document.querySelector(`[data-id="${imageId}"]`);
        const image = this.images.find(img => img.id === imageId);
        
        if (card && image) {
            const statsElements = card.querySelectorAll('.stat-item');
            if (statsElements[0]) statsElements[0].innerHTML = `<i class="ri-eye-line"></i>${image.views}`;
            if (statsElements[1]) statsElements[1].innerHTML = `<i class="ri-download-line"></i>${image.downloads}`;
            if (statsElements[2]) statsElements[2].innerHTML = `<i class="ri-heart-line"></i>${image.likes}`;
        }
    }

    // 批量操作方法
    batchDownload() {
        if (this.selectedImages.size === 0) return;
        
        const selectedImagesList = Array.from(this.selectedImages).map(id => 
            this.images.find(img => img.id === id)
        ).filter(Boolean);
        
        this.showNotification(`开始下载 ${selectedImagesList.length} 张图片...`, 'info');
        
        selectedImagesList.forEach((image, index) => {
            setTimeout(() => {
                this.downloadImage(image.id);
            }, index * 500); // 间隔下载，避免浏览器限制
        });
        
        this.clearSelection();
    }

    batchDelete() {
        if (this.selectedImages.size === 0) return;
        
        const count = this.selectedImages.size;
        if (confirm(`确定要删除 ${count} 张图片吗？此操作不可撤销。`)) {
            Array.from(this.selectedImages).forEach(imageId => {
                this.images = this.images.filter(img => img.id !== imageId);
                this.filteredImages = this.filteredImages.filter(img => img.id !== imageId);
            });
            
            this.clearSelection();
            this.renderImages();
            this.updateStats();
            
            this.showNotification(`已删除 ${count} 张图片`, 'success');
        }
    }

    // 其他方法...
    handleResize() {
        if (this.currentView === 'masonry') {
            this.arrangeMasonry();
        }
    }

    handleScroll() {
        // 无限滚动逻辑
        if (this.isLoading) return;
        
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 1000) {
            this.loadMoreImages();
        }
    }

    async loadMoreImages() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showNotification('加载更多图片...', 'info');
        
        try {
            await this.simulateAPICall();
            const newImages = this.generateMockImages(20);
            this.images.push(...newImages);
            this.filterImages(); // 重新应用过滤器
            
            this.showNotification('新图片加载完成', 'success');
        } catch (error) {
            this.showNotification('加载失败，请稍后重试', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredImages.length / this.itemsPerPage);
        const pagination = document.getElementById('pagination');
        
        if (!pagination) return;
        
        // 简化的分页逻辑
        const prevBtn = pagination.querySelector('#prevBtn');
        const nextBtn = pagination.querySelector('#nextBtn');
        
        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;
    }

    changePage(page) {
        const totalPages = Math.ceil(this.filteredImages.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderImages();
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 模态框相关
    showUploadModal() {
        this.showNotification('上传功能正在开发中...', 'info');
    }

    showBulkUploadModal() {
        this.showNotification('批量上传功能正在开发中...', 'info');
    }

    showCreateAlbumModal() {
        this.showNotification('创建相册功能正在开发中...', 'info');
    }

    showExportModal() {
        this.showNotification('导出功能正在开发中...', 'info');
    }

    showBatchMoveModal() {
        this.showNotification('批量移动功能正在开发中...', 'info');
    }

    showBatchTagModal() {
        this.showNotification('批量标签功能正在开发中...', 'info');
    }

    closeAllModals() {
        document.querySelectorAll('.modal, .image-viewer').forEach(modal => {
            modal.remove();
        });
    }

    // 其他工具方法
    addTooltip(element) {
        // 添加现代化工具提示
        const title = element.getAttribute('title');
        if (!title) return;
        
        element.removeAttribute('title');
        
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = title;
            document.body.appendChild(tooltip);
            
            const rect = element.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
            tooltip.style.top = `${rect.top - 10}px`;
            
            element._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', () => {
            if (element._tooltip) {
                element._tooltip.remove();
                delete element._tooltip;
            }
        });
    }

    searchByTag(tag) {
        const searchInput = document.getElementById('smartSearch');
        if (searchInput) {
            searchInput.value = tag;
            this.filterImages(tag.toLowerCase());
        }
    }

    handleFilterClick(e) {
        const filter = e.target.dataset.filter;
        e.target.classList.toggle('active');
        
        // 应用过滤器逻辑
        this.applyActiveFilters();
    }

    handleSortChange(e) {
        this.applySorting();
        this.renderImages();
    }

    handleViewChange(e) {
        const view = e.target.closest('.view-mode-btn').dataset.view;
        this.switchView(view);
    }

    applyActiveFilters() {
        const activeFilters = document.querySelectorAll('.filter-chip.active');
        const filters = {};
        
        activeFilters.forEach(filter => {
            const type = filter.dataset.filter;
            switch (type) {
                case 'favorite':
                    filters.favorite = true;
                    break;
                case 'recent':
                    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    filters.dateRange = { start: oneWeekAgo, end: new Date() };
                    break;
                // 可以添加更多过滤器
            }
        });
        
        const searchQuery = document.getElementById('smartSearch')?.value.trim().toLowerCase() || '';
        this.filterImages(searchQuery, filters);
    }

    updateFilterStats() {
        // 更新过滤后的统计信息
        const filteredCount = this.filteredImages.length;
        const totalCount = this.images.length;
        
        if (filteredCount !== totalCount) {
            this.showNotification(`显示 ${filteredCount} / ${totalCount} 张图片`, 'info', 2000);
        }
    }

    showContextMenu(e, imageId) {
        // 显示右键菜单
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" onclick="dashboard.viewImage(${imageId})">
                <i class="ri-eye-line"></i>
                查看大图
            </div>
            <div class="context-menu-item" onclick="dashboard.downloadImage(${imageId})">
                <i class="ri-download-line"></i>
                下载
            </div>
            <div class="context-menu-item" onclick="dashboard.shareImage(${imageId})">
                <i class="ri-share-line"></i>
                分享
            </div>
            <div class="context-menu-item" onclick="dashboard.toggleFavorite(${imageId})">
                <i class="ri-heart-line"></i>
                收藏/取消收藏
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item danger" onclick="dashboard.deleteImage(${imageId})">
                <i class="ri-delete-bin-line"></i>
                删除
            </div>
        `;
        
        document.body.appendChild(menu);
        
        menu.style.left = `${e.pageX}px`;
        menu.style.top = `${e.pageY}px`;
        
        // 点击其他地方关闭菜单
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 100);
    }

    bindViewerKeyboard(currentImageId) {
        const keyHandler = (e) => {
            switch (e.key) {
                case 'Escape':
                    document.querySelector('.image-viewer')?.remove();
                    document.removeEventListener('keydown', keyHandler);
                    break;
                case 'ArrowLeft':
                    // 上一张图片
                    this.navigateImage(currentImageId, -1);
                    break;
                case 'ArrowRight':
                    // 下一张图片
                    this.navigateImage(currentImageId, 1);
                    break;
            }
        };
        
        document.addEventListener('keydown', keyHandler);
    }

    navigateImage(currentImageId, direction) {
        const currentIndex = this.filteredImages.findIndex(img => img.id === currentImageId);
        const newIndex = currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < this.filteredImages.length) {
            const newImage = this.filteredImages[newIndex];
            document.querySelector('.image-viewer')?.remove();
            this.viewImage(newImage.id);
        }
    }
}

// 初始化增强仪表盘
let dashboard;

document.addEventListener('DOMContentLoaded', function() {
    dashboard = new DashboardEnhanced();
});

// 导出给全局使用
window.dashboard = dashboard; 