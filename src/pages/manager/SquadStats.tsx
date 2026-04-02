import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

interface PlayerStat {
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  stats: PlayerStat[];
}

const SquadStats = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'goals', direction: 'desc' });

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const userRes = await api.get('/user');
      const team = userRes.data.data?.team;
      if (!team) return;
      setTeamName(team.name);

      const playersRes = await api.get('/players', { params: { teamId: team.id, limit: 100 } });
      const payload = playersRes.data.data !== undefined ? playersRes.data.data : playersRes.data;
      const rows = Array.isArray(payload) ? payload : (payload.data || []);
      setPlayers(rows);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getAggregatedStats = (player: Player) => {
    return player.stats.reduce((acc, curr) => ({
      goals: acc.goals + curr.goals,
      assists: acc.assists + curr.assists,
      yellowCards: acc.yellowCards + curr.yellowCards,
      redCards: acc.redCards + curr.redCards
    }), { goals: 0, assists: 0, yellowCards: 0, redCards: 0 });
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const statsA = getAggregatedStats(a);
    const statsB = getAggregatedStats(b);
    const valA = (statsA as any)[sortConfig.key] ?? 0;
    const valB = (statsB as any)[sortConfig.key] ?? 0;

    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  if (loading) return <div className="p-10 text-center font-black italic text-slate-400 animate-pulse">ANALYZING SQUAD DATA...</div>;

  const topScorer = [...players].sort((a, b) => getAggregatedStats(b).goals - getAggregatedStats(a).goals)[0];
  const topAssist = [...players].sort((a, b) => getAggregatedStats(b).assists - getAggregatedStats(a).assists)[0];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-fade-in">
      {/* Header */}
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="relative z-10">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter shrink-0 flex items-center gap-4">
            Squad Stats 📊
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 relative z-10">
          Analyze your player performance
        </p>
        </div>
      </div>

      {/* Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topScorer && getAggregatedStats(topScorer).goals > 0 && (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group hover:scale-[1.02] transition-all">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">GOLDEN BOOT</p>
             <h3 className="text-3xl font-black italic uppercase leading-none mb-1">{topScorer.name}</h3>
             <p className="text-blue-200 font-bold italic text-sm">#{topScorer.number} • {topScorer.position}</p>
             <div className="mt-8 flex items-end gap-3 font-black italic">
                <span className="text-6xl">{getAggregatedStats(topScorer).goals}</span>
                <span className="text-xl mb-2 opacity-50 uppercase tracking-tighter">Goals Scored</span>
             </div>
          </div>
        )}

        {topAssist && getAggregatedStats(topAssist).assists > 0 && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
             </div>
             <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2">TOP ASSISTANT</p>
             <h3 className="text-3xl font-black text-slate-900 italic uppercase leading-none mb-1">{topAssist.name}</h3>
             <p className="text-slate-400 font-bold italic text-sm">#{topAssist.number} • {topAssist.position}</p>
             <div className="mt-8 flex items-end gap-3 font-black italic text-slate-900">
                <span className="text-6xl">{getAggregatedStats(topAssist).assists}</span>
                <span className="text-xl mb-2 text-slate-300 uppercase tracking-tighter">Assists Provided</span>
             </div>
          </div>
        )}

        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
           <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-2">SQUAD SUMMARY</p>
           <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                 <span className="text-xs font-bold text-white/40 uppercase">Total Players</span>
                 <span className="text-xl font-black italic">{players.length}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                 <span className="text-xs font-bold text-white/40 uppercase">Season Goals</span>
                 <span className="text-xl font-black italic text-blue-400">{players.reduce((sum, p) => sum + getAggregatedStats(p).goals, 0)}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Main Stats Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
           <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">Detailed Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic border-b border-slate-50">
                <th className="p-8 w-16 text-center">#</th>
                <th className="p-8">Player</th>
                <th className="p-8 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => requestSort('goals')}>Goals {sortConfig.key === 'goals' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th className="p-8 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => requestSort('assists')}>Assists {sortConfig.key === 'assists' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th className="p-8 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => requestSort('yellowCards')}>Yellow {sortConfig.key === 'yellowCards' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th className="p-8 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => requestSort('redCards')}>Red {sortConfig.key === 'redCards' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedPlayers.map((player) => {
                const s = getAggregatedStats(player);
                return (
                  <tr key={player.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="p-8 font-black text-slate-300 text-center text-xl italic group-hover:text-blue-600">{player.number}</td>
                    <td className="p-8">
                       <p className="font-black text-slate-900 italic uppercase tracking-tighter leading-none group-hover:translate-x-1 transition-transform">{player.name}</p>
                       <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{player.position}</p>
                    </td>
                    <td className="p-8">
                       <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic text-xl shadow-inner border border-slate-50 ${s.goals > 0 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50/50 text-slate-300'}`}>
                          {s.goals}
                       </span>
                    </td>
                    <td className="p-8 font-black italic text-lg text-slate-800">{s.assists}</td>
                    <td className="p-8">
                       <div className="flex items-center gap-2">
                          <div className={`w-4 h-6 rounded-sm shadow-sm ${s.yellowCards > 0 ? 'bg-yellow-400' : 'bg-slate-100 grayscale'}`}></div>
                          <span className="font-black text-slate-400 italic text-sm">{s.yellowCards}</span>
                       </div>
                    </td>
                    <td className="p-8">
                       <div className="flex items-center gap-2">
                          <div className={`w-4 h-6 rounded-sm shadow-sm ${s.redCards > 0 ? 'bg-red-500' : 'bg-slate-100 grayscale'}`}></div>
                          <span className="font-black text-slate-400 italic text-sm">{s.redCards}</span>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SquadStats;