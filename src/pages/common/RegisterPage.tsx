// src/pages/common/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { UserRole } from '../../types';
import ConfirmModal from '../../components/ConfirmModal'; // 🔵 ปรับ path ให้ตรงกับตำแหน่งไฟล์ ConfirmModal ของคุณ

interface RegisterPageProps {
  setCurrentRole: (role: UserRole) => void;
}

// จำกัดให้หน้าสมัครเลือกได้แค่ 2 Role นี้
type RegistrableRole = 'MANAGER' | 'PLAYER';

const RegisterPage: React.FC<RegisterPageProps> = ({ setCurrentRole }) => {
  const navigate = useNavigate();
  
  const [role, setRole] = useState<RegistrableRole>('PLAYER');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // 🔵 State สำหรับจัดการ ConfirmModal
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'INFO' as 'INFO' | 'SUCCESS' | 'DANGER',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🔵 เปิด ConfirmModal แจ้งเตือนความสำเร็จ
    setModal({
      isOpen: true,
      title: 'สมัครสมาชิกสำเร็จ!',
      message: `สร้างบัญชีในฐานะ ${role} เรียบร้อยแล้ว\nระบบกำลังพาคุณไปที่หน้า Dashboard`,
      type: 'SUCCESS',
    });
  };

  // 🔵 ฟังก์ชันเมื่อกดปุ่ม "ตกลง/Confirm" ใน Modal
  const handleConfirmSuccess = () => {
    setModal({ ...modal, isOpen: false });
    
    // เซ็ต Role ไปที่ App.tsx เพื่อให้ผ่าน ProtectedRoute
    setCurrentRole(role as UserRole);
    
    // Redirect ตาม Role
    if (role === 'MANAGER') navigate('/manager');
    if (role === 'PLAYER') navigate('/player');
  };

  // 🔵 ฟังก์ชันเมื่อกดปุ่ม "ยกเลิก/Cancel" ใน Modal
  const handleCancelModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-slate-900 relative">
      
      <Link to="/" className="flex items-center gap-2 font-black text-2xl tracking-tighter mb-8 hover:opacity-80 transition-opacity">
        <span className="text-3xl">⚽</span>
        <span>LEAGUE<span className="text-blue-600">PRO</span></span>
      </Link>

      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <h1 className="text-2xl font-bold text-center mb-2">สร้างบัญชีใหม่</h1>
        <p className="text-slate-500 text-center mb-8 text-sm">เลือกบทบาทของคุณและกรอกข้อมูลเพื่อเริ่มต้น</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 🟢 ส่วนเลือก Role (เหลือแค่ 2 อัน) */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">คุณคือใครในโลกฟุตบอล?</label>
            <div className="grid grid-cols-2 gap-4">
              
              <button
                type="button"
                onClick={() => setRole('PLAYER')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  role === 'PLAYER' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300 text-slate-500'
                }`}
              >
                <span className="text-3xl mb-2">👟</span>
                <span className="text-sm font-bold">Player</span>
                <span className="text-xs font-normal mt-1 opacity-70">นักเตะทั่วไป</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('MANAGER')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  role === 'MANAGER' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300 text-slate-500'
                }`}
              >
                <span className="text-3xl mb-2">🧢</span>
                <span className="text-sm font-bold">Manager</span>
                <span className="text-xs font-normal mt-1 opacity-70">ผู้จัดการทีม</span>
              </button>

            </div>
          </div>

          {/* 🟢 ส่วนกรอกข้อมูล */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">ชื่อ-นามสกุล</label>
              <input 
                type="text" required placeholder="เช่น สมชาย สายฟ้า"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">อีเมล</label>
              <input 
                type="email" required placeholder="you@example.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">รหัสผ่าน</label>
              <input 
                type="password" required placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm mt-4">
            สร้างบัญชี
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-8">
          มีบัญชีอยู่แล้วใช่ไหม? <Link to="/login" className="text-blue-600 font-bold hover:underline">เข้าสู่ระบบที่นี่</Link>
        </p>
      </div>

      {/* 🔵 เรียกใช้งาน ConfirmModal */}
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText="เข้าสู่ระบบ"
        onConfirm={handleConfirmSuccess}
        onCancel={handleCancelModal}
      />
    </div>
  );
};

export default RegisterPage;