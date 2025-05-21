/**
 * 分享页面的JavaScript逻辑
 */
document.addEventListener('DOMContentLoaded', () => {
    // 初始化分享页面
    initSharePage();
});

// 初始化分享页面
async function initSharePage() {
    try {
        // 从URL获取分享ID
        const shareId = getShareIdFromUrl();
        
        if (!shareId) {
            showError('无效的分享链接');
            return;
        }
        
        // 获取分享信息
        const shareInfo = await getShareInfo(shareId);
        
        if (!shareInfo) {
            showError('无法获取分享信息');
            return;
        }
        
        // 根据分享类型处理
        handleShareAccess(shareInfo, shareId);
    } catch (error) {
        console.error('初始化分享页面错误:', error);
        showError('加载分享内容时出错');
    }
}

// 从URL获取分享ID
function getShareIdFromUrl() {
    const pathParts = window.location.pathname.split('/');
    // 预期URL格式: /share/{shareId}
    if (pathParts.length >= 3 && pathParts[1] === 'share') {
        return pathParts[2];
    }
    return null;
}

// 获取分享信息
async function getShareInfo(shareId) {
    try {
        const response = await fetch(`/api/shares/${shareId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                showError('分享链接不存在或已过期');
            } else if (response.status === 410) {
                showError('分享链接已过期');
            } else {
                showError('获取分享信息失败');
            }
            return null;
        }
        
        const data = await response.json();
        return data.shareInfo;
    } catch (error) {
        console.error('获取分享信息错误:', error);
        return null;
    }
}

// 处理分享访问
function handleShareAccess(shareInfo, shareId) {
    // 根据分享类型显示不同的界面
    if (shareInfo.requiresPassword) {
        // 显示密码输入表单
        showPasswordForm(shareId);
    } else if (shareInfo.shareType === 'specific_users') {
        // 检查用户是否已登录
        const isLoggedIn = checkAuth();
        
        if (isLoggedIn) {
            // 尝试访问分享内容
            accessSharedImage(shareId);
        } else {
            // 显示访问被拒绝界面
            showAccessDenied();
        }
    } else {
        // 公开分享，直接访问
        accessSharedImage(shareId);
    }
}

// 显示密码输入表单
function showPasswordForm(shareId) {
    const passwordForm = document.getElementById('passwordForm');
    const submitButton = document.getElementById('submitPassword');
    const passwordInput = document.getElementById('sharePassword');
    const passwordError = document.getElementById('passwordError');
    
    // 显示密码表单
    passwordForm.style.display = 'block';
    
    // 添加提交事件
    submitButton.addEventListener('click', async () => {
        const password = passwordInput.value.trim();
        
        if (!password) {
            passwordError.textContent = '请输入密码';
            passwordError.style.display = 'block';
            return;
        }
        
        try {
            // 尝试访问受密码保护的图片
            const result = await accessSharedImage(shareId, password);
            
            if (!result.success) {
                passwordError.textContent = '密码错误';
                passwordError.style.display = 'block';
            }
        } catch (error) {
            console.error('访问分享图片错误:', error);
            passwordError.textContent = '访问失败，请重试';
            passwordError.style.display = 'block';
        }
    });
    
    // 添加回车键提交
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitButton.click();
        }
    });
}

// 显示访问被拒绝界面
function showAccessDenied() {
    document.getElementById('accessDenied').style.display = 'block';
}

// 访问分享图片
async function accessSharedImage(shareId, password = null) {
    try {
        const headers = {
            'Content-Type': 'application/json',
            ...getAuthHeader()
        };
        
        const response = await fetch(`/api/shares/${shareId}/access`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ password })
        });
        
        if (!response.ok) {
            if (response.status === 403) {
                showAccessDenied();
                return { success: false };
            }
            
            showError('访问分享内容失败');
            return { success: false };
        }
        
        const data = await response.json();
        
        if (data.success) {
            // 显示分享内容
            showSharedContent(data.imageId, data.accessUrl);
            return { success: true };
        } else {
            showError(data.error || '访问分享内容失败');
            return { success: false };
        }
    } catch (error) {
        console.error('访问分享图片错误:', error);
        showError('访问分享内容时出错');
        return { success: false };
    }
}

// 显示分享内容
async function showSharedContent(imageId, accessUrl) {
    try {
        // 隐藏其他界面
        document.getElementById('passwordForm').style.display = 'none';
        document.getElementById('accessDenied').style.display = 'none';
        
        // 显示分享内容
        const shareContent = document.getElementById('shareContent');
        shareContent.style.display = 'block';
        
        // 设置图片
        const sharedImage = document.getElementById('sharedImage');
        sharedImage.src = accessUrl;
        
        // 获取图片元数据
        const response = await fetch(accessUrl, {
            method: 'HEAD'
        });
        
        // 设置文件信息
        if (response.ok) {
            const contentType = response.headers.get('Content-Type') || '-';
            const contentLength = response.headers.get('Content-Length') || '0';
            const lastModified = response.headers.get('Last-Modified') || '-';
            
            document.getElementById('fileName').textContent = `文件名: ${imageId.split('.')[0]}`;
            document.getElementById('fileSize').textContent = `文件大小: ${formatFileSize(parseInt(contentLength))}`;
            document.getElementById('uploadDate').textContent = `上传时间: ${new Date(lastModified).toLocaleString()}`;
        }
        
        // 设置下载按钮
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = accessUrl;
            a.download = imageId.split('.')[0];
            a.click();
        });
        
        // 设置复制链接按钮
        const copyLinkBtn = document.getElementById('copyLinkBtn');
        copyLinkBtn.addEventListener('click', () => {
            const tempInput = document.createElement('input');
            tempInput.value = window.location.origin + accessUrl;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            
            // 显示复制成功提示
            const originalText = copyLinkBtn.innerHTML;
            copyLinkBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                已复制!
            `;
            setTimeout(() => {
                copyLinkBtn.innerHTML = originalText;
            }, 2000);
        });
    } catch (error) {
        console.error('显示分享内容错误:', error);
        showError('加载分享内容时出错');
    }
}

// 显示错误信息
function showError(message) {
    // 创建错误提示
    const errorContainer = document.createElement('div');
    errorContainer.className = 'access-denied';
    errorContainer.innerHTML = `
        <h2>出错了</h2>
        <p>${message}</p>
        <p><a href="/" class="login-link">返回首页</a></p>
    `;
    
    // 清空并添加到主内容区
    const main = document.querySelector('main');
    main.innerHTML = '';
    main.appendChild(errorContainer);
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
