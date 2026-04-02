import { useState, useEffect } from 'react';
import api from '../../lib/api';

const PlayerStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const userRes = await api.get('/user');
      const playerProfile = userRes.data.data?.player || userRes.data.player;
      
      if (playerProfile) {
        const aggregatedStats = playerProfile.stats?.reduce((acc: any, curr: any) => ({
          matches: acc.matches + (curr.matchesPlayed || 0),
          goals: acc.goals + (curr.goals || 0),
          assists: acc.assists + (curr.assists || 0),
          yellowCards: acc.yellowCards + (curr.yellowCards || 0),
          redCards: acc.redCards + (curr.redCards || 0),
          rating: 0 // Logic to be added later
        }), { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, rating: 0 });

        setStats({
          ...aggregatedStats,
          topSpeed: '0 km/h',
          distance: '0.0 km',
          passAccuracy: '0%'
        });
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

  if (loading) return <div className="p-10 text-center font-black italic text-slate-400 animate-pulse uppercase tracking-widest">Loading Performance Stats...</div>;

  const statCards = [
    { label: 'Goals', value: stats.goals, icon: '⚽', color: 'green' },
    { label: 'Assists', value: stats.assists, icon: '🎯', color: 'purple' },
    { label: 'Rating', value: stats.rating, icon: '⭐', color: 'yellow' },
    { label: 'Yellow Cards', value: stats.yellowCards, icon: '🟨', color: 'orange' },
    { label: 'Red Cards', value: stats.redCards, icon: '🟥', color: 'red' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter relative z-10">Career Stats 📊</h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 relative z-10">Seasonal Performance Data</p>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {statCards.map(stat => (
          <div key={stat.label} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
            <div className="text-3xl mb-4">{stat.icon}</div>
            <div className="text-3xl font-black italic text-slate-800">{stat.value}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-sm border border-slate-100">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-emerald-500 pl-3 mb-10">Advanced Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Top Speed</div>
            <div className="text-2xl font-black italic text-slate-900">{stats.topSpeed}</div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
               <div className="bg-blue-600 h-full" style={{ width: '0%' }}></div>
            </div>
          </div>
          <div className="space-y-4">
             <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Avg Distance / Match</div>
             <div className="text-2xl font-black italic text-slate-900">{stats.distance}</div>
             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
               <div className="bg-emerald-600 h-full" style={{ width: '0%' }}></div>
            </div>
          </div>
          <div className="space-y-4">
             <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pass Accuracy</div>
             <div className="text-2xl font-black italic text-slate-900">{stats.passAccuracy}</div>
             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
               <div className="bg-indigo-600 h-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
