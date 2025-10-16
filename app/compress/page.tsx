"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

// 图片压缩功能页面
const ImageCompressionPage = () => {
  const router = useRouter();
  // 状态管理
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedPreviewUrl, setCompressedPreviewUrl] = useState<string | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<number>(70); // 默认压缩质量70%
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [originalSize, setOriginalSize] = useState<string>('');
  const [compressedSize, setCompressedSize] = useState<string>('');
  const [compressionRatio, setCompressionRatio] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // 文件上传的input引用
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setCompressedPreviewUrl(null); // 清除之前的压缩预览
    setCompressedSize('');
    setCompressionRatio('');
    
    // 显示原始文件大小
    setOriginalSize(formatFileSize(file.size));
  };

  // 处理压缩等级变化
  const handleCompressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompressionLevel(Number(e.target.value));
  };

  // 压缩图片
  const compressImage = () => {
    if (!selectedFile || !previewUrl) return;

    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // 设置画布大小（保持原尺寸）
      canvas.width = img.width;
      canvas.height = img.height;

      // 在画布上绘制图像
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // 使用canvas的toDataURL方法进行压缩
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsProcessing(false);
            return;
          }

          // 生成压缩后的预览URL
          const compressedUrl = URL.createObjectURL(blob);
          setCompressedPreviewUrl(compressedUrl);
          
          // 显示压缩后的文件大小和压缩率
          setCompressedSize(formatFileSize(blob.size));
          const ratio = ((1 - blob.size / selectedFile.size) * 100).toFixed(1);
          setCompressionRatio(`${ratio}%`);
          
          setIsProcessing(false);
        },
        selectedFile.type || 'image/jpeg',
        compressionLevel / 100 // 转换为0-1之间的值
      );
    };

    img.src = previewUrl;
  };

  // 下载压缩后的图片
  const downloadCompressedImage = () => {
    if (!compressedPreviewUrl) return;

    // 创建一个下载链接
    const link = document.createElement('a');
    link.href = compressedPreviewUrl;
    link.download = `compressed_${selectedFile?.name || 'image'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    else return `${(bytes / 1048576).toFixed(2)} MB`;
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
    setCompressedPreviewUrl(null); // 清除之前的压缩预览
    setCompressedSize('');
    setCompressionRatio('');
    
    // 显示原始文件大小
    setOriginalSize(formatFileSize(file.size));
  };

  // 处理拖放悬停
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
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

      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-4">
            图片压缩
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            智能压缩图片大小，保持高质量的同时大幅减少文件体积
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
                    大小: {originalSize} | 尺寸: 未知
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
                        setCompressedPreviewUrl(null);
                        setOriginalSize('');
                        setCompressedSize('');
                        setCompressionRatio('');
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

          {/* 压缩设置区域 */}
          {selectedFile && (
            <div className={`p-8 ${compressedPreviewUrl ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                压缩设置
              </h3>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-700 dark:text-gray-300 font-medium">
                    压缩质量: {compressionLevel}%
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {compressionLevel < 30 ? '高压缩率 (低质量)' : compressionLevel < 70 ? '平衡' : '高质量 (低压缩率)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={compressionLevel}
                  onChange={handleCompressionChange}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <button
                onClick={compressImage}
                disabled={isProcessing}
                className={`w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? (
                  <>处理中...</>
                ) : (
                  <>压缩图片</>
                )}
              </button>
            </div>
          )}

          {/* 压缩结果区域 */}
          {compressedPreviewUrl && (
            <div className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                压缩结果
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* 原图 */}
                <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                  <h4 className="text-gray-700 dark:text-gray-300 font-medium mb-3 text-center">
                    原图 ({originalSize})
                  </h4>
                  <div className="bg-white dark:bg-gray-700 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600">
                    <img 
                      src={previewUrl || undefined} 
                      alt="原图" 
                      className="w-full object-contain max-h-60"
                    />
                  </div>
                </div>
                {/* 压缩后 */}
                <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                  <h4 className="text-gray-700 dark:text-gray-300 font-medium mb-3 text-center">
                    压缩后 ({compressedSize}) - 节省 {compressionRatio}
                  </h4>
                  <div className="bg-white dark:bg-gray-700 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600">
                    <img 
                      src={compressedPreviewUrl} 
                      alt="压缩后图片" 
                      className="w-full object-contain max-h-60"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={downloadCompressedImage}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                下载压缩后的图片
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCompressionPage;