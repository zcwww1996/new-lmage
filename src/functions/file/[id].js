export async function fileHandler(c) {
    const env = c.env;
    const id = c.req.param('id');
    const url = new URL(c.req.url);
    
    // 检查是否为下载请求
    const isDownload = url.searchParams.get('download') === 'true';
    
    // 检查是否为预览请求
    const isPreview = url.searchParams.get('preview') === 'true';
    
    // 检查是否为浏览器直接访问（而非嵌入、API调用等）
    const userAgent = c.req.header('User-Agent') || '';
    const accept = c.req.header('Accept') || '';
    const referer = c.req.header('Referer') || '';
    
    // 判断是否为浏览器直接访问：
    // 1. Accept头包含text/html
    // 2. 没有referer或referer不是图片嵌入
    // 3. 不是下载请求
    const isBrowserDirectAccess = !isDownload && 
                                  accept.includes('text/html') && 
                                  !accept.includes('image/') &&
                                  (!referer || !referer.includes('image'));

    try {
        let fileUrl = null;
        
        // 尝试处理通过Telegram Bot API上传的文件
        if (id.length > 30 || id.includes('.')) { // 长ID通常代表通过Bot上传的文件，或包含扩展名的文件
            const fileId = id.split('.')[0]; // 分离文件ID和扩展名
            const filePath = await getFilePath(env, fileId);

            if (filePath) {
                fileUrl = `https://api.telegram.org/file/bot${env.TG_Bot_Token}/${filePath}`;
            }
        } else {
            // 处理Telegraph链接
            fileUrl = `https://telegra.ph/file/${id}`;
        }

        // 如果找到文件URL
        if (fileUrl) {
            // 如果是预览请求，返回预览页面
            if (isPreview) {
                return createPreviewPage(c, id, fileUrl);
            }
            
            // 否则返回原图文件（包括下载和直接访问）
            return await proxyFile(c, fileUrl);
        }

        // 处理KV元数据
        if (env.img_url) {
            let record = await env.img_url.getWithMetadata(id);

            if (!record || !record.metadata) {
                // 初始化元数据（如不存在）
                record = {
                    metadata: {
                        ListType: "None",
                        Label: "None",
                        TimeStamp: Date.now(),
                        liked: false,
                        fileName: id,
                        fileSize: 0,
                    }
                };
                await env.img_url.put(id, "", { metadata: record.metadata });
            }

            const metadata = {
                ListType: record.metadata.ListType || "None",
                Label: record.metadata.Label || "None",
                TimeStamp: record.metadata.TimeStamp || Date.now(),
                liked: record.metadata.liked !== undefined ? record.metadata.liked : false,
                fileName: record.metadata.fileName || id,
                fileSize: record.metadata.fileSize || 0,
            };

            // 根据ListType和Label处理
            if (metadata.ListType === "Block" || metadata.Label === "adult") {
                if (referer) {
                    return c.redirect('/images/blocked.png');
                } else {
                    return c.redirect('/block-img.html');
                }
            }

            // 保存元数据
            await env.img_url.put(id, "", { metadata });
        }

        // 如果所有尝试都失败，返回404
        return c.text('文件不存在', 404);
    } catch (error) {
        console.error('文件访问错误:', error);
        return c.text('服务器错误', 500);
    }
}

/**
 * 创建图片预览页面
 */
