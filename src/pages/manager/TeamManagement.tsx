// src/pages/manager/TeamManagement.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// --- Types ---
type Position = 'GK' | 'DF' | 'MF' | 'FW';

interface Player {
  id: string;
  name: string;
  number: number;
  position: Position;
  matches: number;
  goals: number;
  assists: number;
}

const TeamManagement = () => {
  // --- State: นักเตะในทีมปัจจุบัน ---
  const [players, setPlayers] = useState<Player[]>([
    { id: 'P1', name: 'David De Gea', number: 1, position: 'GK', matches: 5, goals: 0, assists: 0 },
    { id: 'P2', name: 'Virgil van Dijk', number: 4, position: 'DF', matches: 5, goals: 1, assists: 0 },
  ]);

  // --- State: คำขอเข้าร่วมทีมที่รออนุมัติ (Pending Requests) ---
  const [pendingRequests, setPendingRequests] = useState<Player[]>([
    { id: 'REQ-1', name: 'John Player', number: 10, position: 'MF', matches: 0, goals: 0, assists: 0 },
    { id: 'REQ-2', name: 'Darwin Nuñez', number: 9, position: 'FW', matches: 0, goals: 0, assists: 0 }
  ]);

  // --- Functions ---
  const getPositionColor = (pos: Position) => {
    switch (pos) {
      case 'GK': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'DF': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'MF': return 'bg-green-100 text-green-800 border-green-300';
      case 'FW': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // 🟢 อนุมัติรับเข้าทีม
  const handleApprove = (player: Player) => {
    // 1. ลบออกจากกล่อง Pending
    setPendingRequests(pendingRequests.filter(req => req.id !== player.id));
    // 2. ย้ายไปใส่ในตารางนักเตะหลัก
    setPlayers([...players, player]);
  };

  // 🔴 ปฏิเสธคำขอ
  const handleReject = (playerId: string) => {
    setPendingRequests(pendingRequests.filter(req => req.id !== playerId));
  };

  // ลบนักเตะออกจากทีม (Release)
  const handleRemovePlayer = (id: string, name: string) => {
    if (window.confirm(`คุณต้องการยกเลิกสัญญากับ ${name} ใช่หรือไม่?`)) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/manager" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <span>&larr;</span> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Squad Management</h1>
          <p className="text-gray-500 mt-1">จัดการรายชื่อนักเตะและขุมกำลังของทีมคุณ</p>
        </div>
        
      </div>

      {/* 📥 ส่วนคำขอรออนุมัติ (Pending Requests) - จะโชว์แค่ตอนที่มีคนขอมา */}
      {pendingRequests.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            Pending Transfer Requests ({pendingRequests.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map(req => (
              <div key={req.id} className="bg-white p-4 rounded-lg border border-yellow-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">👦🏻</div>
                  <div>
                    <h3 className="font-bold text-gray-900">{req.name}</h3>
                    <p className="text-xs text-gray-500">Prefers: {req.position} | No. {req.number}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleReject(req.id)}
                    className="flex-1 px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-md text-sm font-bold transition-colors"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleApprove(req)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md text-sm font-bold shadow-sm transition-colors"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🟢 ตารางนักเตะหลัก (Current Squad) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Current Squad ({players.length})</h2>
        </div>
        {players.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 font-semibold w-16 text-center">No.</th>
                  <th className="p-4 font-semibold">Player Name</th>
                  <th className="p-4 font-semibold w-24 text-center">Position</th>
                  <th className="p-4 font-semibold w-24 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {players.sort((a, b) => a.number - b.number).map((player) => (
                  <tr key={player.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="p-4 font-black text-gray-400 text-center text-lg">{player.number}</td>
                    <td className="p-4 font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                        👦🏻
                      </div>
                      {player.name}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 text-xs font-bold rounded border ${getPositionColor(player.position)}`}>
                        {player.position}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleRemovePlayer(player.id, player.name)}
                        className="text-red-500 hover:text-white border border-transparent hover:border-red-500 hover:bg-red-500 px-3 py-1.5 rounded-md text-xs font-bold transition-all opacity-0 group-hover:opacity-100"
                      >
                        Release
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-bold text-gray-900">No Players Yet</h3>
            <p className="text-gray-500 mt-2">ทีมของคุณยังไม่มีนักเตะเลย รออนุมัติคำขอจากด้านบนได้เลย!</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default TeamManagement;