"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
}

const features: FeatureCard[] = [
  {
    id: "compress",
    title: "图片压缩",
    description: "智能压缩图片大小，保持高质量的同时大幅减少文件体积",
    icon: "🗜️",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: "remove-bg",
    title: "抠图去背景",
    description: "AI智能识别主体，一键去除背景，支持透明PNG输出",
    icon: "✂️",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: "recognize",
    title: "图片识别",
    description: "强大的AI图像识别，提取文字、识别物体、分析内容",
    icon: "🔍",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    id: "ai-generate",
    title: "AI生图",
    description: "基于文本描述生成高质量图片，创意无限可能",
    icon: "🎨",
    gradient: "from-orange-500 to-red-500"
  }
];

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const router = useRouter();

  const handleFeatureClick = (featureId: string) => {
    console.log(`导航到功能: ${featureId}`);
    if (featureId === 'compress') {
      router.push('/compress');
    } else if (featureId === 'remove-bg') {
      router.push('/remove-bg');
    } else if (featureId === 'recognize') {
      router.push('/image-recognition');
    } else if (featureId === 'ai-generate') {
      router.push('/ai-generate');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              图片处理大师
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              专业的AI驱动图片处理平台，提供压缩、抠图、识别、生成等全方位服务
            </p>
          </div>
        </div>
      </header>

      {/* Main Features Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`relative group cursor-pointer transition-all duration-300 transform ${
                hoveredCard === feature.id ? "scale-105 -translate-y-2" : "hover:scale-102"
              }`}
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleFeatureClick(feature.id)}
            >
              {/* Card Background */}
              <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 p-8 h-full">
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  
                  {/* Action Button */}
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                    <span>立即使用</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                
                {/* Hover Effect Border */}
                <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500 transition-colors duration-300`} />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <p className="text-gray-500 dark:text-gray-400">
              © 2024 图片处理大师. 基于最新AI技术驱动的专业图片处理平台
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
