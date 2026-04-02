import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { UserRole } from "./types";
import MainLayout from "./components/MainLayout.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import LandingPage from "./pages/common/LandingPage.tsx";
import AuthCallback from "./pages/common/AuthCallback.tsx";
import ResetPassword from "./pages/common/ResetPassword.tsx";
import LeagueManagement from "./pages/admin/LeagueManagement.tsx";
import LeagueDetail from "./pages/admin/LeagueDetail";
import UserManagement from "./pages/admin/UserManagement";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import TeamManagement from "./pages/manager/TeamManagement";
import SquadStats from "./pages/manager/SquadStats";
import LeagueDiscovery from "./pages/manager/LeagueDiscovery";
import MatchCenter from "./pages/shared/MatchCenter";
import PlayerDashboard from "./pages/player/PlayerDashboard";
import StandingsPage from "./pages/shared/StandingsPage";
import PlayerRoster from "./pages/player/PlayerRoster";
import PlayerStats from "./pages/player/PlayerStats";

function App() {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const user = JSON.parse(saved);
        return user.role;
      } catch (err) {}
    }
    return null;
  });

  const [userName] = useState<string>(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const user = JSON.parse(saved);
        return user.name || "Guest User";
      } catch (err) {}
    }
    return "Guest User";
  });

  return (
    <BrowserRouter>
      <Routes>
        {/*ส่วนที่ 1: หน้าที่ไม่มี Layout (ไม่มีเมนูด้านข้าง)*/}
        <Route path="/" element={<LandingPage setCurrentRole={setCurrentRole}/>} />
        <Route path="/auth/callback" element={<AuthCallback setCurrentRole={setCurrentRole}/>} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/*ส่วนที่ 2: หน้าที่มี Layout (มีเมนู Sidebar & Topbar)*/}
        <Route
          element={<MainLayout currentRole={currentRole} userName={userName} />}
        >
          {/* --- ADMIN Routes --- */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN"]}
                currentRole={currentRole}
              />
            }
          >
            <Route path="/admin" element={<LeagueManagement />} />
            <Route path="/admin/league/:id" element={<LeagueDetail />} />
            <Route path="/admin/users" element={<UserManagement />} />
          </Route>

          {/* --- MANAGER Routes --- */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["MANAGER"]}
                currentRole={currentRole}
              />
            }
          >
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/manager/matches" element={<MatchCenter />} />
            <Route path="/manager/team" element={<TeamManagement />} />
            <Route path="/manager/stats" element={<SquadStats />} />
            <Route path="/manager/standings" element={<StandingsPage />} />
            <Route path="/manager/leagues" element={<LeagueDiscovery />} />
          </Route>

          {/* --- PLAYER Routes --- */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["PLAYER"]}
                currentRole={currentRole}
              />
            }
          >
            <Route path="/player" element={<PlayerDashboard />} />
            <Route path="/player/matches" element={<MatchCenter />} />
            <Route path="/player/standings" element={<StandingsPage />} />
            <Route path="/player/team" element={<PlayerRoster />} />
            <Route path="/player/stats" element={<PlayerStats />} />
          </Route>
        </Route>

        {/* Fallback Route - ถ้าพิมพ์ URL ผิด ให้เด้งไปหน้าแรก */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;