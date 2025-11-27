
import React, { useState } from 'react';
import { DailyLog } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Plus, CheckCircle2 } from 'lucide-react';

interface TrackerProps {
  logs: DailyLog[];
  onAddLog: (log: DailyLog) => void;
}

// Generate some dummy data for initial visualization if empty
const MOCK_DATA = Array.from({ length: 14 }).map((_, i) => ({
  date: `第 ${i + 1} 天`,
  weight: 80 - (i * 0.2) + (Math.random() * 0.5 - 0.25),
  energyLevel: 6 + Math.floor(Math.random() * 4),
}));

const Tracker: React.FC<TrackerProps> = ({ logs, onAddLog }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLog, setNewLog] = useState<Partial<DailyLog>>({
    weight: 0,
    energyLevel: 5,
    completedPlan: true
  });

  const chartData = logs.length > 0 ? logs : MOCK_DATA;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const log: DailyLog = {
      date: new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      weight: Number(newLog.weight),
      energyLevel: Number(newLog.energyLevel),
      completedPlan: !!newLog.completedPlan,
    };
    onAddLog(log);
    setShowAddForm(false);
    setNewLog({ weight: 0, energyLevel: 5, completedPlan: true });
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">进度追踪</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" /> 记录今日数据
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow border border-brand-100">
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">今日体重 (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  className="w-full p-2 border rounded"
                  value={newLog.weight || ''}
                  onChange={e => setNewLog({...newLog, weight: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">精力水平 (1-10)</label>
                <select 
                  className="w-full p-2 border rounded bg-white"
                  value={newLog.energyLevel}
                  onChange={e => setNewLog({...newLog, energyLevel: Number(e.target.value)})}
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="flex items-center h-10 pb-2">
                 <label className="flex items-center cursor-pointer">
                   <input 
                    type="checkbox" 
                    className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 border-gray-300"
                    checked={newLog.completedPlan}
                    onChange={e => setNewLog({...newLog, completedPlan: e.target.checked})}
                   />
                   <span className="ml-2 text-sm text-slate-700">完成今日计划</span>
                 </label>
              </div>
              <button type="submit" className="bg-slate-900 text-white p-2 rounded hover:bg-black">保存记录</button>
           </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-6">体重趋势 (kg)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#94a3b8" />
                <YAxis domain={['auto', 'auto']} tick={{fontSize: 12}} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#0ea5e9" 
                  strokeWidth={3} 
                  dot={{r: 4, fill: '#0ea5e9', strokeWidth: 0}}
                  activeDot={{r: 6}} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-6">精力感受 & 执行度</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#94a3b8" />
                <YAxis domain={[0, 10]} tick={{fontSize: 12}} stroke="#94a3b8" />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="energyLevel" name="精力水平" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracker;
