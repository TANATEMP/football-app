import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import zxcvbn from "zxcvbn";
import api from "../../lib/api";
import { TwoFactorSetup } from "../../components/TwoFactorSetup";
import axios, { AxiosError } from "axios";

const passwordSchema = z.object({
  oldPassword: z.string().min(1, { message: "กรุณากรอกรหัสผ่านเดิม" }),
  newPassword: z.string().min(15, { message: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 15 ตัวอักษร" }),
  confirmNewPassword: z.string().min(1, { message: "กรุณายืนยันรหัสผ่านใหม่" }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "รหัสผ่านใหม่ไม่ตรงกัน",
  path: ["confirmNewPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const regNewPassword = watch("newPassword");
  const passwordResult = regNewPassword ? zxcvbn(regNewPassword) : null;

  const fetchProfile = async () => {
    try {
      const response = await api.get("/user");
      setUser(response.data.data);
      setEditName(response.data.data.name);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onChangePassword = async (data: PasswordFormData) => {
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const payload = {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      };
      await api.patch("/user/password", payload);
      setSuccessMsg("รหัสผ่านถูกเปลี่ยนเรียบร้อยแล้ว");
      reset();
    } catch (err) {
      const error = err as AxiosError<any>;
      let finalMessage = error.response?.data?.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน";
      if (Array.isArray(finalMessage)) finalMessage = finalMessage.join("\n");
      setErrorMsg(finalMessage);
    }
  };

  const onUpdateProfile = async () => {
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await api.patch("/user", { name: editName });
      setUser((prev: any) => ({ ...prev, name: editName }));
      setIsEditing(false);
      setSuccessMsg("อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว");
      
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...savedUser, name: editName }));
    } catch (err) {
      setErrorMsg("ไม่สามารถอัปเดตโปรไฟล์ได้");
    }
  };

  const getStrengthColor = (score: number) =>
    ["bg-red-500 w-1/4", "bg-red-500 w-1/4", "bg-yellow-500 w-2/4", "bg-blue-500 w-3/4", "bg-green-500 w-full"][score] || "bg-slate-200 w-0";
  const getStrengthLabel = (score: number) =>
    ["อ่อนแอ", "อ่อนแอ", "พอใช้", "แข็งแรง", "แข็งแรงมาก"][score] || "";

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-slate-500">จัดการหน้าโปรไฟล์และการตั้งค่าความปลอดภัย</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 self-start">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              {!isEditing ? (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800 line-clamp-1">{user?.name}</h2>
                    <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-700 p-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-1">{user?.email}</p>
                </>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm font-bold"
                  />
                  <div className="flex gap-2">
                    <button onClick={onUpdateProfile} className="px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700">บันทึก</button>
                    <button onClick={() => { setIsEditing(false); setEditName(user?.name); }} className="px-3 py-1 text-xs font-bold bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300">ยกเลิก</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">บทบาทปัจจุบัน</p>
              <span className="inline-block px-3 py-1.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Change Password</h3>
          
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm font-medium">
              ✅ {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium">
              ❌ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
            <div>
              <input
                {...register("oldPassword")}
                type="password"
                placeholder="รหัสผ่านเดิม"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl ${errors.oldPassword ? "border-red-500" : "border-slate-200"}`}
              />
              {errors.oldPassword && <p className="text-red-500 text-[10px] mt-1">{errors.oldPassword.message}</p>}
            </div>

            <div>
              <input
                {...register("newPassword")}
                type="password"
                placeholder="รหัสผ่านใหม่ (อย่างน้อย 15 ตัวอักษร)"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl ${errors.newPassword ? "border-red-500" : "border-slate-200"}`}
              />
              {regNewPassword && regNewPassword.length > 0 && passwordResult && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div className={`h-full transition-all duration-300 ${getStrengthColor(passwordResult.score)}`} />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-500 text-[10px]">ความยาก: {getStrengthLabel(passwordResult.score)}</span>
                  </div>
                </div>
              )}
              {errors.newPassword && <p className="text-red-500 text-[10px] mt-1">{errors.newPassword.message}</p>}
            </div>

            <div>
              <input
                {...register("confirmNewPassword")}
                type="password"
                placeholder="ยืนยันรหัสผ่านใหม่"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl ${errors.confirmNewPassword ? "border-red-500" : "border-slate-200"}`}
              />
              {errors.confirmNewPassword && <p className="text-red-500 text-[10px] mt-1">{errors.confirmNewPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 disabled:bg-slate-400 transition-colors"
            >
              {isSubmitting ? "กำลังเปลี่ยนรหัสผ่าน..." : "อัปเดตรหัสผ่าน"}
            </button>
          </form>
        </div>
      </div>

      <div className="w-full">
        <TwoFactorSetup initialEnabled={user?.isTwoFactorEnabled} />
      </div>
    </div>
  );
};

export default ProfilePage;
