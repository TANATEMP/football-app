// src/components/OverviewTab.tsx
import React from 'react';
import type { LeagueStatus } from '../pages/admin/LeagueDetail';

interface OverviewTabProps {
  status: LeagueStatus;
  data: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ status, data }) => {
  
  // ==========================================
  // 1. สถานะเปิดรับสมัคร (REGISTRATION)
  // ==========================================
  if (status === 'REGISTRATION') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-100 flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-3xl font-black italic tracking-tighter mb-1">RECRUITING TEAMS</h3>
              <p className="text-blue-100 font-bold uppercase text-xs tracking-widest">
                Joined: {data.currentTeams} / {data.maxTeams} Teams
              </p>
              <div className="mt-4 h-2 w-48 bg-blue-900/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-1000" 
                  style={{ width: `${(data.currentTeams / data.maxTeams) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-8xl opacity-20 absolute -right-4 -bottom-4 rotate-12">📝</div>
          </div>
          
          {/* Pending Requests */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h4 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Pending Requests</h4>
               <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-1 rounded-md">3 WAITING</span>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-200 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm font-bold text-blue-600">T{i}</div>
                    <span className="font-bold text-slate-700">Team Name {i} FC</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white text-slate-400 rounded-xl text-xs font-bold hover:text-red-500 transition-colors">Reject</button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-100">Approve</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Setup Checklist */}
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white h-fit sticky top-6">
          <h3 className="font-black italic text-xl mb-6 tracking-tight text-blue-400">LEAGUE READINESS</h3>
          <ul className="space-y-5">
            <li className="flex items-start gap-3">
              <span className="bg-green-500/20 text-green-500 p-1 rounded-lg text-xs">✔</span>
              <div>
                <p className="text-sm font-bold">Basic Identity</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold">League info & Logo set</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className={`p-1 rounded-lg text-xs ${data.currentTeams >= data.maxTeams ? 'bg-green-500/20 text-green-500' : 'bg-slate-800 text-slate-600'}`}>
                {data.currentTeams >= data.maxTeams ? '✔' : '○'}
              </span>
              <div>
                <p className={`text-sm font-bold ${data.currentTeams >= data.maxTeams ? 'text-white' : 'text-slate-500'}`}>Squad Full</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold">{data.currentTeams}/{data.maxTeams} Teams approved</p>
              </div>
            </li>
            <li className="flex items-start gap-3 opacity-50">
              <span className="bg-slate-800 text-slate-600 p-1 rounded-lg text-xs">○</span>
              <div>
                <p className="text-sm font-bold text-slate-500">Fixture Generated</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Waiting for teams...</p>
              </div>
            </li>
          </ul>
          <button 
            disabled={data.currentTeams < data.maxTeams}
            className="w-full mt-10 py-4 bg-blue-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-blue-900/20"
          >
            Launch Season 🚀
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. สถานะแข่งขันจบแล้ว (COMPLETED)
  // ==========================================
  if (status === 'COMPLETED') {
    return (
      <div className="animate-fade-in space-y-8">
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 p-1 rounded-[2.5rem] shadow-2xl shadow-yellow-100">
          <div className="bg-slate-900 rounded-[2.4rem] p-12 text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-yellow-400 text-xs font-black uppercase tracking-[0.4em] mb-2">Season Champion</h2>
              <h3 className="text-5xl font-black italic text-white tracking-tighter mb-6">TEAM NAME 1 FC</h3>
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <p className="text-slate-500 text-[10px] font-black uppercase">Points</p>
                  <p className="text-2xl font-black text-white">45</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-500 text-[10px] font-black uppercase">Goal Diff</p>
                  <p className="text-2xl font-black text-white">+28</p>
                </div>
              </div>
            </div>
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          </div>
        </div>
        <button className="w-full py-4 border-2 border-slate-100 rounded-2xl text-slate-400 font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all">
          View Season Archive & Report 📄
        </button>
      </div>
    );
  }

  // ==========================================
  // 3. สถานะกำลังแข่งขัน (ACTIVE)
  // ==========================================
  const stats = [
    { label: 'Total Teams', value: data.maxTeams, icon: '🛡️', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Played', value: '42 / 120', icon: '⚽', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Results', value: '5', icon: '⏳', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Top Scorer', value: 'M. Salah', icon: '👟', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex items-center gap-5 transition-all hover:shadow-md group">
            <div className={`w-14 h-14 ${stat.bg} flex items-center justify-center rounded-2xl text-2xl group-hover:scale-110 transition-transform`}>{stat.icon}</div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table Leaderboard */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              Current Leaders
            </h3>
            <button className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest">Full Standings &rarr;</button>
          </div>
          <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">
                  <th className="p-5 text-left font-black">Pos</th>
                  <th className="p-5 text-left font-black">Club</th>
                  <th className="p-5 text-center font-black">P</th>
                  <th className="p-5 text-center font-black">GD</th>
                  <th className="p-5 text-center font-black text-blue-600">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[1, 2, 3, 4, 5].map((pos) => (
                  <tr key={pos} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-5 font-black text-slate-300 group-hover:text-blue-600 transition-colors">{pos.toString().padStart(2, '0')}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
                        <span className="font-bold text-slate-700 italic">TEAM NAME {pos}</span>
                      </div>
                    </td>
                    <td className="p-5 text-center font-bold text-slate-500">10</td>
                    <td className="p-5 text-center font-bold text-slate-500">+{15 - pos}</td>
                    <td className="p-5 text-center font-black text-blue-600 text-lg">{30 - pos * 3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Side */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-400 mb-6 relative z-10">Admin Control</h3>
            <div className="space-y-3 relative z-10">
              <button className="w-full py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-left px-5 flex items-center justify-between group">
                <span className="text-xs font-bold tracking-wide">Edit League Settings</span>
                <span className="group-hover:translate-x-1 transition-transform">⚙️</span>
              </button>
              <button className="w-full py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-left px-5 flex items-center justify-between group">
                <span className="text-xs font-bold tracking-wide">Report Match Result</span>
                <span className="group-hover:translate-x-1 transition-transform">⚽</span>
              </button>
              <button className="w-full mt-4 py-3.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all text-xs font-black uppercase tracking-widest text-center border border-red-500/20">
                Close Season 🔒
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-blue-50 rounded-[2rem] p-8 border border-blue-100">
            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-600 mb-4">Last Notice</h3>
            <p className="text-xs text-blue-900/70 font-bold leading-relaxed italic">
              "Please verify all match scores from Week 5 by this Sunday evening. Champion trophy presentation is scheduled for final match day."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;