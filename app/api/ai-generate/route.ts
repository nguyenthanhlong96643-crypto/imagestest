import { NextRequest, NextResponse } from 'next/server';

// 真实的火山引擎AI生图API路由
export async function POST(request: NextRequest) {
  try {
    // 获取请求体中的提示词
    const body = await request.json();
    const { prompt } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { error: '请提供提示词' },
        { status: 400 }
      );
    }
    
    // 获取环境变量中的API Key
    const apiKey = process.env.ARK_API_KEY;
    
    if (!apiKey) {
      console.error('环境变量中未配置ARK_API_KEY');
      return NextResponse.json(
        { error: 'API Key未配置，请检查.env.local文件' },
        { status: 500 }
      );
    }
    
    // 设置请求超时时间为30秒
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    // 调用火山引擎AI生图API
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'ep-20251011110054-8pg6q',
        prompt: prompt,
        sequential_image_generation: 'disabled',
        response_format: 'url',
        size: '2K',
        stream: false,
        watermark: true
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('火山引擎API请求失败:', { status: response.status, data: errorData });
      return NextResponse.json(
        { error: errorData.error?.message || `API请求失败: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('火山引擎API响应:', data);
    
    // 检查响应中是否包含图片URL
    if (data.data && data.data[0] && data.data[0].url) {
      const imageUrl = data.data[0].url;
      
      try {
        // 服务器端获取图片并转换为base64，避免前端跨域问题
        const imageResponse = await fetch(imageUrl);
        
        if (!imageResponse.ok) {
          console.error('获取图片失败:', imageResponse.status);
          // 如果获取base64失败，仍然返回URL作为备选方案
          return NextResponse.json({
            imageUrl: imageUrl,
            prompt,
            message: '图片生成成功，但无法优化下载功能'
          });
        }
        
        // 转换图片为base64
        const buffer = await imageResponse.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');
        const contentType = imageResponse.headers.get('content-type') || 'image/png';
        const base64Url = `data:${contentType};base64,${base64Image}`;
        
        return NextResponse.json({
          imageUrl: base64Url,
          isBase64: true,
          prompt,
          message: '图片生成成功'
        });
      } catch (imageError) {
        console.error('转换图片为base64时出错:', imageError);
        // 出错时仍返回原始URL
        return NextResponse.json({
          imageUrl: imageUrl,
          prompt,
          message: '图片生成成功'
        });
      }
    } else {
      console.error('API响应格式不正确:', data);
      return NextResponse.json(
        { error: 'API响应格式不正确' },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('AI生图API请求超时');
      return NextResponse.json(
        { error: '图片生成超时，请稍后重试' },
        { status: 504 }
      );
    }
    
    console.error('AI生图API错误:', error);
    return NextResponse.json(
      { error: error.message || '图片生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}