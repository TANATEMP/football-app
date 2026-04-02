// src/components/TeamsTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import ConfirmModal from './ConfirmModal'; // 👈 นำเข้า ConfirmModal

// กำหนด Interface ให้ตรงกับ Prisma Schema
interface Team {
  id: string;
  name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; 
  logoUrl?: string;
}

interface TeamsTabProps {
  leagueId: string;
  maxTeams: number;
  onRefresh?: () => void;
}

// 👈 เพิ่ม Interface สำหรับ ConfirmModal
interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  type?: 'DANGER' | 'SUCCESS' | 'INFO';
  onConfirm: () => void;
}

const TeamsTab: React.FC<TeamsTabProps> = ({ leagueId, maxTeams, onRefresh }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // 👈 State ป้องกันการกดปุ่มซ้ำ

  // 👈 State สำหรับควบคุม ConfirmModal
  const [confirmConfig, setConfirmConfig] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/teams", { params: { leagueId } });
      const payload = response.data.data !== undefined ? response.data.data : response.data;
      const rows = Array.isArray(payload) ? payload : (payload.data || payload.rows || []);
      setTeams(rows);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setIsLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // --- Helpers สำหรับเปิด/ปิด Modal ---
  const closeConfirm = () => {
    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
  };

  const showConfirm = (
    title: string,
    message: string, 
    onConfirm: () => void, 
    type: 'DANGER' | 'SUCCESS' | 'INFO' = 'INFO',
    confirmText: string = 'OK'
  ) => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm, type, confirmText });
  };

  const showAlert = (title: string, message: string, type: 'SUCCESS' | 'DANGER' | 'INFO' = 'INFO') => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm: closeConfirm, 
      type,
      confirmText: 'ตกลง'
    });
  };

  // ✅ ฟังก์ชันอัปเดตสถานะทีม (Accept/Decline)
  const handleUpdateStatus = async (teamId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      setIsSubmitting(true);
      await api.patch(`/teams/${teamId}/status`, { status: newStatus });
      fetchTeams();
      onRefresh?.(); 
    } catch (error) {
      showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถอัปเดตสถานะทีมได้ โปรดตรวจสอบระบบหลังบ้าน', 'DANGER');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ ฟังก์ชันลบทีมออกจากลีก (เรียกเมื่อกดยืนยันใน Modal)
  const executeRemoveTeam = async (teamId: string) => {
    try {
      setIsSubmitting(true);
      await api.post(`/teams/${teamId}/remove-league`);
      fetchTeams();
      onRefresh?.();
      closeConfirm(); // ปิด Modal เมื่อสำเร็จ
    } catch (error) {
      setIsSubmitting(false);
      showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถนำทีมออกจากลีกได้', 'DANGER');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 👈 เปลี่ยนจาก confirm() มาใช้ showConfirm()
  const confirmRemoveTeam = (teamId: string) => {
    showConfirm(
      'นำทีมออกจากลีก?',
      'คุณต้องการนำทีมนี้ออกจากลีกใช่หรือไม่?\n(สถานะของทีมจะกลับไปเป็น PENDING)',
      () => executeRemoveTeam(teamId),
      'DANGER',
      'นำทีมออก'
    );
  };

  const approvedTeams = teams.filter(t => t.status === 'APPROVED');
  const isFull = approvedTeams.length >= maxTeams;
  const pendingTeams = teams.filter(t => t.status === 'PENDING');

  return (
    <div className="space-y-8">
      
      {/* 📋 1. ส่วนคำขอที่รอการอนุมัติ (Pending Requests) */}
      {pendingTeams.length > 0 && (
        <section className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6">
          <h3 className="text-amber-700 font-bold mb-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            Pending Requests ({pendingTeams.length})
            {isFull && <span className="ml-2 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">FULL 🚫</span>}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {pendingTeams.map(team => (
              <div key={team.id} className="bg-white p-4 rounded-xl border border-amber-200 flex justify-between items-center shadow-sm">
                <span className="font-bold text-slate-700">{team.name}</span>
                <div className="flex gap-2">
                  <button 
                    disabled={isFull || isSubmitting} // 👈 บล็อกปุ่มถ้าระบบกำลังโหลด
                    onClick={() => handleUpdateStatus(team.id, 'APPROVED')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      isFull || isSubmitting
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    Accept
                  </button>
                  <button 
                    disabled={isSubmitting} // 👈 บล็อกปุ่มถ้าระบบกำลังโหลด
                    onClick={() => handleUpdateStatus(team.id, 'REJECTED')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      isSubmitting 
                      ? 'text-slate-400 cursor-not-allowed' 
                      : 'text-red-500 hover:bg-red-50'
                    }`}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 🏆 2. รายชื่อทีมที่อนุมัติแล้ว (Approved Teams) */}
      <section>
        <h3 className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-4">
          Approved Teams ({approvedTeams.length})
        </h3>
        
        {isLoading ? (
          <div className="py-10 text-center text-slate-400">Loading teams...</div>
        ) : approvedTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedTeams.map(team => (
              <div key={team.id} className="group relative p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-4 hover:border-red-100 transition-all">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xl">
                  {team.logoUrl ? <img src={team.logoUrl} alt="logo" className="w-full h-full object-contain p-1" /> : "⚽"}
                </div>
                <div className="flex-1">
                  <span className="font-bold text-slate-800 block">{team.name}</span>
                  <button 
                    disabled={isSubmitting}
                    onClick={() => confirmRemoveTeam(team.id)} // 👈 เรียกใช้งาน Modal แทน confirm()
                    className="text-[10px] font-black uppercase tracking-tighter text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                  >
                    Remove from League &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 italic">
            No teams approved yet.
          </div>
        )}
      </section>

      {/* 👈 Render ConfirmModal */}
      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText={confirmConfig.confirmText}
        onConfirm={confirmConfig.onConfirm}
        onCancel={closeConfirm}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default TeamsTab;