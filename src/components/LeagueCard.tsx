// src/components/admin/LeagueCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { League } from '../types';

interface LeagueCardProps {
  league: League;
}

const LeagueCard = ({ league }: LeagueCardProps) => {
  // ฟังก์ชันสีป้ายสถานะย้ายมาอยู่ที่นี่แทน
  const getStatusColor = (status: League['status']) => {
    switch (status) {
      case 'REGISTRATION': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ONGOING': return 'bg-green-100 text-green-800 border-green-300';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const fillPercentage = Math.round((league.currentTeams / league.maxTeams) * 100);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="p-5 border-b border-gray-100 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{league.name}</h3>
          <p className="text-sm text-gray-500 mt-1">Season: {league.season}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(league.status)}`}>
          {league.status}
        </span>
      </div>

      <div className="p-5 flex-1 bg-gray-50/50">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-600">Registered Teams</span>
          <span className="font-bold text-gray-900">{league.currentTeams} / {league.maxTeams}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${fillPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
            style={{ width: `${fillPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-right">{fillPercentage}% Full</p>
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