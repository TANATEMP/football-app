// src/pages/manager/LeagueDiscovery.tsx
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

interface League {
// ... (rest of the interface unchanged)
  id: string;
  name: string;
  season: string;
  description: string;
  maxTeams: number;
  minPlayers: number;
  maxPlayers: number;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  matchDuration: number;
  registrationStart: string;
  registrationEnd: string;
  startDate: string;
  endDate: string;
  _count: { teams: number };
}

const LeagueDiscovery = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myTeam, setMyTeam] = useState<any>(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [leaguesRes, userRes] = await Promise.all([
        api.get('/leagues', { params: { status: 'REGISTRATION' } }),
        api.get('/user')
      ]);
      
      const leaguesPayload = leaguesRes.data.data || leaguesRes.data;
      setLeagues(Array.isArray(leaguesPayload) ? leaguesPayload : leaguesPayload.data || []);
      setMyTeam(userRes.data.data?.team || null);
    } catch (err) {
      console.error("Error fetching leagues:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleJoinLeague = async (leagueId: string) => {
    if (!myTeam || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await api.post(`/teams/${myTeam.id}/join-league`, { leagueId });
      setSelectedLeague(null);
      navigate('/manager');
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to join league");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDayNames = (days: number[]) => {
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(d => names[d]).join(', ');
  };

  const isInActiveLeague = myTeam?.league && myTeam.league.status !== 'COMPLETED';

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] font-black italic text-slate-300 animate-pulse">SCOUTING LEAGUES...</div>;

  if (isInActiveLeague) {
    return (
      <div className="max-w-4xl mx-auto py-32 px-4 animate-fade-in text-center flex flex-col items-center justify-center">
        <div className="w-32 h-32 bg-amber-50 rounded-[3rem] flex items-center justify-center text-5xl mb-12 shadow-inner border border-amber-100">🔒</div>
        <h1 className="text-4xl font-black text-slate-900 mb-6 italic uppercase tracking-tighter leading-none">Access Restricted</h1>
        <p className="text-slate-400 text-lg font-bold uppercase tracking-widest text-[11px] mb-12 max-w-md">
           สโมสรของคุณกำลังอยู่ระหว่างการแข่งขันในลีก <span className="text-blue-600 font-black italic">{myTeam.league.name}</span> ไม่สามารถสมัครลีกอื่นซ้อนได้ในขณะนี้
        </p>
        <button 
          onClick={() => window.history.back()}
          className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] italic shadow-2xl hover:bg-blue-600 transition-all active:scale-95"
        >
          &larr; กลับสู่กองอำนวยการ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 px-4 pb-20 animate-fade-in">
      {/* Header Section */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="relative z-10">
          <h2 className="text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4 italic text-center md:text-left">Recruitment Hub</h2>
          <h1 className="text-6xl font-black tracking-tighter mb-4 italic uppercase text-center md:text-left leading-none">Find Your Arena</h1>
          <p className="text-slate-400 text-lg font-bold uppercase tracking-widest text-[11px] text-center md:text-left">
            สำรวจทัวร์นาเมนต์ที่กำลังเปิดรับสมัครและยื่นใบสมัครเพื่อเข้าสู่สนามระดับอาชีพ
          </p>
        </div>
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {leagues.length === 0 ? (
          <div className="py-32 text-center bg-white border-2 border-dashed border-slate-100 rounded-[3rem] text-slate-300 font-black uppercase italic tracking-widest flex flex-col items-center gap-6">
             <span className="text-6xl">🔭</span>
             <p>No leagues are currently in recruitment phase.</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {leagues.map(league => (
            <div key={league.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all group relative flex flex-col">
               <div className="flex justify-between items-start mb-6">
                  <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full font-black text-[9px] uppercase tracking-widest border border-blue-100 italic">Season {league.season}</span>
                  <span className="text-[10px] font-black text-slate-300 uppercase italic">{league._count?.teams || 0} / {league.maxTeams} Teams</span>
               </div>
               <h3 className="text-3xl font-black text-slate-900 mb-4 italic uppercase tracking-tighter leading-none group-hover:text-blue-600 transition-colors">{league.name}</h3>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-wide leading-relaxed line-clamp-2 mb-6">{league.description || "Top tier league with elite clubs and professional structure."}</p>
               
               {/* 🗓️ Match Schedule Summary on Card */}
               <div className="mb-8 space-y-2">
                  <div className="flex items-center gap-3 text-slate-500 font-black uppercase italic text-[10px] tracking-widest">
                     <span className="w-5 h-5 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 not-italic">📅</span>
                     {getDayNames(league.daysOfWeek)}
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-black uppercase italic text-[10px] tracking-widest">
                     <span className="w-5 h-5 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 not-italic">⏰</span>
                     {league.startTime} - {league.endTime}
                  </div>
                  <div className="flex items-center gap-3 text-blue-600 font-black uppercase italic text-[10px] tracking-widest">
                     <span className="w-5 h-5 bg-blue-50 rounded-lg flex items-center justify-center text-blue-400 not-italic">🏁</span>
                     Season: {new Date(league.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - {new Date(league.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                  </div>
               </div>

               <div className="mt-auto space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-400 uppercase italic">Registration Closes</span>
                     <span className="text-[11px] font-black text-slate-800 uppercase italic">{new Date(league.registrationEnd).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedLeague(league)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] italic shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95"
                  >
                    View Scouting Report 🔍
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Deep-Dive Modal */}
      {selectedLeague && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedLeague(null)}></div>
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-slate-100 animate-slide-up mx-4">
             <div className="bg-slate-900 p-8 text-white relative">
                <div className="flex justify-between items-start">
                   <div>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full font-black text-[8px] uppercase tracking-widest border border-blue-400/20 italic mb-3 inline-block">Scouting Report</span>
                      <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">{selectedLeague.name}</h2>
                      <p className="text-white/40 mt-2 font-black uppercase tracking-widest text-[9px] italic">Season {selectedLeague.season} • Requirements Match</p>
                   </div>
                   <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLeague(null);
                    }} 
                    className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-2xl transition-all font-bold relative z-20 shadow-lg"
                    aria-label="Close"
                   >
                     &times;
                   </button>
                </div>
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
             </div>

             <div className="p-8 overflow-y-auto max-h-[70vh] space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Logistics Column */}
                   <div className="space-y-4">
                      <h3 className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] italic border-l-2 border-blue-600 pl-3">Logistics</h3>
                      <div className="space-y-2">
                         <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 uppercase italic">Matchdays</span>
                            <span className="text-xs font-black text-slate-900 uppercase italic">{getDayNames(selectedLeague.daysOfWeek)}</span>
                         </div>
                         <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 uppercase italic">Window</span>
                            <span className="text-xs font-black text-slate-900 uppercase italic">{selectedLeague.startTime} - {selectedLeague.endTime}</span>
                         </div>
                      </div>
                   </div>

                   {/* Requirements Column */}
                   <div className="space-y-4">
                      <h3 className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em] italic border-l-2 border-emerald-600 pl-3">Squad</h3>
                      <div className="space-y-2">
                         <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                            <span className="text-[9px] font-black text-emerald-600 uppercase italic">Min Roster</span>
                            <span className="text-xs font-black text-emerald-800 italic">{selectedLeague.minPlayers} Players</span>
                         </div>
                         <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 uppercase italic">Max Slots</span>
                            <span className="text-xs font-black text-slate-900 italic">{selectedLeague.maxPlayers} Players</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-100 text-center">
                   <h3 className="text-[9px] font-black text-slate-800 uppercase tracking-[0.3em] italic mb-4">Season Dates</h3>
                   <div className="flex items-center justify-center gap-4 text-xs">
                      <div className="text-center">
                         <p className="text-[8px] font-black text-slate-400 uppercase italic mb-1">Starts</p>
                         <p className="font-black text-slate-900 italic">{new Date(selectedLeague.startDate).toLocaleDateString('th-TH')}</p>
                      </div>
                      <div className="w-8 h-px bg-slate-200"></div>
                      <div className="text-center">
                         <p className="text-[8px] font-black text-slate-400 uppercase italic mb-1">Ends</p>
                         <p className="font-black text-slate-900 italic">{new Date(selectedLeague.endDate).toLocaleDateString('th-TH')}</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-8 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => handleJoinLeague(selectedLeague.id)}
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest italic shadow-xl hover:bg-blue-600 transition-all active:scale-95 disabled:bg-slate-300 text-xs"
                >
                  {isSubmitting ? 'PROCESSING...' : 'INITIALIZE ENROLLMENT ⚽'}
                </button>
             </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default LeagueDiscovery;
