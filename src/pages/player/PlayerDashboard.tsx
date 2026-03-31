// src/pages/player/PlayerDashboard.tsx
import React, { useState } from 'react';

// --- Types ---
type PlayerStatus = 'FREE_AGENT' | 'PENDING' | 'SIGNED';

interface TeamInfo {
  id: string;
  name: string;
  manager: string;
}

const PlayerDashboard = () => {
  // --- States ---
  const [status, setStatus] = useState<PlayerStatus>('FREE_AGENT');
  const [searchQuery, setSearchQuery] = useState('');
  const [requestedTeam, setRequestedTeam] = useState<TeamInfo | null>(null);

  // --- Mock Data ---
  const availableTeams: TeamInfo[] = [
    { id: 'T1', name: 'Red Devils FC', manager: 'John Doe' },
    { id: 'T2', name: 'Blue Moon City', manager: 'Jane Smith' },
    { id: 'T3', name: 'London Gunners', manager: 'Mike Tyson' },
  ];

  const myTeam: TeamInfo = { id: 'T1', name: 'Red Devils FC', manager: 'John Doe' };
  const myStats = { matches: 5, goals: 3, assists: 2, rating: 8.5 };

  // --- Functions ---
  const handleRequestJoin = (team: TeamInfo) => {
    setRequestedTeam(team);
    setStatus('PENDING'); // เปลี่ยนสถานะเป็นรออนุมัติ
  };

  const handleCancelRequest = () => {
    setRequestedTeam(null);
    setStatus('FREE_AGENT'); // ยกเลิกแล้วกลับมาเป็นนักเตะไร้สังกัด
  };

  // ปุ่มลับเอาไว้เทส (Mock) การถูกรับเข้าทีม
  const simulateManagerApproval = () => {
    setStatus('SIGNED');
  };

  // ==========================================
  // 🔴 1. สถานะ: ไร้สังกัด (FREE AGENT) - ค้นหาทีม
  // ==========================================
  if (status === 'FREE_AGENT') {
    const filteredTeams = availableTeams.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-gray-800 to-gray-600 rounded-2xl p-8 text-white shadow-lg text-center">
          <div className="text-5xl mb-4">👟</div>
          <h1 className="text-3xl font-black mb-2">You are a Free Agent</h1>
          <p className="text-gray-200">ค้นหาสโมสรที่คุณต้องการเข้าร่วม และส่งคำขอเพื่อเริ่มต้นเส้นทางของคุณ</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="relative mb-6">
            <input 
              type="text" 
              placeholder="Search for a club by name..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="w-6 h-6 text-gray-400 absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          <div className="space-y-3">
            {filteredTeams.length > 0 ? filteredTeams.map(team => (
              <div key={team.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black">
                    {team.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500">Manager: {team.manager}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRequestJoin(team)}
                  className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  Request to Join
                </button>
              </div>
            )) : (
              <p className="text-center text-gray-500 py-8">ไม่พบสโมสรที่คุณค้นหา</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🟡 2. สถานะ: รออนุมัติ (PENDING)
  // ==========================================
  if (status === 'PENDING' && requestedTeam) {
    return (
      <div className="max-w-3xl mx-auto pt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-center p-10">
          <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Pending</h1>
          <p className="text-gray-500 mb-6">
            คุณได้ส่งคำขอเข้าร่วมทีม <span className="font-bold text-gray-800">"{requestedTeam.name}"</span> แล้ว<br/>
            โปรดรอผู้จัดการทีมอนุมัติคำขอของคุณ
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={handleCancelRequest} className="px-6 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-bold transition-colors">
              Cancel Request
            </button>
            {/* ปุ่มลับสำหรับเทส ให้ข้ามไปสถานะมีทีมเลย */}
            <button onClick={simulateManagerApproval} className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm opacity-20 hover:opacity-100 transition-opacity">
              [Dev] Force Approve
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🟢 3. สถานะ: มีสังกัด (SIGNED) - Dashboard ปกติ
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Profile นักเตะ */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl shadow-inner">
            👦🏻
          </div>
          <div>
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30 mb-2 inline-block">
              {myTeam.name}
            </span>
            <h1 className="text-4xl font-black tracking-tight">John Player</h1>
            <p className="text-blue-100 mt-1 font-medium">Position: Midfielder (MF) • No. 10</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Personal Stats */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            My Season Stats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
              <div className="text-3xl font-black text-blue-600">{myStats.matches}</div>
              <div className="text-xs font-bold text-gray-500 uppercase mt-1">Matches</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
              <div className="text-3xl font-black text-green-600">{myStats.goals}</div>
              <div className="text-xs font-bold text-gray-500 uppercase mt-1">Goals</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
              <div className="text-3xl font-black text-purple-600">{myStats.assists}</div>
              <div className="text-xs font-bold text-gray-500 uppercase mt-1">Assists</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
              <div className="text-3xl font-black text-yellow-500">{myStats.rating}</div>
              <div className="text-xs font-bold text-gray-500 uppercase mt-1">Avg Rating</div>
            </div>
          </div>
        </div>

        {/* Club Info & Next Match */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">My Club</h2>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-xl">
                {myTeam.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-gray-900">{myTeam.name}</div>
                <div className="text-xs text-gray-500">Manager: {myTeam.manager}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Next Match
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
              <div className="flex justify-between items-center px-2">
                <span className="font-bold text-gray-900">RDF</span>
                <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded font-bold text-xs">VS</span>
                <span className="font-bold text-gray-900">LGN</span>
              </div>
              <p className="text-xs text-gray-400 mt-3">Sat, 26 Oct 2024 • 19:30</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlayerDashboard;