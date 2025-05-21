<div align="center">
  <img src="public/images/logo.svg" alt="TG-Image Logo" width="150">
  <h1>TG-Image 图床</h1>
  <p><strong>基于 Telegram 的现代化图片托管服务</strong></p>

  <p>
    <a href="#特性"><img src="https://img.shields.io/badge/特性-Features-blue?style=flat-square&logo=telegram" alt="特性"></a>
    <a href="#部署"><img src="https://img.shields.io/badge/部署-Deploy-orange?style=flat-square&logo=cloudflare" alt="部署"></a>
    <a href="#使用"><img src="https://img.shields.io/badge/使用-Usage-green?style=flat-square&logo=bookstack" alt="使用"></a>
    <a href="#更新"><img src="https://img.shields.io/badge/更新-Changelog-red?style=flat-square&logo=git" alt="更新"></a>
  </p>

  <p>TG-Image 提供免费、无限制的图床服务，支持原图上传与下载，<br>确保您的图片在分享过程中保持原始质量，不会被压缩或降低画质。</p>
</div>

---

## ✨ 特性

<table>
  <tr>
    <td align="center"><h3>🚀 高速上传</h3></td>
    <td align="center"><h3>📦 无限空间</h3></td>
    <td align="center"><h3>📸 原图保真</h3></td>
  </tr>
  <tr>
    <td>优化的上传流程，CDN全球加速</td>
    <td>基于Telegram存储，无容量限制</td>
    <td>保持原始质量，不压缩图片</td>
  </tr>
  <tr>
    <td align="center"><h3>🎨 现代界面</h3></td>
    <td align="center"><h3>👍 简单易用</h3></td>
    <td align="center"><h3>🔄 批量上传</h3></td>
  </tr>
  <tr>
    <td>精美UI，支持暗色模式</td>
    <td>拖放、粘贴上传，一键复制链接</td>
    <td>支持同时上传多张图片</td>
  </tr>
  <tr>
    <td align="center"><h3>🔐 用户系统</h3></td>
    <td align="center"><h3>🏷️ 图片管理</h3></td>
    <td align="center"><h3>📱 响应式设计</h3></td>
  </tr>
  <tr>
    <td>安全的用户认证，保护隐私</td>
    <td>支持图片列表、标签和搜索</td>
    <td>完美适配各种设备尺寸</td>
  </tr>
  <tr>
    <td align="center"><h3>📊 数据可视化</h3></td>
    <td align="center"><h3>⭐ 收藏功能</h3></td>
    <td align="center"><h3>🔀 多视图模式</h3></td>
  </tr>
  <tr>
    <td>直观图表展示上传趋势和存储使用</td>
    <td>标记和筛选您喜爱的图片</td>
    <td>网格、列表和时间线多种视图</td>
  </tr>
  <tr>
    <td align="center"><h3>↕️ 拖拽排序</h3></td>
    <td align="center"><h3>🔍 高级搜索</h3></td>
    <td align="center"><h3>🎭 自定义主题</h3></td>
  </tr>
  <tr>
    <td>自由调整图片顺序和排列方式</td>
    <td>按日期、大小、标签等多维度搜索</td>
    <td>个性化界面外观和布局</td>
  </tr>
</table>

## 🚀 部署

### 前提条件

