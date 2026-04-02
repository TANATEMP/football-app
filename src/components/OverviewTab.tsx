// src/components/OverviewTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import axios from 'axios';
import type { LeagueStatus } from '../pages/admin/LeagueDetail';

interface OverviewTabProps {
  status: LeagueStatus;
  data: any;
  onRefresh?: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ status, data, onRefresh }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fixtureCount, setFixtureCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [totalGoals, setTotalGoals] = useState<number>(0);
  
  const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  const scheduleSummary = data ? `${data.daysOfWeek?.map((d: number) => dayNames[d]).join(', ')} @ ${data.startTime}` : '';

  const checkFixtures = useCallback(async () => {
    if (!data?.id) return;
    try {
      // Fetch ALL matches
      const resTotal = await api.get('/matches', { params: { leagueId: data.id } });
      const payloadTotal = resTotal.data.data !== undefined ? resTotal.data.data : resTotal.data;
      const total = payloadTotal.pagination?.total ?? (Array.isArray(payloadTotal) ? payloadTotal.length : (payloadTotal.data?.length ?? 0));
      setFixtureCount(total);

      // Fetch COMPLETED matches (if ongoing)
      if (status === 'ONGOING' || status === 'COMPLETED') {
        const resDone = await api.get('/matches', { params: { leagueId: data.id, status: 'COMPLETED' } });
        const payloadDone = resDone.data.data !== undefined ? resDone.data.data : resDone.data;
        const done = payloadDone.pagination?.total ?? (Array.isArray(payloadDone) ? payloadDone.length : (payloadDone.data?.length ?? 0));
        setCompletedCount(done);

        // Fetch standings to get total goals
        const resStandings = await api.get(`/leagues/${data.id}/standings`);
        const standings = resStandings.data.data || resStandings.data;
        const totalG = standings.reduce((acc: number, s: any) => acc + s.goalsFor, 0);
        setTotalGoals(totalG);
      }
    } catch {
      setFixtureCount(0);
    }
  }, [status, data]); // Fixed: Listen to entire data object change

  useEffect(() => {
    checkFixtures();
  }, [checkFixtures]);

  const handleCloseRegistration = async () => {
    if (!confirm('ปิดรับสมัครทีม แล้วเข้าสู่ช่วง Pre-Season?')) return;
    try {
      setIsSubmitting(true);
      await api.patch(`/leagues/${data.id}/status`, { status: 'PRE_SEASON' });
      alert('✅ Registration closed!');
      onRefresh?.();
    } catch (err) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.error?.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateFixtures = async () => {
    if (!confirm('สร้างตารางแข่งแบบพบกันหมด?')) return;
    try {
      setIsSubmitting(true);
      await api.post(`/leagues/${data.id}/generate-fixtures`, {});
      alert(`✅ สร้างตารางสำเร็จ! อ้างอิงตามค่าเริ่มต้นของลีก`);
      onRefresh?.();
      checkFixtures();
    } catch (err) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.error?.message || 'Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartSeason = async () => {
    if (!confirm('🚨 เริ่มฤดูกาลอย่างเป็นทางการ?')) return;
    try {
      setIsSubmitting(true);
      await api.post(`/leagues/${data.id}/start-season`);
      alert('🏆 ฤดูกาลเริ่มต้นแล้ว!');
      onRefresh?.();
    } catch (err) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.error?.message || 'Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndSeason = async () => {
    if (!confirm('🏁 ต้องการสิ้นสุดฤดูกาลนี้ใช่หรือไม่? ข้อมูลจะถูกล็อกเป็น COMPLETED')) return;
    try {
      setIsSubmitting(true);
      await api.patch(`/leagues/${data.id}/status`, { status: 'COMPLETED' });
      alert('🏆 ฤดูกาลสิ้นสุดลงแล้ว!');
      onRefresh?.();
    } catch (err) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.error?.message || 'Failed to end season');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'REGISTRATION') {
    const isFull = data.currentTeams >= data.maxTeams;

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Compact Header & Action Row */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-sm flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-6 px-4">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl shadow-xl shadow-blue-100">🏆</div>
            <div>
              <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">REGISTRATION OPEN</h3>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-widest border border-blue-100">
                  {data.currentTeams} / {data.maxTeams} Teams
                </span>
                <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(data.currentTeams/data.maxTeams)*100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-[300px] flex justify-end px-4">
            <button 
              disabled={isSubmitting || !isFull}
              onClick={handleCloseRegistration}
              className={`group relative overflow-hidden px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-2xl ${
                isFull 
                ? 'bg-blue-900 text-white hover:bg-black hover:scale-105 active:scale-95 shadow-blue-200' 
                : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100 shadow-none'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isFull ? 'Close Registration & Start Pre-Season ⏩' : `Wait for ${data.maxTeams - data.currentTeams} More Teams...`}
              </span>
            </button>
          </div>
        </div>

        {/* Combined Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Description - Compact */}
          <div className="md:col-span-2 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">League Identity & Rules</h4>
              <p className="text-slate-600 text-sm leading-7 italic whitespace-pre-wrap">"{data.description || 'No description provided.'}"</p>
            </div>
            <div className="absolute top-8 right-8 text-6xl opacity-[0.03] rotate-12 pointer-events-none font-serif">"</div>
          </div>

          {/* Quick Config Summary */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6">Schedule Policy</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Match Days</span>
                  <span className="text-sm font-black italic">{scheduleSummary}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Format</span>
                  <span className="text-sm font-black italic uppercase text-blue-400">
                    {data.matchFormat === 'DOUBLE' ? 'Home & Away' : 'Single Round'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duration</span>
                  <span className="text-sm font-black italic">{data.matchDuration} Mins</span>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-loose">
                 Settings are locked until pre-season generation phase.
               </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PRE_SEASON view remains concise as already implemented
  if (status === 'PRE_SEASON' || status === 'ONGOING' || status === 'COMPLETED') {
    const isOngoing = status === 'ONGOING';
    const isCompleted = status === 'COMPLETED';
    const fixturesGenerated = fixtureCount > 0;
    const progress = fixtureCount > 0 ? Math.round((completedCount / fixtureCount) * 100) : 0;

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Status Header */}
        <div className={`p-10 rounded-[3rem] text-white shadow-2xl flex items-center justify-between relative overflow-hidden ${
          isOngoing ? 'bg-gradient-to-br from-blue-600 to-indigo-800' : 
          isCompleted ? 'bg-gradient-to-br from-slate-700 to-slate-900' :
          'bg-slate-900 border border-slate-800'
        }`}>
          <div className="relative z-10">
            <h3 className="text-4xl font-black italic tracking-tighter mb-2 uppercase">
              {isOngoing ? 'Season Live' : isCompleted ? 'Season Finished' : 'Preparation Phase'}
            </h3>
            <p className="text-white/60 font-black uppercase text-[10px] tracking-[0.3em]">
              {isOngoing ? `Progress: ${progress}% (${completedCount}/${fixtureCount} Matches)` : 
               isCompleted ? `Final: ${fixtureCount} Matches Played` :
               `Total Fixtures: ${fixtureCount}`}
            </p>
          </div>
          
          <div className="relative z-10 flex gap-4">
            {status === 'PRE_SEASON' && !fixturesGenerated && (
              <button onClick={handleGenerateFixtures} disabled={isSubmitting} className="bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40">
                {isSubmitting ? 'Generating...' : 'Generate Fixtures ⚽'}
              </button>
            )}
            {status === 'PRE_SEASON' && fixturesGenerated && (
              <button onClick={handleStartSeason} disabled={isSubmitting} className="bg-emerald-500 hover:bg-white hover:text-emerald-500 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/40">
                Start Season 📢
              </button>
            )}
            {(isOngoing || isCompleted) && (
              <div className="bg-white/10 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/10 flex flex-col items-end">
                 <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-1">
                   {isCompleted ? '🏆 Tournament Locked' : '⚽ Competition Active'}
                 </p>
                 <div className="w-32 h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-blue-400 transition-all duration-1000" style={{ width: `${progress}%` }} />
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Ongoing Stats Grid */}
        {(isOngoing || isCompleted) && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Matches Played</p>
                <p className="text-4xl font-black italic text-slate-800">{completedCount} <span className="text-lg text-slate-300 mx-1">/</span> {fixtureCount}</p>
             </div>
             
             <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Goals</p>
                <p className="text-4xl font-black italic text-blue-600">{totalGoals}</p>
             </div>

             <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Average Goals</p>
                <p className="text-4xl font-black italic text-slate-800">
                  {completedCount > 0 ? (totalGoals / completedCount).toFixed(1) : '0.0'}
                </p>
             </div>

             {isOngoing && (
               <div className={`rounded-[2.5rem] p-8 text-center flex flex-col justify-center items-center border-2 transition-all ${
                 completedCount === fixtureCount && fixtureCount > 0
                 ? 'bg-red-50 border-red-200 shadow-lg shadow-red-100 animate-pulse'
                 : 'bg-slate-50 border-slate-200 border-dashed opacity-60'
               }`}>
                  <button 
                    disabled={isSubmitting || completedCount < fixtureCount || fixtureCount === 0}
                    onClick={handleEndSeason} 
                    className={`font-black text-[10px] uppercase tracking-widest transition-all ${
                      completedCount === fixtureCount && fixtureCount > 0
                      ? 'text-red-600 hover:scale-110 active:scale-95'
                      : 'text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {completedCount === fixtureCount && fixtureCount > 0 
                      ? 'OFFICIALLY END SEASON 🏁' 
                      : 'SEASON IN PROGRESS 🔒'}
                  </button>
                  {completedCount < fixtureCount && (
                    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">
                      Wait for {fixtureCount - completedCount} more matches
                    </p>
                  )}
               </div>
             )}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default OverviewTab;