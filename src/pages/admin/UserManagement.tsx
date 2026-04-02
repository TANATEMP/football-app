import React, { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "PLAYER" | "VIEWER";
  status: "ACTIVE" | "BANNED";
  joinedDate?: string;
}

interface ModalConfig {
  isOpen: boolean;
  type: "confirm" | "error";
  title: string;
  message: string;
  onConfirm?: () => void;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
  });

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/user/list");
      const payload = response.data.data;
      setUsers(Array.isArray(payload) ? payload : []);
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("ไม่พบ Token กรุณาเข้าสู่ระบบใหม่");
        } else {
          setError(
            err.response?.data?.message || "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้"
          );
        }
      } else {
        setError("เกิดข้อผิดพลาดที่ไม่รู้จัก");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "BANNED" : "ACTIVE";

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: newStatus as "ACTIVE" | "BANNED" } : u
        )
      );

      await api.patch(`/user/${id}/status`, { status: newStatus });
    } catch (err) {
      fetchUsers();
      if (axios.isAxiosError(err)) {
        setModal({
          isOpen: true,
          type: "error",
          title: "เกิดข้อผิดพลาด",
          message: err.response?.data?.message || "ไม่สามารถอัปเดตสถานะได้",
        });
      }
      console.error(err);
    }
  };

  const handleToggleClick = (user: User) => {
    const isBanning = user.status === "ACTIVE";
    setModal({
      isOpen: true,
      type: "confirm",
      title: isBanning ? "ยืนยันการระงับผู้ใช้" : "ยืนยันการปลดระงับผู้ใช้",
      message: `คุณแน่ใจหรือไม่ว่าต้องการ${
        isBanning ? "ระงับ" : "ปลดระงับ"
      }ผู้ใช้ "${user.name}"?`,
      onConfirm: () => {
        closeModal();
        toggleStatus(user.id, user.status);
      },
    });
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500">จัดการผู้ใช้งานในระบบ</p>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาชื่อหรืออีเมล..."
            className="pl-4 pr-4 py-2 border border-gray-200 rounded-lg w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                          className={`w-2 h-2 rounded-full ${
                            user.status === "ACTIVE"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <span
                          className={`text-sm font-medium ${
                            user.status === "ACTIVE"
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleClick(user)}
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

      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className={`text-lg font-bold mb-2 ${modal.type === "error" ? "text-red-600" : "text-slate-800"}`}>
              {modal.title}
            </h3>
            <p className="text-slate-600 text-sm mb-6">
              {modal.message}
            </p>
            <div className="flex justify-end gap-3">
              {modal.type === "confirm" && (
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
              )}
              <button
                onClick={modal.type === "confirm" ? modal.onConfirm : closeModal}
                className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors ${
                  modal.type === "error" 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {modal.type === "error" ? "ตกลง" : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;