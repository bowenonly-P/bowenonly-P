
import React, { useState, useMemo } from 'react';
import { FullPlan, CarbType, DailyPlan } from '../types';
import { Dumbbell, Utensils, Zap, Info, Settings2, Save, AlertTriangle } from 'lucide-react';

interface PlanDisplayProps {
  plan: FullPlan;
  templates?: Partial<Record<CarbType, DailyPlan>>;
  recommendedCounts?: Partial<Record<CarbType, number>>;
  onUpdateSchedule?: (updatedSchedule: DailyPlan[]) => void;
}

const CarbBadge: React.FC<{ type: CarbType }> = ({ type }) => {
  const colors = {
    [CarbType.High]: 'bg-red-100 text-red-800 border-red-200',
    [CarbType.Medium]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [CarbType.Low]: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[type]}`}>
      {type}
    </span>
  );
};

const DayCard: React.FC<{ 
  day: DailyPlan; 
  isEditing: boolean;
  availableTypes: CarbType[];
  onTypeChange: (newType: CarbType) => void; 
}> = ({ day, isEditing, availableTypes, onTypeChange }) => {
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all ${isEditing ? 'ring-2 ring-brand-400 ring-offset-2 scale-[1.02]' : 'hover:shadow-md'}`}>
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800">{day.dayName}</h3>
        {isEditing ? (
          <select 
            value={day.carbType}
            onChange={(e) => onTypeChange(e.target.value as CarbType)}
            className="text-xs p-1 rounded border border-brand-300 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
          >
            {availableTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        ) : (
          <CarbBadge type={day.carbType} />
        )}
      </div>
      
      <div className={`p-5 space-y-4 ${isEditing ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}>
        {/* Training */}
        <div className="flex items-start space-x-3">
          <div className="mt-1 bg-blue-100 p-1.5 rounded-lg">
             <Dumbbell className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">训练重点</p>
            <p className="text-sm font-medium text-slate-900">{day.trainingFocus}</p>
          </div>
        </div>

        {/* Macros */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
           <div className="flex items-center space-x-2 mb-2">
             <Zap className="w-4 h-4 text-orange-500" />
             <span className="text-xs font-bold text-slate-700">营养目标 ({day.macros.calories} kcal)</span>
           </div>
           <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-1 rounded border border-slate-100">
                <p className="text-[10px] text-slate-500">蛋白质</p>
                <p className="text-xs font-bold text-slate-800">{day.macros.protein}g</p>
              </div>
              <div className="bg-white p-1 rounded border border-slate-100">
                <p className="text-[10px] text-slate-500">碳水</p>
                <p className="text-xs font-bold text-slate-800">{day.macros.carbs}g</p>
              </div>
              <div className="bg-white p-1 rounded border border-slate-100">
                <p className="text-[10px] text-slate-500">脂肪</p>
                <p className="text-xs font-bold text-slate-800">{day.macros.fat}g</p>
              </div>
           </div>
        </div>

        {/* Meals */}
        <div className="space-y-2">
           <div className="flex items-center space-x-2">
             <Utensils className="w-3 h-3 text-slate-400" />
             <span className="text-xs font-semibold text-slate-500">参考食谱</span>
           </div>
           <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
             {day.meals.map((meal, idx) => (
               <li key={idx} className="truncate">{meal}</li>
             ))}
           </ul>
        </div>
        
        {/* Tip */}
         <div className="flex items-start space-x-2 bg-blue-50 p-2 rounded text-blue-800 text-xs">
           <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
           <p>{day.tips}</p>
         </div>
      </div>
    </div>
  );
};

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, templates, recommendedCounts, onUpdateSchedule }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Capture unique templates.
  const planTemplates = useMemo(() => {
    if (templates && Object.keys(templates).length > 0) {
        return templates;
    }
    const t: Partial<Record<CarbType, DailyPlan>> = {};
    plan.weeklySchedule.forEach(day => {
      if (!t[day.carbType]) {
        t[day.carbType] = day;
      }
    });
    return t;
  }, [plan, templates]); 

  // Available types for dropdown based on templates
  const availableTypes = Object.keys(planTemplates) as CarbType[];

  // Calculate stats for validation and warnings
  const validationResult = useMemo(() => {
    const currentCounts = {
      [CarbType.High]: 0,
      [CarbType.Medium]: 0,
      [CarbType.Low]: 0
    };
    
    plan.weeklySchedule.forEach(day => {
       if (currentCounts[day.carbType] !== undefined) currentCounts[day.carbType]++;
    });

    const warnings: string[] = [];

    // Prioritize checking against recommended counts if available (New logic)
    if (recommendedCounts) {
       ([CarbType.High, CarbType.Medium, CarbType.Low] as CarbType[]).forEach(type => {
         const current = currentCounts[type];
         const recommended = recommendedCounts[type] || 0;
         
         // Only warn if we are strictly LESS than recommended
         if (current < recommended) {
           const diff = recommended - current;
           warnings.push(`您的${type}比科学推荐方案少了 ${diff} 天。`);
         }
       });
    } else {
       // Fallback logic for old profiles: only warn if completely missing
       const missingTypes = Object.keys(currentCounts).filter(k => currentCounts[k as CarbType] === 0) as CarbType[];
       if (missingTypes.length > 0) {
         warnings.push(`检测到您的日程中完全缺失 ${missingTypes.join('、')}。`);
       }
    }

    return { counts: currentCounts, warnings };
  }, [plan.weeklySchedule, recommendedCounts]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleDayTypeChange = (dayIndex: number, newType: CarbType) => {
    if (!onUpdateSchedule) return;

    const template = planTemplates[newType];
    if (!template) return; 

    const newSchedule = [...plan.weeklySchedule];
    newSchedule[dayIndex] = {
      ...template,
      dayName: newSchedule[dayIndex].dayName,
      carbType: newType
    };

    onUpdateSchedule(newSchedule);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Strategy Summary */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-4">你的专属碳循环策略</h2>
          <p className="text-slate-300 leading-relaxed mb-6">{plan.summary}</p>
          <div className="bg-white/10 p-4 rounded-lg border border-white/10">
             <p className="text-sm font-medium text-white/90">💡 专家建议: {plan.advice}</p>
          </div>
        </div>
      </div>

      {/* Weekly Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center">
            <span className="bg-brand-600 w-2 h-6 mr-3 rounded-full"></span>
            本周日程安排
          </h3>
          
          {onUpdateSchedule && (
            <button 
              onClick={toggleEdit}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                ${isEditing 
                  ? 'bg-brand-100 text-brand-700 hover:bg-brand-200' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>完成调整</span>
                </>
              ) : (
                <>
                  <Settings2 className="w-4 h-4" />
                  <span>调整日程</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Validation Warning */}
        {validationResult.warnings.length > 0 && (
            <div className="mb-6 bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start space-x-3 animate-in slide-in-from-top-2 shadow-sm">
              <div className="bg-orange-100 p-2 rounded-full flex-shrink-0">
                 <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-orange-800 text-sm mb-2">计划结构可能失衡</h4>
                <ul className="space-y-1 list-disc list-inside text-sm text-orange-700">
                  {validationResult.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
                <p className="text-xs text-orange-600 mt-2">
                  提示：为了达到最佳的代谢效果，请尽量贴近系统生成的科学推荐方案。
                </p>
                
                <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-slate-600 bg-white/50 p-2 rounded-lg inline-block">
                   <span className={validationResult.counts[CarbType.High] < (recommendedCounts?.[CarbType.High] || 0) ? "text-red-500 font-bold" : "text-slate-700"}>
                     {CarbType.High}: {validationResult.counts[CarbType.High]} 天
                     {recommendedCounts && <span className="text-slate-400 font-normal"> (推荐: {recommendedCounts[CarbType.High]})</span>}
                   </span>
                   <span className="w-px h-3 bg-slate-300 self-center"></span>
                   <span className={validationResult.counts[CarbType.Medium] < (recommendedCounts?.[CarbType.Medium] || 0) ? "text-red-500 font-bold" : "text-slate-700"}>
                     {CarbType.Medium}: {validationResult.counts[CarbType.Medium]} 天
                     {recommendedCounts && <span className="text-slate-400 font-normal"> (推荐: {recommendedCounts[CarbType.Medium]})</span>}
                   </span>
                   <span className="w-px h-3 bg-slate-300 self-center"></span>
                   <span className={validationResult.counts[CarbType.Low] < (recommendedCounts?.[CarbType.Low] || 0) ? "text-red-500 font-bold" : "text-slate-700"}>
                     {CarbType.Low}: {validationResult.counts[CarbType.Low]} 天
                     {recommendedCounts && <span className="text-slate-400 font-normal"> (推荐: {recommendedCounts[CarbType.Low]})</span>}
                   </span>
                </div>
              </div>
            </div>
        )}

        {isEditing && validationResult.warnings.length === 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start space-x-3 text-sm text-blue-800 animate-in slide-in-from-top-2">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">编辑模式说明：</p>
              <p>您可以根据实际情况更改每一天的碳水类型。更改后，当天的饮食热量目标和食谱建议将自动更新。</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plan.weeklySchedule.map((day, idx) => (
            <DayCard 
              key={idx} 
              day={day} 
              isEditing={isEditing}
              availableTypes={availableTypes}
              onTypeChange={(newType) => handleDayTypeChange(idx, newType)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanDisplay;
