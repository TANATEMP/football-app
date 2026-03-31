import { useCallback, useEffect, useState } from "react"; // 👈 เพิ่ม useEffect
import type { League } from "../../types";
import LeagueCard from "../../components/LeagueCard";
import CreateLeagueModal from "../../components/CreateLeagueModal";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:3000" });
const LeagueManagement = () => {
  // 1. เปลี่ยนจาก MOCK_LEAGUES เป็นอาเรย์ว่างก่อน
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 2. ฟังก์ชันดึงข้อมูลจาก API (NestJS)

  // 📥 ดึงข้อมูล (GET)
  const fetchLeagues = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/leagues");
      setLeagues(response.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []); // [] ตรงนี้บอกว่าสร้างฟังก์ชันนี้แค่ครั้งเดียวพอ

  // 🔄 ตอนนี้ใส่ fetchLeagues ลงใน dependency ได้อย่างสบายใจ
  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  // 📤 ส่งข้อมูลสร้าง (POST)
  const handleCreateLeague = async (formData: {
    name: string;
    season: string;
    maxTeams: number;
  }) => {
    try {
      await api.post("/leagues", formData); // ไม่ต้อง JSON.stringify เอง
      await fetchLeagues(); // ดึงข้อมูลใหม่
      setIsModalOpen(false);
    } catch (error: unknown) {
      // 👈 เปลี่ยนจาก any เป็น unknown
      if (axios.isAxiosError(error)) {
        // 👈 ใช้ฟังก์ชันเช็คว่าเป็น Error จาก Axios จริงไหม
        const message = error.response?.data?.message || "เกิดข้อผิดพลาด";
        alert(`สร้างไม่สำเร็จ: ${message}`);
      } else {
        alert("เกิดข้อผิดพลาดที่ไม่คาดคิด");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            League Management
          </h1>
          <p className="text-gray-500 mt-1">
            จัดการและควบคุมการแข่งขันทั้งหมดในระบบ (Real-time DB)
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

      {/* แสดง Loading หรือรายการ League */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500">
          กำลังดึงข้อมูลจากฐานข้อมูล...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {leagues.map((league) => (
            <LeagueCard key={league.id} league={league} />
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <CreateLeagueModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateLeague}
        />
      )}
    </div>
  );
};

export default LeagueManagement;
