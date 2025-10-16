"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

// 抠图去背景功能页面
const RemoveBackgroundPage = () => {
  const router = useRouter();
  // 状态管理
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  
  // 文件上传的input引用
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API配置
  const API_KEY = 'JiGBS4zUwcPbJYEFizTC5Btr';
  const API_URL = 'https://api.remove.bg/v1.0/removebg';

  // 处理文件上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      setErrorMessage('请上传有效的图片文件');
      return;
    }

    // 检查文件大小（限制为10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrorMessage('文件大小不能超过10MB');
      return;
    }

    // 清除错误信息
    setErrorMessage(null);
    
    // 设置文件并生成预览
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResultUrl(null); // 清除之前的处理结果
    setProgress(null);
  };

  // 去除背景
  const removeBackground = async () => {
    if (!selectedFile || !previewUrl) return;

    setIsProcessing(true);
    setProgress(0);
    setErrorMessage(null);

    try {
      // 创建FormData
      const formData = new FormData();
      formData.append('image_file', selectedFile);
      formData.append('size', 'auto');

      // 发送请求到API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY
        },
        body: formData,
        signal: AbortSignal.timeout(60000) // 60秒超时
      });

      // 检查响应状态
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API请求失败: ${response.status} ${errorText}`);
      }

      // 获取响应的二进制数据
      const blob = await response.blob();
      
      // 生成结果图片的URL
      const resultImageUrl = URL.createObjectURL(blob);
      setResultUrl(resultImageUrl);
      setProgress(100);

    } catch (error) {
      console.error('去除背景失败:', error);
      setErrorMessage(`去除背景失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setProgress(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // 下载处理后的图片
  const downloadResult = () => {
    if (!resultUrl) return;

    // 创建一个下载链接
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `no-bg_${selectedFile?.name.replace(/\.[^/.]+$/, '') || 'image'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 打开文件选择对话框
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // 处理拖放
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      setErrorMessage('请上传有效的图片文件');
      return;
    }

    // 检查文件大小（限制为10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrorMessage('文件大小不能超过10MB');
      return;
    }

    // 清除错误信息
    setErrorMessage(null);
    
    // 设置文件并生成预览
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResultUrl(null); // 清除之前的处理结果
    setProgress(null);
  };

  // 处理拖放悬停
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
            抠图去背景
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            AI智能识别主体，一键去除背景，支持透明PNG输出
          </p>
        </div>

        {/* 错误信息显示 */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* 主要内容区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* 上传区域 */}
          <div className={`p-8 ${selectedFile ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
            {!selectedFile ? (
              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                onClick={triggerFileSelect}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  拖放或点击上传图片
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  支持 JPG、PNG、WebP 格式，最大支持 10MB
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={previewUrl || undefined} 
                    alt="预览图" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {selectedFile.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    大小: {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={triggerFileSelect}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      更换图片
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setResultUrl(null);
                        setProgress(null);
                      }}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    >
                      移除图片
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 处理按钮区域 */}
          {selectedFile && !resultUrl && (
            <div className={`p-8 ${progress !== null ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
              <button
                onClick={removeBackground}
                disabled={isProcessing}
                className={`w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? (
                  <>正在处理...</>
                ) : (
                  <>一键去除背景</>
                )}
              </button>

              {/* 进度条 */}
              {progress !== null && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      处理进度
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                    处理时间可能因图片大小和服务器响应时间而异
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 处理结果区域 */}
          {resultUrl && (
            <div className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                处理结果
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* 原图 */}
                <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                  <h4 className="text-gray-700 dark:text-gray-300 font-medium mb-3 text-center">
                    原图
                  </h4>
                  <div className="bg-white dark:bg-gray-700 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600">
                    <img 
                      src={previewUrl || undefined} 
                      alt="原图" 
                      className="w-full object-contain max-h-60"
                    />
                  </div>
                </div>
                {/* 去背景后 */}
                <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                  <h4 className="text-gray-700 dark:text-gray-300 font-medium mb-3 text-center">
                    去背景后
                  </h4>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 p-4">
                    <img 
                      src={resultUrl} 
                      alt="去背景后图片" 
                      className="w-full object-contain max-h-60 mx-auto"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={downloadResult}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                下载透明背景图片
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoveBackgroundPage;