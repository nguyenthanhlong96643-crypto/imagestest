// 火山引擎API图片测试脚本 - 使用合适尺寸的图片
const fs = require('fs');
const https = require('https');

// 读取.env.local文件中的API Key
function getApiKey() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const match = envContent.match(/ARK_API_KEY=(.+)/);
    if (match && match[1]) {
      return match[1];
    }
  } catch (error) {
    console.error('读取.env.local文件失败:', error);
  }
  return null;
}

// 测试API调用
async function testApiCall() {
  console.log('=== 火山引擎API图片测试 ===\n');
  
  // 获取API Key
  const apiKey = getApiKey();
  console.log('API Key状态:', apiKey ? '已获取' : '未获取');
  if (!apiKey) {
    console.error('未找到API Key，请检查.env.local文件');
    return;
  }
  
  // 使用一个符合尺寸要求的16x16像素PNG图片的base64编码
  // 这满足API要求的最小14像素尺寸
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABWUlEQVR4XpWWB67c2BUFb3g557T/hRo9/WUMZHlgr4Bg8Z4qQgQJlHI4A8SzFVrapvmTF9O7dmYRFZ60YiBhJRCgh1FYhiLAmdvX0CzTOpNE77ME0Zty/nWWzchDtiqrmQDeuv3powQ5ta2eN0FY0InkqDD73lT9c9lEzwUNqgFHs9VQce3TVClFCQrSTfOiYkVJQBmpbq2L6iZavPnAPcoU0dSw0SUTqz/GtrGuXfbyyBniKykOWQWGqwwMA7QiYAxi+IlPdqo+hYHnUt5ZPfnsHJyNiDtnpJyayNBkF6cWoYGAMY92U2hXHF/C1M8uP/ZtYdiuj26UdAdQQSXQErwSOMzt/XWRWAz5GuSBIkwG1H3FabJ2OsUOUhGC6tK4EMtJO0ttC6IBD3kM0ve0tJwMdSfjZo+EEISaeTr9P3wYrGjXqyC1krcKdhMpxEnt5JetoulscpyzhXN5FRpuPHvbeQaKxFAEB6EN+cYN6xD7RYGpXpNndMmZgM5Dcs3YSNFDHUo2LGfZuukSWyUYirJAdYbF3MfqEKmjM+I2EfhA94iG3L7uKrR+GdWD73ydlIB+6hgref1QTlmgmbM3/LeX5GI1Ux1RWpgxpLuZ2+I+IjzZ8wqE4nilvQdkUdfhzI5QDWy+kw5Wgg2pGpeEVeCCA7b85BO3F9DzxB3cdqvBzWcmzbyMiqhzuYqtHRVG2y4x+KOlnyqla8AoWWpuBoYRxzXrfKuILl6SfiWCbjxoZJUaCBj1CjH7GIaDbc9kqBY3W/Rgjda1iqQcOJu2WW+76pZC9QG7M00dffe9hNnseupFL53r8F7YHSwJWUKP2q+k7RdsxyOB11n0xtOvnW4irMMFNV4H0uqwS5ExsmP9AxbDTc9JwgneAT5vTiUSm1E7BSflSt3bfa1tv8Di3R8n3Af7MNWzs49hmauE2wP+ttrq+AsWpFG2awvsuOqbipWHgtuvuaAE+A1Z/7gC9hesnr+7wqCwG8c5yAg3AL1fm8T9AZtp/bbJGwl1pNrE7RuOX7PeMRUERVaPpEs+yqeoSmuOlokqw49pgomjLeh7icHNlG19yjs6XXOMedYm5xH2YxpV2tc0RoZJgUa4aIXJcZ2dBoLbVTyxo61Yx+hX6HHjRg+WVl5rX1ZWV1h1h12W5WoWkX5SiXpSgXLlA29vZ2VtZw1Udbuxl9jOhJFIkP2pLpvjOaZxZHJJJyI9cjzHJtlgXlOlyOJt5k+yOCD9fr18rb29vbWaYD70gt6jUYhGjqaC6JoDBZWm0ZTYnWZ/Wn5yJFhKio+Mjp6enl3+PJLIkO8Lb/Es6VyjuWPJqP60B0JvOZg7N2dH8V164xYs4J0kT+hXHupFgG0upz2pPjOaY65pMn5bI16qO+qP2uDV1ZFYWjX58n88q71qT60hsxYtJqS2qM7ZbL0rH0L1KAV0e0t1qz/9n4v3793Q7i+OB1VqdOq5vTtctqNJqJ9bP64k7ZkD71I8OvdM1qDkA2qF2q1a9Yv1KdOq0g7s1e3tLRpI0qGpOq4M2aB60h+1KAuZgG1KAq6pX6qW1ZgD7yDfDkP9nHcX1zcXAo9u1a1W3OaqFp1qM6JgD0qz60Rq9Xb28u6uZ0JzVQAAAABJRU5ErkJggg==';
  
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
              url: `data:image/png;base64,${testImageBase64}`
            }
          }
        ]
      }
    ]
  };
  
  try {
    console.log('准备发送请求...');
    console.log('请求URL:', 'https://ark.cn-beijing.volces.com/api/v3/chat/completions');
    console.log('请求体大小:', Buffer.from(JSON.stringify(requestBody)).length, '字节');
    
    // 使用https模块发送请求（Node.js原生方式）
    const options = {
      hostname: 'ark.cn-beijing.volces.com',
      port: 443,
      path: '/api/v3/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.from(JSON.stringify(requestBody)).length
      }
    };
    
    const req = https.request(options, (res) => {
      console.log(`状态码: ${res.statusCode}`);
      console.log('响应头:', JSON.stringify(res.headers));
      
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('响应体:', responseData);
        try {
          const data = JSON.parse(responseData);
          if (data.error) {
            console.error('API错误:', data.error.message);
          } else if (data.choices && data.choices.length > 0) {
            console.log('识别结果:', data.choices[0].message?.content || '无内容');
          }
        } catch (e) {
          console.error('解析响应失败:', e);
        }
      });
    });
    
    req.on('error', (e) => {
      console.error('请求错误:', e.message);
      console.error('完整错误信息:', e);
      
      // 网络错误类型分析
      if (e.code === 'ETIMEDOUT') {
        console.log('可能原因: 连接超时，请检查网络连接或API服务器状态');
      } else if (e.code === 'ENOTFOUND') {
        console.log('可能原因: 无法解析域名，请检查DNS设置');
      } else if (e.code === 'ECONNREFUSED') {
        console.log('可能原因: 连接被拒绝，请检查API地址和端口是否正确');
      } else {
        console.log('可能原因: 网络连接问题或防火墙限制');
      }
    });
    
    // 设置请求超时
    req.setTimeout(30000, () => {
      req.abort();
      console.error('请求超时: 超过30秒没有响应');
    });
    
    // 发送请求体
    req.write(JSON.stringify(requestBody));
    req.end();
    
  } catch (error) {
    console.error('API调用异常:', error.message);
  }
}

// 运行测试
console.log('=== 开始网络连接测试 ===');

// 先测试基本网络连接
https.get('https://www.baidu.com', (res) => {
  console.log('百度连接测试成功，状态码:', res.statusCode);
  res.resume(); // 消耗响应数据以释放内存
  
  // 等待一会儿再开始API测试
  setTimeout(() => {
    testApiCall();
  }, 1000);
}).on('error', (e) => {
  console.error('网络连接测试失败:', e.message);
  console.error('请检查您的网络连接');
});