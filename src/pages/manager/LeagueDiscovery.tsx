// src/pages/manager/LeagueDiscovery.tsx
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import ConfirmModal from '../../components/ConfirmModal'; // 🔵 นำเข้า ConfirmModal (ปรับ path ตามจริง)

interface League {
  id: string;
  name: string;
  season: string;
  description: string;
  maxTeams: number;
  minPlayers: number;
  maxPlayers: number;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  matchDuration: number;
  registrationStart: string;
  registrationEnd: string;
  startDate: string;
  endDate: string;
  _count: { teams: number };
}

// กำหนด Interface สำหรับ Modal
interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'DANGER';
  onConfirm?: () => void;
}

const LeagueDiscovery = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myTeam, setMyTeam] = useState<any>(null);
  const navigate = useNavigate();

  // 🔵 State สำหรับจัดการ Modal
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'INFO',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [leaguesRes, userRes] = await Promise.all([
        api.get('/leagues', { params: { status: 'REGISTRATION' } }),
        api.get('/user')
      ]);
      
      const leaguesPayload = leaguesRes.data.data || leaguesRes.data;
      setLeagues(Array.isArray(leaguesPayload) ? leaguesPayload : leaguesPayload.data || []);
      setMyTeam(userRes.data.data?.team || null);
    } catch (err) {
      console.error("Error fetching leagues:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🔵 ปิด Modal ทั่วไป
  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  const handleJoinLeague = async (leagueId: string) => {
    if (!myTeam || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await api.post(`/teams/${myTeam.id}/join-league`, { leagueId });
      setSelectedLeague(null);
      
      // 🔵 แสดง Modal แจ้งเตือนเมื่อเข้าร่วมสำเร็จ
      setModal({
        isOpen: true,
        title: 'สำเร็จ!',
        message: 'ส่งคำขอเข้าร่วมลีกเรียบร้อยแล้ว',
        type: 'SUCCESS',
        onConfirm: () => {
          closeModal();
          navigate('/manager'); // ค่อย Redirect เมื่อกดตกลง
        }
      });
      
    } catch (err: any) {
      const resMessage = err.response?.data?.message;
      const errorMessage = Array.isArray(resMessage) ? resMessage.join(", ") : (resMessage || "Failed to join league");
      
      setModal({
        isOpen: true,
        title: 'เกิดข้อผิดพลาด',
        message: errorMessage,
        type: 'DANGER',
        onConfirm: closeModal
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDayNames = (days: number[]) => {
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(d => names[d]).join(', ');
  };


  if (loading) return <div className="flex items-center justify-center min-h-[60vh] font-black italic text-slate-300 animate-pulse">SCOUTING LEAGUES...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-12 px-4 pb-20 animate-fade-in">
      {/* Header Section */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="relative z-10">
          <h1 className="text-6xl font-black tracking-tighter mb-4 italic uppercase text-center md:text-left leading-none">Find Your League</h1>
          <p className="text-slate-400 text-lg font-bold uppercase tracking-widest text-[11px] text-center md:text-left">
            Explore tournaments that are currently open for applications and submit your application to enter
          </p>
        </div>
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {leagues.length === 0 ? (
          <div className="py-32 text-center bg-white border-2 border-dashed border-slate-100 rounded-[3rem] text-slate-300 font-black uppercase italic tracking-widest flex flex-col items-center gap-6">
             <span className="text-6xl">🔭</span>
             <p>No leagues are currently in recruitment phase.</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {leagues.map(league => (
            <div key={league.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all group relative flex flex-col">
               <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black text-blue-600 uppercase italic">{league._count?.teams || 0} / {league.maxTeams} Teams</span>
               </div>
               <h3 className="text-3xl font-black text-slate-900 mb-4 italic uppercase tracking-tighter leading-none group-hover:text-blue-600 transition-colors">{league.name}</h3>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-wide leading-relaxed line-clamp-2 mb-6">{league.description || "Top tier league with elite clubs and professional structure."}</p>
               
               {/* 🗓️ Match Schedule Summary on Card */}
               <div className="mb-8 space-y-2">
                  <div className="flex items-center gap-3 text-blue-600 font-black uppercase italic text-[10px] tracking-widest">
                     MatchDay: {getDayNames(league.daysOfWeek)}
                  </div>
                  <div className="flex items-center gap-3 text-blue-600 font-black uppercase italic text-[10px] tracking-widest">
                     Time: {league.startTime} - {league.endTime}
                  </div>
                  <div className="flex items-center gap-3 text-blue-600 font-black uppercase italic text-[10px] tracking-widest">
                     Period: {new Date(league.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - {new Date(league.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="flex items-center gap-3 text-blue-600 font-black uppercase italic text-[10px] tracking-widest">
                    Registration Close: {new Date(league.registrationEnd).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  </div>
               </div>

               <div className="mt-auto space-y-4">
                  <button 
                    onClick={() => setSelectedLeague(league)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] italic shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95"
                  >
                    View League Details
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Deep-Dive Modal */}
      {selectedLeague && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedLeague(null)}></div>
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-slate-100 animate-slide-up mx-4">
            
            {/* Modal Header */}
            <div className="bg-slate-900 p-8 text-white relative">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full font-black text-[8px] uppercase tracking-widest border border-blue-400/20 italic mb-3 inline-block">League Profile</span>
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-tight">{selectedLeague.name}</h2>
                </div>
              <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedLeague(null);
                    }} 
                    className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-3xl transition-all cursor-pointer border border-white/10 hover:scale-110 active:scale-90 relative z-[110]"
                    aria-label="Close modal"
                  >
                    &times;
                  </button>
              </div>
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[65vh] space-y-10">
              
              {/* --- 📝 ส่วนคำอธิบายลีก (Description) --- */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic flex items-center gap-2">
                  <span className="w-6 h-[1px] bg-slate-200"></span> About This League
                </h3>
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative overflow-hidden">
                  <p className="text-slate-700 text-sm font-bold leading-relaxed relative z-10 italic">
                    "{selectedLeague.description || "No specific description provided for this tournament. Expect high-level competition and professional organization."}"
                  </p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logistics */}
                <div className="space-y-4">
                  <h3 className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] italic border-l-2 border-blue-600 pl-3">Schedule</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase italic">Matchdays</span>
                      <span className="text-xs font-black text-slate-900 uppercase italic">{getDayNames(selectedLeague.daysOfWeek)}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase italic">Match Duration</span>
                      <span className="text-xs font-black text-slate-900 uppercase italic">{selectedLeague.matchDuration} Mins</span>
                    </div>
                  </div>
                </div>

                {/* Squad */}
                <div className="space-y-4">
                  <h3 className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em] italic border-l-2 border-emerald-600 pl-3">Squad Rules</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                      <span className="text-[9px] font-black text-emerald-600 uppercase italic">Min Players</span>
                      <span className="text-xs font-black text-emerald-800 italic">{selectedLeague.minPlayers}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                      <span className="text-[9px] font-black text-emerald-600 uppercase italic">Max Players</span>
                      <span className="text-xs font-black text-emerald-800 italic">{selectedLeague.maxPlayers}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Season Dates Table */}
              <div className="pt-6 border-t border-slate-100">
                <div className="bg-slate-900 text-white p-6 rounded-3xl flex items-center justify-around shadow-xl shadow-slate-200">
                  <div className="text-center">
                    <p className="text-[7px] font-black text-blue-400 uppercase tracking-widest mb-1">Kick-off Date</p>
                    <p className="font-black italic text-sm uppercase">{new Date(selectedLeague.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="h-8 w-px bg-white/10"></div>
                  <div className="text-center">
                    <p className="text-[7px] font-black text-rose-400 uppercase tracking-widest mb-1">Season Finale</p>
                    <p className="font-black italic text-sm uppercase">{new Date(selectedLeague.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Button */}
            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => handleJoinLeague(selectedLeague.id)}
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] italic shadow-2xl hover:bg-blue-600 transition-all active:scale-[0.98] disabled:bg-slate-300 text-xs flex items-center justify-center gap-3"
              >
                {isSubmitting ? 'PROCESSING...' : (
                  <>
                    Request to Join League
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 🔵 เรียกใช้งาน ConfirmModal (Render ที่ระดับล่างสุดของ Component) */}
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText="ตกลง"
        onConfirm={modal.onConfirm || closeModal}
        onCancel={closeModal}
      />
    </div>
  );
};

export default LeagueDiscovery;