function createPreviewPage(c, id, imageUrl) {
    const currentUrl = new URL(c.req.url);
    const baseUrl = `${currentUrl.protocol}//${currentUrl.host}`;
    const downloadUrl = `${baseUrl}/file/${id}?download=true`;
    
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>图片预览 - TG-Image</title>
    <meta name="description" content="图片预览">
    <link rel="icon" href="${baseUrl}/images/favicon.ico" type="image/x-icon">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: #000;
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
        }
        
        .preview-container {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: zoom-in;
        }
        
        .preview-container.fullscreen {
            cursor: zoom-out;
        }
        
        .preview-image {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            transition: all 0.3s ease;
        }
        
        .preview-image.fullscreen {
            max-width: 100%;
            max-height: 100%;
            border-radius: 0;
        }
        
        .controls {
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
            z-index: 1000;
        }
        
        .control-btn {
            width: 50px;
            height: 50px;
            background: rgba(67, 97, 238, 0.9);
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }
        
        .control-btn:hover {
            background: rgba(67, 97, 238, 1);
            transform: scale(1.1);
        }
        
        .control-btn.large {
            width: 60px;
            height: 60px;
            font-size: 24px;
        }
        
        .info-panel {
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 15px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
            font-size: 14px;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            z-index: 1000;
        }
        
        .info-panel.show {
            opacity: 1;
            transform: translateY(0);
        }
        
        .info-item {
            margin-bottom: 5px;
        }
        
        .info-item:last-child {
            margin-bottom: 0;
        }
        
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid #4361ee;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .error {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            font-size: 18px;
            opacity: 0.7;
        }
        
        .hotkeys {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
            font-size: 12px;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
            z-index: 1000;
        }
        
        .hotkeys.show {
            opacity: 1;
            transform: translateY(0);
        }
        
        @media (max-width: 768px) {
            .controls {
                bottom: 15px;
                right: 15px;
                gap: 8px;
            }
            
            .control-btn {
                width: 45px;
                height: 45px;
                font-size: 18px;
            }
            
            .control-btn.large {
                width: 50px;
                height: 50px;
                font-size: 20px;
            }
            
            .info-panel {
                top: 15px;
                left: 15px;
                right: 15px;
                font-size: 13px;
            }
            
            .hotkeys {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="preview-container" id="previewContainer">
        <div class="loading" id="loading">
            <div class="loading-spinner"></div>
            <div>加载中...</div>
        </div>
        <img class="preview-image" id="previewImage" style="display: none;" />
        <div class="error" id="error" style="display: none;">
            图片加载失败<br>
            <small>请检查网络连接或稍后重试</small>
        </div>
    </div>
    
    <div class="info-panel" id="infoPanel">
        <div class="info-item"><strong>文件名:</strong> <span id="fileName">${id}</span></div>
        <div class="info-item"><strong>尺寸:</strong> <span id="dimensions">-</span></div>
        <div class="info-item"><strong>类型:</strong> <span id="fileType">-</span></div>
    </div>
    
    <div class="controls">
        <button class="control-btn" id="infoBtn" onclick="toggleInfo()" title="显示/隐藏信息 (I)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
        </button>
        <button class="control-btn" id="fullscreenBtn" onclick="toggleFullscreen()" title="全屏查看 (F)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
        </button>
        <button class="control-btn large" id="downloadBtn" onclick="downloadImage()" title="下载原图 (D)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
        </button>
    </div>
    
    <div class="hotkeys" id="hotkeys">
        <div><kbd>F</kbd> 全屏 <kbd>I</kbd> 信息 <kbd>D</kbd> 下载 <kbd>ESC</kbd> 关闭</div>
    </div>

    <script>
        const imageUrl = '${imageUrl}';
        const downloadUrl = '${downloadUrl}';
        const previewImage = document.getElementById('previewImage');
        const previewContainer = document.getElementById('previewContainer');
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        const infoPanel = document.getElementById('infoPanel');
        const hotkeys = document.getElementById('hotkeys');
        
        let isFullscreen = false;
        let infoVisible = false;
        
        // 加载图片
        previewImage.onload = function() {
            loading.style.display = 'none';
            previewImage.style.display = 'block';
            
            // 更新图片信息
            updateImageInfo();
            
            // 显示快捷键提示
            setTimeout(() => {
                hotkeys.classList.add('show');
                setTimeout(() => {
                    hotkeys.classList.remove('show');
                }, 3000);
            }, 1000);
        };
        
        previewImage.onerror = function() {
            loading.style.display = 'none';
            error.style.display = 'block';
        };
        
        previewImage.src = imageUrl;
        
        // 更新图片信息
        function updateImageInfo() {
            document.getElementById('dimensions').textContent = 
                previewImage.naturalWidth + ' × ' + previewImage.naturalHeight;
            
            // 从URL推断文件类型
            const extension = imageUrl.split('.').pop().toLowerCase();
            const typeMap = {
                'jpg': 'JPEG',
                'jpeg': 'JPEG', 
                'png': 'PNG',
                'gif': 'GIF',
                'webp': 'WebP',
                'svg': 'SVG'
            };
            document.getElementById('fileType').textContent = typeMap[extension] || '未知';
        }
        
        // 切换信息面板
        function toggleInfo() {
            infoVisible = !infoVisible;
            if (infoVisible) {
                infoPanel.classList.add('show');
            } else {
                infoPanel.classList.remove('show');
            }
        }
        
        // 切换全屏
        function toggleFullscreen() {
            isFullscreen = !isFullscreen;
            if (isFullscreen) {
                previewContainer.classList.add('fullscreen');
                previewImage.classList.add('fullscreen');
            } else {
                previewContainer.classList.remove('fullscreen');
                previewImage.classList.remove('fullscreen');
            }
        }
        
        // 下载图片
        function downloadImage() {
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = '${id}';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        // 点击图片切换全屏
        previewContainer.addEventListener('click', function(e) {
            if (e.target === previewImage || e.target === previewContainer) {
                toggleFullscreen();
            }
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', function(e) {
            switch(e.key.toLowerCase()) {
                case 'escape':
                    if (isFullscreen) {
                        toggleFullscreen();
                    } else {
                        window.close();
                    }
                    break;
                case 'f':
                    toggleFullscreen();
                    break;
                case 'd':
                    downloadImage();
                    break;
                case 'i':
                    toggleInfo();
                    break;
            }
        });
        
        // 防止右键菜单
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    </script>
</body>
</html>`;

    return c.html(html);
}

/**
 * 获取Telegram文件路径
 */
async function getFilePath(env, fileId) {
    try {
        const url = `https://api.telegram.org/bot${env.TG_Bot_Token}/getFile?file_id=${fileId}`;
        const res = await fetch(url, {
            method: 'GET',
        });

        if (!res.ok) {
            console.error(`HTTP错误! 状态: ${res.status}`);
            return null;
        }

        const responseData = await res.json();
        const { ok, result } = responseData;

        if (ok && result) {
            return result.file_path;
        } else {
            console.error('响应数据错误:', responseData);
            return null;
        }
    } catch (error) {
        console.error('获取文件路径错误:', error.message);
        return null;
    }
}

/**
 * 代理文件请求
 * 直接传递原始文件内容，不进行压缩，确保原图质量
 */
async function proxyFile(c, fileUrl) {
    const response = await fetch(fileUrl, {
        method: c.req.method,
        headers: c.req.headers
    });

    if (!response.ok) {
        return c.text('文件获取失败', response.status);
    }

    const headers = new Headers();
    response.headers.forEach((value, key) => {
        headers.set(key, value);
    });

    // 添加缓存控制
    headers.set('Cache-Control', 'public, max-age=31536000');

    // 确保设置正确的Content-Type，以便浏览器能够预览图片
    const contentType = response.headers.get('Content-Type');
    if (contentType) {
        headers.set('Content-Type', contentType);
    } else {
        // 根据URL推断内容类型
        const fileExtension = fileUrl.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg'].includes(fileExtension)) {
            headers.set('Content-Type', 'image/jpeg');
        } else if (fileExtension === 'png') {
            headers.set('Content-Type', 'image/png');
        } else if (fileExtension === 'gif') {
            headers.set('Content-Type', 'image/gif');
        } else if (fileExtension === 'webp') {
            headers.set('Content-Type', 'image/webp');
        } else if (fileExtension === 'svg') {
            headers.set('Content-Type', 'image/svg+xml');
        }
    }

    // 移除Content-Disposition头或设置为inline，确保浏览器预览而不是下载
    headers.set('Content-Disposition', 'inline');

    return new Response(response.body, {
        status: response.status,
        headers
    });
}