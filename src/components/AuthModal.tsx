import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios, { AxiosError } from "axios";
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
      .min(8, { message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" }),
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
  const [view, setView] = useState(initialView);
  const API_URL = "http://localhost:3000";

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

  const regRole = useWatch({ control, name: "role", defaultValue: "PLAYER" });

  if (!isOpen) return null;

  const onSubmit = async (data: AuthFormData) => {
    try {
      const endpoint = view === "LOGIN" ? "/auth/login" : "/auth/register";
      // 🚀 แยก Payload: Login ไม่ส่ง name/confirmPassword
      const payload =
        view === "LOGIN"
          ? { email: data.email, password: data.password }
          : data;

      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      const { access_token, user } = response.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      setCurrentRole(user.role); // 👈 สำคัญมาก! เพื่อให้ App เปลี่ยน State หลัก
      onClose();
      navigate(`/${user.role.toLowerCase()}`);
    } catch (err) {
      const error = err as AxiosError<{ message: string | string[] }>;
      const msg = error.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join("\n") : msg || "เกิดข้อผิดพลาด");
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
          {view === "LOGIN" ? "ยินดีต้อนรับกลับมา" : "สร้างบัญชีใหม่"}
        </h2>

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
