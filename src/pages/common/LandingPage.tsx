import { useState, type FC } from "react";
import type { UserRole } from "../../types";
import AuthModal from "../../components/AuthModal";

interface LandingPageProps {
  setCurrentRole: (role: UserRole | null) => void;
  setUserName: (name: string) => void;
}

const LandingPage: FC<LandingPageProps> = ({ setCurrentRole, setUserName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"LOGIN" | "REGISTER">("LOGIN");

  const openModal = (view: "LOGIN" | "REGISTER") => {
    setModalView(view);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col relative">
      <nav className="flex justify-between items-center px-6 py-5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">
          <span className="text-3xl">⚽</span>
          <span>
            LEAGUE<span className="text-blue-600">PRO</span>
          </span>
        </div>

        <div className="flex items-center gap-4 font-semibold">
          <button
            onClick={() => openModal("LOGIN")}
            className="text-slate-500 hover:text-blue-600 transition-colors px-4 py-2"
          >
            Log In
          </button>
          <button
            onClick={() => openModal("REGISTER")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Sign Up
          </button>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center px-4 text-center pb-32 max-w-3xl mx-auto">
        <div className="inline-block bg-blue-100 text-blue-700 font-bold px-4 py-1.5 rounded-full text-sm mb-6">
          แพลตฟอร์มสำหรับคอฟุตบอลตัวจริง
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight text-slate-900">
          จัดการลีกฟุตบอล <br />
          <span className="text-blue-600">ง่าย จบ ในที่เดียว</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl mb-10 font-medium leading-relaxed">
          เชื่อมต่อทุกบทบาทเข้าด้วยกัน ไม่ว่าคุณจะเป็น{" "}
          <b className="text-slate-700">ผู้จัด (Admin)</b>,{" "}
          <b className="text-slate-700">ผู้จัดการทีม (Manager)</b> หรือ{" "}
          <b className="text-slate-700">นักเตะ (Player)</b>
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => openModal("REGISTER")}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-md"
          >
            เริ่มต้นใช้งานฟรี
          </button>
          <button
            onClick={() => openModal("LOGIN")}
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </main>

      <AuthModal
        key={isModalOpen ? `auth-${modalView}` : "closed"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialView={modalView}
        setCurrentRole={setCurrentRole}
        setUserName={setUserName}
      />
    </div>
  );
};

export default LandingPage;
