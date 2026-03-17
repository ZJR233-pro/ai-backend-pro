import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    message: "✅ 后端部署成功！可以正常访问！"
  });
});

// 图片生成接口
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, error: "请输入提示词" });

    const imageUrl = `https://picsum.photos/1024/1024?random=${Date.now()}`;
    return res.json({
      success: true,
      url: imageUrl,
      message: "图片生成成功"
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "服务异常" });
  }
});

// 视频生成接口
app.post('/api/generate-video', async (req, res) => {
  try {
    return res.json({
      success: true,
      url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      message: "视频生成成功"
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "服务异常" });
  }
});

// 对口型接口
app.post('/api/generate-lipsync', async (req, res) => {
  try {
    return res.json({
      success: true,
      url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      message: "对口型生成成功"
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "服务异常" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 服务启动成功，端口：${PORT}`);
});
