// src/components/MatchesTab.tsx
import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";
import ConfirmModal from "./ConfirmModal"; // 👈 นำเข้า ConfirmModal

interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
}

interface Player {
  id: string;
  name: string;
  number?: number;
  position: string;
}

interface MatchEvent {
  id: string;
  eventType: 'GOAL' | 'ASSIST' | 'YELLOW_CARD' | 'RED_CARD' | 'OWN_GOAL';
  minute: number;
  team: { id: string; shortName: string };
  player?: { id: string; name: string };
}

interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  status: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  matchDate: string;
  events?: MatchEvent[];
}

interface MatchesTabProps {
  leagueId: string;
  status: string;
  onRefresh?: () => void;
}

const MatchesTab: React.FC<MatchesTabProps> = ({ leagueId, status: leagueStatus, onRefresh }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Modal & Event State
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [homeRoster, setHomeRoster] = useState<Player[]>([]);
  const [awayRoster, setAwayRoster] = useState<Player[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔔 เพิ่ม State สำหรับจัดการ ConfirmModal
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'DANGER' | 'SUCCESS' | 'INFO';
    onConfirm: () => void;
  } | null>(null);

  // New Event Form State
  const [eventTeamId, setEventTeamId] = useState("");
  const [eventPlayerId, setEventPlayerId] = useState("");
  const [eventAssistPlayerId, setEventAssistPlayerId] = useState("");
  const [eventType, setEventType] = useState<'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'OWN_GOAL'>('GOAL');
  const [eventMinute, setEventMinute] = useState(1);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role?.toUpperCase() || null);
  }, []);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/matches', { params: { leagueId, limit: 100 } });
      const payload = response.data.data !== undefined ? response.data.data : response.data;
      const rows = Array.isArray(payload) ? payload : (payload.data || payload.rows || []);
      setMatches(rows);
    } catch (err) {
      console.error("Error fetching matches:", err);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    if (leagueId) fetchMatches();
  }, [leagueId, fetchMatches]);

  const fetchRosters = async (homeId: string, awayId: string) => {
    try {
      const [resHome, resAway] = await Promise.all([
        api.get(`/teams/${homeId}`),
        api.get(`/teams/${awayId}`)
      ]);
      setHomeRoster(resHome.data.data?.players || resHome.data.players || []);
      setAwayRoster(resAway.data.data?.players || resAway.data.players || []);
    } catch (err) {
      console.error("Error fetching rosters:", err);
    }
  };

  const openModal = (match: Match) => {
    setEditingMatch(match);
    if (match.status !== 'DRAFT') {
      fetchRosters(match.homeTeam.id, match.awayTeam.id);
      setEventTeamId(match.homeTeam.id); 
    }
  };

  const handleAddEvent = async () => {
    if (!editingMatch || !eventTeamId || isSubmitting) return;
    try {
      setIsSubmitting(true);
      
      // 1. Record the primary event (Goal, Card, etc.)
      await api.post(`/matches/${editingMatch.id}/events`, {
        team_id: eventTeamId,
        player_id: eventPlayerId || undefined,
        type: eventType,
        minute: Number(eventMinute),
      });

      // 2. If it's a Goal and an Assist player is selected, record the Assist event
      if (eventType === 'GOAL' && eventAssistPlayerId) {
        await api.post(`/matches/${editingMatch.id}/events`, {
          team_id: eventTeamId,
          player_id: eventAssistPlayerId,
          type: 'ASSIST',
          minute: Number(eventMinute),
        });
      }
      
      // Refresh matches
      const res = await api.get('/matches', { params: { leagueId, limit: 100 } });
      const payload = res.data.data !== undefined ? res.data.data : res.data;
      const rows = Array.isArray(payload) ? payload : (payload.data || payload.rows || []);
      setMatches(rows);
      
      const updatedMatch = rows.find((m: Match) => m.id === editingMatch.id);
      if (updatedMatch) setEditingMatch(updatedMatch);

      setEventPlayerId(""); 
      setEventAssistPlayerId("");
    } catch (err: any) {
      setModalConfig({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.error?.message || 'Failed to add event',
        type: 'DANGER',
        onConfirm: () => setModalConfig(null)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveStatus = async (newStatus: string) => {
    if (!editingMatch || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await api.patch(`/matches/${editingMatch.id}`, { status: newStatus });
      
      setModalConfig({
        isOpen: true,
        title: "Success",
        message: `Match status updated to ${newStatus}`,
        type: 'SUCCESS',
        onConfirm: () => setModalConfig(null)
      });

      setEditingMatch(null);
      fetchMatches();
      onRefresh?.();
    } catch (err: any) {
      setModalConfig({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.error?.message || 'Failed to update status',
        type: 'DANGER',
        onConfirm: () => setModalConfig(null)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSchedule = async (newDate: string) => {
    if (!editingMatch || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await api.patch(`/matches/${editingMatch.id}`, {
        scheduled_at: new Date(newDate).toISOString(),
      });
      
      setModalConfig({
        isOpen: true,
        title: "Success",
        message: "Match schedule updated!",
        type: 'SUCCESS',
        onConfirm: () => setModalConfig(null)
      });

      setEditingMatch(null);
      fetchMatches();
    } catch (err: any) {
      setModalConfig({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.error?.message || 'Failed to update schedule',
        type: 'DANGER',
        onConfirm: () => setModalConfig(null)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-50 text-green-600 border-green-100';
      case 'LIVE': return 'bg-red-50 text-red-600 border-red-100 animate-pulse';
      case 'DRAFT': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'CANCELLED': return 'bg-gray-50 text-gray-400 border-gray-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400 font-bold uppercase italic tracking-widest text-xs">Loading Fixtures...</div>;
  
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center animate-pulse">
           <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <div>
           <h3 className="text-2xl font-black text-slate-800 italic uppercase">Fixtures Pending</h3>
           <p className="text-slate-400 font-bold max-w-xs mt-2 uppercase text-[10px] tracking-widest">
             {leagueStatus === 'REGISTRATION' 
               ? 'TBA • Match schedule will be broadcasted once registration closes.'
               : leagueStatus === 'PRE_SEASON'
               ? 'Use the Overview tab to generate fixtures for this league.'
               : 'No matches found for this league.'}
           </p>
        </div>
      </div>
    );
  }

  const sortedMatches = [...matches].sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
  const completedMatches = sortedMatches.filter(m => m.status === 'COMPLETED');
  const upcomingMatches = sortedMatches.filter(m => m.status !== 'COMPLETED');

  const canEdit = userRole === 'ADMIN';

  return (
    <>
      <div className="space-y-8 animate-fade-in relative">
        {/* Management Modal */}
        {editingMatch && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 overflow-y-auto">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden relative border border-slate-100 my-auto">
              {/* Modal Header */}
              <div className="bg-slate-900 p-8 text-center text-white relative">
                <button onClick={() => setEditingMatch(null)} className="absolute right-6 top-6 text-white/40 hover:text-white transition-colors">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">MATCH MANAGEMENT</h3>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex-1 text-right">
                     <p className="text-xl font-black italic uppercase leading-none truncate">{editingMatch.homeTeam.name}</p>
                     <p className="text-[10px] font-bold text-white/40 mt-2 flex items-center justify-end gap-2">
                       HOME
                       {leagueStatus === 'COMPLETED' && <span className="bg-white/10 px-2 py-0.5 rounded text-[8px] border border-white/5 uppercase">Archive</span>}
                     </p>
                  </div>
                  <div className="bg-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 border border-white/5 shadow-inner">
                     <span className="text-4xl font-black italic">{editingMatch.homeScore}</span>
                     <span className="text-white/20 font-black italic text-xl">-</span>
                     <span className="text-4xl font-black italic">{editingMatch.awayScore}</span>
                  </div>
                  <div className="flex-1 text-left">
                     <p className="text-xl font-black italic uppercase leading-none truncate">{editingMatch.awayTeam.name}</p>
                     <p className="text-[10px] font-bold text-white/40 mt-2">AWAY</p>
                  </div>
                </div>
              </div>

              <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {editingMatch.status === 'DRAFT' ? (
                  /* DRAFT MODE UI */
                  <div className="space-y-8">
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Scheduled Kick-off</label>
                      <input
                        type="datetime-local"
                        defaultValue={new Date(editingMatch.matchDate).toISOString().slice(0, 16)}
                        onChange={(e) => handleUpdateSchedule(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 text-slate-800 font-bold focus:border-blue-600 outline-none transition-all shadow-sm"
                      />
                      <p className="text-[9px] text-slate-400 mt-4 italic">* Changing this date will update the fixture schedule immediately</p>
                    </div>
                  </div>
                ) : (
                  /* LIVE/REPORTING MODE UI */
                  <div className="space-y-10">
                    {/* Event Logger Form (Disabled if League is Completed) */}
                    {leagueStatus !== 'COMPLETED' && (
                      <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add Match Event</h4>
                           <span className={`text-[8px] px-2 py-0.5 rounded-full font-black border ${getStatusBadge(editingMatch.status)}`}>{editingMatch.status}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Team</label>
                              <select 
                                value={eventTeamId} 
                                onChange={(e) => setEventTeamId(e.target.value)}
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
                              >
                                <option value={editingMatch.homeTeam.id}>{editingMatch.homeTeam.name}</option>
                                <option value={editingMatch.awayTeam.id}>{editingMatch.awayTeam.name}</option>
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Player</label>
                              <select 
                                value={eventPlayerId} 
                                onChange={(e) => setEventPlayerId(e.target.value)}
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
                              >
                                <option value="">Select Player</option>
                                {(eventTeamId === editingMatch.homeTeam.id ? homeRoster : awayRoster).map(p => (
                                  <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                                ))}
                              </select>
                           </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Event Type</label>
                              <div className="grid grid-cols-3 gap-2">
                                 {(['GOAL', 'YELLOW_CARD', 'RED_CARD'] as const).map(type => (
                                   <button 
                                     key={type}
                                     onClick={() => {
                                       setEventType(type as any);
                                       if (type !== 'GOAL') setEventAssistPlayerId("");
                                     }}
                                     className={`py-2 rounded-lg text-[9px] font-black border transition-all ${
                                       eventType === type ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400'
                                     }`}
                                   >
                                     {type.replace('_', ' ')}
                                   </button>
                                 ))}
                              </div>
                              <div className="grid grid-cols-1 gap-2 mt-2">
                                 {(['OWN_GOAL'] as const).map(type => (
                                   <button 
                                     key={type}
                                     onClick={() => {
                                       setEventType(type as any);
                                       setEventAssistPlayerId("");
                                     }}
                                     className={`py-2 rounded-lg text-[9px] font-black border transition-all ${
                                       eventType === type ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400'
                                     }`}
                                   >
                                     {type.replace('_', ' ')}
                                   </button>
                                 ))}
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Minute</label>
                              <input 
                                type="number" 
                                min="1" 
                                max="120"
                                value={eventMinute}
                                onChange={(e) => setEventMinute(Number(e.target.value))}
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
                              />
                              <button 
                                onClick={handleAddEvent}
                                disabled={isSubmitting || !eventPlayerId && eventType !== 'OWN_GOAL'}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest mt-4 shadow-xl shadow-blue-100 transition-all active:scale-95"
                              >
                                {isSubmitting ? '...' : 'ADD EVENT +'}
                              </button>
                           </div>
                        </div>

                        {/* Conditional Assist Dropdown */}
                        {eventType === 'GOAL' && (
                          <div className="animate-fade-in space-y-2 pt-2 border-t border-slate-100 mt-4">
                            <label className="text-[9px] font-black text-blue-500 uppercase ml-2 italic flex items-center gap-2">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                              Assisted By (Optional)
                            </label>
                            <select 
                              value={eventAssistPlayerId} 
                              onChange={(e) => setEventAssistPlayerId(e.target.value)}
                              className="w-full bg-blue-50 border-2 border-blue-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 text-blue-900"
                            >
                              <option value="">No Assist / Solo Goal</option>
                              {(eventTeamId === editingMatch.homeTeam.id ? homeRoster : awayRoster)
                                .filter(p => p.id !== eventPlayerId) // Can't assist yourself
                                .map(p => (
                                  <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                                ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Event Timeline */}
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                         <span>Match Timeline</span>
                         <div className="flex-1 h-px bg-slate-100"></div>
                      </h4>
                      
                      <div className="space-y-3">
                        {(() => {
                          const allEvents = editingMatch.events || [];
                          const assists = allEvents.filter(e => e.eventType === 'ASSIST');
                          const mainEvents = allEvents.filter(e => e.eventType !== 'ASSIST');
                          
                          // Map assists to goals by minute and team
                          const timeline = mainEvents.map(event => {
                            let assistantName = "";
                            if (event.eventType === 'GOAL') {
                              const matchAssist = assists.find(a => a.minute === event.minute && a.team.id === event.team.id);
                              if (matchAssist) assistantName = matchAssist.player?.name || "";
                            }
                            return { ...event, assistantName };
                          });

                          return timeline.length > 0 ? (
                            timeline.map((event, idx) => (
                               <div key={event.id || idx} className="flex items-center gap-4 bg-white border border-slate-50 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                 <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black italic text-slate-600 text-xs shadow-inner shrink-0 text-center">
                                   {event.minute}'
                                 </div>
                                 <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                       <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                                         (event.eventType as string) === 'GOAL' ? 'bg-green-100 text-green-700' :
                                         (event.eventType as string) === 'YELLOW_CARD' ? 'bg-yellow-100 text-yellow-700' :
                                         (event.eventType as string) === 'RED_CARD' ? 'bg-red-100 text-red-700' :
                                         (event.eventType as string) === 'OWN_GOAL' ? 'bg-orange-100 text-orange-700' :
                                         'bg-slate-100 text-slate-600'
                                       }`}>
                                         {event.eventType.replace('_', ' ')}
                                       </span>
                                       <span className="text-[9px] font-black text-slate-400 uppercase">{event.team.shortName}</span>
                                    </div>
                                    <p className="text-sm font-black text-slate-800 italic uppercase mt-0.5">
                                       {event.player?.name || 'Unknown Player'}
                                       {event.assistantName && (
                                         <span className="text-blue-500 normal-case font-bold ml-1 italic text-[11px]">
                                           (Assisted by {event.assistantName})
                                         </span>
                                       )}
                                    </p>
                                 </div>
                               </div>
                            ))
                          ) : (
                            <div className="text-center py-10 text-slate-300 italic text-[10px] font-bold uppercase tracking-widest border-2 border-dashed border-slate-50 rounded-3xl">
                               No events recorded yet
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex gap-4">
                <button 
                  onClick={() => setEditingMatch(null)}
                  className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Close Window
                </button>
                {leagueStatus !== 'COMPLETED' && (
                  <>
                    {editingMatch.status !== 'COMPLETED' && editingMatch.status !== 'DRAFT' && (
                      <button 
                        onClick={() => handleSaveStatus('COMPLETED')}
                        disabled={isSubmitting}
                        className="flex-[1.5] py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95"
                      >
                        OFFICIALLY END MATCH 🏁
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming & Results Sections */}
        {upcomingMatches.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Upcoming Fixtures</h3>
            </div>
            <div className="space-y-4">
              {upcomingMatches.map((match) => (
                <MatchCard key={match.id} match={match} canEdit={canEdit} onEdit={openModal} getStatusBadge={getStatusBadge} leagueStatus={leagueStatus} />
              ))}
            </div>
          </section>
        )}

        {completedMatches.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-6">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Recent Results</h3>
            </div>
            <div className="space-y-4">
              {completedMatches.map((match) => (
                <MatchCard key={match.id} match={match} canEdit={canEdit} onEdit={openModal} getStatusBadge={getStatusBadge} leagueStatus={leagueStatus} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 🛎️ นำ Modal แจ้งเตือนมาวางไว้ที่ระดับนอกสุด */}
      {modalConfig && (
        <ConfirmModal 
          isOpen={modalConfig.isOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          type={modalConfig.type}
          onConfirm={modalConfig.onConfirm}
          onCancel={() => setModalConfig(null)}
          confirmText="OK"
        />
      )}
    </>
  );
};

// ---- MatchCard Component ----
interface MatchCardProps {
  match: Match;
  canEdit: boolean;
  onEdit: (match: Match) => void;
  getStatusBadge: (status: string) => string;
  leagueStatus: string;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, canEdit, onEdit, getStatusBadge, leagueStatus }) => (
  <div className="bg-white border border-slate-100 rounded-[2rem] p-6 lg:p-8 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
      <div className="flex flex-col items-center lg:items-start min-w-[140px] text-center lg:text-left">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-2">
          {new Date(match.matchDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        <span className="text-[14px] font-black italic text-slate-900 mb-2 leading-none">
          {new Date(match.matchDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </span>
        <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase italic tracking-widest border ${getStatusBadge(match.status)}`}>
          {match.status}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center gap-4 lg:gap-8 w-full">
        <div className="flex-1 text-right">
           <p className="font-black text-lg lg:text-xl text-slate-900 italic tracking-tighter uppercase group-hover:text-blue-600 transition-colors leading-none truncate">{match.homeTeam.name}</p>
           <p className="text-[10px] font-bold text-slate-400 uppercase italic mt-2">{match.homeTeam.shortName}</p>
        </div>

        <div className="flex items-center gap-3 lg:gap-5 bg-slate-50/50 p-4 lg:p-6 rounded-[2rem] border border-slate-100 shadow-inner">
          <div className="w-14 h-18 lg:w-16 lg:h-20 bg-white rounded-2xl flex items-center justify-center text-3xl lg:text-4xl font-black italic shadow-sm border border-slate-100">
            {match.homeScore}
          </div>
          <div className="w-4 h-1 bg-slate-200 rounded-full"></div>
          <div className="w-14 h-18 lg:w-16 lg:h-20 bg-white rounded-2xl flex items-center justify-center text-3xl lg:text-4xl font-black italic shadow-sm border border-slate-100">
            {match.awayScore}
          </div>
        </div>

        <div className="flex-1 text-left">
           <p className="font-black text-lg lg:text-xl text-slate-900 italic tracking-tighter uppercase group-hover:text-blue-600 transition-colors leading-none truncate">{match.awayTeam.name}</p>
           <p className="text-[10px] font-bold text-slate-400 uppercase italic mt-2">{match.awayTeam.shortName}</p>
        </div>
      </div>

      {canEdit && (
        <div className="w-full lg:w-auto">
          <button 
            onClick={() => onEdit(match)}
            className="w-full lg:w-auto min-w-[140px] px-8 py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase italic tracking-widest hover:bg-slate-800 shadow-xl transition-all active:scale-95 whitespace-nowrap"
          >
            {leagueStatus === 'COMPLETED' ? 'View Timeline 🔍' : 'Manage Match ⚡'}
          </button>
        </div>
      )}
    </div>
  </div>
);

export default MatchesTab;