import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { LeagueStatus } from '../pages/admin/LeagueDetail';

const api = axios.create({ baseURL: "http://localhost:3000" });

// กำหนด Interface ให้ตรงกับ Prisma Schema
interface Team {
  id: string;
  name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; 
  logoUrl?: string;
}

interface TeamsTabProps {
  leagueId: string;
  status: LeagueStatus;
}

const TeamsTab: React.FC<TeamsTabProps> = ({ leagueId, status }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/teams/league/${leagueId}`);
      setTeams(response.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setIsLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // ✅ ฟังก์ชันอัปเดตสถานะทีม (Accept/Decline)
  const handleUpdateStatus = async (teamId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      // ส่ง PATCH ไปที่ Backend (NestJS)
      await api.patch(`/teams/${teamId}/status`, { status: newStatus });
      
      // เมื่อสำเร็จ ให้ดึงข้อมูลใหม่มาแสดง
      fetchTeams();
    } catch (error) {
      alert("Failed to update team status. Please check your Backend.");
    }
  };

  // กรองทีมตามสถานะเพื่อแยกส่วนการแสดงผล
  const pendingTeams = teams.filter(t => t.status === 'PENDING');
  const approvedTeams = teams.filter(t => t.status === 'APPROVED');

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
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {pendingTeams.map(team => (
              <div key={team.id} className="bg-white p-4 rounded-xl border border-amber-200 flex justify-between items-center shadow-sm">
                <span className="font-bold text-slate-700">{team.name}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdateStatus(team.id, 'APPROVED')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(team.id, 'REJECTED')}
                    className="text-red-500 hover:bg-red-50 px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
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
              <div key={team.id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xl">
                  {team.logoUrl ? <img src={team.logoUrl} alt="logo" /> : "⚽"}
                </div>
                <span className="font-bold text-slate-800">{team.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 italic">
            No teams approved yet.
          </div>
        )}
      </section>

    </div>
  );
};

export default TeamsTab;