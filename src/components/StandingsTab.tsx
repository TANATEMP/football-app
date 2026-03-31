// src/components/shared/StandingsTab.tsx
import React from 'react';

// --- โครงสร้างข้อมูลตารางคะแนน ---
interface StandingRecord {
  id: number;
  position: number;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[]; // ฟอร์ม 5 นัดหลังสุด
}

const StandingsTab = () => {
  // --- Mock Data (เรียงตามคะแนนแล้ว) ---
  const standings: StandingRecord[] = [
    { id: 1, position: 1, teamName: 'Red Devils FC', played: 5, won: 4, drawn: 1, lost: 0, goalsFor: 12, goalsAgainst: 4, goalDifference: 8, points: 13, form: ['W', 'W', 'D', 'W', 'W'] },
    { id: 2, position: 2, teamName: 'Blue Moon City', played: 5, won: 4, drawn: 0, lost: 1, goalsFor: 15, goalsAgainst: 5, goalDifference: 10, points: 12, form: ['W', 'L', 'W', 'W', 'W'] },
    { id: 3, position: 3, teamName: 'London Gunners', played: 5, won: 2, drawn: 2, lost: 1, goalsFor: 7, goalsAgainst: 6, goalDifference: 1, points: 8, form: ['D', 'W', 'D', 'L', 'W'] },
    { id: 4, position: 4, teamName: 'The Blues', played: 5, won: 0, drawn: 1, lost: 4, goalsFor: 2, goalsAgainst: 12, goalDifference: -10, points: 1, form: ['L', 'L', 'D', 'L', 'L'] },
  ];

  // ฟังก์ชันวาดสีฟอร์มนัดหลังสุด (W = เขียว, D = เทา, L = แดง)
  const renderFormBadge = (result: 'W' | 'D' | 'L', index: number) => {
    const colors = {
      W: 'bg-green-500',
      D: 'bg-gray-400',
      L: 'bg-red-500'
    };
    return (
      <span key={index} className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white rounded-sm ${colors[result]}`}>
        {result}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h2 className="text-xl font-bold text-gray-800">League Table</h2>
        <span className="text-sm text-gray-500">Last updated: Just now</span>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full text-center border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="p-3 font-semibold w-12 text-center">Pos</th>
              <th className="p-3 font-semibold text-left">Club</th>
              <th className="p-3 font-semibold w-12" title="Played">MP</th>
              <th className="p-3 font-semibold w-12" title="Won">W</th>
              <th className="p-3 font-semibold w-12" title="Drawn">D</th>
              <th className="p-3 font-semibold w-12" title="Lost">L</th>
              <th className="p-3 font-semibold w-12 hidden md:table-cell" title="Goals For">GF</th>
              <th className="p-3 font-semibold w-12 hidden md:table-cell" title="Goals Against">GA</th>
              <th className="p-3 font-semibold w-12" title="Goal Difference">GD</th>
              <th className="p-3 font-bold text-gray-900 w-16" title="Points">Pts</th>
              <th className="p-3 font-semibold text-left hidden sm:table-cell w-32">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {standings.map((team, index) => {
              // ไฮไลต์ทีมแชมป์ หรือโซนตกชั้น (ตัวอย่าง: ให้ทีมนำจ่าฝูงมีขีดเส้นสีเขียวด้านซ้าย)
              const isTopTeam = index === 0;
              
              return (
                <tr key={team.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="p-3 text-gray-600 font-medium relative">
                    {/* แถบสีด้านซ้ายบอกโซน (สมมติว่าที่ 1 คือแชมป์) */}
                    {isTopTeam && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-r-md"></div>}
                    {team.position}
                  </td>
                  <td className="p-3 font-bold text-gray-900 text-left flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${isTopTeam ? 'bg-blue-600' : 'bg-gray-400'}`}>
                      {team.teamName.charAt(0)}
                    </div>
                    {team.teamName}
                  </td>
                  <td className="p-3 text-gray-600">{team.played}</td>
                  <td className="p-3 text-gray-600">{team.won}</td>
                  <td className="p-3 text-gray-600">{team.drawn}</td>
                  <td className="p-3 text-gray-600">{team.lost}</td>
                  <td className="p-3 text-gray-500 hidden md:table-cell">{team.goalsFor}</td>
                  <td className="p-3 text-gray-500 hidden md:table-cell">{team.goalsAgainst}</td>
                  <td className="p-3 text-gray-600 font-medium">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</td>
                  <td className="p-3 text-lg font-black text-blue-900 bg-blue-50/30">{team.points}</td>
                  <td className="p-3 hidden sm:table-cell">
                    <div className="flex gap-1">
                      {team.form.map((result, i) => renderFormBadge(result, i))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-6 text-xs text-gray-500 px-2">
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span> Champion</div>
        <div className="flex items-center gap-2"><span className="font-bold">MP</span> = Matches Played</div>
        <div className="flex items-center gap-2"><span className="font-bold">GD</span> = Goal Difference</div>
      </div>
    </div>
  );
};

export default StandingsTab;