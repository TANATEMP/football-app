// src/components/shared/StandingsTab.tsx
import React, { useEffect, useState, useCallback } from 'react';
import api from '../lib/api';

// --- Improved Standings Type ---
interface StandingRecord {
  id: string;
  position: number;
  team: {
    name: string;
    shortName: string;
    logoUrl?: string;
  };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface StandingsTabProps {
  leagueId: string;
  status: any;
}

const StandingsTab: React.FC<StandingsTabProps> = ({ leagueId }) => {
  const [standings, setStandings] = useState<StandingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStandings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/leagues/${leagueId}/standings`);
      // Backend wraps: { success, data: [...] }
      const payload = response.data.data !== undefined ? response.data.data : response.data;
      setStandings(Array.isArray(payload) ? payload : (payload.data || []));
    } catch (err) {
      console.error("Error fetching standings:", err);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    if (leagueId) {
      fetchStandings();
    }
  }, [leagueId, fetchStandings]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading standings...</div>;
  if (!standings.length) return <div className="p-8 text-center text-slate-400">No standings data yet.</div>;

  return (
    <div className="overflow-hidden bg-white border border-slate-100 rounded-[1.5rem] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <th className="p-5 w-16 text-center italic">Pos</th>
              <th className="p-5 text-left italic">Club</th>
              <th className="p-5 w-16 italic" title="Played">MP</th>
              <th className="p-5 w-16 italic" title="Won">W</th>
              <th className="p-5 w-16 italic" title="Drawn">D</th>
              <th className="p-5 w-16 italic" title="Lost">L</th>
              <th className="p-5 w-16 hidden md:table-cell italic" title="Goal Difference">GD</th>
              <th className="p-5 font-black text-slate-900 w-20 italic bg-blue-50/20" title="Points">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {standings.map((row, index) => {
              const isTop = index === 0;
              return (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5 font-black text-slate-900 italic">
                    <div className="flex items-center justify-center relative">
                       {isTop && <div className="absolute -left-5 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>}
                       {index + 1}
                    </div>
                  </td>
                  <td className="p-5 font-black text-slate-900 text-left">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black italic shadow-inner">
                          {row.team.shortName || row.team.name.charAt(0)}
                       </div>
                       <span className="uppercase tracking-tighter italic">{row.team.name}</span>
                    </div>
                  </td>
                  <td className="p-5 text-slate-500 font-bold">{row.played}</td>
                  <td className="p-5 text-slate-500 font-bold">{row.won}</td>
                  <td className="p-5 text-slate-500 font-bold">{row.drawn}</td>
                  <td className="p-5 text-slate-500 font-bold">{row.lost}</td>
                  <td className="p-5 text-slate-400 font-bold hidden md:table-cell italic">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                  <td className="p-5 text-xl font-black text-blue-900 bg-blue-50/20 italic">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StandingsTab;