// src/pages/manager/TeamManagement.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../../lib/api';
import axios from 'axios';

// --- Types ---
type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

interface Player {
  id: string;
  name: string;
  number: number;
  position: Position;
  stats?: any[];
}

interface JoinRequest {
  id: string;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const TeamManagement = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingRequest, setApprovingRequest] = useState<JoinRequest | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userRes = await api.get('/user');
      const team = userRes.data.data?.team;
      if (!team) return;
      
      // setMyTeamId(team.id);

      const [playersRes, reqsRes] = await Promise.all([
        api.get('/players', { params: { teamId: team.id } }),
        api.get(`/join-requests/team/${team.id}`),
      ]);

      console.log(playersRes);
      console.log(reqsRes);
      const playersPayload = playersRes.data.data !== undefined ? playersRes.data.data : playersRes.data;
      const reqsPayload = reqsRes.data.data !== undefined ? reqsRes.data.data : reqsRes.data;

      const playersData = Array.isArray(playersPayload) ? playersPayload : playersPayload?.data || [];
      const reqsData = Array.isArray(reqsPayload) ? reqsPayload : reqsPayload?.data || [];
      setPlayers(playersData);
      setPendingRequests(reqsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const getPositionColor = (pos: string) => {
    switch (pos) {
      case 'GK': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'DEF': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'MID': return 'bg-green-100 text-green-800 border-green-300';
      case 'FWD': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleApprove = async (reqId: string, number: number) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await api.patch(`/join-requests/${reqId}/approve`, { number });
      setApprovingRequest(null);
      setNewNumber('');
      await fetchData();
    } catch (err: any) {
      console.error('Approval error:', err);
      // 🔥 Extracting from nested error structure (success: false, error: { message: ... })
      const data = err.response?.data;
      const msg = data?.error?.message || data?.message || data?.error || err.message || 'Error occurred';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : typeof msg === 'object' ? JSON.stringify(msg) : msg.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (reqId: string) => {
    try {
      await api.patch(`/join-requests/${reqId}/reject`);
      await fetchData();
    } catch (err) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.message || 'Error occurred');
    }
  };

  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [newNumber, setNewNumber] = useState<string>('');

  const handleUpdateNumber = async () => {
    if (!editingPlayer) return;
    const num = parseInt(newNumber);
    if (isNaN(num) || num < 1 || num > 99) {
      alert('โปรดระบุเบอร์เสื้อระหว่าง 1-99');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await api.patch(`/players/${editingPlayer.id}`, { number: num });
      setEditingPlayer(null);
      await fetchData();
    } catch (err: any) {
      console.error('Update number error:', err);
      // 🔥 Extracting from nested error structure (success: false, error: { message: ... })
      const data = err.response?.data;
      const msg = data?.error?.message || data?.message || data?.error || err.message || 'Failed to update number';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : typeof msg === 'object' ? JSON.stringify(msg) : msg.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePlayer = async (id: string, name: string) => {
    if (window.confirm(`คุณต้องการยกเลิกสัญญากับ ${name} ใช่หรือไม่?`)) {
      try {
        await api.delete(`/players/${id}`);
        await fetchData();
      } catch (err) {
        if (axios.isAxiosError(err)) alert(err.response?.data?.message || 'Error occurred');
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Squad Management</h1>
          <p className="text-slate-500 mt-1">จัดการรายชื่อนักเตะและขุมกำลังของทีมคุณ</p>
        </div>
        <Link to="/manager/stats" className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs italic transition-all shadow-xl active:scale-95 flex items-center gap-2">
           View Full Analytics <span className="text-lg">📊</span>
        </Link>
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
                    <h3 className="font-bold text-gray-900">{req.user.name}</h3>
                    <p className="text-xs text-gray-500">{req.user.email} {req.message ? `- "${req.message}"` : ''}</p>
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
                    onClick={() => {
                      setApprovingRequest(req);
                      setNewNumber('');
                      setErrorMsg(null);
                    }}
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
                {players.sort((a, b) => (a.number || 999) - (b.number || 999)).map((player) => (
                  <tr key={player.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="p-4 text-center">
                      <div className="relative group/num flex justify-center">
                        <button 
                          onClick={() => {
                            setEditingPlayer(player);
                            setNewNumber(player.number?.toString() || '');
                            setErrorMsg(null);
                          }}
                          className="relative w-12 h-12 rounded-xl bg-white border-2 border-slate-100 flex flex-col items-center justify-center font-black transition-all hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 active:scale-95 group-hover:bg-slate-50"
                        >
                          <span className={`text-lg ${player.number ? 'text-slate-900' : 'text-slate-300 italic'}`}>
                            {player.number || '--'}
                          </span>
                          <span className="text-[8px] uppercase tracking-tighter text-blue-500 font-bold opacity-0 group-hover/num:opacity-100 transition-opacity">
                            Edit ✏️
                          </span>
                        </button>
                      </div>
                    </td>
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

      {/* 🔢 Edit Jersey Number Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 animate-slide-up">
            <div className="bg-slate-900 p-6 text-white">
              <h3 className="text-lg font-black italic uppercase tracking-tight">Assign Jersey No.</h3>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Player: {editingPlayer.name}</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4 text-center">
                <input 
                  type="number"
                  min="1"
                  max="99"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  className="w-24 h-24 text-4xl font-black text-center bg-slate-50 border-2 border-slate-200 rounded-[1.5rem] focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                  placeholder="--"
                  autoFocus
                />
                
                {/* ⚠️ Error Alert */}
                {errorMsg && (
                   <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 flex items-center justify-center gap-2 text-xs font-bold">
                     <span className="text-sm">⚠️</span> {errorMsg}
                   </div>
                )}

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">เลือกเบอร์ระหว่าง 1 - 99</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setEditingPlayer(null)}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-xl font-black uppercase tracking-widest text-[10px] italic hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateNumber}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] italic hover:bg-blue-600 shadow-lg shadow-blue-100 transition-all"
                >
                  Submit No.
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔢 Approve Request & Assign Number Modal */}
      {approvingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 animate-slide-up">
            <div className="bg-green-600 p-6 text-white">
              <h3 className="text-lg font-black italic uppercase tracking-tight">Approve Transfer</h3>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Assign number to: {approvingRequest.user.name}</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4 text-center">
                <input 
                  type="number"
                  min="1"
                  max="99"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  className="w-24 h-24 text-4xl font-black text-center bg-slate-50 border-2 border-slate-200 rounded-[1.5rem] focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all"
                  placeholder="--"
                  autoFocus
                />

                {/* ⚠️ Error Alert */}
                {errorMsg && (
                   <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 flex items-center justify-center gap-2 text-xs font-bold">
                     <span className="text-sm">⚠️</span> {errorMsg}
                   </div>
                )}

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">กำหนดเบอร์เสื้อ (1 - 99)</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setApprovingRequest(null)}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-xl font-black uppercase tracking-widest text-[10px] italic hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const num = parseInt(newNumber);
                    if (isNaN(num)) return alert('กรุณาระบุเบอร์เสื้อ');
                    handleApprove(approvingRequest.id, num);
                  }}
                  className="flex-1 py-4 bg-green-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] italic hover:bg-green-700 shadow-lg shadow-green-100 transition-all"
                >
                  Sign Player
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeamManagement;