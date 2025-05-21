/**
 * 图片分享相关API
 */
import { errorHandling, telemetryData } from '../utils/middleware';
import { authMiddleware } from '../utils/auth';

// 创建分享链接
export async function createShareLink(c) {
  try {
    // 错误处理和遥测数据
    await errorHandling(c);
    telemetryData(c);

    const user = c.get('user');
    const userId = user.id;
    
    // 获取请求数据
    const { imageId, shareType, password, expiresAt, allowedUsers } = await c.req.json();
    
    if (!imageId) {
      return c.json({ error: '图片ID不能为空' }, 400);
    }
    
    // 验证分享类型
    const validShareTypes = ['public', 'password', 'private', 'specific_users'];
    if (!validShareTypes.includes(shareType)) {
      return c.json({ error: '无效的分享类型' }, 400);
    }
    
    // 如果是密码保护，确保提供了密码
    if (shareType === 'password' && !password) {
      return c.json({ error: '密码保护的分享必须提供密码' }, 400);
    }
    
    // 如果是特定用户，确保提供了用户列表
    if (shareType === 'specific_users' && (!allowedUsers || !Array.isArray(allowedUsers) || allowedUsers.length === 0)) {
      return c.json({ error: '特定用户分享必须提供允许的用户列表' }, 400);
    }
    
    // 获取图片元数据，确认所有权
    const fileMetadata = await c.env.img_url.getWithMetadata(imageId);
    
    // 检查图片是否存在
    if (!fileMetadata || !fileMetadata.metadata) {
      return c.json({ error: '图片不存在' }, 404);
    }
    
    // 检查图片所有权
    if (fileMetadata.metadata.userId !== userId) {
      return c.json({ error: '无权分享此图片' }, 403);
    }
    
    // 生成唯一的分享ID
    const shareId = crypto.randomUUID();
    
    // 创建分享记录
    const shareRecord = {
      id: shareId,
      imageId,
      ownerId: userId,
      shareType,
      password: shareType === 'password' ? password : null,
      allowedUsers: shareType === 'specific_users' ? allowedUsers : null,
      createdAt: Date.now(),
      expiresAt: expiresAt || null,
      accessCount: 0,
      lastAccessedAt: null
    };
    
    // 保存分享记录
    await c.env.img_url.put(`share:${shareId}`, JSON.stringify(shareRecord));
    
    // 更新图片元数据，添加分享信息
    const updatedMetadata = {
      ...fileMetadata.metadata,
      shares: [...(fileMetadata.metadata.shares || []), shareId]
    };
    
    await c.env.img_url.put(imageId, "", { metadata: updatedMetadata });
    
    // 构建分享链接
    const shareUrl = `${new URL(c.req.url).origin}/share/${shareId}`;
    
    return c.json({
      message: '分享链接创建成功',
      shareId,
      shareUrl,
      shareRecord: {
        ...shareRecord,
        password: shareRecord.password ? '******' : null // 不返回实际密码
      }
    });
  } catch (error) {
    console.error('创建分享链接错误:', error);
    return c.json({ error: '创建分享链接失败' }, 500);
  }
}

// 获取分享信息
export async function getShareInfo(c) {
  try {
    // 错误处理和遥测数据
    await errorHandling(c);
    telemetryData(c);
    
    const shareId = c.req.param('id');
    
    if (!shareId) {
      return c.json({ error: '分享ID不能为空' }, 400);
    }
    
    // 获取分享记录
    const shareRecord = await c.env.img_url.get(`share:${shareId}`, { type: 'json' });
    
    if (!shareRecord) {
      return c.json({ error: '分享链接不存在或已过期' }, 404);
    }
    
    // 检查是否过期
    if (shareRecord.expiresAt && shareRecord.expiresAt < Date.now()) {
      return c.json({ error: '分享链接已过期' }, 410);
    }
    
    // 获取图片基本信息（不包含敏感数据）
    const imageMetadata = await c.env.img_url.getWithMetadata(shareRecord.imageId);
    
    if (!imageMetadata || !imageMetadata.metadata) {
      return c.json({ error: '图片不存在' }, 404);
    }
    
    // 返回分享信息（不包含密码等敏感信息）
    return c.json({
      shareInfo: {
        id: shareRecord.id,
        imageId: shareRecord.imageId,
        shareType: shareRecord.shareType,
        requiresPassword: shareRecord.shareType === 'password',
        createdAt: shareRecord.createdAt,
        expiresAt: shareRecord.expiresAt,
        imageInfo: {
          fileName: imageMetadata.metadata.fileName,
          fileSize: imageMetadata.metadata.fileSize,
          uploadTime: imageMetadata.metadata.TimeStamp
        }
      }
    });
  } catch (error) {
    console.error('获取分享信息错误:', error);
    return c.json({ error: '获取分享信息失败' }, 500);
  }
}

