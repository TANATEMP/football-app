// src/pages/manager/TeamManagement.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../../lib/api';
import axios from 'axios';
import ConfirmModal from '../../components/ConfirmModal'; 

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

// 🔵 ปรับ ModalState ให้รับเฉพาะค่าที่ ConfirmModal มีจริงๆ
interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'DANGER';
  isConfirm?: boolean; 
  onConfirm?: () => void;
}

const TeamManagement = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingRequest, setApprovingRequest] = useState<JoinRequest | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'INFO',
    isConfirm: false,
  });

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  const fetchData = async () => {
    try {
      setLoading(true);
      const userRes = await api.get('/user');
      const team = userRes.data.data?.team;
      if (!team) return;
      
      const [playersRes, reqsRes] = await Promise.all([
        api.get('/players', { params: { teamId: team.id } }),
        api.get(`/join-requests/team/${team.id}`),
      ]);

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
      const data = err.response?.data;
      const msg = data?.error?.message || data?.message || data?.error || err.message || 'Error';
      setErrorMsg(msg.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (reqId: string) => {
    try {
      await api.patch(`/join-requests/${reqId}/reject`);
      await fetchData();
    } catch (err: any) {
      setModal({
        isOpen: true,
        title: 'Error',
        message: err.response?.data?.message || 'Error occurred',
        type: 'DANGER',
        onConfirm: closeModal
      });
    }
  };

  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [newNumber, setNewNumber] = useState<string>('');

  const handleUpdateNumber = async () => {
    if (!editingPlayer) return;
    const num = parseInt(newNumber);
    if (isNaN(num) || num < 1 || num > 99) {
      setModal({
        isOpen: true,
        title: 'Invalid Input',
        message: 'โปรดระบุเบอร์เสื้อระหว่าง 1-99',
        type: 'INFO', 
        onConfirm: closeModal
      });
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await api.patch(`/players/${editingPlayer.id}`, { number: num });
      setEditingPlayer(null);
      await fetchData();
    } catch (err: any) {
      const data = err.response?.data;
      const msg = data?.error?.message || data?.message || data?.error || err.message || 'Failed';
      setErrorMsg(msg.toString());
    } finally {
      setLoading(false);
    }
  };

  const confirmRemovePlayer = (id: string, name: string) => {
    setModal({
      isOpen: true,
      title: 'Confirm Release',
      message: `คุณต้องการยกเลิกสัญญากับ ${name} ใช่หรือไม่?`,
      type: 'DANGER',
      isConfirm: true,
      onConfirm: async () => {
        closeModal(); 
        try {
          await api.delete(`/players/${id}`);
          await fetchData();
        } catch (err: any) {
          setTimeout(() => {
            setModal({
              isOpen: true,
              title: 'Error',
              message: err.response?.data?.message || 'Error',
              type: 'DANGER',
              onConfirm: closeModal
            });
          }, 300);
        }
      }
    });
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      
      {/* Header */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="relative z-10">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter shrink-0 flex items-center gap-4">
            Squad Management ⚙️
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 relative z-10">
            Manage your players and kit numbers
          </p>
        </div>
      </div>

      {/* 📥 Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2">
            Pending Requests ({pendingRequests.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map(req => (
              <div key={req.id} className="bg-white p-4 rounded-lg border border-yellow-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{req.user.name}</h3>
                  <p className="text-xs text-gray-500">{req.user.email}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleReject(req.id)} className="flex-1 px-3 py-2 border border-red-200 text-red-600 rounded-md text-sm font-bold">Reject</button>
                  <button onClick={() => { setApprovingRequest(req); setNewNumber(''); setErrorMsg(null); }} className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md text-sm font-bold">Approve</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🟢 Squad Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Current Squad ({players.length})</h2>
        </div>
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
                    <button onClick={() => { setEditingPlayer(player); setNewNumber(player.number?.toString() || ''); setErrorMsg(null); }} className="w-10 h-10 rounded-lg border font-bold">
                      {player.number || '--'}
                    </button>
                  </td>
                  <td className="p-4 font-bold text-gray-900">{player.name}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 text-xs font-bold rounded border ${getPositionColor(player.position)}`}>
                      {player.position}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => confirmRemovePlayer(player.id, player.name)} className="text-red-500 font-bold opacity-0 group-hover:opacity-100">Release</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Jersey Number Modals (ส่วนนี้ใช้ UI ในไฟล์นี้เอง ไม่เกี่ยวกับ ConfirmModal) */}
      {editingPlayer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm text-center">
            <h3 className="text-lg font-black mb-4">Edit Number</h3>
            <input type="number" value={newNumber} onChange={(e) => setNewNumber(e.target.value)} className="w-20 h-20 text-3xl text-center border-2 rounded-xl mb-4" />
            {errorMsg && <p className="text-red-500 text-xs mb-4">{errorMsg}</p>}
            <div className="flex gap-2">
              <button onClick={() => setEditingPlayer(null)} className="flex-1 py-3 bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={handleUpdateNumber} className="flex-1 py-3 bg-slate-900 text-white rounded-xl">Save</button>
            </div>
          </div>
        </div>
      )}

      {approvingRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm text-center">
            <h3 className="text-lg font-black mb-4">Assign Number</h3>
            <input type="number" value={newNumber} onChange={(e) => setNewNumber(e.target.value)} className="w-20 h-20 text-3xl text-center border-2 rounded-xl mb-4" />
            {errorMsg && <p className="text-red-500 text-xs mb-4">{errorMsg}</p>}
            <div className="flex gap-2">
              <button onClick={() => setApprovingRequest(null)} className="flex-1 py-3 bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={() => {
                const num = parseInt(newNumber);
                if (isNaN(num)) return setModal({ isOpen: true, title: 'Error', message: 'กรุณากรอกเบอร์', type: 'INFO', onConfirm: closeModal });
                handleApprove(approvingRequest.id, num);
              }} className="flex-1 py-3 bg-green-600 text-white rounded-xl">Approve</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔵 จุดสำคัญ: เรียกใช้ ConfirmModal โดยไม่ส่งค่าที่ไม่มีใน Interface */}
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.isConfirm ? "ยืนยัน" : "ตกลง"}
        // ❌ ไม่ส่ง cancelText เพราะ Modal ไม่มี prop นี้
        onConfirm={modal.onConfirm || closeModal}
        onCancel={closeModal}
      />

    </div>
  );
};

export default TeamManagement;