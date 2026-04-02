import { useCallback, useEffect, useState } from "react";
import type { League } from "../../types";
import LeagueCard from "../../components/LeagueCard";
import CreateLeagueModal from "../../components/CreateLeagueModal";
import ConfirmModal from "../../components/ConfirmModal";
import api from "../../lib/api";
import axios from "axios";

const LeagueManagement = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'DANGER' | 'SUCCESS' | 'INFO';
    onConfirm: () => void;
  } | null>(null);

  const fetchLeagues = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/leagues");
      console.log(response);
 
      const payload = response.data.data !== undefined ? response.data.data : response.data;
      const rows = Array.isArray(payload) ? payload : (payload.data || payload.rows || []);

      setLeagues(
        rows.map((l: any) => ({
          ...l,
          currentTeams: l.approvedTeamsCount ?? l._count?.teams ?? l.teams?.length ?? 0,
          totalApplicants: l.totalApplicants ?? 0,
          approvedTeamsCount: l.approvedTeamsCount ?? 0,
          totalMatches: l.totalMatches ?? 0,
          completedMatches: l.completedMatches ?? 0,
          maxTeams: l.maxTeams ?? 20,
        }))
      );
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  const handleCreateLeague = async (formData: any) => {
    try {
      await api.post("/leagues", {
        name: formData.name,
        season: new Date().getFullYear().toString(),
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        registrationEnd: formData.registrationEnd,
        status: "REGISTRATION",
        maxTeams: formData.maxTeams || 16,
        daysOfWeek: formData.daysOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
        matchDuration: formData.matchDuration,
        matchFormat: formData.matchFormat
      });
      await fetchLeagues();
      setIsModalOpen(false);
      
      setModalConfig({
        isOpen: true,
        title: "Success",
        message: "สร้างลีกการแข่งขันเรียบร้อยแล้ว!",
        type: 'SUCCESS',
        onConfirm: () => setModalConfig(null)
      });

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "เกิดข้อผิดพลาด";
        const errorMessage = Array.isArray(message) ? message.join('\n') : message;
        
        setModalConfig({
          isOpen: true,
          title: "สร้างไม่สำเร็จ",
          message: errorMessage,
          type: 'DANGER',
          onConfirm: () => setModalConfig(null)
        });
      } else {
        setModalConfig({
          isOpen: true,
          title: "Error",
          message: "เกิดข้อผิดพลาดที่ไม่คาดคิด",
          type: 'DANGER',
          onConfirm: () => setModalConfig(null)
        });
      }
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              League Management
            </h1>
            <p className="text-gray-500 mt-1">
              จัดการและควบคุมการแข่งขันทั้งหมดในระบบ
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md transition-all flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Create New League
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-500 font-medium animate-pulse">
            กำลังดึงข้อมูลทัวร์นาเมนต์...
          </div>
        ) : leagues.length === 0 ? (
          <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-[2rem] bg-gray-50/50">
            <div className="text-5xl mb-4 opacity-20">🏆</div>
            <p className="text-xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">ยังไม่มีลีกการแข่งขัน</p>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">กดปุ่ม "Create New League" เพื่อเริ่มสร้างประวัติศาสตร์</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* 1. Recruitment & Registration */}
            {leagues.some(l => l.status === 'REGISTRATION') && (
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] italic border-l-4 border-blue-600 pl-4 flex items-center gap-3">
                  Recruitment Phase
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {leagues.filter(l => l.status === 'REGISTRATION').map((league) => (
                    <LeagueCard key={league.id} league={league} />
                  ))}
                </div>
              </div>
            )}

            {/* 2. Pre-Season & Ongoing */}
            {leagues.some(l => l.status === 'PRE_SEASON' || l.status === 'ONGOING') && (
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] italic border-l-4 border-emerald-600 pl-4">
                  Active Tournaments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {leagues.filter(l => l.status === 'PRE_SEASON' || l.status === 'ONGOING').map((league) => (
                    <LeagueCard key={league.id} league={league} />
                  ))}
                </div>
              </div>
            )}

            {/* 3. Completed */}
            {leagues.some(l => l.status === 'COMPLETED') && (
              <div className="space-y-6 pt-10 border-t border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic border-l-4 border-slate-200 pl-4">
                  History & Archives
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 opacity-80 grayscale-[0.5] hover:grayscale-0 transition-all duration-500">
                  {leagues.filter(l => l.status === 'COMPLETED').map((league) => (
                    <LeagueCard key={league.id} league={league} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isModalOpen && (
          <CreateLeagueModal
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateLeague}
          />
        )}
      </div>

      {modalConfig && (
        <ConfirmModal 
          isOpen={modalConfig.isOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          type={modalConfig.type}
          onConfirm={modalConfig.onConfirm}
          onCancel={() => setModalConfig(null)}
          confirmText="OK"
        />
      )}
    </>
  );
};

export default LeagueManagement;