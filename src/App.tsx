import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// 1. นำเข้า Types
import type { UserRole } from "./types";

// 2. นำเข้า Layout และ Guard
import MainLayout from "./components/MainLayout.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

// 3. นำเข้า Pages (หน้าต่างๆ)
// -- Common --
import LandingPage from "./pages/common/LandingPage.tsx";

// -- Admin --
import LeagueManagement from "./pages/admin/LeagueManagement.tsx";
import LeagueDetail from "./pages/admin/LeagueDetail";
import UserManagement from "./pages/admin/UserManagement";

// -- Manager --
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import TeamManagement from "./pages/manager/TeamManagement";

// // -- Player --
import PlayerDashboard from "./pages/player/PlayerDashboard";
import PlayerTeamView from "./pages/player/PlayerTeamView";

function App() {
  // เริ่มต้นเป็น null คือยังไม่ได้ล็อกอิน
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  // จำลองชื่อผู้ใช้ (ในของจริงจะดึงจาก Database/API ตอนล็อกอินเสร็จ)
  const [userName, setUserName] = useState<string>("Guest User");

  return (
    <BrowserRouter>
      <Routes>
        {/* ==========================================
            ส่วนที่ 1: หน้าที่ไม่มี Layout (ไม่มีเมนูด้านข้าง)
            ========================================== */}
        {/* Public Route - หน้าแรกของเว็บ (ทุกคนเข้าได้) */}
        <Route path="/" element={<LandingPage setCurrentRole={setCurrentRole}/>} />

        {/* ==========================================
            ส่วนที่ 2: หน้าที่มี Layout (มีเมนู Sidebar & Topbar)
            ========================================== */}
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
            <Route path="/manager/team" element={<TeamManagement />} />
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
            <Route path="/player/team" element={<PlayerTeamView />} />
          </Route>
        </Route>

        {/* Fallback Route - ถ้าพิมพ์ URL ผิด ให้เด้งไปหน้าแรก */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;