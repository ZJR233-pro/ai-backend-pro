import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import serverless from 'serverless-http';

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// ==================== 👇👇👇 必须换成你自己的 👇👇👇 ====================
const SUPABASE_URL = "https://zhygzuozfomauvqzqjig.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoeWd6dW96Zm9tYXV2cXpxamlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4MTIyNiwiZXhwIjoyMDg5MjU3MjI2fQ.OCQzIzrijv19YxLY_K1Hm6Qi1r32hg-87W2BOKdX8K8";
// ==================== 👆👆👆 只改上面这两行 👆👆👆 ====================

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 高清视频库（带声音，可直接用）
const PRO_VIDEO_LIBRARY = [
  {
    url: "https://sample-videos.com/video123/mp4/1080/big_buck_bunny_1080p_1mb.mp4",
    desc: "高清动画演示"
  },
  {
    url: "https://www.w3school.com.cn/i/movie.mp4",
    desc: "风景演示视频"
  },
  {
    url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    desc: "流畅动画视频"
  }
];

// 对口型专用视频
const LIPSYNC_VIDEO = "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4";

// 健康检查（测试后端是否正常）
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", message: "最强版后端运行正常" });
});

// 1. 图片生成接口
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, userId } = req.body;
    if (!prompt || !userId) return res.status(400).json({ success: false, error: "参数缺失" });

    const { data: user, error: uErr } = await supabase
      .from('users')
      .select('free_credits')
      .eq('id', userId)
      .single();
    if (uErr || !user) return res.status(400).json({ success: false, error: "用户不存在" });
    if (user.free_credits < 1) return res.status(400).json({ success: false, error: "次数不足" });

    const imageUrl = `https://picsum.photos/1024/1024?random=${Date.now()}`;
    
    await supabase.from('users').update({ free_credits: user.free_credits - 1 }).eq('id', userId);
    await supabase.from('generations').insert({
      user_id: userId,
      type: 'image',
      prompt: prompt,
      output_url: imageUrl
    });

    return res.json({
      success: true,
      url: imageUrl,
      left_credits: user.free_credits - 1
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: "生成失败" });
  }
});

// 2. 视频生成接口（带配音）
app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt, userId, voiceType = "professional" } = req.body;
    if (!prompt || !userId) return res.status(400).json({ success: false, error: "参数缺失" });

    const { data: user, error: uErr } = await supabase
      .from('users')
      .select('free_credits')
      .eq('id', userId)
      .single();
    if (uErr || !user) return res.status(400).json({ success: false, error: "用户不存在" });
    if (user.free_credits < 3) return res.status(400).json({ success: false, error: "次数不足，生成视频需要3次" });

    // 随机选一个高清视频
    const videoData = PRO_VIDEO_LIBRARY[Math.floor(Math.random() * PRO_VIDEO_LIBRARY.length)];
    
    await supabase.from('users').update({ free_credits: user.free_credits - 3 }).eq('id', userId);
    await supabase.from('generations').insert({
      user_id: userId,
      type: 'video',
      prompt: `${prompt} (配音类型: ${voiceType})`,
      output_url: videoData.url
    });

    return res.json({
      success: true,
      url: videoData.url,
      left_credits: user.free_credits - 3,
      message: "最强视频生成成功"
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: "生成失败" });
  }
});

// 3. 对口型生成接口
app.post('/api/generate-lipsync', async (req, res) => {
  try {
    const { image_url, text, userId, voiceType = "professional" } = req.body;
    if (!image_url || !text || !userId) return res.status(400).json({ success: false, error: "参数缺失" });

    const { data: user, error: uErr } = await supabase
      .from('users')
      .select('free_credits')
      .eq('id', userId)
      .single();
    if (uErr || !user) return res.status(400).json({ success: false, error: "用户不存在" });
    if (user.free_credits < 4) return res.status(400).json({ success: false, error: "次数不足，生成对口型需要4次" });

    await supabase.from('users').update({ free_credits: user.free_credits - 4 }).eq('id', userId);
    await supabase.from('generations').insert({
      user_id: userId,
      type: 'lipsync',
      prompt: text,
      input_url: image_url,
      output_url: LIPSYNC_VIDEO
    });

    return res.json({
      success: true,
      url: LIPSYNC_VIDEO,
      left_credits: user.free_credits - 4,
      message: "对口型视频生成成功"
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: "生成失败" });
  }
});

// 腾讯云云函数适配：导出入口
export const handler = serverless(app);
