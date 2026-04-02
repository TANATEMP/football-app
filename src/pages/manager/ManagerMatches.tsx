import { useState, useEffect } from 'react';
import api from '../../lib/api';

const ManagerMatches = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myTeam, setMyTeam] = useState<any>(null);

  const fetchData = async () => {
    try {
      const userRes = await api.get('/user');
      const user = userRes.data.data;
      const team = user.team;
      setMyTeam(team);
      
      if (team?.id) {
        const params: any = { 
          limit: 100, 
          teamId: team.id 
        };
        
        const res = await api.get('/matches', { params });
        const resData = res.data.data || res.data;
        const matchArray = Array.isArray(resData) ? resData : resData.data || resData.rows || [];
        setMatches(matchArray);
      }
    } catch (err) {
      console.error("Match Center Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="p-10 text-center font-black italic text-slate-400 animate-pulse uppercase tracking-widest">
      CONNECTING TO MATCH CENTER...
    </div>
  );

  const sortedMatches = [...matches].sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
  
  const fixtures = sortedMatches.filter(m => 
    (m.status === 'SCHEDULED' || m.status === 'LIVE') && 
    m.leagueId === myTeam?.leagueId
  );
  
  const results = sortedMatches.filter(m => m.status === 'COMPLETED').reverse();

  const noLeague = !myTeam?.leagueId || !myTeam?.league || myTeam?.league?.status === 'COMPLETED';

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter relative z-10 text-blue-400">Match Center ⚽</h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 relative z-10">
          Fixtures & Historical Results for {myTeam?.name}
        </p>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-blue-500 pl-3">Upcoming Battles</h3>
          {noLeague ? (
            <div className="bg-white rounded-[3rem] p-12 text-center shadow-sm border border-slate-100">
               <div className="text-4xl mb-4 grayscale opacity-20">🏟️</div>
               <h2 className="text-lg font-black italic uppercase text-slate-900 mb-2">ยังไม่มีนัดแข่งขันเร็วๆ นี้</h2>
               <p className="text-slate-400 font-black italic uppercase text-[9px] tracking-widest leading-relaxed">
                 {!myTeam?.leagueId ? "ทีมของคุณยังไม่มีสถานะเข้าแข่งในลีกที่กำลังเปิดรับสมัคร" : "ฤดูกาลแข่งขันจบลงแล้ว หรือยังไม่มีการจัดตารางแข่งในขณะนี้"}
               </p>
            </div>
          ) : fixtures.length > 0 ? (
            fixtures.map(match => {
              const isHome = match.homeTeamId === myTeam?.id;
              
              return (
                <div key={match.id} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 group hover:shadow-xl hover:border-blue-200 transition-all duration-500">
                  <div className="text-center mb-6">
                    <div className="inline-block bg-blue-50 border border-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {match.league?.name}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-center space-y-3">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto border transition-transform group-hover:scale-110 ${
                        isHome ? 'border-blue-400 bg-blue-50/50' : 'border-slate-100 bg-slate-50'
                      }`}>
                        {match.homeTeam?.logoUrl ? (
                          <img src={match.homeTeam.logoUrl} className="w-10 h-10 object-contain" />
                        ) : (
                          <span className="font-black italic text-slate-300 text-sm">{match.homeTeam?.shortName}</span>
                        )}
                      </div>
                      <span className={`font-black italic uppercase text-[11px] block truncate ${isHome ? 'text-blue-600' : 'text-slate-500'}`}>
                        {match.homeTeam?.name}
                      </span>
                    </div>
                    
                    <div className="px-4 text-center">
                      <div className="mb-3">
                        <div className="text-xs md:text-sm font-black uppercase text-slate-800 bg-slate-100 px-3 py-1 rounded-lg whitespace-nowrap">
                          {new Date(match.matchDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 mt-1 whitespace-nowrap">
                          {new Date(match.matchDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase italic tracking-widest shadow-lg inline-block">VS</div>
                    </div>

                    <div className="flex-1 text-center space-y-3">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto border transition-transform group-hover:scale-110 ${
                        !isHome ? 'border-blue-400 bg-blue-50/50' : 'border-slate-100 bg-slate-50'
                      }`}>
                        {match.awayTeam?.logoUrl ? (
                          <img src={match.awayTeam.logoUrl} className="w-10 h-10 object-contain" />
                        ) : (
                          <span className="font-black italic text-slate-300 text-sm">{match.awayTeam?.shortName}</span>
                        )}
                      </div>
                      <span className={`font-black italic uppercase text-[11px] block truncate ${!isHome ? 'text-blue-600' : 'text-slate-500'}`}>
                        {match.awayTeam?.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
              <span className="text-4xl block mb-4 opacity-30">📅</span>
              <p className="text-slate-400 font-black italic uppercase text-xs tracking-widest">No scheduled fixtures</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-indigo-500 pl-3">Historical Logs</h3>
          <div className="space-y-3">
            {results.length > 0 ? (
              results.map(match => {
                const isHome = match.homeTeamId === myTeam?.id;
                const myScore = isHome ? match.homeScore : match.awayScore;
                const opScore = isHome ? match.awayScore : match.homeScore;
                const status = myScore > opScore ? 'W' : myScore < opScore ? 'L' : 'D';
                const statusColor = status === 'W' ? 'bg-emerald-500' : status === 'L' ? 'bg-red-500' : 'bg-slate-400';

                return (
                  <div key={match.id} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-4 group hover:shadow-lg transition-all duration-300">
                    <div className={`w-8 h-8 ${statusColor} rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-lg shrink-0`}>
                      {status}
                    </div>
                    
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`text-[11px] font-black italic uppercase truncate w-12 ${isHome ? 'text-blue-600' : 'text-slate-400'}`}>
                          {match.homeTeam?.shortName || match.homeTeam?.name}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 shrink-0">
                          <span className={`text-sm font-black italic ${match.homeScore > match.awayScore ? 'text-blue-600' : 'text-slate-400'}`}>
                            {match.homeScore}
                          </span>
                          <span className="text-[8px] font-black text-slate-300 opacity-50">-</span>
                          <span className={`text-sm font-black italic ${match.awayScore > match.homeScore ? 'text-blue-600' : 'text-slate-400'}`}>
                            {match.awayScore}
                          </span>
                        </div>
                        <div className={`text-[11px] font-black italic uppercase truncate w-12 ${!isHome ? 'text-blue-600' : 'text-slate-400'}`}>
                          {match.awayTeam?.shortName || match.awayTeam?.name}
                        </div>
                      </div>
                      
                      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 ml-4">
                        <div className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded truncate max-w-[120px]">
                          {match.league?.name}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500">
                          {new Date(match.matchDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
                <span className="text-4xl block mb-4 opacity-30">📉</span>
                <p className="text-slate-400 font-black italic uppercase text-xs tracking-widest">No past results recorded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerMatches;