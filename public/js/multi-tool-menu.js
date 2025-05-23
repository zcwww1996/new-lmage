/**
 * 多功能工具菜单
 * 提供WebP转换和其他图片处理工具
 */
class MultiToolMenu {
    constructor() {
        this.isCollapsed = false;
        this.webpFiles = [];
        this.isProcessing = false;
        this.processedResults = [];
        
        this.initElements();
        this.bindEvents();
        this.setupDragAndDrop();
    }

    initElements() {
        // 主要元素
        this.menuElement = document.getElementById('multiToolMenu');
        this.toggleButton = document.getElementById('toolMenuToggle');
        this.menuContent = document.getElementById('toolMenuContent');
        
        // WebP转换相关元素
        this.webpUploadArea = document.getElementById('webpUploadArea');
        this.webpDropZone = document.getElementById('webpDropZone');
        this.webpFileInput = document.getElementById('webpFileInput');
        this.webpOptions = document.getElementById('webpOptions');
        this.webpFileList = document.getElementById('webpFileList');
        this.webpFileItems = document.getElementById('webpFileItems');
        this.webpFileCount = document.getElementById('webpFileCount');
        this.webpActions = document.getElementById('webpActions');
        this.webpProgress = document.getElementById('webpProgress');
        this.webpResults = document.getElementById('webpResults');
        
        // 控制元素
        this.webpQuality = document.getElementById('webpQuality');
        this.webpQualityValue = document.getElementById('webpQualityValue');
        this.webpAutoUpload = document.getElementById('webpAutoUpload');
        this.webpConvertBtn = document.getElementById('webpConvertBtn');
        this.webpDownloadBtn = document.getElementById('webpDownloadBtn');
        this.webpClearAll = document.getElementById('webpClearAll');
        
        // 进度元素
        this.webpProgressFill = document.getElementById('webpProgressFill');
        this.webpProgressCurrent = document.getElementById('webpProgressCurrent');
        this.webpProgressTotal = document.getElementById('webpProgressTotal');
        
        // 结果元素
        this.webpSuccessCount = document.getElementById('webpSuccessCount');
        this.webpFailedCount = document.getElementById('webpFailedCount');
        this.webpResultsContent = document.getElementById('webpResultsContent');
    }

