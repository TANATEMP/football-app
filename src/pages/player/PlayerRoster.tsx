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

  const getPositionColor = (position: string) => {
  const pos = position?.toUpperCase() || '';

  if (pos === 'GK') return 'bg-yellow-500';

  if (pos ===  'DEF') return 'bg-blue-500';

  if (pos ===  'MID') return 'bg-emerald-500';

  if (pos ===  'FWD') return 'bg-rose-500';

  return 'bg-slate-400';
};

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center font-black italic text-slate-400 animate-pulse uppercase tracking-widest">Loading Roster...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20 px-4">
      {/* Header Section */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5 flex flex-col justify-between gap-8">
        <div className="relative z-10">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">My Squad 👥</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">MANAGER AND TEAMMATES</p>
        </div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Roster Section */}
      <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-sm border border-slate-100">
        

        {/* Manager */}
        {myTeam?.manager && (
          <div className="mb-10 p-8 rounded-[2rem] border-2 border-blue-100 bg-blue-50/30 flex items-center gap-6 relative overflow-hidden group hover:border-blue-300 hover:shadow-lg transition-all">
            <div className="absolute -right-4 -bottom-6 text-[100px] font-black italic text-blue-600/5 group-hover:text-blue-600/10 group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500 pointer-events-none select-none z-0">
              MGR
            </div>
            <div className="text-5xl relative z-10 group-hover:scale-110 transition-transform duration-500">👔</div>
            <div className="relative z-10">
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Team Manager</div>
              <div className="text-2xl font-black italic uppercase text-slate-900 tracking-tight">{myTeam.manager.name}</div>
            </div>
          </div>
        )}
        
        {/* Teammates*/}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {roster.map(player => (
            <div key={player.id} className={`p-8 rounded-[2rem] border-2 transition-all hover:shadow-2xl relative overflow-hidden group ${player.id === playerProfile?.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-50 hover:border-blue-100 bg-white'}`}>
              
              <div className="absolute -bottom-4 -right-2 text-[100px] font-black italic text-slate-900/5 group-hover:text-blue-500/20 group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500 pointer-events-none leading-none select-none z-0">
                {player.number || ''}
              </div>

              <div className="text-4xl mb-6 group-hover:scale-125 transition-transform origin-left duration-500 relative z-10">👤</div>
              <div className="relative z-10 pr-10">
                <h4 className="font-black italic uppercase text-sm truncate mb-1 text-slate-900">{player.name}</h4>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getPositionColor(player.position)}`}></span>
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