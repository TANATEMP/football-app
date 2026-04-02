// src/pages/common/ResetPassword.tsx
import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import api from "../../lib/api";

const resetSchema = z.object({
  password: z
    .string()
    .min(12, { message: "รหัสผ่านต้องมีอย่างน้อย 12 ตัวอักษร" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_])[A-Za-z\d@$!%*?&#+\-_]/, {
      message: "ต้องมีตัวพิมพ์ใหญ่, เล็ก, ตัวเลข และสัญลักษณ์พิเศษ",
    }),
  confirmPassword: z.string().min(1, { message: "กรุณายืนยันรหัสผ่าน" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

type ResetFormData = z.infer<typeof resetSchema>;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    if (!token) {
      alert("ไม่พบโทเคนสำหรับการรีเซ็ต");
      return;
    }

    try {
      await api.post("/auth/reset-password", {
        token,
        password: data.password,
      });
      setIsSuccess(true);
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      const error = err as AxiosError<{ message: string | string[] }>;
      alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h2 className="text-xl font-bold mb-2">ลิงก์ไม่ถูกต้อง</h2>
          <p className="text-slate-500 text-sm mb-6">ลิงก์ที่คุณใช้ไม่ถูกต้องหรือหมดอายุแล้ว</p>
          <button onClick={() => navigate("/")} className="text-blue-600 font-bold hover:underline font-black uppercase text-[10px] tracking-widest">
            กลับไปหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-800">ตั้งรหัสผ่านใหม่สำเร็จ!</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">เปลี่ยนรหัสผ่านของคุณเรียบร้อยแล้ว <br/>ระบบกำลังนำคุณกลับไปหน้าเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
        
        <div className="flex items-center gap-2 font-black text-xl tracking-tighter mb-8 border-b border-slate-50 pb-4">
          <span className="text-2xl">⚽</span>
          <span>LEAGUE<span className="text-blue-600">PRO</span></span>
        </div>

        <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">ตั้งรหัสผ่านใหม่</h2>
        <p className="text-slate-500 text-sm mb-8 font-medium italic">กำหนดรหัสผ่านใหม่เพื่อความปลอดภัยในการเข้าใช้งานสูงสุด</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">รหัสผ่านใหม่</label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••••••"
              className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl transition-all focus:ring-2 focus:ring-blue-600/20 outline-none ${errors.password ? "border-red-500" : "border-slate-100 focus:border-blue-600"}`}
            />
            {errors.password && (
              <p className="text-red-500 text-[10px] mt-1.5 ml-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">ยืนยันรหัสผ่านอีกครั้ง</label>
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="••••••••••••"
              className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl transition-all focus:ring-2 focus:ring-blue-600/20 outline-none ${errors.confirmPassword ? "border-red-500" : "border-slate-100 focus:border-blue-600"}`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-[10px] mt-1.5 ml-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:bg-slate-300 disabled:shadow-none hover:-translate-y-0.5"
          >
            {isSubmitting ? "กำลังบันทึก..." : "อัปเดตรหัสผ่านใหม่ ✨"}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="w-full mt-6 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-blue-600 transition-colors"
        >
          ยกเลิกและกลับหน้าหลัก
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
