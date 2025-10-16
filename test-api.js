// 火山引擎API测试脚本
const fs = require('fs');
const path = require('path');

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
  console.log('开始测试火山引擎API调用...');
  
  // 获取API Key
  const apiKey = getApiKey();
  console.log('API Key状态:', apiKey ? '已获取' : '未获取');
  if (!apiKey) {
    console.error('未找到API Key，请检查.env.local文件');
    return;
  }
  
  // 准备测试数据（使用简单的base64编码图片）
  // 这里使用一个非常小的1x1像素的PNG图片的base64编码
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  
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
    
    // 发送请求
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      timeout: 30000 // 30秒超时
    });
    
    console.log('响应状态码:', response.status);
    
    // 检查响应是否成功
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API调用失败，响应内容:', errorText);
      return;
    }
    
    // 解析响应数据
    const data = await response.json();
    console.log('API调用成功，响应数据:', data);
    
    // 检查是否有有效的结果
    if (data.choices && data.choices.length > 0) {
      console.log('识别结果:', data.choices[0].message?.content || '无内容');
    } else {
      console.log('未获取到有效的识别结果');
    }
    
  } catch (error) {
    console.error('API调用异常:', error.name, error.message);
    console.error('完整错误信息:', error);
    
    // 提供可能的解决方案
    console.log('\n可能的解决方案:');
    console.log('1. 检查网络连接是否正常');
    console.log('2. 确认API Key是否有效');
    console.log('3. 检查API地址是否正确');
    console.log('4. 确认网络防火墙是否允许访问该API');
    console.log('5. 可能需要配置代理服务器');
  }
}

// 运行测试
console.log('=== 火山引擎API测试工具 ===\n');

// 首先测试网络连接
console.log('测试网络连接...');
fetch('https://www.baidu.com')
  .then(response => {
    console.log('网络连接测试成功，状态码:', response.status);
    return testApiCall();
  })
  .catch(error => {
    console.error('网络连接测试失败:', error.message);
    console.error('请检查您的网络连接');
  });