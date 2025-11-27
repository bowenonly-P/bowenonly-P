
import React, { useState } from 'react';
import { UserStats, Gender, ActivityLevel, CarbType, DayPreferenceType, WeeklyPreference } from '../types';
import { ChevronRight, Loader2, UserPen, Calendar, Settings2 } from 'lucide-react';

interface InputFormProps {
  onSubmit: (stats: UserStats, profileName: string) => void;
  isLoading: boolean;
}

const DAYS_OF_WEEK = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [profileName, setProfileName] = useState('我的碳循环计划');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [formData, setFormData] = useState<UserStats>({
    age: 30,
    gender: Gender.Male,
    height: 175,
    weight: 75,
    bodyFat: 20,
    activityLevel: ActivityLevel.Moderate,
    trainingDays: 4,
    targetBodyFat: 15,
    targetWeeks: 8
  });

  const [weeklyPreferences, setWeeklyPreferences] = useState<WeeklyPreference>(
    DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: '自动' }), {})
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'gender' || name === 'activityLevel' ? value : Number(value)
    }));
  };

  const handlePreferenceChange = (day: string, type: DayPreferenceType) => {
    setWeeklyPreferences(prev => ({
      ...prev,
      [day]: type
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      weeklyPreferences: showAdvanced ? weeklyPreferences : undefined
    }, profileName);
  };

  const getPreferenceColor = (type: DayPreferenceType) => {
    switch (type) {
      case CarbType.High: return 'bg-red-100 text-red-800 border-red-200 ring-2 ring-red-500';
      case CarbType.Medium: return 'bg-yellow-100 text-yellow-800 border-yellow-200 ring-2 ring-yellow-500';
      case CarbType.Low: return 'bg-green-100 text-green-800 border-green-200 ring-2 ring-green-500';
      default: return 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100';
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100 my-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800">建立你的身体档案</h2>
        <p className="text-slate-500">AI 将根据这些数据为你计算精准的代谢需求。</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Profile Name */}
        <div className="bg-brand-50 p-4 rounded-xl border border-brand-100">
           <label className="block text-sm font-bold text-brand-900 mb-2 flex items-center">
             <UserPen className="w-4 h-4 mr-2" />
             计划名称 / 用户昵称
           </label>
           <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              required
              placeholder="例如：张三的减脂计划"
              className="w-full p-3 rounded-lg border border-brand-200 focus:ring-2 focus:ring-brand-500"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Stats */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">性别</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
            >
              <option value={Gender.Male}>男</option>
              <option value={Gender.Female}>女</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">年龄</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">身高 (cm)</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">当前体重 (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">当前体脂率 (%)</label>
            <input
              type="number"
              name="bodyFat"
              value={formData.bodyFat}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
            />
          </div>

           <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">每周训练天数 (1-7)</label>
            <input
              type="number"
              name="trainingDays"
              min="1"
              max="7"
              value={formData.trainingDays}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">日常活动强度</label>
          <select
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 bg-white"
          >
            {Object.values(ActivityLevel).map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Schedule Preference Toggle */}
        <div className="pt-4 border-t border-slate-200">
           <button 
             type="button"
             onClick={() => setShowAdvanced(!showAdvanced)}
             className="flex items-center text-brand-600 font-semibold hover:text-brand-800 transition-colors"
           >
             <Settings2 className="w-5 h-5 mr-2" />
             {showAdvanced ? '收起自定义日程' : '自定义每日碳水安排 (可选)'}
           </button>

           {showAdvanced && (
             <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
               <div className="flex items-start space-x-2 mb-4">
                 <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                 <p className="text-sm text-slate-500">
                   默认情况下 AI 会自动安排。如果你有特定的训练习惯（例如：周六一定是高强度腿部训练），请强制指定该日为<span className="text-red-500 font-bold">高碳日</span>。
                 </p>
               </div>
               
               <div className="space-y-3">
                 {DAYS_OF_WEEK.map(day => (
                   <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-lg border border-slate-100">
                     <span className="font-bold text-slate-700 mb-2 sm:mb-0 w-20">{day}</span>
                     <div className="flex space-x-2 overflow-x-auto pb-1 sm:pb-0">
                       {(['自动', CarbType.High, CarbType.Medium, CarbType.Low] as DayPreferenceType[]).map((type) => (
                         <button
                           key={type}
                           type="button"
                           onClick={() => handlePreferenceChange(day, type)}
                           className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all whitespace-nowrap
                             ${weeklyPreferences[day] === type 
                               ? getPreferenceColor(type)
                               : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                             }`}
                         >
                           {type}
                         </button>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">设定目标</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">目标体脂率 (%)</label>
              <input
                type="number"
                name="targetBodyFat"
                value={formData.targetBodyFat}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-brand-200 bg-brand-50 focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">期望达成周期 (周)</label>
              <input
                type="number"
                name="targetWeeks"
                value={formData.targetWeeks}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-brand-200 bg-brand-50 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              正在生成智能计划... (约需10秒)
            </>
          ) : (
            <>
              生成我的碳循环计划 <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;
