import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/api";
import MatchesTab from "../../components/MatchesTab";
import TeamsTab from "../../components/TeamsTab";
import StandingsTab from "../../components/StandingsTab";
import OverviewTab from "../../components/OverviewTab";
import type { League } from "../../types";

export type LeagueStatus = "REGISTRATION" | "PRE_SEASON" | "ONGOING" | "COMPLETED";
type TabType = "overview" | "teams" | "matches" | "standings";

const LeagueDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [leagueData, setLeagueData] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeagueDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/leagues/${id}`);
      // Backend wraps: { success, data: { ...league, teams: [...] }, meta }
      const league = response.data.data;
      setLeagueData({
        ...league,
        currentTeams: league._count?.teams ?? 0,
        maxTeams: league.maxTeams ?? 20,
      });
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
      case "PRE_SEASON":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "ONGOING":
        return "bg-green-100 text-green-800 border-green-300";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading)
    return <div className="p-10 text-center">กำลังโหลดข้อมูลลีก...</div>;
  if (!leagueData)
    return (
      <div className="p-10 text-center text-red-500">ไม่พบข้อมูลลีกนี้</div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
                className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${getStatusBadge(leagueData.status as LeagueStatus)}`}
              >
                {leagueData.status}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {leagueData.name}
            </h1>
          </div>
        </div>

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
        {activeTab === "overview" && (
          <OverviewTab status={leagueData.status as LeagueStatus} data={leagueData} onRefresh={fetchLeagueDetail} />
        )}
        {activeTab === "teams" && (
          <TeamsTab leagueId={id!} maxTeams={leagueData.maxTeams} onRefresh={fetchLeagueDetail} />
        )}
        {activeTab === "matches" && (
          <MatchesTab leagueId={id!} status={leagueData.status as LeagueStatus} onRefresh={fetchLeagueDetail} />
        )}
        {activeTab === "standings" && (
          <StandingsTab leagueId={id!} status={leagueData.status as LeagueStatus} />
        )}
      </div>
    </div>
  );
};

export default LeagueDetail;
