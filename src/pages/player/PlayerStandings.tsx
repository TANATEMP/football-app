import { useState, useEffect } from 'react';
import api from '../../lib/api';

const PlayerStandings = () => {
  const [standings, setStandings] = useState<any[]>([]);
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [playerProfile, setPlayerProfile] = useState<any>(null);

  const fetchData = async () => {
    try {
      const userRes = await api.get('/user');
      const profile = userRes.data.data?.player || userRes.data.player;
      setPlayerProfile(profile);
      
      if (profile?.team?.leagueId) {
        setMyTeamId(profile.teamId);
        const res = await api.get(`/leagues/${profile.team.leagueId}/standings`);
        setStandings(res.data.data || res.data);
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

  if (loading) return <div className="p-10 text-center font-black italic text-slate-400 animate-pulse uppercase tracking-widest">Loading Standings...</div>;

  const noLeague = !playerProfile?.team?.leagueId || playerProfile?.team?.league?.status === 'COMPLETED';

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter relative z-10">League Table 🏆</h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 relative z-10">Current Season Standings</p>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {noLeague ? (
        <div className="bg-white rounded-[3rem] p-20 text-center shadow-sm border border-slate-100">
           <div className="text-6xl mb-6 grayscale opacity-20">🏆</div>
           <h2 className="text-2xl font-black italic uppercase text-slate-900 mb-2">ตารางคะแนนยังไม่พร้อมใช้งาน</h2>
           <p className="text-slate-400 font-black italic uppercase text-xs tracking-widest">ทีมของคุณไม่ได้อยู่ในลีกที่กำลังแข่งขัน หรือลีกได้จบฤดูกาลแล้ว</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-50">
                  <th className="px-6 py-4 text-left font-black">Rank</th>
                  <th className="px-6 py-4 text-left font-black">Club</th>
                  <th className="px-6 py-4 text-center font-black">MP</th>
                  <th className="px-6 py-4 text-center font-black">W</th>
                  <th className="px-6 py-4 text-center font-black">D</th>
                  <th className="px-6 py-4 text-center font-black">L</th>
                  <th className="px-6 py-4 text-center font-black">GD</th>
                  <th className="px-6 py-4 text-center font-black">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team, idx) => (
                  <tr 
                    key={team.teamId} 
                    className={`border-b border-slate-50 transition-all group ${team.teamId === myTeamId ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-6 py-6 text-xs font-black italic text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 shadow-sm flex items-center justify-center bg-white group-hover:scale-110 transition-transform">
                          {team.team.logoUrl ? <img src={team.team.logoUrl} className="w-6 h-6 object-contain" /> : <div className="text-[10px] font-black">{team.team.name.charAt(0)}</div>}
                        </div>
                        <span className={`font-black italic uppercase text-sm ${team.teamId === myTeamId ? 'text-blue-600' : 'text-slate-900'}`}>{team.team.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center text-xs font-bold text-slate-500">{team.played}</td>
                    <td className="px-6 py-6 text-center text-xs font-bold text-slate-900">{team.won}</td>
                    <td className="px-6 py-6 text-center text-xs font-bold text-slate-900">{team.drawn}</td>
                    <td className="px-6 py-6 text-center text-xs font-bold text-slate-900">{team.lost}</td>
                    <td className="px-6 py-6 text-center text-xs font-bold text-blue-600 italic">{(team.goalDifference > 0 ? '+' : '') + team.goalDifference}</td>
                    <td className="px-6 py-6 text-center font-black italic text-base">{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {standings.length === 0 && (
            <div className="text-center py-20 text-slate-400 font-black italic uppercase text-xs tracking-widest">No standings data available for this league yet.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerStandings;
