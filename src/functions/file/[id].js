import { verifyToken } from '../utils/auth';

export async function fileHandler(c) {
    const env = c.env;
    const id = c.req.param('id');
    const url = new URL(c.req.url);
    const shareToken = url.searchParams.get('token');

    try {
        // 处理KV元数据，检查权限
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
                        accessControl: 'public' // 默认公开访问
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
                userId: record.metadata.userId || "anonymous",
                accessControl: record.metadata.accessControl || 'public',
                shares: record.metadata.shares || []
            };

            // 根据ListType和Label处理
            if (metadata.ListType === "Block" || metadata.Label === "adult") {
                const referer = c.req.header('Referer');
                if (referer) {
                    return c.redirect('/images/blocked.png');
                } else {
                    return c.redirect('/block-img.html');
                }
            }

            // 检查访问权限
            if (metadata.accessControl !== 'public') {
                // 获取当前用户（如果已登录）
                const authHeader = c.req.header('Authorization');
                let currentUserId = null;

                if (authHeader && authHeader.startsWith('Bearer ')) {
                    try {
                        const token = authHeader.substring(7);
                        const { valid, payload } = await verifyToken(token, c.env);
                        if (valid) {
                            currentUserId = payload.id;
                        }
                    } catch (error) {
                        console.error('验证令牌错误:', error);
                    }
                }

                // 检查是否是文件所有者
                const isOwner = currentUserId && currentUserId === metadata.userId;

                // 如果不是所有者，检查是否通过分享链接访问
                let hasShareAccess = false;

                if (shareToken) {
                    // 检查分享令牌是否有效
                    const shareRecord = await env.img_url.get(`share:${shareToken}`, { type: 'json' });

                    if (shareRecord && shareRecord.imageId === id) {
                        // 检查分享是否过期
                        if (!shareRecord.expiresAt || shareRecord.expiresAt > Date.now()) {
                            // 检查分享类型
                            if (shareRecord.shareType === 'public') {
                                hasShareAccess = true;
                            } else if (shareRecord.shareType === 'specific_users' && currentUserId) {
                                // 检查用户是否在允许列表中
                                hasShareAccess = shareRecord.allowedUsers.includes(currentUserId);
                            }

                            // 更新访问计数
                            if (hasShareAccess) {
                                shareRecord.accessCount += 1;
                                shareRecord.lastAccessedAt = Date.now();
                                await env.img_url.put(`share:${shareToken}`, JSON.stringify(shareRecord));
                            }
                        }
                    }
                }

                // 如果既不是所有者也没有分享访问权限，则拒绝访问
                if (!isOwner && !hasShareAccess) {
                    return c.json({ error: '无权访问此文件' }, 403);
                }
            }

            // 保存元数据
            await env.img_url.put(id, "", { metadata });
        }

        // 尝试处理通过Telegram Bot API上传的文件
        if (id.length > 30 || id.includes('.')) { // 长ID通常代表通过Bot上传的文件，或包含扩展名的文件
            const fileId = id.split('.')[0]; // 分离文件ID和扩展名
            const filePath = await getFilePath(env, fileId);

            if (filePath) {
                const telegramFileUrl = `https://api.telegram.org/file/bot${env.TG_Bot_Token}/${filePath}`;
                return await proxyFile(c, telegramFileUrl);
            }
        } else {
            // 处理Telegraph链接
            const telegraphUrl = `https://telegra.ph/file/${id}`;
            return await proxyFile(c, telegraphUrl);
        }

        // 如果所有尝试都失败，返回404
        return c.text('文件不存在', 404);
    } catch (error) {
        console.error('文件访问错误:', error);
        return c.text('服务器错误', 500);
    }
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