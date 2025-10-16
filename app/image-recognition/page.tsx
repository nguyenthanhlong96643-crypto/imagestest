"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface UploadedImage {
  name: string;
  type: string;
  base64: string;
}

const ImageRecognitionPage: React.FC = () => {
  const router = useRouter();
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      // 提取base64内容（去掉data:image/xxx;base64,前缀）
      const base64Content = base64String.split(',')[1];
      
      setUploadedImage({
        name: file.name,
        type: file.type,
        base64: base64Content
      });
      setResult('');
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // 处理拖放
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      const base64Content = base64String.split(',')[1];
      
      setUploadedImage({
        name: file.name,
        type: file.type,
        base64: base64Content
      });
      setResult('');
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // 调用后端API进行图片识别
  const callVolcanoAPI = async () => {
    if (!uploadedImage) return;
    
    setIsProcessing(true);
    setError('');
    setResult('');

    try {
      console.log('图片base64数据长度:', uploadedImage.base64.length);

      // 构建请求体，发送到我们的后端API
      const requestBody = {
        imageBase64: uploadedImage.base64,
        imageType: uploadedImage.type
      };

      console.log('准备发送请求到后端API...');

      // 发送请求到我们的API路由，添加超时设置
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      const response = await fetch('/api/image-recognition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId); // 清除超时计时器

      console.log('后端API响应状态码:', response.status);
      
      // 解析响应数据
      const data = await response.json();
      
      // 检查响应是否成功
      if (!response.ok) {
        console.error('后端API调用失败，响应内容:', data);
        setError(data.error || `API调用失败: HTTP ${response.status}`);
        setIsProcessing(false);
        return;
      }

      console.log('后端API调用成功，响应数据:', data);

      // 检查是否有有效的结果
      if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message?.content || '无内容';
        setResult(content);
        console.log('识别结果:', content);
      } else {
        setError('未获取到有效的识别结果');
        console.log('未获取到有效的识别结果');
      }

    } catch (error) {
      console.error('API调用异常:', error);
      
      // 分类错误提示
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('请求超时，请检查网络连接或稍后重试');
        } else if (error.message.includes('NetworkError')) {
          setError('网络错误，请检查您的网络连接');
        } else if (error.message.includes('Failed to fetch')) {
          setError('无法连接到服务器，请检查网络连接');
        } else {
          setError(`请求失败: ${error.message}`);
        }
      } else {
        setError('请求失败，请稍后重试');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // 清除上传的图片
  const clearImage = () => {
    setUploadedImage(null);
    setResult('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            返回首页
          </button>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">图片识别</h1>
          <p className="text-gray-600 dark:text-gray-300">上传图片，让AI分析图片内容</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左侧：上传和预览区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">上传图片</h2>
            
            {/* 文件上传区域 */}
            {!uploadedImage ? (
              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*"
                  className="hidden"
                />
                <div className="mb-4 text-gray-500 dark:text-gray-400">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-300">点击或拖放图片到此处上传</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">支持 JPG、PNG、WEBP 等格式</p>
              </div>
            ) : (
              /* 图片预览区域 */
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img 
                    src={`data:${uploadedImage.type};base64,${uploadedImage.base64}`} 
                    alt="预览图片"
                    className="w-full h-auto object-cover"
                  />
                  <button 
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="清除图片"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{uploadedImage.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {(new Blob([uploadedImage.base64], {type: uploadedImage.type}).size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button 
                  onClick={callVolcanoAPI}
                  disabled={isProcessing}
                  className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-md hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>正在分析图片...</span>
                    </>
                  ) : (
                    <span>分析图片内容</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* 右侧：结果显示区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">分析结果</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
                {error}
              </div>
            )}
            
            {result ? (
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap break-words p-4 bg-gray-50 dark:bg-gray-900 rounded-md text-sm">
                  {result}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                <p>上传图片并点击分析按钮以查看结果</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 图片处理工具 | 提供图片压缩、抠图去背景、图片识别等功能</p>
        </div>
      </footer>
    </div>
  );
};

export default ImageRecognitionPage;