// 访问分享图片
export async function accessSharedImage(c) {
  try {
    // 错误处理和遥测数据
    await errorHandling(c);
    telemetryData(c);
    
    const shareId = c.req.param('id');
    const { password } = await c.req.json();
    
    if (!shareId) {
      return c.json({ error: '分享ID不能为空' }, 400);
    }
    
    // 获取分享记录
    const shareRecord = await c.env.img_url.get(`share:${shareId}`, { type: 'json' });
    
    if (!shareRecord) {
      return c.json({ error: '分享链接不存在或已过期' }, 404);
    }
    
    // 检查是否过期
    if (shareRecord.expiresAt && shareRecord.expiresAt < Date.now()) {
      return c.json({ error: '分享链接已过期' }, 410);
    }
    
    // 检查访问权限
    if (shareRecord.shareType === 'password' && password !== shareRecord.password) {
      return c.json({ error: '密码错误' }, 403);
    }
    
    if (shareRecord.shareType === 'specific_users') {
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
      
      // 检查用户是否在允许列表中
      if (!currentUserId || !shareRecord.allowedUsers.includes(currentUserId)) {
        return c.json({ error: '您没有权限访问此图片' }, 403);
      }
    }
    
    // 更新访问计数和最后访问时间
    shareRecord.accessCount += 1;
    shareRecord.lastAccessedAt = Date.now();
    
    await c.env.img_url.put(`share:${shareId}`, JSON.stringify(shareRecord));
    
    // 返回图片访问信息
    return c.json({
      success: true,
      imageId: shareRecord.imageId,
      accessUrl: `/file/${shareRecord.imageId}`
    });
  } catch (error) {
    console.error('访问分享图片错误:', error);
    return c.json({ error: '访问分享图片失败' }, 500);
  }
}

// 删除分享链接
export async function deleteShareLink(c) {
  try {
    // 错误处理和遥测数据
    await errorHandling(c);
    telemetryData(c);
    
    const user = c.get('user');
    const userId = user.id;
    const shareId = c.req.param('id');
    
    if (!shareId) {
      return c.json({ error: '分享ID不能为空' }, 400);
    }
    
    // 获取分享记录
    const shareRecord = await c.env.img_url.get(`share:${shareId}`, { type: 'json' });
    
    if (!shareRecord) {
      return c.json({ error: '分享链接不存在' }, 404);
    }
    
    // 检查所有权
    if (shareRecord.ownerId !== userId) {
      return c.json({ error: '无权删除此分享链接' }, 403);
    }
    
    // 获取图片元数据
    const imageMetadata = await c.env.img_url.getWithMetadata(shareRecord.imageId);
    
    if (imageMetadata && imageMetadata.metadata) {
      // 从图片元数据中移除分享ID
      const updatedShares = (imageMetadata.metadata.shares || []).filter(id => id !== shareId);
      
      const updatedMetadata = {
        ...imageMetadata.metadata,
        shares: updatedShares
      };
      
      await c.env.img_url.put(shareRecord.imageId, "", { metadata: updatedMetadata });
    }
    
    // 删除分享记录
    await c.env.img_url.delete(`share:${shareId}`);
    
    return c.json({ message: '分享链接已删除' });
  } catch (error) {
    console.error('删除分享链接错误:', error);
    return c.json({ error: '删除分享链接失败' }, 500);
  }
}

// 获取用户的所有分享链接
export async function getUserShares(c) {
  try {
    // 错误处理和遥测数据
    await errorHandling(c);
    telemetryData(c);
    
    const user = c.get('user');
    const userId = user.id;
    
    // 获取用户的图片列表
    const userFilesKey = `user:${userId}:files`;
    const userFiles = await c.env.img_url.get(userFilesKey, { type: 'json' }) || [];
    
    // 收集所有分享信息
    const shares = [];
    
    for (const file of userFiles) {
      // 获取图片元数据
      const imageMetadata = await c.env.img_url.getWithMetadata(file.id);
      
      if (imageMetadata && imageMetadata.metadata && imageMetadata.metadata.shares) {
        // 获取每个分享的详细信息
        for (const shareId of imageMetadata.metadata.shares) {
          const shareRecord = await c.env.img_url.get(`share:${shareId}`, { type: 'json' });
          
          if (shareRecord) {
            shares.push({
              ...shareRecord,
              password: shareRecord.password ? '******' : null, // 不返回实际密码
              imageInfo: {
                id: file.id,
                fileName: file.fileName,
                fileSize: file.fileSize,
                uploadTime: file.uploadTime,
                url: file.url
              }
            });
          }
        }
      }
    }
    
    return c.json({ shares });
  } catch (error) {
    console.error('获取用户分享链接错误:', error);
    return c.json({ error: '获取用户分享链接失败' }, 500);
  }
}
