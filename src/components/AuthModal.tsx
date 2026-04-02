import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import api, { API_URL } from "../lib/api";
import type { UserRole } from "../types";

// 🛡️ 1. Validation Schema พร้อมตรวจสอบ Password 2 รอบ
// 🛡️ 1. ปรับปรุง Validation Schema
const authSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร" })
      .optional()
      .or(z.literal("")),
    email: z.string().email({ message: "รูปแบบอีเมลไม่ถูกต้อง" }).toLowerCase(),
    password: z
      .string()
      .min(12, { message: "รหัสผ่านต้องมีอย่างน้อย 12 ตัวอักษร" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_])[A-Za-z\d@$!%*?&#+\-_]/, {
        message: "ต้องมีตัวพิมพ์ใหญ่, เล็ก, ตัวเลข และสัญลักษณ์พิเศษ",
      }),
    // เปลี่ยน confirmPassword เป็น optional เพื่อให้ตอน Login ไม่ติดขัด
    confirmPassword: z.string().optional().or(z.literal("")),
    role: z.enum(["MANAGER", "PLAYER"]),
  })
  .superRefine((data, ctx) => {
    // 💡 หัวใจสำคัญ: ตรวจสอบรหัสผ่านเฉพาะเมื่อมีการกรอก confirmPassword (หน้า Register)
    // ถ้า password มีค่า แต่ไม่ตรงกับ confirmPassword ให้แจ้ง Error
    if (
      data.confirmPassword !== undefined &&
      data.confirmPassword !== "" &&
      data.confirmPassword !== data.password
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "รหัสผ่านไม่ตรงกัน",
        path: ["confirmPassword"],
      });
    }
  });

type AuthFormData = z.infer<typeof authSchema>;

const forgotSchema = z.object({
  email: z.string().email({ message: "รูปแบบอีเมลไม่ถูกต้อง" }).toLowerCase(),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

// 1. เพิ่มใน Interface
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView: "LOGIN" | "REGISTER";
  setCurrentRole: (role: UserRole) => void; // 👈 เพิ่มกลับมา
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialView,
  setCurrentRole
}) => {
  const navigate = useNavigate();
  const [view, setView] = useState<"LOGIN" | "REGISTER" | "FORGOT_PASSWORD">(initialView);


  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      role: "PLAYER",
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
  });

  // Separate form for Forgot Password to avoid password validation issues
  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: errorsForgot, isSubmitting: isSubmittingForgot },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const regRole = useWatch({ control, name: "role", defaultValue: "PLAYER" });

  if (!isOpen) return null;

  const onSubmit = async (data: AuthFormData) => {
    try {
      const endpoint = view === "LOGIN" ? "/auth/login" : "/auth/register";
      // 🚀 แยก Payload: Login ไม่ส่ง name/confirmPassword
      const payload =
        view === "LOGIN"
          ? { email: data.email, password: data.password }
          : { 
              name: data.name, 
              email: data.email, 
              password: data.password, 
              role: data.role.toLowerCase() // Backend expects lowercase
            };

      const response = await api.post(`${endpoint}`, payload);
      // Backend returns { success: true, data: { accessToken, refreshToken, ... } }
      const { accessToken } = response.data.data;
      localStorage.setItem("token", accessToken);

      // Backend doesn't return user info in register/login response, so fetch it
      const profileResponse = await api.get("/user", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const user = profileResponse.data.data;
      // Backend roles are lowercase (admin, manager, player) -> Map to uppercase
      const normalizedRole = user.role.toUpperCase() as UserRole;
      user.role = normalizedRole;

      localStorage.setItem("user", JSON.stringify(user));

      setCurrentRole(normalizedRole); // 👈 สำคัญมาก! เพื่อให้ App เปลี่ยน State หลัก
      onClose();
      navigate(`/${normalizedRole.toLowerCase()}`);
    } catch (err) {
      const error = err as AxiosError<{ message: string | string[] }>;
      const msg = error.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join("\n") : msg || "เกิดข้อผิดพลาด");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const onForgotPassword = async (data: ForgotFormData) => {
    try {
      await api.post("/auth/forgot-password", { email: data.email });
      alert("✅ ลิงก์รีเซ็ตรหัสผ่านถูกส่งไปที่อีเมลของคุณแล้ว (หากมีบัญชีในระบบ)");
      setView("LOGIN");
    } catch (err) {
      const error = err as AxiosError<{ message: string | string[] }>;
      alert(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">
          {view === "LOGIN" ? "ยินดีต้อนรับกลับมา" : view === "REGISTER" ? "สร้างบัญชีใหม่" : "ลืมรหัสผ่าน?"}
        </h2>

        {view === "FORGOT_PASSWORD" ? (
          <form onSubmit={handleSubmitForgot(onForgotPassword)} className="space-y-4">
            <p className="text-xs text-slate-500 text-center mb-4 font-medium italic">
              กรอกอีเมลของคุณเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่
            </p>
            <input
              {...registerForgot("email")}
              type="email"
              placeholder="อีเมลที่ใช้สมัคร"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl ${errorsForgot.email ? "border-red-500" : "border-slate-200"}`}
            />
            {errorsForgot.email && (
              <p className="text-red-500 text-[10px]">{errorsForgot.email.message}</p>
            )}
            <button
              type="submit"
              disabled={isSubmittingForgot}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-400"
            >
              {isSubmittingForgot ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน 📩"}
            </button>
            <button
              type="button"
              onClick={() => setView("LOGIN")}
              className="w-full text-center text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-blue-600 transition-colors"
            >
              ← กลับไปหน้าเข้าสู่ระบบ
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {view === "REGISTER" && (
            <>
              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {(["PLAYER", "MANAGER"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setValue("role", r)}
                    className={`p-3 rounded-xl border-2 transition-all ${regRole === r ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"}`}
                  >
                    <span className="block text-xl">
                      {r === "PLAYER" ? "👟" : "🧢"}
                    </span>
                    <span className="text-xs font-bold">{r}</span>
                  </button>
                ))}
              </div>
              {/* Name Input */}
              <input
                {...register("name")}
                placeholder="ชื่อ-นามสกุล"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl ${errors.name ? "border-red-500" : "border-slate-200"}`}
              />
            </>
          )}

          {/* Email */}
          <input
            {...register("email")}
            type="email"
            placeholder="อีเมล"
            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl ${errors.email ? "border-red-500" : "border-slate-200"}`}
          />
          {errors.email && (
            <p className="text-red-500 text-[10px]">{errors.email.message}</p>
          )}

          {/* Password */}
          <input
            {...register("password")}
            type="password"
            placeholder="รหัสผ่าน"
            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl ${errors.password ? "border-red-500" : "border-slate-200"}`}
          />
          {errors.password && (
            <p className="text-red-500 text-[10px]">
              {errors.password.message}
            </p>
          )}

          {view === "LOGIN" && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setView("FORGOT_PASSWORD")}
                className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-600 transition-colors"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>
          )}

          {/* Confirm Password (เฉพาะ Register) */}
          {view === "REGISTER" && (
            <>
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="ยืนยันรหัสผ่าน"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl ${errors.confirmPassword ? "border-red-500" : "border-slate-200"}`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-[10px]">
                  {errors.confirmPassword.message}
                </p>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-400"
          >
            {isSubmitting
              ? "กำลังประมวลผล..."
              : view === "LOGIN"
                ? "เข้าสู่ระบบ"
                : "สร้างบัญชี"}
          </button>
        </form>
      )}

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-black">
            <span className="bg-white px-4 text-slate-300 italic">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3.5 bg-white border border-slate-100 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>

        <p className="text-center text-slate-500 text-sm mt-6">
          {view === "LOGIN" ? "ยังไม่มีบัญชี?" : "มีบัญชีอยู่แล้ว?"}{" "}
          <button
            onClick={() => setView(view === "LOGIN" ? "REGISTER" : "LOGIN")}
            className="text-blue-600 font-bold hover:underline"
          >
            {view === "LOGIN" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
