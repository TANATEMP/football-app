import { useState, useEffect } from 'react';
import api from '../../lib/api';
import axios from 'axios';

// --- Types ---
type PlayerStatus = 'ONBOARDING' | 'FREE_AGENT' | 'PENDING' | 'SIGNED';

interface TeamInfo {
  id: string;
  name: string;
  managerId: string;
}

const PlayerDashboard = () => {
  const [status, setStatus] = useState<PlayerStatus>('ONBOARDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTeams, setAvailableTeams] = useState<TeamInfo[]>([]);
  const [myTeam, setMyTeam] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerProfile, setPlayerProfile] = useState<any>(null);
  const [onboardingForm, setOnboardingForm] = useState({ name: '', position: 'MID' as any });

  const fetchData = async () => {
    try {
      setLoading(true);
      const userRes = await api.get('/user');
      const userData = userRes.data.data || userRes.data;
      const playerProfile = userData.player;
      const userName = userData.name;
      
      // 1. Check if already signed to a team
      if (playerProfile?.teamId) {
        // Fetch Detailed Signed Data
        const teamId = playerProfile.teamId;

        const [teamRes, matchRes, standingsRes] = await Promise.all([
          api.get(`/teams/${teamId}`),
          api.get(`/matches?teamId=${teamId}&limit=100`),
          playerProfile?.team?.leagueId ? api.get(`/leagues/${playerProfile.team.leagueId}/standings`) : Promise.resolve({ data: { data: [] } })
        ]);

        const teamDataFinal = teamRes.data.data !== undefined ? teamRes.data.data : teamRes.data;
        setMyTeam(teamDataFinal);
        setPlayerProfile(playerProfile); 
        
        const standingsData = standingsRes.data.data !== undefined ? standingsRes.data.data : standingsRes.data;
        setStandings(Array.isArray(standingsData) ? standingsData : []);
        
        const matchResData = matchRes.data.data !== undefined ? matchRes.data.data : matchRes.data;
        // Check if it's the PaginatedResult { data: [...], pagination: {...} } OR a raw array
        let matchArray = [];
        if (Array.isArray(matchResData)) {
          matchArray = matchResData;
        } else if (matchResData && Array.isArray(matchResData.data)) {
          matchArray = matchResData.data;
        } else if (matchResData && Array.isArray(matchResData.rows)) {
          matchArray = matchResData.rows;
        }
        
        setMatches(matchArray);
        setStatus('SIGNED');
        return;
      }

      // 2. Check for pending requests if not signed
      const reqsRes = await api.get('/join-requests/me');
      const reqsPayload = reqsRes.data.data !== undefined ? reqsRes.data.data : reqsRes.data;
      const reqs = Array.isArray(reqsPayload) ? reqsPayload : reqsPayload?.data || [];
      const pending = reqs.find((r: any) => r.status === 'PENDING');

      if (pending) {
        setStatus('PENDING');
        setMyTeam(pending.team);
      } else if (playerProfile) {
        // Has profile but no team and no pending request
        setStatus('FREE_AGENT');
        const teamsRes = await api.get('/teams');
        const teamsPayload = teamsRes.data.data !== undefined ? teamsRes.data.data : teamsRes.data;
        const teamsData = Array.isArray(teamsPayload) ? teamsPayload : teamsPayload?.data || [];
        setAvailableTeams(teamsData);
        setPlayerProfile(playerProfile);
      } else {
        // No profile yet
        setStatus('ONBOARDING');
        setOnboardingForm(prev => ({ ...prev, name: userName }));
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCompleteOnboarding = async () => {
    if (!onboardingForm.name || !onboardingForm.position) {
      alert('โปรดระบุชื่อและตำแหน่งของคุณ');
      return;
    }
    try {
      setLoading(true);
      await api.post('/players', onboardingForm);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestJoin = async (team: TeamInfo) => {
    try {
      await api.post('/join-requests', { teamId: team.id });
      alert('Join request sent!');
      fetchData();
    } catch (err) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.message || 'Error occurred');
    }
  };

  const myStats = playerProfile?.stats?.reduce((acc: any, curr: any) => ({
    matches: acc.matches + (curr.matchesPlayed || 0),
    goals: acc.goals + (curr.goals || 0),
    assists: acc.assists + (curr.assists || 0),
    rating: 0 
  }), { matches: 0, goals: 0, assists: 0, rating: 0 }) || { matches: 0, goals: 0, assists: 0, rating: 0 };

  const currentRank = standings.findIndex((s: any) => s.teamId === myTeam?.id) + 1;
  const totalTeams = standings.length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-black italic text-slate-400 uppercase tracking-widest animate-pulse">Initializing Career...</p>
      </div>
    </div>
  );

  // ==========================================
  // ⚡ 0. สถานะ: ลงทะเบียนใหม่ (ONBOARDING)
  // ==========================================
  if (status === 'ONBOARDING') {
    const positions = [
      { id: 'GK', label: 'Goalkeeper', icon: '🧤', desc: 'The last line of defense.' },
      { id: 'DEF', label: 'Defender', icon: '🛡️', desc: 'Solid as a rock.' },
      { id: 'MID', label: 'Midfielder', icon: '🎯', desc: 'The engine of the team.' },
      { id: 'FWD', label: 'Forward', icon: '⚽', desc: 'The goal machine.' },
    ];

    return (
      <div className="max-w-4xl mx-auto space-y-8 py-10 animate-fade-in">
        <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5 text-center">
          <div className="relative z-10">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full font-black text-[9px] uppercase tracking-widest border border-blue-400/20 italic mb-4 inline-block">Pro Career Initialization</span>
            <h1 className="text-5xl font-black tracking-tighter mb-4 italic uppercase">Create Your Profile</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">กำหนดตัวตนและตำแหน่งของคุณเพื่อเริ่มต้นเส้นทางนักเตะอาชีพ</p>
          </div>
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-10">
          {/* Name Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic border-l-2 border-blue-600 pl-3">Player Identity</h3>
            <input 
              type="text" 
              placeholder="Enter your field name..."
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-black italic uppercase tracking-wider text-slate-800"
              value={onboardingForm.name}
              onChange={(e) => setOnboardingForm(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {/* Position Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic border-l-2 border-emerald-600 pl-3">Specialization</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {positions.map(pos => (
                <button
                  key={pos.id}
                  onClick={() => setOnboardingForm(prev => ({ ...prev, position: pos.id }))}
                  className={`p-6 rounded-[2rem] border-2 transition-all text-left space-y-3 group ${
                    onboardingForm.position === pos.id 
                    ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className={`text-3xl transition-transform group-hover:scale-125 duration-300 ${onboardingForm.position === pos.id ? 'scale-110' : ''}`}>
                    {pos.icon}
                  </div>
                  <div>
                    <div className={`font-black uppercase italic text-xs ${onboardingForm.position === pos.id ? 'text-blue-600' : 'text-slate-900'}`}>
                      {pos.label}
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 leading-tight mt-1">{pos.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleCompleteOnboarding}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest italic shadow-2xl hover:bg-blue-600 transition-all active:scale-95 text-xs mt-4"
          >
            INITIALIZE CAREER ⚽
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🔴 1. สถานะ: ไร้สังกัด (FREE AGENT) - ค้นหาทีม
  // ==========================================
  if (status === 'FREE_AGENT') {
    const filteredTeams = availableTeams.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-gray-800 to-gray-600 rounded-2xl p-8 text-white shadow-lg text-center">
          <div className="text-5xl mb-4">👟</div>
          <h1 className="text-3xl font-black mb-2">You are a Free Agent</h1>
          <p className="text-gray-200">ค้นหาสโมสรที่คุณต้องการเข้าร่วม และส่งคำขอเพื่อเริ่มต้นเส้นทางของคุณ</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="relative mb-6">
            <input 
              type="text" 
              placeholder="Search for a club by name..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="w-6 h-6 text-gray-400 absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          <div className="space-y-3">
            {filteredTeams.length > 0 ? filteredTeams.map(team => (
              <div key={team.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black">
                    {team.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{team.name}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => handleRequestJoin(team)}
                  className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  Request to Join
                </button>
              </div>
            )) : (
              <p className="text-center text-gray-500 py-8">ไม่พบสโมสรที่คุณค้นหา</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🟡 2. สถานะ: รออนุมัติ (PENDING)
  // ==========================================
  if (status === 'PENDING') {
    return (
      <div className="max-w-3xl mx-auto pt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-center p-10">
          <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Pending</h1>
          <p className="text-gray-500 mb-6">
            คุณได้ส่งคำขอเข้าร่วมทีม <span className="font-bold text-gray-800">"{myTeam?.name}"</span> แล้ว<br/>
            โปรดรอผู้จัดการทีมอนุมัติคำขอของคุณ
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => {}} className="px-6 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-bold transition-colors">
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🟢 3. สถานะ: มีสังกัด (SIGNED) - Dashboard ปกติ (Overview Only)
  // ==========================================
  // Sort matches by date to ensure nextMatch and recentResult are accurate
  const sortedMatches = [...matches].sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
  
  const nextMatch = sortedMatches.find(m => m.status === 'SCHEDULED' || m.status === 'LIVE');
  const recentResult = [...sortedMatches].filter(m => m.status === 'COMPLETED').reverse()[0];

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
      
      {/* 🚀 Dynamic Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden border border-white/5">
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 text-center md:text-left">
            <div className="relative p-2 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
              <div className="w-40 h-40 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-7xl shadow-inner border border-white/10 transform -rotate-3 hover:rotate-0 transition-transform duration-700">
                👤
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl border-4 border-slate-900 shadow-2xl">
                {playerProfile?.number || '--'}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-4 py-1.5 bg-blue-600 rounded-full font-black text-[10px] uppercase tracking-widest border border-blue-400/30 italic shadow-lg shadow-blue-900/50">
                  {myTeam?.name}
                </span>
                <span className="px-4 py-1.5 bg-white/10 rounded-full font-black text-[10px] uppercase tracking-widest border border-white/10 italic backdrop-blur-md">
                  {playerProfile?.position || 'Unknown'}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase drop-shadow-2xl">{playerProfile?.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-4">
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></span> Active Pro Profile
                 </p>
                 <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">Season 2024</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 md:gap-6 relative z-10 w-full md:w-auto mt-4 md:mt-0">
            <div className="flex-1 md:flex-none px-6 py-4 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 text-center shadow-xl">
              <div className="text-3xl font-black italic text-emerald-400">{myStats.goals}</div>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Goals</div>
            </div>
            <div className="flex-1 md:flex-none px-6 py-4 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 text-center shadow-xl">
              <div className="text-3xl font-black italic text-blue-400">{myStats.assists}</div>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Assists</div>
            </div>
          </div>

          <div className="absolute -right-40 -bottom-40 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        </div>
      </div>

      {/* 🏠 Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          
          {/* Next Match Card */}
          <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-700">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic border-l-4 border-orange-500 pl-4">Next Match</h3>
                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-5">{nextMatch?.league?.name}</div>
              </div>
              <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 w-1/3 animate-shimmer"></div>
              </div>
            </div>
            
            {(!myTeam?.leagueId || !myTeam?.league || myTeam?.league?.status === 'COMPLETED') ? (
              <div className="text-center py-10 px-4">
                <div className="text-4xl mb-4 grayscale opacity-30">🏟️</div>
                <p className="text-slate-400 font-black italic uppercase text-[10px] tracking-widest leading-relaxed">ทีมกำลังรอเข้าร่วมลีกใหม่<br/>Wait for league registration.</p>
              </div>
            ) : nextMatch ? (
              <div className="flex items-center justify-between text-center relative z-10">
                <div className="flex-1 transition-transform duration-500 group-hover:scale-110">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 border border-slate-100 shadow-sm shadow-slate-200/50">
                    {nextMatch.homeTeam?.logoUrl ? <img src={nextMatch.homeTeam.logoUrl} className="w-14 h-14 object-contain" /> : nextMatch.homeTeam?.name?.charAt(0)}
                  </div>
                  <div className="font-black italic uppercase text-sm tracking-tight truncate max-w-[150px] mx-auto text-slate-900">{nextMatch.homeTeam?.name}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Home</div>
                </div>
                
                <div className="px-10">
                  <div className="text-5xl font-black italic text-slate-100 mb-4 tracking-tighter opacity-50">VS</div>
                  <div className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest italic shadow-2xl shadow-slate-900/40">
                    {new Date(nextMatch.matchDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex-1 transition-transform duration-500 group-hover:scale-110">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 border border-slate-100 shadow-sm shadow-slate-200/50">
                    {nextMatch.awayTeam?.logoUrl ? <img src={nextMatch.awayTeam.logoUrl} className="w-14 h-14 object-contain" /> : nextMatch.awayTeam?.name?.charAt(0)}
                  </div>
                  <div className="font-black italic uppercase text-sm tracking-tight truncate max-w-[150px] mx-auto text-slate-900">{nextMatch.awayTeam?.name}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Away</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-4xl mb-4 grayscale opacity-30">🏟️</div>
                <p className="text-slate-400 font-black italic uppercase text-xs tracking-widest">Wait for coach schedule.</p>
              </div>
            )}
            
            <div className="absolute right-0 top-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full opacity-50"></div>
          </div>

          <div className="grid grid-cols-1 gap-8">
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-4">Latest Result</h3>
               <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{recentResult?.league?.name}</div>
            </div>
            {recentResult ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between text-center relative">
                  <div className="w-14 space-y-2">
                     <div className="text-[10px] font-black italic uppercase truncate">{recentResult.homeTeam?.name}</div>
                     <div className={`text-4xl font-black italic ${recentResult.homeScore > recentResult.awayScore ? 'text-indigo-600' : 'text-slate-300'}`}>{recentResult.homeScore}</div>
                  </div>
                  <div className="text-slate-200 font-black italic text-xl">X</div>
                  <div className="w-14 space-y-2">
                     <div className="text-[10px] font-black italic uppercase truncate text-right">{recentResult.awayTeam?.name}</div>
                     <div className={`text-4xl font-black italic ${recentResult.awayScore > recentResult.homeScore ? 'text-indigo-600' : 'text-slate-300'}`}>{recentResult.awayScore}</div>
                  </div>
                </div>
                <div className="text-center">
                  <span className="px-4 py-2 bg-slate-50 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] italic border border-slate-100">Official Result</span>
                </div>
              </div>
            ) : (!myTeam?.leagueId || !myTeam?.league || myTeam?.league?.status === 'COMPLETED') ? (
              <div className="text-center py-8 space-y-3">
                <div className="text-3xl opacity-20 mx-auto">🏟️</div>
                <p className="text-slate-300 font-black italic uppercase text-[9px] tracking-widest leading-relaxed">No active league matches.</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-300 font-black italic uppercase text-[10px] tracking-widest">Season beginning soon...</p>
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-500/20 group relative overflow-hidden">
            <div className="relative z-10">
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-500">🏆</div>
                <h3 className="font-black italic uppercase text-2xl mb-2 tracking-tighter">League Progress</h3>
                
                {(!myTeam?.leagueId || !myTeam?.league || myTeam?.league?.status === 'COMPLETED') ? (
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mb-8 leading-relaxed">
                    Waiting for the season to start. Your rank will appear here once the league is active.
                  </p>
                ) : (
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mb-8 leading-relaxed">
                    Your team is currently ranked <span className="text-white font-black italic">#{currentRank || '--'}</span> out of {totalTeams || '--'} teams.
                  </p>
                )}
                
                <button 
                  onClick={() => window.location.href = '/player/standings'}
                  className="w-full py-4 bg-white text-emerald-600 rounded-2xl font-black uppercase tracking-widest italic text-[10px] shadow-2xl hover:bg-slate-900 hover:text-white transition-all transform active:scale-95"
               >
                  Full League Table 🛡️
               </button>
             </div>
             {(myTeam?.leagueId && myTeam?.league?.status !== 'COMPLETED') && (
               <div className="absolute -right-10 -bottom-10 text-[12rem] opacity-10 font-black italic select-none">#{currentRank || '--'}</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;