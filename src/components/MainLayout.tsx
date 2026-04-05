import { Link, Outlet, useLocation } from "react-router-dom";
import type { UserRole } from "../types";

interface MainLayoutProps {
  currentRole: UserRole | null;
  userName?: string;
  onLogout?: () => void;
}

const MainLayout = ({ currentRole, userName = "Guest", onLogout }: MainLayoutProps) => {
  const location = useLocation();

  const getMenuItems = () => {
    if (currentRole === "ADMIN") {
      return [
        { path: "/admin", label: "🏆 League Management" },
        { path: "/admin/users", label: "👥 User Management" },
      ];
    }
    if (currentRole === "MANAGER") {
      return [
        { path: "/manager", label: "📋 Manager Dashboard" },
        { path: "/manager/matches", label: "⚽ Fixtures & Results" },
        { path: "/manager/standings", label: "🏆 League Table" },
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
      {/*Sidebar*/}
      <aside className="w-64 bg-blue-900 text-white flex flex-col relative z-20 hidden md:flex shadow-[4px_0_24px_rgba(0,0,0,0.20)]">
        {/*Logo*/}
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
            const isActive =
              menu.path === "/admin" ||
              menu.path === "/manager" ||
              menu.path === "/player"
                ? location.pathname === menu.path
                : location.pathname.startsWith(menu.path);

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

        {currentRole && (
          <div className="p-4 border-t border-blue-800">
            <button
              onClick={onLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10 relative">
          <div className="text-xl font-bold text-gray-800 md:hidden">
            ⚽ PRO
          </div>

          <div className="hidden md:block text-gray-500 font-medium">
            League Management System
          </div>

          <div className="flex items-center gap-4">
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

            <Link to="/profile" className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold border-2 border-blue-500 hover:opacity-80 transition cursor-pointer" title="Go to Profile">
              {userName.charAt(0).toUpperCase()}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
