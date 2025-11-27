import React from 'react';
import { Activity, TrendingDown, Zap } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="bg-brand-100 p-4 rounded-full mb-6">
        <Activity className="w-12 h-12 text-brand-600" />
      </div>
      <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">
        智能碳循环教练
      </h1>
      <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-8">
        科学定制你的 <span className="text-brand-600 font-bold">Carb Cycling</span> 计划。
        精准调控碳水摄入，最大化燃烧脂肪，保留肌肉。
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
          <Zap className="w-8 h-8 text-carb-high mb-2" />
          <h3 className="font-bold text-slate-800">高碳充能</h3>
          <p className="text-sm text-slate-500">高强度训练日补充糖原，提升运动表现。</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
          <TrendingDown className="w-8 h-8 text-carb-low mb-2" />
          <h3 className="font-bold text-slate-800">低碳燃脂</h3>
          <p className="text-sm text-slate-500">休息日降低胰岛素水平，加速脂肪氧化。</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
          <Activity className="w-8 h-8 text-brand-500 mb-2" />
          <h3 className="font-bold text-slate-800">智能追踪</h3>
          <p className="text-sm text-slate-500">AI 实时监控进度，动态调整计划。</p>
        </div>
      </div>

      <button
        onClick={onStart}
        className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all transform hover:scale-105"
      >
        立即开始定制计划
      </button>
    </div>
  );
};

export default Hero;