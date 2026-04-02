// src/pages/common/AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../lib/api";
import type { UserRole } from "../../types";

interface AuthCallbackProps {
  setCurrentRole: (role: UserRole) => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ setCurrentRole }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");

      if (!token) {
        console.error("No token found in OAuth callback");
        navigate("/");
        return;
      }

      try {
        // 1. Store token
        localStorage.setItem("token", token);

        // 2. Fetch user profile to get role and info
        const profileResponse = await api.get("/user", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const user = profileResponse.data.data;
        const normalizedRole = user.role.toUpperCase() as UserRole;
        user.role = normalizedRole;

        // 3. Store user info
        localStorage.setItem("user", JSON.stringify(user));

        // 4. Update global state
        setCurrentRole(normalizedRole);

        // 5. Redirect based on role
        navigate(`/${normalizedRole.toLowerCase()}`);
      } catch (err) {
        console.error("OAuth Profile Sync Error:", err);
        alert("การเข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง");
        navigate("/");
      }
    };

    handleCallback();
  }, [searchParams, navigate, setCurrentRole]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-400 font-black italic uppercase text-xs tracking-widest animate-pulse">
          Authenticating with Google...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
