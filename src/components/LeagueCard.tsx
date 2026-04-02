import React from 'react';
import { Link } from 'react-router-dom';
import type { League } from '../types';

interface LeagueCardProps {
  league: League;
}

const LeagueCard = ({ league }: LeagueCardProps) => {

  const getStatusColor = (status: League['status']) => {
    switch (status) {
      case 'REGISTRATION': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ONGOING': return 'bg-green-100 text-green-800 border-green-300';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="p-5 border-b border-gray-100 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{league.name}</h3>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(league.status)}`}>
          {league.status}
        </span>
      </div>

      <div className="p-6 flex-1 bg-gray-50/30 space-y-6">
        {(league.status === 'ONGOING' || league.status === 'COMPLETED') ? (
          <div className="space-y-4 py-2">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest italic text-emerald-600">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-200"></span>
                Match Progress
              </span>
              <span>{league.completedMatches || 0} / {league.totalMatches || 0}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/50">
              <div 
                className={`h-full transition-all duration-1000 ${league.status === 'COMPLETED' ? 'bg-slate-400' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.min(100, ((league.completedMatches || 0) / (league.totalMatches || 1)) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[9px] font-black text-slate-400 uppercase italic tracking-widest">
                {league.status === 'COMPLETED' ? 'Tournament Finished' : 'Season in progress'}
              </p>
              <span className="text-[10px] font-black text-emerald-600 italic">
                {Math.round(((league.completedMatches || 0) / (league.totalMatches || 1)) * 100)}% Done
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                  All Applicants
                </span>
                <span>{league.totalApplicants || 0} / {league.maxTeams}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-slate-300" 
                  style={{ width: `${Math.min(100, ((league.totalApplicants || 0) / league.maxTeams) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest italic text-blue-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-blue-600 rounded-full shadow-sm"></span>
                  Confirmed Squads
                </span>
                <span>{league.approvedTeamsCount || 0} / {league.maxTeams}</span>
              </div>
              <div className="w-full bg-blue-50 rounded-full h-3 overflow-hidden border border-blue-100">
                <div 
                  className={`h-full transition-all duration-1000 ${league.approvedTeamsCount === league.maxTeams ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                  style={{ width: `${Math.min(100, ((league.approvedTeamsCount || 0) / league.maxTeams) * 100)}%` }}
                ></div>
              </div>
              {league.approvedTeamsCount === league.maxTeams && (
                <p className="text-[9px] font-black text-emerald-600 uppercase italic tracking-widest text-right mt-1">✓ Capacity Reached</p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <Link 
          to={`/admin/league/${league.id}`}
          className="block w-full text-center bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors"
        >
          Manage League
        </Link>
      </div>
    </div>
  );
};

export default LeagueCard;