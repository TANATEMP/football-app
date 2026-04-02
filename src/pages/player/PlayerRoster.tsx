import { useState, useEffect } from 'react';
import api from '../../lib/api';

const PlayerRoster = () => {
  const [roster, setRoster] = useState<any[]>([]);
  const [playerProfile, setPlayerProfile] = useState<any>(null);
  const [myTeam, setMyTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const userRes = await api.get('/user');
      const profile = userRes.data.data?.player || userRes.data.player;
      setPlayerProfile(profile);

      if (profile?.teamId) {
        const teamRes = await api.get(`/teams/${profile.teamId}`);
        const teamData = teamRes.data.data || teamRes.data;
        setMyTeam(teamData);
        setRoster(teamData.players || []);
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

  if (loading) return <div className="p-10 text-center font-black italic text-slate-400 animate-pulse uppercase tracking-widest">Loading Roster...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="relative z-10">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">My Squad 👥</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">The Active Roster</p>
        </div>
        
        {myTeam?.manager && (
          <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl flex items-center gap-4 group hover:bg-white/10 transition-all">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">👔</div>
            <div>
              <div className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Team Manager</div>
              <div className="text-sm font-black italic uppercase text-white">{myTeam.manager.name}</div>
            </div>
          </div>
        )}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-blue-500 pl-3">Registered Players</h3>
          <span className="text-[10px] font-black text-blue-600 uppercase italic tracking-widest bg-blue-50 px-4 py-2 rounded-full">{roster.length} Squad Members</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {roster.map(player => (
            <div key={player.id} className={`p-8 rounded-[2rem] border-2 transition-all hover:shadow-2xl relative overflow-hidden group ${player.id === playerProfile?.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-50 hover:border-blue-100 bg-white'}`}>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-slate-50 group-hover:bg-blue-600 transition-colors rotate-45 group-hover:rotate-0 flex items-center justify-center border-b border-l border-slate-100 group-hover:border-transparent">
                <span className="text-xs font-black text-slate-400 group-hover:text-white -rotate-45 group-hover:rotate-0 transition-all font-mono">#{player.number || '--'}</span>
              </div>
              <div className="text-4xl mb-6 group-hover:scale-125 transition-transform origin-left duration-500">👤</div>
              <div>
                <h4 className="font-black italic uppercase text-sm truncate mb-1 text-slate-900">{player.name}</h4>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${player.position === 'GK' ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{player.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerRoster;
