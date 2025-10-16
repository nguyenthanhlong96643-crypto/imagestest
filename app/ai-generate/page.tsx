"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AIGeneratePage: React.FC = () => {
  const router = useRouter();
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  // 预设的提示词示例
  const promptExamples = [
    '星际穿越，黑洞，黑洞里冲出一辆快支离破碎的复古列车，抢视觉冲击力，电影大片',
    '阳光明媚的海滩，清澈的海水，白色的沙滩，远处有椰子树，蓝天白云',
    '未来城市，高楼大厦，悬浮汽车，霓虹灯闪烁，科技感十足',
    '森林中的小屋，周围环绕着参天大树，阳光透过树叶洒下斑驳的光影',
    '可爱的小猫，在阳光下睡觉，毛茸茸的，温暖的色调'
  ];

  // 调用后端AI生图API路由
  const generateImage = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError('');
    setGeneratedImage(null);

    try {
      // 调用后端API路由
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `API请求失败: ${response.status}`);
      }

      console.log('API响应:', data);

      // 检查响应中是否包含图片URL
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        
        // 保存到历史记录
        if (!promptHistory.includes(prompt)) {
          const newHistory = [prompt, ...promptHistory.slice(0, 9)]; // 只保留最近10条
          setPromptHistory(newHistory);
          localStorage.setItem('promptHistory', JSON.stringify(newHistory));
        }
      } else {
        throw new Error('API响应格式不正确');
      }
    } catch (err) {
      console.error('生成图片时出错:', err);
      setError(err.message || '生成图片失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 添加到历史记录
  const addToHistory = (newPrompt: string) => {
    setPromptHistory(prev => {
      const newHistory = [newPrompt, ...prev];
      // 只保留最近5条记录
      return newHistory.slice(0, 5);
    });
  };

  // 使用历史记录或示例提示词
  const usePrompt = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
  };

  // 下载生成的图片
  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      // 检查是否是base64格式的图片
      if (generatedImage.startsWith('data:image/')) {
        // 直接处理base64图片
        const a = document.createElement('a');
        a.href = generatedImage;
        
        // 从base64 URL中提取图片类型
        const typeMatch = generatedImage.match(/data:image\/(\w+);/);
        const extension = typeMatch ? typeMatch[1] : 'png';
        a.download = `ai-generated-${Date.now()}.${extension}`;
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
        }, 100);
        
        console.log('Base64图片下载成功');
      } else {
        // 处理普通URL图片
        const response = await fetch(generatedImage, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'image/*'
          }
        });

        // 检查响应状态
        if (!response.ok) {
          console.error('下载失败，HTTP状态:', response.status);
          setError(`下载失败，服务器返回状态: ${response.status}`);
          return;
        }

        const blob = await response.blob();
        
        // 检查blob是否有效
        if (!blob || blob.size === 0) {
          console.error('下载的图片为空');
          setError('下载的图片为空，请稍后重试');
          return;
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // 获取图片类型
        const imageType = blob.type || 'image/png';
        const extension = imageType.split('/')[1] || 'png';
        a.download = `ai-generated-${Date.now()}.${extension}`;
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
        
        console.log('URL图片下载成功');
      }
      
      // 清除可能的错误提示
      setError('');
    } catch (err) {
      console.error('下载图片时发生错误:', err);
      // 提供更详细的错误信息
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('网络请求失败，可能是跨域限制，请稍后重试');
      } else {
        setError(`下载失败: ${err.message || '未知错误'}`);
      }
    }
  };

  // 复制提示词
  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <nav className="bg-white dark:bg-gray-800 shadow-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md"></div>
            <span className="text-xl font-bold text-gray-800 dark:text-white">图片处理工具</span>
          </div>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            返回首页
          </button>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI 生图</h1>
          <p className="text-gray-600 dark:text-gray-300">输入提示词，让AI为您创作精美图片</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：提示词输入区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">输入提示词</h2>
              {prompt && (
                <button 
                  onClick={copyPrompt}
                  className="text-sm text-blue-500 hover:text-blue-600 flex items-center space-x-1"
                  aria-label="复制提示词"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <span>复制</span>
                </button>
              )}
            </div>

            <div className="mb-6">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="请输入详细的图片描述，越详细生成的图片越符合您的预期..."
                className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
              />
              <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{prompt.length} 字符</span>
                <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => setPrompt('')}>清空</span>
              </div>
            </div>

            {/* 提示词历史 */}
            {promptHistory.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">历史提示词</h3>
                <div className="flex flex-wrap gap-2">
                  {promptHistory.map((historyPrompt, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => usePrompt(historyPrompt)}
                    >
                      {historyPrompt.length > 20 ? `${historyPrompt.substring(0, 20)}...` : historyPrompt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 提示词示例 */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">提示词示例</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {promptExamples.map((example, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 dark:bg-gray-750 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => usePrompt(example)}
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {example}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={generateImage}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full mt-6 py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-md hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>正在生成图片...</span>
                </>
              ) : (
                <span>生成图片</span>
              )}
            </button>
          </div>

          {/* 右侧：结果显示区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">生成结果</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
                {error}
              </div>
            )}
            
            {generatedImage ? (
              <div className="space-y-4">
                <div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
                  <img 
                    src={generatedImage}
                    alt="AI生成的图片"
                    className="w-full h-auto max-h-[500px] object-contain"
                    onError={() => setError('图片加载失败')}
                  />
                </div>
                <div className="flex space-x-4">
                  <button 
                    onClick={downloadImage}
                    className="flex-1 py-3 px-4 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                    </svg>
                    <span>下载图片</span>
                  </button>
                  <button 
                    onClick={generateImage}
                    disabled={isGenerating}
                    className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                    )}
                    <span>重新生成</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500 dark:text-gray-400">
                {isGenerating ? (
                  // 重新生成时显示的等待提示
                  <>
                    <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
                      <svg className="animate-spin w-12 h-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <p className="text-lg">重新生成请等待</p>
                    <p className="text-sm mt-2">AI正在为您创建新的图片...</p>
                  </>
                ) : (
                  // 正常状态下的提示
                  <>
                    <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                      </svg>
                    </div>
                    <p className="text-lg">输入提示词并点击生成按钮</p>
                    <p className="text-sm mt-2">AI将根据您的描述创建精美图片</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 图片处理工具 | 提供图片压缩、抠图去背景、图片识别、AI生图等功能</p>
        </div>
      </footer>
    </div>
  );
};

export default AIGeneratePage;