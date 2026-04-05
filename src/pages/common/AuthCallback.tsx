import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../lib/api";
import type { UserRole } from "../../types";

interface AuthCallbackProps {
  setCurrentRole: (role: UserRole | null) => void;
  setUserName: (name: string) => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ setCurrentRole, setUserName }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: "",
  });

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");

      if (!token) {
        console.error("No token found in OAuth callback");
        navigate("/");
        return;
      }

      try {
        localStorage.setItem("token", token);

        const profileResponse = await api.get("/user", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const rawUser = profileResponse.data.data;
        const normalizedRole = rawUser.role.toUpperCase() as UserRole;
        
        // Sanitize: Only store non-sensitive public info
        const userToSave = {
          id: rawUser.id,
          name: rawUser.name,
          email: rawUser.email,
          role: normalizedRole,
        };

        localStorage.setItem("user", JSON.stringify(userToSave));

        setCurrentRole(normalizedRole);
        setUserName(userToSave.name);

        navigate(`/${normalizedRole.toLowerCase()}`);
      } catch (err) {
        console.error("OAuth Profile Sync Error:", err);
        setErrorModal({
          isOpen: true,
          message: "การเข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง"
        });
      }
    };

    handleCallback();
  }, [searchParams, navigate, setCurrentRole]);

  const handleCloseModal = () => {
    setErrorModal({ isOpen: false, message: "" });
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-400 font-black italic uppercase text-xs tracking-widest animate-pulse">
          Authenticating with Google...
        </p>
      </div>

      {errorModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-2 text-red-600 text-left">
              เกิดข้อผิดพลาด
            </h3>
            <p className="text-slate-600 text-sm mb-6 text-left">
              {errorModal.message}
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;