    bindEvents() {
        // 折叠菜单切换
        this.toggleButton.addEventListener('click', () => this.toggleMenu());
        
        // 文件选择
        this.webpFileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));
        this.webpDropZone.addEventListener('click', () => this.webpFileInput.click());
        
        // 质量控制滑块
        this.webpQuality.addEventListener('input', (e) => {
            this.webpQualityValue.textContent = e.target.value + '%';
        });
        
        // 按钮事件
        this.webpConvertBtn.addEventListener('click', () => this.startConversion());
        this.webpDownloadBtn.addEventListener('click', () => this.downloadResults());
        this.webpClearAll.addEventListener('click', () => this.clearAllFiles());
    }

    setupDragAndDrop() {
        // 防止默认拖拽行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.webpDropZone.addEventListener(eventName, this.preventDefaults, false);
        });

        // 拖拽高亮效果
        ['dragenter', 'dragover'].forEach(eventName => {
            this.webpDropZone.addEventListener(eventName, () => {
                this.webpDropZone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.webpDropZone.addEventListener(eventName, () => {
                this.webpDropZone.classList.remove('dragover');
            }, false);
        });

        // 文件拖放处理
        this.webpDropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFileSelect(files);
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    toggleMenu() {
        this.isCollapsed = !this.isCollapsed;
        this.menuElement.classList.toggle('collapsed', this.isCollapsed);
        
        // 更新按钮图标
        const icon = this.toggleButton.querySelector('i');
        if (this.isCollapsed) {
            icon.className = 'ri-arrow-right-s-line';
        } else {
            icon.className = 'ri-arrow-down-s-line';
        }
    }

    handleFileSelect(files) {
        if (!files || files.length === 0) return;
        
        // 过滤图片文件
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            this.showNotification('请选择有效的图片文件', 'warning');
            return;
        }
        
        // 添加到文件列表
        this.webpFiles.push(...imageFiles);
        this.updateFileList();
        this.updateInterface();
        
        this.showNotification(`已添加 ${imageFiles.length} 个文件`, 'success');
    }

    updateFileList() {
        this.webpFileItems.innerHTML = '';
        this.webpFileCount.textContent = this.webpFiles.length;
        
        this.webpFiles.forEach((file, index) => {
            const fileItem = this.createFileItem(file, index);
            this.webpFileItems.appendChild(fileItem);
        });
    }

    createFileItem(file, index) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        // 创建预览
        const reader = new FileReader();
        reader.onload = (e) => {
            fileItem.innerHTML = `
                <div class="file-preview">
                    <img src="${e.target.result}" alt="${file.name}">
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                    <div class="file-format">转换为: WebP</div>
                </div>
                <div class="file-actions">
                    <button class="file-remove-btn" onclick="multiToolMenu.removeFile(${index})">
                        <i class="ri-close-line"></i>
                    </button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
        
        return fileItem;
    }

    removeFile(index) {
        this.webpFiles.splice(index, 1);
        this.updateFileList();
        this.updateInterface();
        
        if (this.webpFiles.length === 0) {
            this.resetInterface();
        }
    }

    clearAllFiles() {
        this.webpFiles = [];
        this.updateFileList();
        this.resetInterface();
        this.showNotification('已清空所有文件', 'info');
    }

    updateInterface() {
        const hasFiles = this.webpFiles.length > 0;
        
        // 显示/隐藏相关区域
        this.webpOptions.style.display = hasFiles ? 'block' : 'none';
        this.webpFileList.style.display = hasFiles ? 'block' : 'none';
        this.webpActions.style.display = hasFiles ? 'flex' : 'none';
        
        // 更新按钮状态
        this.webpConvertBtn.disabled = this.isProcessing;
        if (this.isProcessing) {
            this.webpConvertBtn.innerHTML = '<i class="ri-loader-4-line"></i><span>转换中...</span>';
        } else {
            this.webpConvertBtn.innerHTML = '<i class="ri-refresh-line"></i><span>开始转换</span>';
        }
    }

    resetInterface() {
        this.webpOptions.style.display = 'none';
        this.webpFileList.style.display = 'none';
        this.webpActions.style.display = 'none';
        this.webpProgress.style.display = 'none';
        this.webpResults.style.display = 'none';
        this.webpDownloadBtn.style.display = 'none';
    }

    async startConversion() {
        if (this.webpFiles.length === 0 || this.isProcessing) return;
        
        this.isProcessing = true;
        this.processedResults = [];
        
        // 显示进度
        this.webpProgress.style.display = 'block';
        this.webpResults.style.display = 'none';
        this.updateInterface();
        
        // 设置进度信息
        this.webpProgressTotal.textContent = this.webpFiles.length;
        this.webpProgressCurrent.textContent = '0';
        
        const quality = parseInt(this.webpQuality.value) / 100;
        const autoUpload = this.webpAutoUpload.checked;
        
        let successCount = 0;
        let failedCount = 0;
        
        // 处理每个文件
        for (let i = 0; i < this.webpFiles.length; i++) {
            try {
                // 更新进度文本显示当前操作
                const progressText = document.querySelector('.progress-text');
                if (progressText) {
                    progressText.textContent = `正在转换 ${this.webpFiles[i].name}...`;
                }
                
                const result = await this.convertToWebP(this.webpFiles[i], quality);
                result.originalIndex = i;
                result.originalName = this.webpFiles[i].name;
                
                // 如果启用自动上传，则上传到图床
                if (autoUpload && result.success) {
                    try {
                        // 更新进度文本显示上传操作
                        if (progressText) {
                            progressText.textContent = `正在上传 ${result.file.name}...`;
                        }
                        
                        const uploadResult = await this.uploadToImageHost(result.file);
                        if (uploadResult.success) {
                            result.uploadUrl = uploadResult.url;
                            result.uploadSrc = uploadResult.src;
                            result.uploaded = true;
                            console.log(`文件 ${result.file.name} 上传成功:`, uploadResult.url);
                        } else {
                            throw new Error('上传返回失败状态');
                        }
                    } catch (uploadError) {
                        console.error(`文件 ${result.file.name} 上传失败:`, uploadError);
                        result.uploadError = uploadError.message;
                        result.uploaded = false;
                    }
                }
                
                this.processedResults.push(result);
                successCount++;
                
            } catch (error) {
                console.error(`文件 ${this.webpFiles[i].name} 转换失败:`, error);
                this.processedResults.push({
                    originalIndex: i,
                    originalName: this.webpFiles[i].name,
                    success: false,
                    error: error.message
                });
                failedCount++;
            }
            
            // 更新进度
            this.webpProgressCurrent.textContent = (i + 1).toString();
            const progress = ((i + 1) / this.webpFiles.length) * 100;
            this.webpProgressFill.style.width = progress + '%';
            
            // 恢复进度文本
            const progressText = document.querySelector('.progress-text');
            if (progressText) {
                progressText.textContent = `${Math.round(progress)}% 完成`;
            }
        }
        
        // 转换完成
        this.isProcessing = false;
        this.showResults(successCount, failedCount);
        this.updateInterface();
        
        // 如果启用了自动上传，显示上传结果统计
        if (autoUpload) {
            const uploadedCount = this.processedResults.filter(r => r.uploaded).length;
            const uploadFailedCount = this.processedResults.filter(r => r.success && !r.uploaded).length;
            
            if (uploadedCount > 0) {
                this.showNotification(`转换并上传完成：${uploadedCount} 个文件已上传到图床`, 'success');
            }
            
            if (uploadFailedCount > 0) {
                this.showNotification(`注意：${uploadFailedCount} 个文件转换成功但上传失败`, 'warning');
            }
        }
    }

    async convertToWebP(file, quality) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = async () => {
                try {
                    // 使用现有的ImageProcessor
                    const processor = new ImageProcessor();
                    processor.init(img);
                    
                    // 生成新文件名
                    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
                    const newFileName = `${nameWithoutExt}.webp`;
                    
                    // 转换为WebP
                    const webpFile = await processor.getProcessedImageFile(newFileName, 'image/webp', quality);
                    
                    resolve({
                        success: true,
                        file: webpFile,
                        dataUrl: processor.getProcessedImageDataURL('image/webp', quality),
                        originalSize: file.size,
                        newSize: webpFile.size,
                        compressionRatio: ((file.size - webpFile.size) / file.size * 100).toFixed(1)
                    });
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = () => {
                reject(new Error('图片加载失败'));
            };
            
            // 加载图片
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    async uploadToImageHost(file) {
        // 使用现有的上传功能，集成认证头
        const formData = new FormData();
        formData.append('file', file); // 使用'file'而不是'files'
        
        try {
            // 获取认证头（如果用户已登录）
            const headers = {};
            const authToken = localStorage.getItem('authToken');
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }
            
            console.log('上传WebP文件:', file.name, '大小:', this.formatFileSize(file.size));
            console.log('认证状态:', authToken ? '已登录' : '匿名上传');
            
            const response = await fetch('/upload', { // 使用'/upload'而不是'/api/upload'
                method: 'POST',
                headers: headers,
                body: formData
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('上传响应错误:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('上传成功:', result);
            
            // 检查返回格式
            if (result && result.length > 0 && result[0].src) {
                const fileUrl = window.location.origin + result[0].src;
                return {
                    success: true,
                    url: fileUrl,
                    src: result[0].src
                };
            } else {
                throw new Error('上传响应格式异常');
            }
        } catch (error) {
            console.error('上传失败详细信息:', error);
            throw new Error(`上传失败: ${error.message}`);
        }
    }

    showResults(successCount, failedCount) {
        // 隐藏进度，显示结果
        this.webpProgress.style.display = 'none';
        this.webpResults.style.display = 'block';
        
        // 更新统计信息
        this.webpSuccessCount.textContent = successCount;
        this.webpFailedCount.textContent = failedCount;
        
        // 生成结果列表
        this.generateResultsList();
        
        // 显示下载按钮
        if (successCount > 0) {
            this.webpDownloadBtn.style.display = 'flex';
        }
        
        // 检查是否有上传成功的文件，显示批量复制链接按钮
        const uploadedCount = this.processedResults.filter(r => r.uploaded).length;
        if (uploadedCount > 0) {
            // 创建或更新批量复制按钮
            let copyAllBtn = document.getElementById('webpCopyAllBtn');
            if (!copyAllBtn) {
                copyAllBtn = document.createElement('button');
                copyAllBtn.id = 'webpCopyAllBtn';
                copyAllBtn.className = 'tool-btn tool-btn-secondary';
                copyAllBtn.onclick = () => this.copyAllUploadedUrls();
                this.webpDownloadBtn.parentNode.insertBefore(copyAllBtn, this.webpDownloadBtn.nextSibling);
            }
            copyAllBtn.innerHTML = `
                <i class="ri-links-line"></i>
                <span>复制所有链接 (${uploadedCount})</span>
            `;
            copyAllBtn.style.display = 'flex';
        }
        
        this.showNotification(`转换完成：成功 ${successCount} 个，失败 ${failedCount} 个`, 'success');
    }

    generateResultsList() {
        this.webpResultsContent.innerHTML = '';
        
        this.processedResults.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = `result-item ${result.success ? 'success' : 'failed'}`;
            
            if (result.success) {
                resultItem.innerHTML = `
                    <div class="result-preview">
                        <img src="${result.dataUrl}" alt="${result.originalName}">
                    </div>
                    <div class="result-info">
                        <div class="result-name">${result.file.name}</div>
                        <div class="result-stats">
                            <span>原始大小: ${this.formatFileSize(result.originalSize)}</span>
                            <span>压缩后: ${this.formatFileSize(result.newSize)}</span>
                            <span class="compression-ratio">节省 ${result.compressionRatio}%</span>
                        </div>
                        ${result.uploaded ? 
                            `<div class="upload-info">
                                <i class="ri-check-circle-line"></i>
                                <span>已上传到图床</span>
                                <a href="${result.uploadUrl}" target="_blank" class="view-link">
                                    <i class="ri-external-link-line"></i>
                                </a>
                            </div>
                            <div class="link-actions">
                                <div class="link-group">
                                    <label>图床链接:</label>
                                    <div class="link-input-group">
                                        <input type="text" value="${result.uploadUrl}" readonly class="link-input">
                                        <button class="copy-url-btn" onclick="multiToolMenu.copyUrl('${result.uploadUrl}')">
                                            <i class="ri-file-copy-line"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>` : 
                            ''}
                        ${result.uploadError ? 
                            `<div class="upload-error">
                                <i class="ri-error-warning-line"></i>
                                <span>上传失败: ${result.uploadError}</span>
                            </div>` : 
                            ''}
                        ${!result.uploaded && !result.uploadError && this.webpAutoUpload.checked ? 
                            `<div class="upload-pending">
                                <i class="ri-time-line"></i>
                                <span>等待上传...</span>
                            </div>` : 
                            ''}
                    </div>
                    <div class="result-actions">
                        <button class="download-single-btn" onclick="multiToolMenu.downloadSingle(${result.originalIndex})" title="下载文件">
                            <i class="ri-download-line"></i>
                        </button>
                        ${result.uploaded ? 
                            `<button class="share-single-btn" onclick="multiToolMenu.shareUrl('${result.uploadUrl}')" title="分享链接">
                                <i class="ri-share-line"></i>
                            </button>` : 
                            ''}
                    </div>
                `;
            } else {
                resultItem.innerHTML = `
                    <div class="result-preview error">
                        <i class="ri-error-warning-line"></i>
                    </div>
                    <div class="result-info">
                        <div class="result-name">${result.originalName}</div>
                        <div class="result-error">错误: ${result.error}</div>
                    </div>
                `;
            }
            
            this.webpResultsContent.appendChild(resultItem);
        });
    }

    downloadResults() {
        const successfulResults = this.processedResults.filter(result => result.success);
        
        if (successfulResults.length === 0) {
            this.showNotification('没有可下载的文件', 'warning');
            return;
        }
        
        if (successfulResults.length === 1) {
            // 单个文件直接下载
            this.downloadFile(successfulResults[0].file);
        } else {
            // 多个文件打包下载
            this.downloadAsZip(successfulResults);
        }
    }

    downloadSingle(index) {
        const result = this.processedResults.find(r => r.originalIndex === index);
        if (result && result.success) {
            this.downloadFile(result.file);
        }
    }

    downloadFile(file) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async downloadAsZip(results) {
        // 这里可以使用JSZip库来创建压缩包
        // 为了简化，暂时逐个下载
        this.showNotification('正在准备下载...', 'info');
        
        for (const result of results) {
            this.downloadFile(result.file);
            // 添加小延迟避免浏览器阻止多个下载
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    copyUrl(url) {
        navigator.clipboard.writeText(url).then(() => {
            this.showNotification('链接已复制到剪贴板', 'success');
        }).catch(() => {
            // 降级方案：使用传统方法复制
            const textarea = document.createElement('textarea');
            textarea.value = url;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showNotification('链接已复制到剪贴板', 'success');
        });
    }

    shareUrl(url) {
        if (navigator.share) {
            // 使用原生分享API（如果支持）
            navigator.share({
                title: 'WebP图片分享',
                text: '查看这张WebP格式的图片',
                url: url
            }).catch((error) => {
                console.log('分享失败:', error);
                // 分享失败时复制链接
                this.copyUrl(url);
            });
        } else {
            // 降级到复制链接
            this.copyUrl(url);
        }
    }

    // 批量复制所有上传成功的链接
    copyAllUploadedUrls() {
        const uploadedResults = this.processedResults.filter(r => r.uploaded);
        
        if (uploadedResults.length === 0) {
            this.showNotification('没有已上传的文件', 'warning');
            return;
        }
        
        const urls = uploadedResults.map(r => r.uploadUrl).join('\n');
        
        navigator.clipboard.writeText(urls).then(() => {
            this.showNotification(`已复制 ${uploadedResults.length} 个图床链接`, 'success');
        }).catch(() => {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = urls;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showNotification(`已复制 ${uploadedResults.length} 个图床链接`, 'success');
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        // 可以集成现有的通知系统
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // 简单的通知实现
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: var(--tool-primary-color);
            color: white;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease;
        `;
        
        if (type === 'success') {
            notification.style.background = 'var(--tool-success-color)';
        } else if (type === 'warning') {
            notification.style.background = 'var(--tool-warning-color)';
        } else if (type === 'error') {
            notification.style.background = 'var(--tool-danger-color)';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// 全局实例
let multiToolMenu;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    multiToolMenu = new MultiToolMenu();
});

// 导出到全局作用域以便在HTML中使用
window.multiToolMenu = multiToolMenu; 