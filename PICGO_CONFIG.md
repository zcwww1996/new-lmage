# PicGo 自定义图床配置说明

## 🎯 概述

您的 TG-Image 图床现在支持作为 PicGo 的自定义图床使用！

## ⚙️ PicGo 配置步骤

### 1. 安装 PicGo
下载并安装 [PicGo](https://github.com/Molunerfinn/PicGo/releases)

### 2. 配置自定义图床

在 PicGo 设置中选择 **"自定义Web图床"**，填入以下配置：

```json
{
  "url": "https://your-domain.workers.dev/api/picgo/upload",
  "paramName": "file",
  "jsonPath": "data.url",
  "customHeader": {
    "User-Agent": "PicGo"
  },
  "customBody": {}
}
```

### 3. 配置参数说明

| 参数 | 值 | 说明 |
|------|----|----|
| **API地址** | `https://your-domain.workers.dev/api/picgo/upload` | 替换为您的实际域名 |
| **POST参数名** | `file` | 上传文件的字段名 |
| **JSON路径** | `data.url` | 返回图片URL的JSON路径 |
| **自定义请求头** | `{"User-Agent": "PicGo"}` | 可选，标识请求来源 |
| **自定义Body** | `{}` | 留空即可 |

### 4. 获取您的域名

部署完成后，您的域名格式通常为：
- `your-worker-name.your-username.workers.dev`
- 或您绑定的自定义域名

## 🎨 PicGo 插件推荐

为了更好的体验，推荐安装以下 PicGo 插件：

- **picgo-plugin-rename-file** - 自动重命名文件
- **picgo-plugin-compress** - 图片压缩
- **picgo-plugin-watermark** - 添加水印

## 🚀 快速测试

1. 在 PicGo 中配置好自定义图床
2. 截图或选择一张图片
3. 点击上传按钮
4. 成功后会自动复制图片链接到剪贴板

## 📋 API响应格式

成功响应：
```json
{
  "success": true,
  "message": "上传成功",
  "data": {
    "url": "https://your-domain.workers.dev/file/xxx.jpg",
    "delete": "https://your-domain.workers.dev/file/xxx.jpg"
  }
}
```

失败响应：
```json
{
  "success": false,
  "message": "错误信息"
}
```

## 🔧 故障排除

### 上传失败
1. 检查域名是否正确
2. 确认 Telegram Bot Token 配置正确
3. 检查网络连接

### 配置错误
1. 确认 JSON 路径为 `data.url`
2. 检查 POST 参数名为 `file`
3. 验证 API 地址格式

## 🎯 高级配置

### 自定义上传参数
如需自定义上传行为，可以在 PicGo 的自定义Body中添加：

```json
{
  "quality": "high",
  "resize": false
}
```

### 批量上传
PicGo 支持批量上传，您的图床会自动处理多个文件。

---

🎉 **配置完成后，您就可以享受便捷的 PicGo + TG-Image 图床体验了！** 