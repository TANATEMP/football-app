import React, { useState, useEffect, useCallback } from "react"; // 👈 เพิ่ม useEffect, useCallback
import { useParams, Link } from "react-router-dom";
import axios from "axios"; // 👈 เพิ่ม axios
import MatchesTab from "../../components/MatchesTab";
import TeamsTab from "../../components/TeamsTab";
import StandingsTab from "../../components/StandingsTab";
import OverviewTab from "../../components/OverviewTab";
import type { League } from "../../types";

// แก้ไขในหน้า LeagueDetail.tsx
export type LeagueStatus = "REGISTRATION" | "ONGOING" | "COMPLETED"; // เปลี่ยนจาก ACTIVE เป็น ONGOING
type TabType = "overview" | "teams" | "matches" | "standings";

// สร้าง api instance (หรือใช้จากไฟล์กลางที่ย้ายออกไปข้างนอก)
const api = axios.create({ baseURL: "http://localhost:3000" });

const LeagueDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // 1. สร้าง State สำหรับเก็บข้อมูลจริงจาก DB
  // แก้ที่บรรทัดประมาณ 20
  const [leagueData, setLeagueData] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. ฟังก์ชันดึงข้อมูลลีก
  const fetchLeagueDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/leagues/${id}`); // สมมติว่ามีเส้น GET /leagues/:id
      setLeagueData(response.data);
    } catch (error) {
      console.error("Error fetching league detail:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLeagueDetail();
  }, [fetchLeagueDetail]);

  const getStatusBadge = (status: LeagueStatus) => {
    switch (status) {
      case "REGISTRATION":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "ONGOING":
        return "bg-green-100 text-green-800 border-green-300"; // เปลี่ยนตรงนี้ด้วย
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 3. แสดง Loading ระหว่างรอข้อมูล
  if (isLoading)
    return <div className="p-10 text-center">กำลังโหลดข้อมูลลีก...</div>;
  if (!leagueData)
    return (
      <div className="p-10 text-center text-red-500">ไม่พบข้อมูลลีกนี้</div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ส่วน Header (เหมือนเดิม แต่ใช้ข้อมูลจาก leagueData ที่ดึงมาจริง) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                to="/admin"
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                &larr; Back to Leagues
              </Link>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${getStatusBadge(leagueData.status)}`}
              >
                {leagueData.status}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {leagueData.name}
            </h1>
          </div>

          {leagueData.status === "REGISTRATION" && (
            <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
              Manage Registration
            </button>
          )}
        </div>

        {/* Tab Buttons (เหมือนเดิม) */}
        <div className="flex overflow-x-auto border-t border-gray-200 bg-gray-50/50 px-6">
          {(["overview", "teams", "matches", "standings"] as TabType[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-700 bg-white"
                    : "border-transparent text-gray-500"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
        {/* 4. ส่ง id ของลีกเข้าไปใน Tab ต่างๆ เพื่อให้ Tab ไปดึงข้อมูลต่อเอง */}
        {activeTab === "overview" && (
          <OverviewTab status={leagueData.status} data={leagueData} />
        )}
        {activeTab === "teams" && (
          <TeamsTab leagueId={id!} status={leagueData.status} />
        )}
        {activeTab === "matches" && (
          <MatchesTab leagueId={id!} status={leagueData.status} />
        )}
        {activeTab === "standings" && (
          <StandingsTab leagueId={id!} status={leagueData.status} />
        )}
      </div>
    </div>
  );
};

export default LeagueDetail;
