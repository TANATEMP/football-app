// src/pages/manager/ManagerDashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import StandingsTab from '../../components/StandingsTab';
import ConfirmModal from '../../components/ConfirmModal'; // 🔵 นำเข้า ConfirmModal (ปรับ path ตามจริง)

// --- Improved Types ---
interface MyTeam {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  established?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  league?: {
    id: string;
    name: string;
    status: 'REGISTRATION' | 'PRE_SEASON' | 'ONGOING' | 'COMPLETED';
    season: string;
    description?: string;
    _count?: { teams: number };
  } | null;
}

// 🔵 กำหนด Interface สำหรับ Modal
interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'DANGER';
}

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [myTeam, setMyTeam] = useState<MyTeam | null>(null);
  const [nextMatch, setNextMatch] = useState<any>(null);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', shortName: '' });
  const [finalRank, setFinalRank] = useState<number | null>(null);

  // 🔵 State สำหรับจัดการ Modal
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'INFO',
  });

  // Helper for Rank suffixes (1st, 2nd, 3rd...)
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // 1. Fetch My Profile (Including Team & League)
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/user');
      const user = response.data.data;
      if (user.team) {
        setMyTeam(user.team);
        // Fetch real match data for the team
        const [nextRes, recentRes] = await Promise.all([
          api.get('/matches', { params: { teamId: user.team.id, status: 'SCHEDULED', limit: 1, sort: 'asc' } }),
          api.get('/matches', { params: { teamId: user.team.id, status: 'COMPLETED', limit: 5, sort: 'desc' } })
        ]);

        const nextPayload = nextRes.data.data || nextRes.data;
        const recentPayload = recentRes.data.data || recentRes.data;
        
        setNextMatch((Array.isArray(nextPayload) ? nextPayload : nextPayload.data)?.[0] || null);
        setRecentMatches(Array.isArray(recentPayload) ? recentPayload : recentPayload.data || []);

        // 🏆 If season is over, fetch final standings to get the rank
        if (user.team.league?.status === 'COMPLETED') {
          const standingsRes = await api.get(`/leagues/${user.team.league.id}/standings`);
          const standings = standingsRes.data.data || standingsRes.data;
          const rankIndex = Array.isArray(standings) 
            ? standings.findIndex((s: any) => s.teamId === user.team.id)
            : -1;
          
          if (rankIndex !== -1) {
            setFinalRank(rankIndex + 1);
          }
        }
      } else {
        setMyTeam(null);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 🔵 ฟังก์ชันปิด Modal
  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await api.post('/teams', {
        name: formData.name,
        shortName: formData.shortName.toUpperCase(),
      });
      await fetchProfile();
      
      // 🔵 เปิด Modal แจ้งเตือนเมื่อสร้างทีมสำเร็จ
      setModal({
        isOpen: true,
        title: 'สร้างสโมสรสำเร็จ!',
        message: 'ทีมของคุณถูกสร้างเรียบร้อยแล้ว เตรียมพร้อมลุยได้เลย',
        type: 'SUCCESS',
      });

    } catch (err: any) {
      const resMessage = err.response?.data?.message;
      const errorMessage = Array.isArray(resMessage) ? resMessage.join(", ") : (resMessage || "Failed to create club");
      
      setModal({
        isOpen: true,
        title: 'เกิดข้อผิดพลาด',
        message: errorMessage,
        type: 'DANGER',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] font-black italic text-slate-300 animate-pulse">CONNECTING TO FIELD...</div>;

  // Case: No Team Created yet
  if (!myTeam) {
    return (
      <>
        <div className="max-w-3xl mx-auto pt-10 px-4 animate-fade-in">
          <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden text-center p-16">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] rotate-3 flex items-center justify-center mx-auto mb-8 shadow-inner border border-blue-100">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </div>
            <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter italic uppercase">Build Your Legacy</h1>
            <p className="text-slate-400 mb-10 text-lg font-bold uppercase tracking-widest text-[10px]">Register your club to begin competing.</p>
            <form onSubmit={handleCreateTeam} className="max-w-md mx-auto text-left space-y-6 bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
              <input type="text" required placeholder="Club Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl border-2 border-white bg-white shadow-sm focus:border-blue-500 outline-none" />
              <input type="text" required placeholder="Short Name" value={formData.shortName} onChange={(e) => setFormData({...formData, shortName: e.target.value})} className="w-full px-6 py-4 rounded-2xl border-2 border-white bg-white shadow-sm focus:border-blue-500 outline-none uppercase" />
              <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black italic uppercase tracking-widest">{isSubmitting ? 'Registering...' : 'INITIALIZE CLUB 🚀'}</button>
            </form>
          </div>
        </div>

        {/* 🔵 ใส่ ConfirmModal ตรงนี้สำหรับการแจ้งเตือนสร้างทีม */}
        <ConfirmModal
          isOpen={modal.isOpen}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          confirmText="ตกลง"
          onConfirm={closeModal}
          onCancel={closeModal}
        />
      </>
    );
  }

  // Case: Application Rejected
  if (myTeam.status === "REJECTED") {
    return (
      <div className="max-w-4xl mx-auto space-y-12 px-4 animate-fade-in text-center flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-white rounded-[3rem] p-16 shadow-2xl border-2 border-red-100 relative overflow-hidden max-w-2xl w-full">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-rose-600"></div>
           
           <h1 className="text-4xl font-black text-slate-900 mb-6 italic uppercase tracking-tighter">Sorry {myTeam.name}...</h1>
           <p className="text-red-600 text-lg font-black uppercase tracking-widest text-[11px] mb-4 italic">Status: Application Rejected ✕</p>
           
           <Link to="/manager/leagues" className="group relative inline-flex items-center gap-4 bg-slate-900 hover:bg-red-600 text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest italic shadow-2xl transition-all active:scale-95 text-lg">
             Looking for other leagues &rarr;
             <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 rounded-[2rem]"></div>
           </Link>
           
           <p className="mt-8 text-slate-400 text-[10px] font-black uppercase italic tracking-widest">Champions never quit • Rise again!</p>
        </div>
      </div>
    );
  }

  // Case: No League Joined (not applied yet)
  if (!myTeam.league) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 px-4 animate-fade-in text-center flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-32 h-32 bg-slate-100 rounded-[3rem] flex items-center justify-center text-5xl mb-8 animate-bounce transition-all">🏗️</div>
        <div className="bg-white rounded-[3rem] p-16 shadow-2xl border border-slate-100 relative overflow-hidden max-w-2xl w-full">
           <h1 className="text-4xl font-black text-slate-900 mb-6 italic uppercase tracking-tighter">ขุมกำลัง {myTeam.name} พร้อมแล้ว!</h1>
           <p className="text-slate-400 text-lg font-bold uppercase tracking-widest text-[11px] mb-4 italic">Status: Club Ready • No Tournament Active</p>
           <h2 className="text-2xl font-black text-slate-800 mb-12 italic uppercase tracking-tight">ขณะนี้ทีมของคุณยังไม่มีลีกที่เข้าร่วม</h2>
           
           <Link to="/manager/leagues" className="group relative inline-flex items-center gap-4 bg-slate-900 hover:bg-blue-600 text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest italic shadow-2xl transition-all active:scale-95 text-lg">
             ค้นและสมัครลีกใหม่ 🏆 &rarr;
             <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 rounded-[2rem]"></div>
           </Link>
        </div>
        <p className="text-slate-300 font-black uppercase italic tracking-widest text-[10px] mt-8 flex items-center gap-2">
           <span className="w-2 h-2 bg-slate-200 rounded-full"></span>
           Strategic Headquarters • Waiting for Kick-off
        </p>
      </div>
    );
  }

  // Active/Completed Dashboard
  // At this point, we know myTeam.league exists
  const league = myTeam.league;
  const isSeasonOver = league.status === 'COMPLETED';

  // Simplified Dashboard for Completed Seasons
  if (isSeasonOver) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in text-center flex flex-col items-center justify-center">
        {/* Trophy / Icon section */}
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-amber-400/10 rounded-[2rem] flex items-center justify-center text-4xl relative z-10 animate-pulse border-2 border-amber-400/20 shadow-xl shadow-amber-900/10 transform -rotate-3">🏆</div>
          <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-10 rounded-full"></div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-amber-100 relative overflow-hidden w-full">
           <div className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-600 mb-4 flex items-center justify-center gap-3 italic">
              <span className="w-6 h-[1px] bg-amber-200"></span>
              Season Summary
              <span className="w-6 h-[1px] bg-amber-200"></span>
           </div>

           <h1 className="text-2xl font-black text-slate-900 mb-2 italic uppercase tracking-tighter shrink-0">{myTeam.name}</h1>
           {/* ปรับให้ชื่อลีกใหญ่และชัดขึ้นสำหรับฤดูกาลที่จบไปแล้ว */}
           <p className="text-slate-600 text-sm md:text-base font-black uppercase tracking-widest mb-8 drop-shadow-sm">{myTeam.league.name} • <span className="text-slate-400">Season {myTeam.league.season}</span></p>
           
           <div className="bg-slate-50/80 rounded-3xl p-8 mb-10 border border-slate-100/50">
              <div className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Final Position</div>
              <div className="text-5xl font-black text-slate-900 italic tracking-tighter flex items-center justify-center gap-2">
                 <span className="text-amber-500">{finalRank ? getOrdinal(finalRank) : '--'}</span>
                 <span className="text-xl text-slate-300 mt-2">PLACE</span>
              </div>
           </div>
           
           <Link to="/manager/leagues" className="group relative inline-flex items-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest italic shadow-xl transition-all active:scale-95 text-sm">
             Join new league
             <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 rounded-2xl"></div>
           </Link>
           
           {/* Subtle background decoration */}
           <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
        </div>

        <p className="text-slate-300 font-black uppercase italic tracking-[0.2em] text-[8px] mt-6 flex items-center gap-2">
           Strategic Hub • Season {myTeam.league.season} Ended
        </p>
      </div>
    );
  }

  const getResultBadge = (match: any) => {
    if (match.homeTeam.id === myTeam.id) {
       if (match.homeScore > match.awayScore) return 'W';
       if (match.homeScore < match.awayScore) return 'L';
       return 'D';
    } else {
       if (match.awayScore > match.homeScore) return 'W';
       if (match.awayScore < match.homeScore) return 'L';
       return 'D';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 px-4 pb-20 animate-fade-in">
      <div className={`rounded-[3rem] p-12 text-white shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-12 border relative overflow-hidden transition-all duration-700 ${isSeasonOver ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-amber-400/20' : 'bg-gradient-to-br from-slate-900 to-indigo-950 border-blue-400/10'}`}>
        <div className="flex items-center gap-12 relative z-10 shrink-0">
          <div className="w-32 h-32 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center text-5xl font-black italic shadow-2xl relative group overflow-hidden">
            <div className={`absolute inset-0 opacity-20 blur-2xl group-hover:opacity-40 transition-opacity ${isSeasonOver ? 'bg-amber-400' : 'bg-blue-600'}`}></div>
            <span className="relative z-10 text-white drop-shadow-lg">{myTeam.shortName}</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Team Registration Status */}
              <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest italic border transition-all ${
                myTeam.status === 'APPROVED' ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30' : 
                'bg-amber-400/20 text-amber-400 border-amber-400/30 shadow-lg shadow-amber-900/10'
              }`}>
                {myTeam.status === 'APPROVED' ? '✓ Team Approved' : 
                 '⌛ Pending Registration'}
              </span>

              {/* League Phase Status */}
              <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest italic border transition-all ${
                league.status === 'REGISTRATION' ? 'bg-blue-400/20 text-blue-400 border-blue-400/30' :
                league.status === 'PRE_SEASON' ? 'bg-purple-400/20 text-purple-400 border-purple-400/30 shadow-lg shadow-purple-900/10' :
                league.status === 'ONGOING' ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30 shadow-lg shadow-emerald-900/10' :
                'bg-slate-400/20 text-slate-400 border-slate-400/30'
              }`}>
                {league.status === 'REGISTRATION' ? 'Registration Phase' :
                 league.status === 'PRE_SEASON' ? 'Pre-Season (Preparing fixtures)' :
                 league.status === 'ONGOING' ? 'ONGOING' :
                 'Tournament Finished'}
              </span>

              {/* ปรับให้ชื่อลีกเด่นขึ้น เป็นป้ายที่สว่างและฟอนต์ใหญ่กว่าเดิม */}
              <span className="bg-gradient-to-r from-blue-500/40 to-indigo-500/40 text-white text-xs font-black px-5 py-2 rounded-full border border-blue-400/50 uppercase tracking-widest italic shadow-xl">
                {league.name}
              </span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-none">{myTeam.name}</h1>
            {myTeam.status === 'APPROVED' && league.status === 'PRE_SEASON' && (
              <p className="mt-4 text-blue-400 font-black italic uppercase text-[10px] tracking-widest animate-pulse">
                Your team is approved! waiting for the administrator to finalize the fixtures.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center relative z-10">
          {isSeasonOver && (
            <Link to="/manager/leagues" className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-8 py-5 rounded-2xl font-black shadow-xl transition-all uppercase tracking-widest text-[10px] italic">
              Enroll in New Season 🚀
            </Link>
          )}
          <Link to="/manager/stats" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-5 rounded-2xl font-black shadow-xl transition-all uppercase tracking-widest text-[10px] italic border border-white/10">Player Analytics 📈</Link>
          {!isSeasonOver && <Link to="/manager/team" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black transition-all uppercase tracking-widest text-[10px] italic">Squad Manager ⚡</Link>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10 relative overflow-hidden group">
            {isSeasonOver ? (
              <div className="text-center py-6">
                 <h2 className="text-sm font-black text-amber-600 mb-8 uppercase tracking-widest italic">Season MVP</h2>
                 <div className="w-20 h-20 bg-slate-50 rounded-full mx-auto mb-4 border border-slate-100 flex items-center justify-center text-3xl">👤</div>
                 <p className="text-xl font-black text-slate-900 uppercase italic">Analysing Stats...</p>
                 <Link to="/manager/stats" className="mt-8 text-[10px] font-black text-blue-600 uppercase tracking-widest inline-block border-b-2 border-blue-100 pb-1">View Full Performance &rarr;</Link>
              </div>
            ) : (
              <div>
                <h2 className="text-sm font-black text-slate-800 mb-8 uppercase tracking-widest italic flex items-center gap-2">
                   <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                   Next Battle
                </h2>
                {nextMatch ? (
                  <div className="text-center">
                    <div className="flex justify-between items-center mb-6">
                      <p className="font-black text-2xl text-slate-900 italic uppercase">{nextMatch.homeTeam.shortName}</p>
                      <div className="px-4 py-1 bg-slate-900 text-white rounded-lg font-black text-xs italic">VS</div>
                      <p className="font-black text-2xl text-slate-900 italic uppercase">{nextMatch.awayTeam.shortName}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl text-[11px] font-black text-slate-600 uppercase italic tracking-widest text-center">
                       {new Date(nextMatch.matchDate).toLocaleString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ) : <div className="py-12 text-center text-slate-300 font-black italic uppercase tracking-widest text-[10px]">No scheduled fixtures</div>}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10">
             <h2 className="text-sm font-black text-slate-800 mb-8 italic uppercase tracking-widest">{isSeasonOver ? 'Season Wrap-up' : 'Recent Performance'}</h2>
             <div className="flex gap-3">
                {recentMatches.length > 0 ? recentMatches.map((match, i) => (
                   <div key={match.id || i} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black italic shadow-inner border transition-transform hover:scale-110
                      ${getResultBadge(match) === 'W' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : getResultBadge(match) === 'D' ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                      {getResultBadge(match)}
                   </div>
                )) : <p className="text-[10px] text-slate-300 font-black uppercase italic tracking-widest">No match history yet</p>}
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10">
           <div className="flex items-center justify-between mb-10">
              <h2 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">{isSeasonOver ? 'Final History' : 'League Outlook'}</h2>
              <Link 
                to="/manager/standings" 
                className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-b-2 border-blue-100 hover:border-blue-600 pb-1 transition-all italic"
              >
                View Full Table &rarr;
              </Link>
           </div>
           <StandingsTab leagueId={league.id} status={league.status} />
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;