import { errorHandling, telemetryData } from "./utils/middleware";

/**
 * PicGo自定义图床适配接口
 * 遵循PicGo自定义图床的标准响应格式
 */
export async function picgoUpload(c) {
    const env = c.env;

    try {
        const formData = await c.req.formData();

        // 错误处理和遥测数据
        await errorHandling(c);
        telemetryData(c);

        // PicGo通常使用'file'字段上传图片
        const uploadFile = formData.get('file');
        if (!uploadFile) {
            return c.json({
                success: false,
                message: '未找到上传文件'
            }, 400);
        }

        const fileName = uploadFile.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();

        const telegramFormData = new FormData();
        telegramFormData.append("chat_id", env.TG_Chat_ID);
        
        // 使用sendDocument保持原图质量
        telegramFormData.append("document", uploadFile);

        const result = await sendToTelegram(telegramFormData, 'sendDocument', env);

        if (!result.success) {
            return c.json({
                success: false,
                message: result.error || '上传失败'
            }, 500);
        }

        const fileId = getFileId(result.data);
        if (!fileId) {
            return c.json({
                success: false,
                message: '获取文件ID失败'
            }, 500);
        }

        // 保存文件信息到KV存储
        const fileKey = `${fileId}.${fileExtension}`;
        const timestamp = Date.now();

        if (env.img_url) {
            const metadata = {
                TimeStamp: timestamp,
                ListType: "PicGo",
                Label: "PicGo上传",
                liked: false,
                fileName: fileName,
                fileSize: uploadFile.size,
                userId: "picgo"
            };

            await env.img_url.put(fileKey, "", { metadata });
        }

        // 构建完整的图片URL
        const imageUrl = `${new URL(c.req.url).origin}/file/${fileKey}`;

        // 返回PicGo标准格式响应
        return c.json({
            success: true,
            message: '上传成功',
            data: {
                url: imageUrl,
                delete: imageUrl // 可选：删除链接
            }
        });

    } catch (error) {
        console.error('PicGo上传错误:', error);
        return c.json({
            success: false,
            message: error.message || '服务器内部错误'
        }, 500);
    }
}

function getFileId(response) {
    if (!response.ok || !response.result) return null;

    const result = response.result;
    if (result.document) return result.document.file_id;
    if (result.photo) {
        return result.photo.reduce((prev, current) =>
            (prev.file_size > current.file_size) ? prev : current
        ).file_id;
    }
    if (result.video) return result.video.file_id;
    if (result.audio) return result.audio.file_id;

    return null;
}

async function sendToTelegram(formData, apiEndpoint, env, retryCount = 0) {
    const MAX_RETRIES = 2;
    const apiUrl = `https://api.telegram.org/bot${env.TG_Bot_Token}/${apiEndpoint}`;

    try {
        const response = await fetch(apiUrl, { method: "POST", body: formData });
        const responseData = await response.json();

        if (response.ok) {
            return { success: true, data: responseData };
        }

        return {
            success: false,
            error: responseData.description || '上传到Telegram失败'
        };
    } catch (error) {
        console.error('网络错误:', error);
        if (retryCount < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return await sendToTelegram(formData, apiEndpoint, env, retryCount + 1);
        }
        return { success: false, error: '发生网络错误' };
    }
} 