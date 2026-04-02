import { useState, useEffect } from "react";
import api from "../../lib/api";

/**
 * Unified Match Center Component
 * Shared by both Players and Managers for a consistent, compact view of fixtures and results.
 */
const MatchCenter = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myTeam, setMyTeam] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");

  const fetchData = async () => {
    try {
      const userRes = await api.get("/user");
      const user = userRes.data.data || userRes.data;
      setUserRole(user.role);

      // 🎯 Determine the team based on the user role
      // Players find their team via the player profile, Managers find it directly.
      const team = user.role === "PLAYER" ? user.player?.team : user.team;
      setMyTeam(team);

      if (team?.id) {
        // ✅ โหลดประวัติการแข่ง "ทั้งหมด" ของทีม (เพื่อแสดง Results ย้อนหลังข้ามซีซั่น)
        const params: any = {
          limit: 100,
          teamId: team.id,
        };

        const res = await api.get("/matches", { params });
        const resData = res.data.data || res.data;
        const matchArray = Array.isArray(resData)
          ? resData
          : resData.data || resData.rows || [];
        setMatches(matchArray);
      }
    } catch (err) {
      console.error("Match Center Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center font-black italic text-slate-400 animate-pulse uppercase tracking-widest">
        SYNCING MATCH CENTER...
      </div>
    );

  // Sort and filter matches for consistency
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()
  );

  // ✅ Fixtures: เอาเฉพาะในลีกปัจจุบันของทีมเราเท่านั้น (เพื่อความไม่งงในช่วงรอยต่อลีก)
  const fixtures = sortedMatches.filter(
    (m) =>
      (m.status === "SCHEDULED" || m.status === "LIVE") &&
      m.leagueId === myTeam?.leagueId
  );

  // ✅ Results: เอาทั้งหมดที่เคยเตะมา (Historical Career History)
  const results = sortedMatches.filter((m) => m.status === "COMPLETED").reverse();

  const isPlayer = userRole === "PLAYER";
  
  // Choose accent color based on role (optional, for flavor)
  // Player: Indigo/Orange accents, Manager: Blue accents
  const accentColor = isPlayer ? "indigo" : "blue";
  const upcomingAccent = isPlayer ? "orange" : "blue";

  const noLeague = !myTeam?.leagueId || !myTeam?.league || myTeam?.league?.status === 'COMPLETED';

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
      {/* Header - Shared Premium Design */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <h1 className={`text-4xl font-black italic uppercase tracking-tighter relative z-10 ${isPlayer ? 'text-white' : 'text-blue-400'}`}>
          Match Center ⚽
        </h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 relative z-10">
          Fixtures & Historical Results for {myTeam?.name || "Global League"}
        </p>
        <div className={`absolute -right-20 -top-20 w-80 h-80 bg-${accentColor}-600/10 rounded-full blur-3xl pointer-events-none`}></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Upcoming Fixtures Column */}
        <div className="space-y-6">
          <h3 className={`text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-${upcomingAccent}-500 pl-3`}>
            Upcoming Battles
          </h3>
          {noLeague ? (
            <div className="bg-white rounded-[3rem] p-12 text-center shadow-sm border border-slate-100">
              <div className="text-4xl mb-4 grayscale opacity-20">🏟️</div>
              <h2 className="text-lg font-black italic uppercase text-slate-900 mb-2">ยังไม่มีรายการแข่งขัน</h2>
              <p className="text-slate-400 font-black italic uppercase text-[9px] tracking-widest">
                {!myTeam?.leagueId 
                  ? "ทีมของคุณกำลังรอเข้าร่วมลีกใหม่ในฤดูกาลถัดไป" 
                  : "ฤดูกาลแข่งขันจบลงแล้ว หรือยังไม่มีการจัดตารางแข่งในขณะนี้"}
              </p>
            </div>
          ) : fixtures.length > 0 ? (
            fixtures.map((match) => {
              const isMyTeamHome = match.homeTeamId === myTeam?.id;
              return (
                <div key={match.id} className={`bg-white rounded-3xl p-8 shadow-sm border border-slate-100 group hover:shadow-xl hover:border-${upcomingAccent}-100 transition-all duration-500`}>
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-6 text-center">
                    {match.league?.name}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {/* Home Team */}
                    <div className="flex-1 text-center space-y-3">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto border transition-transform group-hover:scale-110 ${
                        isMyTeamHome ? `border-${upcomingAccent}-400 bg-${upcomingAccent}-50/30` : "border-slate-100 bg-slate-50"
                      }`}>
                        {match.homeTeam?.logoUrl ? (
                          <img src={match.homeTeam.logoUrl} className="w-10 h-10 object-contain" />
                        ) : (
                          <span className="font-black italic text-slate-300 text-sm">{match.homeTeam?.shortName}</span>
                        )}
                      </div>
                      <span className={`font-black italic uppercase text-[11px] block truncate ${isMyTeamHome ? `text-${upcomingAccent}-600` : "text-slate-500"}`}>
                        {match.homeTeam?.name}
                      </span>
                    </div>
                    
                    {/* Versus / Meta */}
                    <div className="px-6 text-center">
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 mb-2">
                        {new Date(match.matchDate).toLocaleDateString()}
                      </div>
                      <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase italic tracking-widest shadow-lg">VS</div>
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 text-center space-y-3">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto border transition-transform group-hover:scale-110 ${
                        !isMyTeamHome ? `border-${upcomingAccent}-400 bg-${upcomingAccent}-50/30` : "border-slate-100 bg-slate-50"
                      }`}>
                        {match.awayTeam?.logoUrl ? (
                          <img src={match.awayTeam.logoUrl} className="w-10 h-10 object-contain" />
                        ) : (
                          <span className="font-black italic text-slate-300 text-sm">{match.awayTeam?.shortName}</span>
                        )}
                      </div>
                      <span className={`font-black italic uppercase text-[11px] block truncate ${!isMyTeamHome ? `text-${upcomingAccent}-600` : "text-slate-500"}`}>
                        {match.awayTeam?.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
              <span className="text-4xl block mb-4 opacity-30">📅</span>
              <p className="text-slate-400 font-black italic uppercase text-xs tracking-widest">No matches currently scheduled.</p>
            </div>
          )}
        </div>

        {/* Past Results Column */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-indigo-500 pl-3">
            Historical Logs
          </h3>
          <div className="space-y-3">
            {results.length > 0 ? (
              results.map((match) => {
                const isHome = match.homeTeamId === myTeam?.id;
                const myScore = isHome ? match.homeScore : match.awayScore;
                const opScore = isHome ? match.awayScore : match.homeScore;
                const status = myScore > opScore ? "W" : myScore < opScore ? "L" : "D";
                const statusColor = status === "W" ? "bg-emerald-500" : status === "L" ? "bg-red-500" : "bg-slate-400";

                return (
                  <div key={match.id} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-4 group hover:shadow-lg transition-all duration-300">
                    <div className={`w-8 h-8 ${statusColor} rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-lg shrink-0`}>
                      {status}
                    </div>
                    
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`text-[11px] font-black italic uppercase truncate w-12 ${isHome ? `text-${accentColor}-600` : "text-slate-400"}`}>
                          {match.homeTeam?.shortName || match.homeTeam?.name}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 shrink-0">
                          <span className={`text-sm font-black italic ${match.homeScore > match.awayScore ? `text-${accentColor}-600` : "text-slate-400"}`}>
                            {match.homeScore}
                          </span>
                          <span className="text-[8px] font-black text-slate-300 opacity-50">-</span>
                          <span className={`text-sm font-black italic ${match.awayScore > match.homeScore ? `text-${accentColor}-600` : "text-slate-400"}`}>
                            {match.awayScore}
                          </span>
                        </div>
                        <div className={`text-[11px] font-black italic uppercase truncate w-12 ${!isHome ? `text-${accentColor}-600` : "text-slate-400"}`}>
                          {match.awayTeam?.shortName || match.awayTeam?.name}
                        </div>
                      </div>
                      
                      <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0 ml-4">
                        <div className="text-[7px] font-black uppercase tracking-widest text-slate-300 truncate max-w-[80px]">
                          {match.league?.name}
                        </div>
                        <div className="text-[8px] font-bold text-slate-400 opacity-60">
                          {new Date(match.matchDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
                <span className="text-4xl block mb-4 opacity-30">📉</span>
                <p className="text-slate-400 font-black italic uppercase text-xs tracking-widest">No past results found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchCenter;