- [Cloudflare](https://cloudflare.com) 账号
- Telegram Bot Token (通过 [@BotFather](https://t.me/BotFather) 创建)
- Telegram Chat ID (群组或频道)
- [Node.js](https://nodejs.org/) 环境

### 快速部署

```bash
# 1. 克隆仓库
git clone https://github.com/xiyewuqiu/new-lmage.git
cd new-lmage

# 2. 安装依赖
npm install

# 3. 登录 Cloudflare
npx wrangler login

# 4. 配置环境变量
# 修改 wrangler.toml 文件，填入 Telegram Bot Token、Chat ID 和 JWT 密钥

# 5. 一键部署
npm run setup
```

> **提示**：如需了解更多部署选项，请参阅 [Cloudflare Pages 部署配置](cloudflare-pages-config.md)。

## 📖 使用

### 匿名上传

1. 访问您的网站
2. 拖放图片到上传区域，或点击选择文件，也可直接 `Ctrl+V` 粘贴图片
3. 上传完成后，系统自动生成链接（原图质量）
4. 复制需要的链接格式（直接链接、HTML、Markdown）
5. 分享给他人，对方将看到原图，无任何压缩

### 用户功能

**登录后，您可以：**

- 查看和管理您上传的所有图片
- 为图片添加标签，方便分类
- 搜索您的图片（支持按文件名、标签、大小等多维度搜索）
- 批量上传多张图片
- 删除不需要的图片
- 收藏喜爱的图片并快速筛选
- 在网格、列表和时间线三种视图模式间切换
- 通过拖拽自定义图片排序
- 查看数据统计和使用趋势图表
- 自定义界面外观和布局

## 🖥️ 技术栈

<table>
  <tr>
    <td align="right"><strong>前端：</strong></td>
    <td>HTML5, CSS3, JavaScript, Chart.js, SortableJS</td>
  </tr>
  <tr>
    <td align="right"><strong>后端：</strong></td>
    <td>Cloudflare Workers, Hono</td>
  </tr>
  <tr>
    <td align="right"><strong>存储：</strong></td>
    <td>Telegram API, Cloudflare KV, LocalStorage</td>
  </tr>
  <tr>
    <td align="right"><strong>部署：</strong></td>
    <td>Wrangler CLI, Cloudflare Pages</td>
  </tr>
  <tr>
    <td align="right"><strong>数据可视化：</strong></td>
    <td>Chart.js, 自定义统计算法</td>
  </tr>
  <tr>
    <td align="right"><strong>UI/UX：</strong></td>
    <td>响应式设计, 暗色模式, 动画效果</td>
  </tr>
</table>

## 🛠️ 开发

```bash
# 启动本地开发服务器
npm run dev

# 构建项目
npm run build

# 部署到 Cloudflare Workers
npm run deploy
```

## 📝 更新日志

### 2025.05.21
- 📊 添加数据可视化功能（上传趋势和存储使用图表）
- 🔀 新增多视图模式（网格、列表、时间线三种视图）
- ⭐ 添加图片收藏功能和收藏过滤器
- ↕️ 实现拖拽排序功能和自定义排序
- 🎨 全面优化用户界面和交互体验
- 📱 增强移动端适配和响应式设计

### 2025.05.18
- 🌾 新增四个模块的美化
- ✨ 新增粘贴上传功能 (Ctrl+V)
- 🎬 添加粘贴上传视觉反馈动画
- 🔄 统一所有上传方式的处理流程

### 2025.05.14
- 🔐 实现用户认证系统（注册、登录、JWT认证）
- 🖼️ 添加图片管理功能（列表、搜索、批量上传）
- 📱 优化移动端体验
- ⚡ 提升页面加载速度和响应性

## 🤝 贡献

欢迎为 TG-Image 项目做出贡献！您可以：
- 报告问题或提交功能建议
- 改进UI/UX设计
- 完善文档
- 提交代码修复或新功能

**贡献流程**：Fork → 修改 → 提交 PR → 审核 → 合并

## 📄 许可证

本项目采用 **GNU Affero通用公共许可证v3.0 (AGPL-3.0) 附加 Commons Clause** 进行许可。

- 📝 **强制开源**：修改必须以相同许可证开源
- 🌐 **网络使用视为分发**：网络服务也需开源修改
- 💼 **禁止商业使用**：未经授权不得用于商业目的

> 如需商业使用，请联系项目作者获取商业许可。

## 📞 联系方式

- **GitHub Issues**：[创建Issue](https://github.com/xiyewuqiu/new-lmage/issues)
- **Email**：[xiyewuqiu@gmail.com](mailto:xiyewuqiu@gmail.com)

---

<div align="center">
  <p>感谢 <a href="https://telegram.org/">Telegram</a> 和 <a href="https://workers.cloudflare.com/">Cloudflare Workers</a> 提供技术支持</p>
  <p>© 2025 TG-Image 图床</p>
</div>
