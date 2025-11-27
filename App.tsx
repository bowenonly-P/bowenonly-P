
import React, { useState, useEffect } from 'react';
import { UserStats, SavedProfile, DailyLog, DailyPlan, CarbType } from './types';
import { generateCarbCyclingPlan } from './services/geminiService';
import Hero from './components/Hero';
import InputForm from './components/InputForm';
import PlanDisplay from './components/PlanDisplay';
import Tracker from './components/Tracker';
import AIChat from './components/AIChat';
import { LayoutDashboard, CalendarDays, LineChart as ChartIcon, Settings, Plus, Users, Trash2, LogOut } from 'lucide-react';

enum AppView {
  Home,
  Plan,
  Tracker,
  ProfileList,    // View for managing/switching profiles
  CreateProfile   // View for creating a new profile (InputForm)
}

function App() {
  const [view, setView] = useState<AppView>(AppView.Home);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Profile Management State
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  // Load from LocalStorage on Mount
  useEffect(() => {
    const saved = localStorage.getItem('scc_profiles');
    const lastActiveId = localStorage.getItem('scc_active_profile_id');
    if (saved) {
      try {
        const parsedProfiles: SavedProfile[] = JSON.parse(saved);
        setProfiles(parsedProfiles);
        if (parsedProfiles.length > 0) {
          if (lastActiveId && parsedProfiles.find(p => p.id === lastActiveId)) {
            setActiveProfileId(lastActiveId);
            setView(AppView.Plan);
          } else {
             // Fallback to most recent if saved ID not found
             setActiveProfileId(parsedProfiles[parsedProfiles.length - 1].id);
             setView(AppView.Plan);
          }
        } else {
          setView(AppView.Home);
        }
      } catch (e) {
        console.error("Failed to load profiles", e);
      }
    }
  }, []);

  // Save to LocalStorage whenever profiles or active ID changes
  useEffect(() => {
    localStorage.setItem('scc_profiles', JSON.stringify(profiles));
    if (activeProfileId) {
      localStorage.setItem('scc_active_profile_id', activeProfileId);
    } else {
      localStorage.removeItem('scc_active_profile_id');
    }
  }, [profiles, activeProfileId]);

  // Derived state for current user
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const plan = activeProfile?.plan || null;
  const logs = activeProfile?.logs || [];

  const handleStartNew = () => {
    setActiveProfileId(null);
    setView(AppView.CreateProfile);
  };

  const handleGeneratePlan = async (stats: UserStats, profileName: string) => {
    setIsGenerating(true);
    try {
      const generatedPlan = await generateCarbCyclingPlan(stats);
      
      // Extract templates for each carb type found in the plan
      const templates: Partial<Record<CarbType, DailyPlan>> = {};
      // Calculate recommended counts for validation
      const recommendedCounts: Partial<Record<CarbType, number>> = {};

      generatedPlan.weeklySchedule.forEach(day => {
        // Save template if not exists
        if (!templates[day.carbType]) {
          templates[day.carbType] = day;
        }
        // Count days
        recommendedCounts[day.carbType] = (recommendedCounts[day.carbType] || 0) + 1;
      });

      const newProfile: SavedProfile = {
        id: crypto.randomUUID(),
        name: profileName,
        userStats: stats,
        plan: generatedPlan,
        templates: templates,
        recommendedCounts: recommendedCounts,
        logs: [],
        createdAt: Date.now()
      };

      setProfiles(prev => [...prev, newProfile]);
      setActiveProfileId(newProfile.id);
      setView(AppView.Plan);
    } catch (error) {
      alert("生成计划失败，请检查API Key配置或网络连接。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateSchedule = (updatedSchedule: DailyPlan[]) => {
    if (!activeProfileId || !activeProfile) return;

    const updatedProfile: SavedProfile = {
      ...activeProfile,
      plan: {
        ...activeProfile.plan,
        weeklySchedule: updatedSchedule
      }
    };

    setProfiles(prev => prev.map(p => p.id === activeProfileId ? updatedProfile : p));
  };

  const handleAddLog = (log: DailyLog) => {
    if (!activeProfileId) return;
    
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return { ...p, logs: [...p.logs, log] };
      }
      return p;
    }));
  };

  const switchProfile = (id: string) => {
    setActiveProfileId(id);
    setView(AppView.Plan);
  };

  const deleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("确定要删除这个计划吗？此操作无法撤销。")) {
      const newProfiles = profiles.filter(p => p.id !== id);
      setProfiles(newProfiles);
      
      // If we deleted the active profile
      if (activeProfileId === id) {
        setActiveProfileId(null);
        if (newProfiles.length > 0) {
          // Switch to the first available profile
          setActiveProfileId(newProfiles[0].id);
          setView(AppView.Plan);
        } else {
          // No profiles left, go to Home
          setView(AppView.Home);
        }
      }
    }
  };

  // Mobile/Tablet Settings View showing Profile Switcher
  const renderProfileList = () => (
    <div className="p-4 space-y-6 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">设置 & 档案</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex justify-between items-center">
          <span>切换计划</span>
          <button onClick={handleStartNew} className="text-brand-600 text-xs font-bold flex items-center">
            <Plus className="w-3 h-3 mr-1" /> 新建
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {profiles.map(p => (
            <div 
              key={p.id} 
              onClick={() => switchProfile(p.id)}
              className={`p-4 flex justify-between items-center cursor-pointer active:bg-slate-50 ${activeProfileId === p.id ? 'bg-brand-50' : ''}`}
            >
              <div className="flex items-center space-x-3">
                 <div className={`w-2 h-2 rounded-full ${activeProfileId === p.id ? 'bg-brand-500' : 'bg-slate-300'}`}></div>
                 <div>
                    <p className={`font-medium ${activeProfileId === p.id ? 'text-brand-900' : 'text-slate-700'}`}>{p.name}</p>
                    <p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                 </div>
              </div>
              <button 
                onClick={(e) => deleteProfile(p.id, e)} 
                className="p-2 text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {profiles.length === 0 && (
            <div className="p-4 text-center text-slate-400 text-sm">暂无存档</div>
          )}
        </div>
      </div>

      <button 
        onClick={handleStartNew}
        className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold shadow-md flex justify-center items-center"
      >
        <Plus className="w-5 h-5 mr-2" /> 创建新计划
      </button>
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case AppView.Home:
        return <Hero onStart={handleStartNew} />;
      
      case AppView.CreateProfile:
        return <InputForm onSubmit={handleGeneratePlan} isLoading={isGenerating} />;
        
      case AppView.ProfileList:
        return renderProfileList();
        
      case AppView.Plan:
        return plan ? (
          <PlanDisplay 
            key={activeProfileId} // Force re-render when switching profiles
            plan={plan} 
            templates={activeProfile?.templates}
            recommendedCounts={activeProfile?.recommendedCounts}
            onUpdateSchedule={handleUpdateSchedule} 
          />
        ) : <div className="text-center p-10 text-slate-500">请选择或创建一个计划</div>;
        
      case AppView.Tracker:
        return <Tracker logs={logs} onAddLog={handleAddLog} />;
        
      default:
        return <Hero onStart={handleStartNew} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      
      {/* Mobile Nav (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around z-40 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] pb-safe">
        <button 
          onClick={() => setView(AppView.Plan)} 
          disabled={!activeProfileId} 
          className={`p-2 rounded-lg flex flex-col items-center flex-1 transition-colors ${view === AppView.Plan ? 'text-brand-600' : 'text-slate-400 disabled:opacity-30'}`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] mt-1">计划</span>
        </button>
        <button 
          onClick={() => setView(AppView.Tracker)} 
          disabled={!activeProfileId} 
          className={`p-2 rounded-lg flex flex-col items-center flex-1 transition-colors ${view === AppView.Tracker ? 'text-brand-600' : 'text-slate-400 disabled:opacity-30'}`}
        >
          <ChartIcon className="w-5 h-5" />
          <span className="text-[10px] mt-1">追踪</span>
        </button>
        <button 
          onClick={() => setView(AppView.ProfileList)} 
          className={`p-2 rounded-lg flex flex-col items-center flex-1 transition-colors ${view === AppView.ProfileList ? 'text-brand-600' : 'text-slate-400'}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-1">档案</span>
        </button>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen sticky top-0 overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center">
            <LayoutDashboard className="w-6 h-6 mr-2 text-brand-500" />
            SCC Coach
          </h1>
        </div>
        
        {/* Profile List */}
        <div className="px-4 pt-6 pb-2">
           <div className="flex justify-between items-center mb-2 px-2">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">我的档案</h3>
             <button onClick={handleStartNew} className="text-brand-400 hover:text-brand-300 transition-colors" title="新建计划">
               <Plus className="w-4 h-4" />
             </button>
           </div>
           <div className="space-y-1 mb-6">
             {profiles.map(p => (
               <div key={p.id} className="group flex items-center">
                 <button 
                  onClick={() => switchProfile(p.id)}
                  className={`flex-1 flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all text-left truncate
                    ${activeProfileId === p.id 
                      ? 'bg-slate-800 text-white font-medium' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                 >
                   <Users className="w-4 h-4 flex-shrink-0" />
                   <span className="truncate">{p.name}</span>
                 </button>
                 <button 
                    onClick={(e) => deleteProfile(p.id, e)}
                    className="hidden group-hover:block p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    title="删除"
                 >
                   <Trash2 className="w-3.5 h-3.5" />
                 </button>
               </div>
             ))}
             {profiles.length === 0 && (
               <p className="px-3 text-xs text-slate-600 italic">暂无计划，请点击上方 + 创建</p>
             )}
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {activeProfile && (
            <>
              <div className="px-2 mb-2">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">当前视图</h3>
              </div>
              <button 
                onClick={() => setView(AppView.Plan)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${view === AppView.Plan ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <CalendarDays className="w-5 h-5" />
                <span className="font-medium">每周计划</span>
              </button>
              
              <button 
                onClick={() => setView(AppView.Tracker)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${view === AppView.Tracker ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <ChartIcon className="w-5 h-5" />
                <span className="font-medium">数据追踪</span>
              </button>
            </>
          )}
        </nav>
        
        {activeProfile && (
          <div className="p-4 m-4 bg-slate-800 rounded-xl border border-slate-700/50">
             <div className="flex items-center space-x-2 mb-2">
               <div className="bg-brand-500 w-2 h-2 rounded-full animate-pulse"></div>
               <span className="text-xs font-bold text-slate-300">目标进行中</span>
             </div>
             <p className="text-sm font-medium text-white mb-1">
               {activeProfile.userStats.targetWeeks}周挑战
             </p>
             <p className="text-xs text-slate-400">
               体脂 {activeProfile.userStats.bodyFat}% <span className="text-slate-600">→</span> {activeProfile.userStats.targetBodyFat}%
             </p>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-16 md:mb-0 max-w-7xl mx-auto w-full">
        {renderContent()}
      </main>

      {/* AI Assistant - Pass current plan context */}
      <AIChat planContext={plan ? JSON.stringify(plan) : undefined} />
    </div>
  );
}

export default App;
