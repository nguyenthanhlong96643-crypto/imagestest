import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // 从请求体获取数据
    const body = await req.json();
    const { imageBase64, imageType } = body;

    // 获取API Key（服务器端可以安全访问）
    const apiKey = process.env.ARK_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key 未配置在服务器端' }, { status: 500 });
    }

    console.log('API Key 已加载，长度:', apiKey.length);
    console.log('收到图片识别请求，base64长度:', imageBase64?.length || 0);

    // 构建请求体
    const requestBody = {
      model: 'ep-20251011094623-w8wkt',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '图片主要讲了什么?'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${imageType};base64,${imageBase64}`
              }
            }
          ]
        }
      ]
    };

    // 发送请求到火山引擎API
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000) // 30秒超时
    });

    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      console.error('火山引擎API调用失败:', response.status, errorText);
      return NextResponse.json({ error: `API调用失败: HTTP ${response.status} - ${errorText}` }, { status: response.status });
    }

    // 返回API结果
    const data = await response.json();
    console.log('火山引擎API调用成功，返回结果');
    return NextResponse.json(data);

  } catch (error) {
    console.error('图片识别API错误:', error);
    
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        return NextResponse.json({ error: '请求超时，请稍后重试' }, { status: 504 });
      }
      return NextResponse.json({ error: `处理失败: ${error.message}` }, { status: 500 });
    }
    
    return NextResponse.json({ error: '处理失败，请稍后重试' }, { status: 500 });
  }
}