// 画廊控制器
class GalleryController {
    constructor() {
        this.images = [];
        this.filteredImages = [];
        this.currentPage = 1;
        this.pageSize = 12;
        this.viewMode = 'grid';
        this.sortBy = 'newest';
        this.searchQuery = '';
        this.favoritesOnly = false;
        this.selectedImage = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadImages();
        this.updateStats();
    }

    // 绑定事件
    bindEvents() {
        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        const searchClear = document.getElementById('searchClear');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        if (searchClear) {
            searchClear.addEventListener('click', () => {
                this.clearSearch();
            });
        }

        // 排序功能
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSort(e.target.value);
            });
        }

        // 视图模式切换
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleViewMode(e.currentTarget.dataset.mode);
            });
        });

        // 收藏过滤器
        const favoritesOnly = document.getElementById('favoritesOnly');
        if (favoritesOnly) {
            favoritesOnly.addEventListener('change', (e) => {
                this.handleFavoritesFilter(e.target.checked);
            });
        }

        // 分页控制
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        const pageSize = document.getElementById('pageSize');

        if (prevPage) {
            prevPage.addEventListener('click', () => {
                this.handlePrevPage();
            });
        }

        if (nextPage) {
            nextPage.addEventListener('click', () => {
                this.handleNextPage();
            });
        }

        if (pageSize) {
            pageSize.addEventListener('change', (e) => {
                this.handlePageSizeChange(parseInt(e.target.value));
            });
        }

        // 头部按钮
        const uploadNewBtn = document.getElementById('uploadNewBtn');
        const refreshGalleryBtn = document.getElementById('refreshGalleryBtn');

        if (uploadNewBtn) {
            uploadNewBtn.addEventListener('click', () => {
                window.location.href = '/';
            });
        }

        if (refreshGalleryBtn) {
            refreshGalleryBtn.addEventListener('click', () => {
                this.refreshGallery();
            });
        }

        // 模态框事件
        this.bindModalEvents();

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    // 绑定模态框事件
    bindModalEvents() {
        const modal = document.getElementById('imageModal');
        const modalOverlay = document.getElementById('modalOverlay');
        const modalClose = document.getElementById('modalClose');
        const prevImage = document.getElementById('prevImage');
        const nextImage = document.getElementById('nextImage');

        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => {
                this.closeModal();
            });
        }

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeModal();
            });
        }

        if (prevImage) {
            prevImage.addEventListener('click', () => {
                this.showPrevImage();
            });
        }

        if (nextImage) {
            nextImage.addEventListener('click', () => {
                this.showNextImage();
            });
        }

        // 模态框内的操作按钮
        const copyLinkBtn = document.getElementById('copyLinkBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const favoriteBtn = document.getElementById('favoriteBtn');
        const deleteBtn = document.getElementById('deleteBtn');

        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', () => {
                this.copyImageLink();
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadImage();
            });
        }

        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => {
                this.toggleFavorite();
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteImage();
            });
        }
    }

    // 加载图片数据
    async loadImages() {
        this.showLoading();
        
        try {
            // 模拟API调用 - 实际项目中需要替换为真实的API
            const response = await this.fetchImages();
            this.images = response;
            this.filterAndSort();
            this.renderImages();
            this.updateStats();
            this.updatePagination();
        } catch (error) {
            console.error('加载图片失败:', error);
            this.showError('加载图片失败，请稍后重试');
        } finally {
            this.hideLoading();
        }
    }

    // 模拟获取图片数据
    async fetchImages() {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 模拟图片数据 - 实际项目中需要从API获取
        const mockImages = [];
        for (let i = 1; i <= 50; i++) {
            mockImages.push({
                id: i,
                name: `图片_${i}.jpg`,
                url: `https://picsum.photos/400/300?random=${i}`,
                size: Math.floor(Math.random() * 2000 + 500) + 'KB',
                dimensions: '400x300',
                uploadTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                views: Math.floor(Math.random() * 1000),
                isFavorite: Math.random() > 0.7,
                tags: ['风景', '自然', '摄影'].slice(0, Math.floor(Math.random() * 3) + 1)
            });
        }

        return mockImages;
    }

    // 搜索处理
    handleSearch(query) {
        this.searchQuery = query.toLowerCase();
        this.currentPage = 1;
        
        const searchClear = document.getElementById('searchClear');
        if (searchClear) {
            searchClear.style.display = query ? 'block' : 'none';
        }

        this.filterAndSort();
        this.renderImages();
        this.updateStats();
        this.updatePagination();
    }

    // 清除搜索
    clearSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchClear = document.getElementById('searchClear');
        
        if (searchInput) {
            searchInput.value = '';
        }
        
        if (searchClear) {
            searchClear.style.display = 'none';
        }

        this.searchQuery = '';
        this.filterAndSort();
        this.renderImages();
        this.updateStats();
        this.updatePagination();
    }

    // 排序处理
    handleSort(sortBy) {
        this.sortBy = sortBy;
        this.filterAndSort();
        this.renderImages();
        this.updatePagination();
    }

    // 视图模式切换
    handleViewMode(mode) {
        this.viewMode = mode;
        
        // 更新按钮状态
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // 更新网格样式
        const imageGrid = document.getElementById('imageGrid');
        if (imageGrid) {
            imageGrid.className = `image-grid ${mode === 'list' ? 'list-view' : ''} ${mode === 'masonry' ? 'masonry' : ''}`;
        }

        this.renderImages();
    }

    // 收藏过滤处理
    handleFavoritesFilter(checked) {
        this.favoritesOnly = checked;
        this.currentPage = 1;
        this.filterAndSort();
        this.renderImages();
        this.updateStats();
        this.updatePagination();
    }

    // 过滤和排序
    filterAndSort() {
        let filtered = [...this.images];

        // 搜索过滤
        if (this.searchQuery) {
            filtered = filtered.filter(image => 
                image.name.toLowerCase().includes(this.searchQuery) ||
                image.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
            );
        }

        // 收藏过滤
        if (this.favoritesOnly) {
            filtered = filtered.filter(image => image.isFavorite);
        }

        // 排序
        filtered.sort((a, b) => {
            switch (this.sortBy) {
                case 'newest':
                    return new Date(b.uploadTime) - new Date(a.uploadTime);
                case 'oldest':
                    return new Date(a.uploadTime) - new Date(b.uploadTime);
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'size':
                    return parseInt(b.size) - parseInt(a.size);
                case 'views':
                    return b.views - a.views;
                default:
                    return 0;
            }
        });

        this.filteredImages = filtered;
    }

    // 渲染图片
    renderImages() {
        const imageGrid = document.getElementById('imageGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!imageGrid) return;

        // 计算分页
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageinatedImages = this.filteredImages.slice(startIndex, endIndex);

        if (pageinatedImages.length === 0) {
            imageGrid.style.display = 'none';
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            return;
        }

        imageGrid.style.display = 'grid';
        if (emptyState) {
            emptyState.style.display = 'none';
        }

        // 生成图片HTML
        imageGrid.innerHTML = pageinatedImages.map(image => {
            return this.createImageItem(image);
        }).join('');

        // 绑定图片点击事件
        imageGrid.querySelectorAll('.image-item').forEach((item, index) => {
            const image = pageinatedImages[index];
            item.addEventListener('click', () => {
                this.openModal(image);
            });

            // 绑定快速操作按钮
            const favoriteBtn = item.querySelector('.favorite-btn');
            if (favoriteBtn) {
                favoriteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleImageFavorite(image.id);
                });
            }
        });
    }

    // 创建图片项HTML
    createImageItem(image) {
        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('zh-CN');
        };

        return `
            <div class="image-item" data-image-id="${image.id}">
                <img src="${image.url}" alt="${image.name}" class="image-preview" loading="lazy">
                <div class="image-info">
                    <h3 class="image-name">${image.name}</h3>
                    <div class="image-meta">
                        <span>${image.size}</span>
                        <span>${formatDate(image.uploadTime)}</span>
                    </div>
                    <div class="image-actions">
                        <button class="image-action-btn favorite-btn ${image.isFavorite ? 'active' : ''}" title="收藏">
                            ⭐
                        </button>
                        <button class="image-action-btn" title="浏览次数">
                            👁️ ${image.views}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 分页处理
    handlePrevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderImages();
            this.updatePagination();
            this.scrollToTop();
        }
    }

    handleNextPage() {
        const totalPages = Math.ceil(this.filteredImages.length / this.pageSize);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderImages();
            this.updatePagination();
            this.scrollToTop();
        }
    }

    handlePageSizeChange(newSize) {
        this.pageSize = newSize;
        this.currentPage = 1;
        this.renderImages();
        this.updatePagination();
    }

    // 更新分页UI
    updatePagination() {
        const totalPages = Math.ceil(this.filteredImages.length / this.pageSize);
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const pageNumbers = document.getElementById('pageNumbers');

        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= totalPages;
        }

        // 生成页码
        if (pageNumbers) {
            const pages = this.generatePageNumbers(this.currentPage, totalPages);
            pageNumbers.innerHTML = pages.map(page => {
                if (page === '...') {
                    return '<span class="page-ellipsis">...</span>';
                }
                return `
                    <button class="page-number ${page === this.currentPage ? 'active' : ''}" 
                            onclick="galleryController.goToPage(${page})">
                        ${page}
                    </button>
                `;
            }).join('');
        }
    }

    // 生成页码数组
    generatePageNumbers(current, total) {
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        if (current <= 4) {
            return [1, 2, 3, 4, 5, '...', total];
        }

        if (current >= total - 3) {
            return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        }

        return [1, '...', current - 1, current, current + 1, '...', total];
    }

    // 跳转到指定页面
    goToPage(page) {
        this.currentPage = page;
        this.renderImages();
        this.updatePagination();
        this.scrollToTop();
    }

    // 滚动到顶部
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 更新统计信息
    updateStats() {
        const totalImages = document.getElementById('totalImages');
        const visibleImages = document.getElementById('visibleImages');
        const favoriteImages = document.getElementById('favoriteImages');

        if (totalImages) {
            totalImages.textContent = this.images.length;
        }

        if (visibleImages) {
            visibleImages.textContent = this.filteredImages.length;
        }

        if (favoriteImages) {
            favoriteImages.textContent = this.images.filter(img => img.isFavorite).length;
        }
    }

    // 切换图片收藏状态
    toggleImageFavorite(imageId) {
        const image = this.images.find(img => img.id === imageId);
        if (image) {
            image.isFavorite = !image.isFavorite;
            this.filterAndSort();
            this.renderImages();
            this.updateStats();
        }
    }

    // 打开模态框
    openModal(image) {
        this.selectedImage = image;
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');

        if (modal && modalImage && modalTitle) {
            modalImage.src = image.url;
            modalImage.alt = image.name;
            modalTitle.textContent = image.name;

            // 更新图片信息
            this.updateModalInfo(image);

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // 更新模态框信息
    updateModalInfo(image) {
        const fileName = document.getElementById('imageFileName');
        const fileSize = document.getElementById('imageFileSize');
        const dimensions = document.getElementById('imageDimensions');
        const uploadTime = document.getElementById('imageUploadTime');
        const favoriteBtn = document.getElementById('favoriteBtn');

        if (fileName) fileName.textContent = image.name;
        if (fileSize) fileSize.textContent = image.size;
        if (dimensions) dimensions.textContent = image.dimensions;
        if (uploadTime) {
            uploadTime.textContent = new Date(image.uploadTime).toLocaleString('zh-CN');
        }

        if (favoriteBtn) {
            const icon = favoriteBtn.querySelector('i');
            const text = favoriteBtn.querySelector('span');
            if (image.isFavorite) {
                if (icon) icon.textContent = '❤️';
                if (text) text.textContent = '取消收藏';
                favoriteBtn.classList.add('active');
            } else {
                if (icon) icon.textContent = '⭐';
                if (text) text.textContent = '收藏';
                favoriteBtn.classList.remove('active');
            }
        }
    }

    // 关闭模态框
    closeModal() {
        const modal = document.getElementById('imageModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            this.selectedImage = null;
        }
    }

    // 显示上一张图片
    showPrevImage() {
        if (!this.selectedImage) return;
        
        const currentIndex = this.filteredImages.findIndex(img => img.id === this.selectedImage.id);
        if (currentIndex > 0) {
            this.openModal(this.filteredImages[currentIndex - 1]);
        }
    }

    // 显示下一张图片
    showNextImage() {
        if (!this.selectedImage) return;
        
        const currentIndex = this.filteredImages.findIndex(img => img.id === this.selectedImage.id);
        if (currentIndex < this.filteredImages.length - 1) {
            this.openModal(this.filteredImages[currentIndex + 1]);
        }
    }

    // 复制图片链接
    copyImageLink() {
        if (!this.selectedImage) return;
        
        navigator.clipboard.writeText(this.selectedImage.url).then(() => {
            this.showNotification('图片链接已复制到剪贴板', 'success');
        }).catch(() => {
            this.showNotification('复制失败，请手动复制', 'error');
        });
    }

    // 下载图片
    downloadImage() {
        if (!this.selectedImage) return;
        
        const link = document.createElement('a');
        link.href = this.selectedImage.url;
        link.download = this.selectedImage.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('开始下载图片', 'success');
    }

    // 切换收藏状态
    toggleFavorite() {
        if (!this.selectedImage) return;
        
        this.selectedImage.isFavorite = !this.selectedImage.isFavorite;
        this.updateModalInfo(this.selectedImage);
        this.filterAndSort();
        this.renderImages();
        this.updateStats();
        
        const message = this.selectedImage.isFavorite ? '已添加到收藏' : '已取消收藏';
        this.showNotification(message, 'success');
    }

    // 删除图片
    deleteImage() {
        if (!this.selectedImage) return;
        
        if (confirm('确定要删除这张图片吗？此操作不可撤销。')) {
            const imageId = this.selectedImage.id;
            this.images = this.images.filter(img => img.id !== imageId);
            this.filterAndSort();
            this.renderImages();
            this.updateStats();
            this.updatePagination();
            this.closeModal();
            
            this.showNotification('图片已删除', 'success');
        }
    }

    // 键盘事件处理
    handleKeyboard(e) {
        if (this.selectedImage) {
            switch (e.key) {
                case 'Escape':
                    this.closeModal();
                    break;
                case 'ArrowLeft':
                    this.showPrevImage();
                    break;
                case 'ArrowRight':
                    this.showNextImage();
                    break;
            }
        }
    }

    // 刷新画廊
    refreshGallery() {
        this.loadImages();
        this.showNotification('画廊已刷新', 'success');
    }

    // 显示加载状态
    showLoading() {
        const loadingState = document.getElementById('loadingState');
        const imageGrid = document.getElementById('imageGrid');
        
        if (loadingState) {
            loadingState.style.display = 'flex';
        }
        
        if (imageGrid) {
            imageGrid.style.display = 'none';
        }
    }

    // 隐藏加载状态
    hideLoading() {
        const loadingState = document.getElementById('loadingState');
        
        if (loadingState) {
            loadingState.style.display = 'none';
        }
    }

    // 显示错误
    showError(message) {
        this.showNotification(message, 'error');
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 复用navigation.js中的通知系统
        if (window.navigationController) {
            window.navigationController.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// 初始化画廊控制器
document.addEventListener('DOMContentLoaded', () => {
    window.galleryController = new GalleryController();
}); 