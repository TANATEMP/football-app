import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import api from "../lib/api";
import type { UserRole } from "../types";
import ConfirmModal from "./ConfirmModal";
import { useGoogleLogin } from "@react-oauth/google";
import zxcvbn from "zxcvbn";

const loginSchema = z.object({
  email: z.string().email({ message: "รูปแบบอีเมลไม่ถูกต้อง" }).toLowerCase(),
  password: z.string().min(1, { message: "กรุณากรอกรหัสผ่าน" }),
});
type LoginFormData = z.infer<typeof loginSchema>;

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
    email: z.string().email({ message: "รูปแบบอีเมลไม่ถูกต้อง" }).toLowerCase(),
    password: z
      .string()
      .min(15, { message: "รหัสผ่านต้องมีอย่างน้อย 15 ตัวอักษร" })
      .refine((val) => zxcvbn(val).score >= 2, {
        message: "รหัสผ่านเดาง่ายเกินไป",
      }),
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
    role: z.enum(["MANAGER", "PLAYER"]),
  })
  .superRefine((data, ctx) => {
    if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "รหัสผ่านไม่ตรงกัน",
        path: ["confirmPassword"],
      });
    }
  });
type RegisterFormData = z.infer<typeof registerSchema>;

const forgotSchema = z.object({
  email: z.string().email({ message: "รูปแบบอีเมลไม่ถูกต้อง" }).toLowerCase(),
});
type ForgotFormData = z.infer<typeof forgotSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView: "LOGIN" | "REGISTER";
  setCurrentRole: (role: UserRole) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialView,
  setCurrentRole,
}) => {
  const navigate = useNavigate();
  const [view, setView] = useState<"LOGIN" | "REGISTER" | "FORGOT_PASSWORD">(
    initialView,
  );
  const [modalConfig, setModalConfig] = useState<any>(null);

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: errorsLogin, isSubmitting: isSubmittingLogin },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    setValue: setSignupValue,
    control: signupControl,
    formState: { errors: errorsSignup, isSubmitting: isSubmittingSignup },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "PLAYER" },
  });
  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: errorsForgot, isSubmitting: isSubmittingForgot },
  } = useForm<ForgotFormData>({ resolver: zodResolver(forgotSchema) });

  const regRole = useWatch({
    control: signupControl,
    name: "role",
    defaultValue: "PLAYER",
  });
  const regPassword = useWatch({
    control: signupControl,
    name: "password",
    defaultValue: "",
  });
  const passwordResult = regPassword ? zxcvbn(regPassword) : null;

  const handleAuthSuccess = async () => {
    const profileResponse = await api.get("/user");

    const user = profileResponse.data.data;
    const normalizedRole = user.role.toUpperCase() as UserRole;
    user.role = normalizedRole;

    localStorage.setItem("user", JSON.stringify(user));
    setCurrentRole(normalizedRole);
    onClose();
    navigate(`/${normalizedRole.toLowerCase()}`);
  };

  const onLogin = async (data: LoginFormData) => {
    try {
      await api.post("/auth/login", data);
      await handleAuthSuccess();
    } catch (err) {
      handleError(err, "Login Failed");
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    try {
      await api.post("/auth/register", {
        ...data,
        role: data.role.toLowerCase(),
      });
      await handleAuthSuccess();
    } catch (err) {
      handleError(err, "Registration Failed");
    }
  };

  const onForgotPassword = async (data: ForgotFormData) => {
    try {
      await api.post("/auth/forgot-password", { email: data.email });
      setModalConfig({
        isOpen: true,
        title: "Check Your Email",
        message: "ลิงก์รีเซ็ตรหัสผ่านถูกส่งไปที่อีเมลของคุณแล้ว",
        type: "SUCCESS",
        onConfirm: () => {
          setModalConfig(null);
          setView("LOGIN");
        },
      });
    } catch (err) {
      handleError(err, "Error");
    }
  };

  const handleError = (err: unknown, title: string) => {
    const error = err as AxiosError<any>;
    let finalMessage =
      error.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
    if (Array.isArray(finalMessage)) finalMessage = finalMessage.join("\n");

    setModalConfig({
      isOpen: true,
      title,
      message: finalMessage,
      type: "DANGER",
      onConfirm: () => setModalConfig(null),
    });
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const payload: any = { accessToken: tokenResponse.access_token };
        if (view === "REGISTER") payload.role = regRole.toLowerCase();

        await api.post("/auth/google", payload);
        await handleAuthSuccess();
      } catch (err) {
        handleError(err, "เข้าสู่ระบบไม่สำเร็จ");
      }
    },
    onError: () => {
      handleError(new Error(), "Google Login Failed");
    },
  });

  const getStrengthColor = (score: number) =>
    [
      "bg-red-500 w-1/4",
      "bg-red-500 w-1/4",
      "bg-yellow-500 w-2/4",
      "bg-blue-500 w-3/4",
      "bg-green-500 w-full",
    ][score] || "bg-slate-200 w-0";
  const getStrengthLabel = (score: number) =>
    ["อ่อนแอ", "อ่อนแอ", "พอใช้", "แข็งแรง", "แข็งแรงมาก"][score] || "";

  if (!isOpen) return null;

  return (
    <>
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
            {view === "LOGIN"
              ? "ยินดีต้อนรับกลับมา"
              : view === "REGISTER"
                ? "สร้างบัญชีใหม่"
                : "ลืมรหัสผ่าน?"}
          </h2>

          {/* FORGOT PASSWORD FORM */}
          {view === "FORGOT_PASSWORD" && (
            <form
              onSubmit={handleSubmitForgot(onForgotPassword)}
              className="space-y-4"
            >
              <p className="text-xs text-slate-500 text-center mb-4 font-medium italic">
                กรอกอีเมลของคุณเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่
              </p>
              <input
                {...registerForgot("email")}
                type="email"
                placeholder="อีเมลที่ใช้สมัคร"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl ${
                  errorsForgot.email ? "border-red-500" : "border-slate-200"
                }`}
              />
              {errorsForgot.email && (
                <p className="text-red-500 text-[10px]">
                  {errorsForgot.email.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmittingForgot}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-400"
              >
                {isSubmittingForgot
                  ? "กำลังส่ง..."
                  : "ส่งลิงก์รีเซ็ตรหัสผ่าน 📩"}
              </button>
              <button
                type="button"
                onClick={() => setView("LOGIN")}
                className="w-full text-center text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-blue-600 transition-colors"
              >
                ← กลับไปหน้าเข้าสู่ระบบ
              </button>
            </form>
          )}

          {/* LOGIN FORM */}
          {view === "LOGIN" && (
            <form onSubmit={handleSubmitLogin(onLogin)} className="space-y-4">
              <input
                {...registerLogin("email")}
                type="email"
                placeholder="อีเมล"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl ${
                  errorsLogin.email ? "border-red-500" : "border-slate-200"
                }`}
              />
              {errorsLogin.email && (
                <p className="text-red-500 text-[10px]">
                  {errorsLogin.email.message}
                </p>
              )}

              <input
                {...registerLogin("password")}
                type="password"
                placeholder="รหัสผ่าน"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl ${
                  errorsLogin.password ? "border-red-500" : "border-slate-200"
                }`}
              />
              {errorsLogin.password && (
                <p className="text-red-500 text-[10px]">
                  {errorsLogin.password.message}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setView("FORGOT_PASSWORD")}
                  className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-600 transition-colors"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmittingLogin}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-400"
              >
                {isSubmittingLogin ? "กำลังประมวลผล..." : "เข้าสู่ระบบ"}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {view === "REGISTER" && (
            <form
              onSubmit={handleSubmitSignup(onRegister)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3 mb-4">
                {(["PLAYER", "MANAGER"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSignupValue("role", r)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      regRole === r
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    <span className="block text-xl">
                      {r === "PLAYER" ? "👟" : "🧢"}
                    </span>
                    <span className="text-xs font-bold">{r}</span>
                  </button>
                ))}
              </div>

              <input
                {...registerSignup("name")}
                placeholder="ชื่อ-นามสกุล"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl ${
                  errorsSignup.name ? "border-red-500" : "border-slate-200"
                }`}
              />
              {errorsSignup.name && (
                <p className="text-red-500 text-[10px]">
                  {errorsSignup.name.message}
                </p>
              )}

              <input
                {...registerSignup("email")}
                type="email"
                placeholder="อีเมล"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl ${
                  errorsSignup.email ? "border-red-500" : "border-slate-200"
                }`}
              />
              {errorsSignup.email && (
                <p className="text-red-500 text-[10px]">
                  {errorsSignup.email.message}
                </p>
              )}

              <div className="relative">
                <input
                  {...registerSignup("password")}
                  type="password"
                  placeholder="รหัสผ่าน"
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl ${
                    errorsSignup.password
                      ? "border-red-500"
                      : "border-slate-200"
                  }`}
                />

                {/* Password Strength Meter */}
                {regPassword && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthColor(
                          passwordResult?.score || 0,
                        )}`}
                      ></div>
                    </div>
                    <div className="flex justify-between items-start mt-1">
                      <span
                        className={`text-[10px] font-bold ${
                          (passwordResult?.score || 0) < 2
                            ? "text-red-500"
                            : (passwordResult?.score || 0) === 2
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        ระดับ: {getStrengthLabel(passwordResult?.score || 0)}
                      </span>
                    </div>
                  </div>
                )}

                {errorsSignup.password && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {errorsSignup.password.message}
                  </p>
                )}
              </div>

              <input
                {...registerSignup("confirmPassword")}
                type="password"
                placeholder="ยืนยันรหัสผ่าน"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl ${
                  errorsSignup.confirmPassword
                    ? "border-red-500"
                    : "border-slate-200"
                }`}
              />
              {errorsSignup.confirmPassword && (
                <p className="text-red-500 text-[10px]">
                  {errorsSignup.confirmPassword.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmittingSignup}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-400 mt-2"
              >
                {isSubmittingSignup ? "กำลังประมวลผล..." : "สร้างบัญชี"}
              </button>
            </form>
          )}

          {/* Social Login & Toggle View */}
          {view !== "FORGOT_PASSWORD" && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest font-black">
                  <span className="bg-white px-4 text-slate-300 italic">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleGoogleLogin()}
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
                  onClick={() =>
                    setView(view === "LOGIN" ? "REGISTER" : "LOGIN")
                  }
                  className="text-blue-600 font-bold hover:underline"
                >
                  {view === "LOGIN" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>

      {modalConfig && (
        <ConfirmModal
          isOpen={modalConfig.isOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          type={modalConfig.type}
          onConfirm={modalConfig.onConfirm}
          onCancel={() => setModalConfig(null)}
          confirmText="OK"
        />
      )}
    </>
  );
};

export default AuthModal;
