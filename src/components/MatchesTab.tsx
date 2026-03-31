// src/components/MatchesTab.tsx
import React, { useState } from "react";
import type { LeagueStatus } from "../pages/admin/LeagueDetail"; // Import type มาใช้
 // Import type มาใช้

interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | '';
  awayScore: number | '';
  status: 'SCHEDULED' | 'COMPLETED';
  date: string;
}

// 🟢 เพิ่ม Interface สำหรับรับ Props
interface MatchesTabProps {
  status: LeagueStatus;
}

const MatchesTab: React.FC<MatchesTabProps> = ({ status }) => {
  const [matches, setMatches] = useState<Match[]>([
    { id: 101, homeTeam: 'Red Devils FC', awayTeam: 'Blue Moon City', homeScore: 2, awayScore: 1, status: 'COMPLETED', date: '12 Oct 2024 - 18:00' },
    { id: 102, homeTeam: 'London Gunners', awayTeam: 'Red Devils FC', homeScore: '', awayScore: '', status: 'SCHEDULED', date: '19 Oct 2024 - 19:30' },
    { id: 103, homeTeam: 'Blue Moon City', awayTeam: 'London Gunners', homeScore: '', awayScore: '', status: 'SCHEDULED', date: '26 Oct 2024 - 20:00' },
  ]);

  // --- Logic เดิมของคุณ ---
  const handleScoreChange = (matchId: number, team: 'home' | 'away', value: string) => {
    const numValue = value === '' ? '' : Number(value);
    setMatches(matches.map(m => {
      if (m.id === matchId) {
        return { ...m, [team === 'home' ? 'homeScore' : 'awayScore']: numValue };
      }
      return m;
    }));
  };

  const handleSaveScore = (matchId: number) => {
    setMatches(matches.map(m => {
      if (m.id === matchId) {
        if (m.homeScore !== '' && m.awayScore !== '') {
          alert(`บันทึกผลการแข่งขันสำเร็จ!`);
          return { ...m, status: 'COMPLETED' };
        } else {
          alert('กรุณากรอกสกอร์ให้ครบทั้งสองฝั่ง');
        }
      }
      return m;
    }));
  };

  // 🟡 กรณีลีกยังอยู่ในช่วงรับสมัคร (REGISTRATION) ไม่ควรโชว์ตารางแข่ง
  if (status === 'REGISTRATION') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="text-6xl">📅</div>
        <h3 className="text-xl font-bold text-gray-800">No Fixtures Yet</h3>
        <p className="text-gray-500 max-w-xs">
          ตารางการแข่งขันจะถูกสร้างขึ้นหลังจากปิดรับสมัครและกดยืนยันรายชื่อทีมครบแล้วเท่านั้น
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Match Fixtures & Results</h2>
          <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">Manage scores and game details</p>
        </div>
        {/* โชว์ปุ่ม Add Match เฉพาะตอนที่ลีค ACTIVE หรือพร้อมแข่ง */}
        {status === 'ACTIVE' && (
          <button className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2">
            <span>+</span> Add Custom Match
          </button>
        )}
      </div>

      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
            
            <div className="w-full md:w-1/4 flex flex-col items-center md:items-start">
              <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">{match.date}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full mt-2 font-black uppercase ${
                match.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {match.status}
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center gap-4 w-full">
              <div className="flex-1 text-right font-black text-slate-800 text-lg">{match.homeTeam}</div>
              
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-inner">
                <input 
                  type="number" min="0"
                  disabled={status === 'COMPLETED'} // ล็อกสกอร์ถ้าจบลีกแล้ว
                  className="w-14 h-12 text-center font-black text-xl rounded-xl border-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                  value={match.homeScore}
                  onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                />
                <span className="text-slate-300 font-black">-</span>
                <input 
                  type="number" min="0"
                  disabled={status === 'COMPLETED'}
                  className="w-14 h-12 text-center font-black text-xl rounded-xl border-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                  value={match.awayScore}
                  onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                />
              </div>

              <div className="flex-1 text-left font-black text-slate-800 text-lg">{match.awayTeam}</div>
            </div>

            <div className="w-full md:w-1/4 flex justify-end">
              {status !== 'COMPLETED' && (
                <button 
                  onClick={() => handleSaveScore(match.id)}
                  className={`px-6 py-3 rounded-xl text-sm font-black w-full md:w-auto transition-all active:scale-95 ${
                    match.status === 'COMPLETED' 
                    ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                  }`}
                >
                  {match.status === 'COMPLETED' ? 'UPDATE' : 'CONFIRM RESULT'}
                </button>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchesTab;