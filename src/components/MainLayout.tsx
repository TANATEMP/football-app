// src/components/MainLayout.tsx
import { Link, Outlet, useLocation } from "react-router-dom";
import type { UserRole } from "../types";

interface MainLayoutProps {
  currentRole: UserRole | null;
  userName?: string;
}

const MainLayout = ({ currentRole, userName = "Guest" }: MainLayoutProps) => {
  const location = useLocation();

  // 🟢 1. ฟังก์ชันจัดกลุ่มเมนูตาม Role (เอา Home ออกแล้ว)
  const getMenuItems = () => {
    if (currentRole === "ADMIN") {
      return [
        { path: "/admin", label: "🏆 League Management" }, // 👈 เปลี่ยนชื่อจาก Dashboard
        { path: "/admin/users", label: "👥 User Management" }, // 👈 เพิ่มหน้าจัดการผู้ใช้
      ];
    }
    if (currentRole === "MANAGER") {
      return [
        { path: "/manager", label: "📋 Manager Dashboard" },
        { path: "/manager/matches", label: "⚽ Fixtures & Results" },
        { path: "/manager/stats", label: "📊 Squad Stats" },
        { path: "/manager/team", label: "⚙️ Squad Management" },
      ];
    }
    if (currentRole === "PLAYER") {
      return [
        { path: "/player", label: "🏠 My Dashboard" },
        { path: "/player/matches", label: "⚽ Fixtures & Results" },
        { path: "/player/standings", label: "🏆 League Table" },
        { path: "/player/team", label: "🛡️ My Team" },
        { path: "/player/stats", label: "📊 My Stats" },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* 🟢 Sidebar (เมนูด้านซ้าย) - อัปเดตเงาแล้ว! */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col relative z-20 hidden md:flex shadow-[4px_0_24px_rgba(0,0,0,0.20)]">
        {/* 🟢 2. Logo (ปรับให้กดแล้ววิ่งกลับไปหน้า Dashboard ของ Role นั้นๆ) */}
        <div className="h-16 flex items-center justify-center border-b border-blue-800">
          <Link
            to={currentRole ? `/${currentRole.toLowerCase()}` : "/"}
            className="text-xl font-bold italic tracking-wider hover:text-gray-300 transition-colors"
          >
            ⚽ FOOTBALL PRO
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((menu) => {
            // 🟢 ลอจิกใหม่: แยกการเช็ค Active ให้ขาดจากกัน
            const isActive =
              // กรณีหน้า Dashboard หลักของแต่ละ Role (เช็คแบบเป๊ะๆ)
              menu.path === "/admin" ||
              menu.path === "/manager" ||
              menu.path === "/player"
                ? location.pathname === menu.path
                : // กรณีหน้าอื่นๆ (เช่น /admin/users) ให้เช็คว่าขึ้นต้นด้วย path นั้นจริงๆ และไม่ไปกวนหน้าหลัก
                  location.pathname.startsWith(menu.path);

            return (
              <Link
                key={menu.path}
                to={menu.path}
                className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-700 font-semibold border-l-4 border-green-400 text-white shadow-inner"
                    : "hover:bg-blue-800 text-gray-300 hover:text-white"
                }`}
              >
                {menu.label}
              </Link>
            );
          })}
        </nav>

        {/* ปุ่ม Logout ด้านล่างสุด (แสดงเฉพาะตอนล็อกอินแล้ว) */}
        {currentRole && (
          <div className="p-4 border-t border-blue-800">
            <button
              onClick={() => {
                // รีเฟรชหน้าต่างเพื่อจำลองการ Logout (เคลียร์ State)
                window.location.href = "/";
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* 🟢 Main Content Area (พื้นที่ตรงกลางและด้านขวา) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar (แถบด้านบน) */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10 relative">
          <div className="text-xl font-bold text-gray-800 md:hidden">
            ⚽ PRO
          </div>

          <div className="hidden md:block text-gray-500 font-medium">
            League Management System
          </div>

          <div className="flex items-center gap-4">
            {/* ป้ายบอก Role */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                currentRole === "ADMIN"
                  ? "bg-purple-100 text-purple-700"
                  : currentRole === "MANAGER"
                    ? "bg-green-100 text-green-700"
                    : currentRole === "PLAYER"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-200 text-gray-700"
              }`}
            >
              Role: {currentRole || "GUEST"}
            </span>

            {/* อวตาร User */}
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold border-2 border-blue-500">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content ของแต่ละหน้าจะมาโผล่ตรงนี้ผ่าน <Outlet /> */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
