import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import { authenticatedUpload } from './functions/upload';
import { fileHandler } from './functions/file/[id]';
import { register, login, getCurrentUser } from './functions/user/auth';
import { getUserImages, deleteUserImage, updateImageInfo, searchUserImages } from './functions/user/images';
import { createShareLink, getShareInfo, accessSharedImage, deleteShareLink, getUserShares } from './functions/share';
import { authMiddleware } from './functions/utils/auth';

const app = new Hono();

// 上传接口
app.post('/upload', authenticatedUpload);

// 文件访问接口
app.get('/file/:id', fileHandler);

// 分享页面路由
app.get('/share/:id', (c) => {
    return c.html(serveStatic({ path: './public/share.html' })(c));
});

// 根路径重定向到index.html
app.get('/', (c) => c.redirect('/index.html'));

// 静态文件服务 - 放在最后，确保其他路由先匹配
app.get('/*', serveStatic({ root: './' }));

// 用户认证相关API
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/user', authMiddleware, getCurrentUser);

// 用户图片管理相关API
app.get('/api/images', authMiddleware, getUserImages);
app.get('/api/images/search', authMiddleware, searchUserImages);
app.delete('/api/images/:id', authMiddleware, deleteUserImage);
app.put('/api/images/:id', authMiddleware, updateImageInfo);

// 分享相关API
app.post('/api/shares', authMiddleware, createShareLink);
app.get('/api/shares', authMiddleware, getUserShares);
app.get('/api/shares/:id', getShareInfo);
app.post('/api/shares/:id/access', accessSharedImage);
app.delete('/api/shares/:id', authMiddleware, deleteShareLink);

export default app;