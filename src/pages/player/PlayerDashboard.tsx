import { useState, useEffect } from 'react';
import api from '../../lib/api';
import axios from 'axios';
import ConfirmModal from '../../components/ConfirmModal'; // 🔵 นำเข้า ConfirmModal

// --- Types ---
type PlayerStatus = 'ONBOARDING' | 'FREE_AGENT' | 'PENDING' | 'SIGNED';

interface TeamInfo {
  id: string;
  name: string;
  managerId: string;
}

// 🔵 กำหนด Interface สำหรับ Modal State
interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'DANGER';
  onConfirm?: () => void;
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

  // 🔵 State สำหรับควบคุม Modal
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'INFO',
  });

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  const fetchData = async () => {
    try {
      setLoading(true);
      const userRes = await api.get('/user');
      const userData = userRes.data.data || userRes.data;
      const playerProfile = userData.player;
      const userName = userData.name;
      
      if (playerProfile?.teamId) {
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

      const reqsRes = await api.get('/join-requests/me');
      const reqsPayload = reqsRes.data.data !== undefined ? reqsRes.data.data : reqsRes.data;
      const reqs = Array.isArray(reqsPayload) ? reqsPayload : reqsPayload?.data || [];
      const pending = reqs.find((r: any) => r.status === 'PENDING');

      if (pending) {
        setStatus('PENDING');
        setMyTeam(pending.team);
      } else if (playerProfile) {
        setStatus('FREE_AGENT');
        const teamsRes = await api.get('/teams');
        const teamsPayload = teamsRes.data.data !== undefined ? teamsRes.data.data : teamsRes.data;
        const teamsData = Array.isArray(teamsPayload) ? teamsPayload : teamsPayload?.data || [];
        setAvailableTeams(teamsData);
        setPlayerProfile(playerProfile);
      } else {
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
      // 🔵 แทนที่ alert ด้วย Modal
      setModal({
        isOpen: true,
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'โปรดระบุชื่อและตำแหน่งของคุณเพื่อเริ่มต้นอาชีพนักเตะ',
        type: 'DANGER',
        onConfirm: closeModal
      });
      return;
    }
    try {
      setLoading(true);
      await api.post('/players', onboardingForm);
      await fetchData();
    } catch (err: any) {
      setModal({
        isOpen: true,
        title: 'เกิดข้อผิดพลาด',
        message: err.response?.data?.message || 'ไม่สามารถสร้างโปรไฟล์ได้',
        type: 'DANGER',
        onConfirm: closeModal
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestJoin = async (team: TeamInfo) => {
    try {
      await api.post('/join-requests', { teamId: team.id });
      // 🔵 แทนที่ alert ด้วย Modal
      setModal({
        isOpen: true,
        title: 'ส่งคำขอสำเร็จ',
        message: `คุณได้ส่งคำขอเข้าร่วมทีม ${team.name} เรียบร้อยแล้ว`,
        type: 'SUCCESS',
        onConfirm: () => {
          closeModal();
          fetchData();
        }
      });
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : 'เกิดข้อผิดพลาด';
      setModal({
        isOpen: true,
        title: 'ไม่สามารถส่งคำขอได้',
        message: msg,
        type: 'DANGER',
        onConfirm: closeModal
      });
    }
  };

  const myStats = playerProfile?.stats?.reduce((acc: any, curr: any) => ({
    matches: acc.matches + (curr.matchesPlayed || 0),
    goals: acc.goals + (curr.goals || 0),
    assists: acc.assists + (curr.assists || 0),
    rating: 0 
  }), { matches: 0, goals: 0, assists: 0, rating: 0 }) || { matches: 0, goals: 0, assists: 0, rating: 0 };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-black italic text-slate-400 uppercase tracking-widest animate-pulse">Initializing Career...</p>
      </div>
    </div>
  );

  // 渲染 ONBOARDING
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
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-10">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic border-l-2 border-blue-600 pl-3">Player Identity</h3>
            <input 
              type="text" 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-black italic uppercase tracking-wider text-slate-800"
              value={onboardingForm.name}
              onChange={(e) => setOnboardingForm(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic border-l-2 border-emerald-600 pl-3">Specialization</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {positions.map(pos => (
                <button
                  key={pos.id}
                  onClick={() => setOnboardingForm(prev => ({ ...prev, position: pos.id }))}
                  className={`p-6 rounded-[2rem] border-2 transition-all text-left space-y-3 group ${
                    onboardingForm.position === pos.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100'
                  }`}
                >
                  <div className="text-3xl">{pos.icon}</div>
                  <div>
                    <div className="font-black uppercase italic text-xs">{pos.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleCompleteOnboarding}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest italic hover:bg-blue-600 transition-all text-xs"
          >
            INITIALIZE CAREER ⚽
          </button>
        </div>

        {/* 🔵 แสดง Modal สำหรับ Onboarding */}
        <ConfirmModal
          isOpen={modal.isOpen}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onConfirm={modal.onConfirm || closeModal}
          onCancel={closeModal}
          confirmText="ตกลง"
        />
      </div>
    );
  }

  // 渲染 FREE AGENT
  if (status === 'FREE_AGENT') {
    const filteredTeams = availableTeams.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-gray-800 to-gray-600 rounded-2xl p-8 text-white shadow-lg text-center">
          <div className="text-5xl mb-4">👟</div>
          <h1 className="text-3xl font-black mb-2">You are a Free Agent</h1>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <input 
            type="text" 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams..."
          />
          <div className="space-y-3 mt-6">
            {filteredTeams.map(team => (
              <div key={team.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <h3 className="font-bold text-gray-900">{team.name}</h3>
                <button 
                  onClick={() => handleRequestJoin(team)}
                  className="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg text-sm font-bold"
                >
                  Request to Join
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 🔵 แสดง Modal สำหรับ Free Agent */}
        <ConfirmModal
          isOpen={modal.isOpen}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onConfirm={modal.onConfirm || closeModal}
          onCancel={closeModal}
          confirmText="ตกลง"
        />
      </div>
    );
  }

  // 渲染 PENDING
  if (status === 'PENDING') {
    return (
      <div className="max-w-3xl mx-auto pt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-center p-10">
          <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Pending</h1>
          <p className="text-gray-500">รอการอนุมัติเข้าร่วมทีม {myTeam?.name}</p>
        </div>
      </div>
    );
  }

  // 渲染 SIGNED
  const sortedMatches = [...matches].sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
  const nextMatch = sortedMatches.find(m => m.status === 'SCHEDULED' || m.status === 'LIVE');
  const recentResult = [...sortedMatches].filter(m => m.status === 'COMPLETED').reverse()[0];

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="relative bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden border border-white/5">
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="space-y-4">
             <span className="px-4 py-1.5 bg-blue-600 rounded-full font-black text-[10px] uppercase italic">
               {myTeam?.name}
             </span>
             <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase">{playerProfile?.name} #{playerProfile?.number || '--'}</h1>
          </div>
        </div>
        
        <div className="flex gap-4 relative z-10">
          <div className="px-6 py-4 bg-white/5 rounded-[2rem] border border-white/10 text-center shadow-xl">
            <div className="text-3xl font-black italic text-emerald-400">{myStats.goals}</div>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Goals</div>
          </div>
          <div className="px-6 py-4 bg-white/5 rounded-[2rem] border border-white/10 text-center shadow-xl">
            <div className="text-3xl font-black italic text-blue-400">{myStats.assists}</div>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Assists</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next Match */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic border-l-4 border-orange-500 pl-4 mb-8">Next Match</h3>
          {nextMatch ? (
             <div className="flex justify-between items-center text-center">
                <div>
                   <div className="font-black italic uppercase text-sm text-slate-900">{nextMatch.homeTeam?.name}</div>
                   <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Home</div>
                </div>
                <div className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase italic shadow-2xl">
                  {new Date(nextMatch.matchDate).toLocaleDateString()}
                </div>
                <div>
                   <div className="font-black italic uppercase text-sm text-slate-900">{nextMatch.awayTeam?.name}</div>
                   <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Away</div>
                </div>
             </div>
          ) : <p className="text-center text-slate-400 py-10 font-black italic uppercase text-xs tracking-widest">Wait for coach schedule.</p>}
        </div>

        {/* Latest Result */}
        <div className="lg:col-span-1 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-4 mb-8">Latest Result</h3>
          <div className="flex-1 flex flex-col justify-center">
            {recentResult ? (
              <div className="text-center">
                <div className="flex items-center justify-between">
                  <div className="text-4xl font-black italic text-indigo-600">{recentResult.homeScore}</div>
                  <div className="text-slate-200 font-black italic text-xl">X</div>
                  <div className="text-4xl font-black italic text-indigo-600">{recentResult.awayScore}</div>
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic mt-6">Official Result</p>
              </div>
            ) : <p className="text-center text-slate-300 font-black italic uppercase text-[10px] tracking-widest">No match data.</p>}
          </div>
        </div>
      </div>

      {/* 🔵 แสดง Modal ทั่วไป (เช่น เมื่อมีการแจ้งเตือน) */}
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm || closeModal}
        onCancel={closeModal}
        confirmText="ตกลง"
      />
    </div>
  );
};

export default PlayerDashboard;