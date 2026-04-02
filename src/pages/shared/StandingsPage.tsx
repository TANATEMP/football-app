import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import StandingsTab from '../../components/StandingsTab'; 

const StandingsPage = () => {
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [leagueInfo, setLeagueInfo] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const userRes = await api.get('/user');
      const user = userRes.data.data;
      const team = user.team || user.playerProfile?.team || user.player?.team;
      
      if (team?.leagueId) {
        setMyTeamId(team.id);
        const leagueRes = await api.get(`/leagues/${team.leagueId}`);
        setLeagueInfo(leagueRes.data.data || leagueRes.data);
      }
    } catch (err) {
      console.error("Error fetching standings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <div className="font-black italic text-slate-300 uppercase tracking-widest animate-pulse">Analyzing League Table...</div>
    </div>
  );

  const hasLeague = !!leagueInfo;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20 px-4 mt-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden border border-white/5">
  <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
    
    {/* ข้อมูลลีก */}
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="px-3 py-1 bg-blue-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-blue-900/40">
          Standings
        </span>
        <div className="h-[1px] w-8 bg-white/20"></div>
        {leagueInfo && (
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 animate-pulse">
            • {leagueInfo.status}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
          {leagueInfo ? leagueInfo.name : 'League Table'}
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[9px]">
          Official Season Rankings & Statistics
        </p>
      </div>
    </div>

    {/* จำนวนทีม */}
    {leagueInfo && (
      <div className="flex flex-wrap items-center gap-4 shrink-0">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 px-7 py-5 rounded-[2rem] flex items-center gap-5 group hover:bg-white/10 transition-all duration-300">
          <div className="text-right">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">
              Total Teams
            </div>
            <div className="text-3xl font-black italic text-white leading-none tracking-tighter">
              {leagueInfo.maxTeams} <span className="text-xs text-slate-500 not-italic ml-1">CLUBS</span>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
</div>

      {!hasLeague ? (
        <div className="bg-white rounded-[4rem] p-24 text-center shadow-2xl border border-slate-100 flex flex-col items-center justify-center">
           <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-6xl mb-10 shadow-inner border border-slate-100 grayscale opacity-40">🏆</div>
           <h2 className="text-3xl font-black italic uppercase text-slate-900 mb-4 tracking-tight">ตารางคะแนนยังไม่พร้อมใช้งาน</h2>
           <p className="text-slate-400 font-bold italic uppercase text-xs tracking-[0.2em] max-w-sm leading-relaxed">ทีมของคุณยังไม่ได้เข้าร่วมลีก หรือฤดูกาลแข่งขันได้สิ้นสุดลงแล้ว</p>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-6 md:p-10 shadow-2xl border border-slate-100 overflow-hidden relative hover:shadow-blue-900/5">
          <StandingsTab leagueId={leagueInfo.id} status={leagueInfo.status} />
        </div>
      )}
    </div>
  );
};

export default StandingsPage;