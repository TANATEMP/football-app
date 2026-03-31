import React, { useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "PLAYER";
  status: "ACTIVE" | "BANNED";
  joinedDate?: string; // ใส่ ? ไว้เผื่อ Backend ไม่ได้ส่งมา
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "http://localhost:3000/users";

  // 🔵 1. ฟังก์ชันดึงข้อมูลจาก API
  const fetchUsers = async () => {
    const token = localStorage.getItem("token"); // 👈 ดึง Token สดใหม่ทุกครั้งที่เรียก API

    if (!token) {
      setError("ไม่พบ Token กรุณาเข้าสู่ระบบใหม่");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get<User[]>(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      setError(null);
    } catch (err) {
      // 🛡️ เช็คก่อนว่า Error นี้มาจาก Axios (API) หรือไม่
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้",
        );
      } else {
        setError("เกิดข้อผิดพลาดที่ไม่รู้จัก");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔵 2. ฟังก์ชันสลับสถานะ
  const toggleStatus = async (id: string, currentStatus: string) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("กรุณาเข้าสู่ระบบใหม่");

    try {
      const newStatus = currentStatus === "ACTIVE" ? "BANNED" : "ACTIVE";

      // อัปเดต UI ทันที (Optimistic UI Update) เพื่อให้เว็บดูลื่นไหล
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u)),
      );

      // ส่งคำขอไปที่ Backend
      await axios.patch(
        `${API_URL}/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (err) {
      // 🛡️ เช็คก่อนว่า Error นี้มาจาก Axios (API) หรือไม่
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้');
      } else {
        setError('เกิดข้อผิดพลาดที่ไม่รู้จัก');
      }
      console.error(err);
    }
  };

  // กรองข้อมูล (Client-side search)
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500">
            จัดการผู้ใช้งานในระบบ (Real-time API)
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาชื่อหรืออีเมล..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
          <p className="font-bold">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">
                            {user.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "MANAGER"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-2 h-2 rounded-full ${user.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"}`}
                        ></div>
                        <span
                          className={`text-sm font-medium ${user.status === "ACTIVE" ? "text-green-700" : "text-red-700"}`}
                        >
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* 🛡️ ป้องกันไม่ให้ Admin แบนตัวเอง */}
                      <button
                        onClick={() => toggleStatus(user.id, user.status)}
                        disabled={user.role === "ADMIN"}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                          user.role === "ADMIN"
                            ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
                            : user.status === "ACTIVE"
                              ? "text-red-600 border-red-100 hover:bg-red-50"
                              : "text-green-600 border-green-100 hover:bg-green-50"
                        }`}
                      >
                        {user.status === "ACTIVE" ? "Ban User" : "Unban"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="py-10 text-center text-slate-400">
              ไม่พบข้อมูลผู้ใช้งานที่ค้นหา
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
