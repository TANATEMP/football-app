import { useState, useEffect } from 'react';
import api from '../../lib/api';

const PlayerMatches = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [playerProfile, setPlayerProfile] = useState<any>(null);

  const fetchData = async () => {
    try {
      const userRes = await api.get('/user');
      const profile = userRes.data.data?.player || userRes.data.player;
      setPlayerProfile(profile);
      if (profile?.teamId) {
        const res = await api.get(`/matches?teamId=${profile.teamId}&limit=100`);
        const resData = res.data.data || res.data;
        const matchArray = Array.isArray(resData) ? resData : resData.data || resData.rows || [];
        setMatches(matchArray);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center font-black italic text-slate-400 animate-pulse uppercase tracking-widest">Loading Fixtures...</div>;

  const team = playerProfile?.team || playerProfile?.player?.team;
  const noLeague = !team?.leagueId || !team?.league || team?.league?.status === 'COMPLETED';
  
  const sortedMatches = [...matches].sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
  
  const fixtures = sortedMatches.filter(m => 
    (m.status === 'SCHEDULED' || m.status === 'LIVE') && 
    m.leagueId === team?.leagueId
  );
  
  const results = sortedMatches.filter(m => m.status === 'COMPLETED').reverse();

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter relative z-10">Match Center ⚽</h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 relative z-10">Fixtures & Historical Results</p>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-orange-500 pl-3">Upcoming Fixtures</h3>
          {noLeague ? (
            <div className="bg-white rounded-[3rem] p-12 text-center shadow-sm border border-slate-100">
               <div className="text-4xl mb-4 grayscale opacity-20">🏟️</div>
               <h2 className="text-lg font-black italic uppercase text-slate-900 mb-2">ยังไม่มีรายการแข่งขัน</h2>
               <p className="text-slate-400 font-black italic uppercase text-[9px] tracking-widest">ทีมของคุณกำลังรอเข้าร่วมลีกใหม่ในฤดูกาลถัดไป</p>
            </div>
          ) : fixtures.length > 0 ? (
            fixtures.map(match => (
              <div key={match.id} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 group hover:shadow-xl hover:border-orange-100 transition-all duration-500">
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-6 text-center">{match.league?.name}</div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-center space-y-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl mx-auto border border-slate-100 group-hover:scale-110 transition-transform">
                      {match.homeTeam?.logoUrl ? <img src={match.homeTeam.logoUrl} className="w-10 h-10 object-contain" /> : <span className="font-black italic text-slate-300 text-sm">{match.homeTeam?.shortName}</span>}
                    </div>
                    <span className="font-black italic uppercase text-[11px] block truncate">{match.homeTeam?.name}</span>
                  </div>
                  
                  <div className="px-6 text-center">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 mb-2">{new Date(match.matchDate).toLocaleDateString()}</div>
                    <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase italic tracking-widest shadow-lg">VS</div>
                  </div>

                  <div className="flex-1 text-center space-y-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl mx-auto border border-slate-100 group-hover:scale-110 transition-transform">
                      {match.awayTeam?.logoUrl ? <img src={match.awayTeam.logoUrl} className="w-10 h-10 object-contain" /> : <span className="font-black italic text-slate-300 text-sm">{match.awayTeam?.shortName}</span>}
                    </div>
                    <span className="font-black italic uppercase text-[11px] block truncate">{match.awayTeam?.name}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
              <span className="text-4xl block mb-4 opacity-30">📅</span>
              <p className="text-slate-400 font-black italic uppercase text-xs tracking-widest">No matches currently scheduled.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-indigo-500 pl-3">Past Results</h3>
          <div className="space-y-3">
            {results.length > 0 ? (
              results.map(match => {
                const isHome = match.homeTeamId === team?.id;
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
                        <div className="text-[11px] font-black italic uppercase text-slate-400 w-12 truncate">{match.homeTeam?.shortName || match.homeTeam?.name}</div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 shrink-0">
                          <span className={`text-sm font-black italic ${match.homeScore > match.awayScore ? 'text-indigo-600' : 'text-slate-400'}`}>{match.homeScore}</span>
                          <span className="text-[8px] font-black text-slate-300 opacity-50">-</span>
                          <span className={`text-sm font-black italic ${match.awayScore > match.homeScore ? 'text-indigo-600' : 'text-slate-400'}`}>{match.awayScore}</span>
                        </div>
                        <div className="text-[11px] font-black italic uppercase text-slate-400 w-12 truncate">{match.awayTeam?.shortName || match.awayTeam?.name}</div>
                      </div>
                      
                      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 ml-4">
                        <div className="text-[7px] font-black uppercase tracking-widest text-slate-300 truncate max-w-[80px]">
                          {match.league?.name}
                        </div>
                        <div className="text-[8px] font-bold text-slate-400 opacity-60">
                          {new Date(match.matchDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
                <span className="text-4xl block mb-4 opacity-30">📉</span>
                <p className="text-slate-400 font-black italic uppercase text-xs tracking-widest">No results found for this season.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerMatches;
