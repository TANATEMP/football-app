// src/pages/manager/ManagerDashboard.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StandingsTab from '../../components/StandingsTab';

// --- Types ---
interface MyTeam {
  id: string;
  name: string;
  shortName: string;
  established: string;
}

const ManagerDashboard = () => {
  // จำลอง State ว่า Manager คนนี้มีทีมหรือยัง (เริ่มต้นให้เป็น null คือยังไม่มี)
  const [myTeam, setMyTeam] = useState<MyTeam | null>(null);
  
  // State สำหรับฟอร์มสร้างทีม
  const [formData, setFormData] = useState({ name: '', shortName: '' });

  // ฟังก์ชันตอนกดปุ่มสร้างทีม
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    // สมมติว่าบันทึกลง Database แล้ว ก็เซ็ต State ให้มีทีม
    setMyTeam({
      id: 'TM-' + Date.now(),
      name: formData.name,
      shortName: formData.shortName.toUpperCase(),
      established: new Date().getFullYear().toString(),
    });
  };

  // ==========================================
  // 🔴 1. หน้าตาตอน "ยังไม่มีทีม" (Empty State)
  // ==========================================
  if (!myTeam) {
    return (
      <div className="max-w-3xl mx-auto pt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-center p-10">
          <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, Manager!</h1>
          <p className="text-gray-500 mb-8">ดูเหมือนว่าคุณจะยังไม่ได้สร้างสโมสรเป็นของตัวเองเลยนะ <br/> มาเริ่มสร้างตำนานของคุณกันเถอะ!</p>

          <form onSubmit={handleCreateTeam} className="max-w-md mx-auto text-left space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Club Name <span className="text-red-500">*</span></label>
              <input 
                type="text" required placeholder="e.g. Red Devils FC"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Short Name (3 Letters) <span className="text-red-500">*</span></label>
              <input 
                type="text" required maxLength={3} placeholder="e.g. RDF"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                value={formData.shortName}
                onChange={(e) => setFormData({...formData, shortName: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-md transition-colors">
              Create My Club
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🟢 2. หน้าตาตอน "มีทีมแล้ว" (Dashboard ปกติ)
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Profile ทีม */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl font-black text-blue-900 shadow-inner">
            {myTeam.shortName}
          </div>
          <div>
            <span className="bg-blue-500/30 text-blue-100 text-xs font-bold px-3 py-1 rounded-full border border-blue-400/30 mb-2 inline-block">
              Est. {myTeam.established}
            </span>
            <h1 className="text-4xl font-black tracking-tight">{myTeam.name}</h1>
            <p className="text-blue-200 mt-1 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Manager: You
            </p>
          </div>
        </div>

        {/* ปุ่มลัดไปจัดการนักเตะ */}
        <Link 
          to="/manager/team" 
          className="bg-white text-blue-900 hover:bg-gray-50 px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          Manage Players
        </Link>
      </div>

      {/* Grid แบ่ง 2 ฝั่ง */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ฝั่งซ้าย: กล่อง Next Match */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Next Match
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-3">Premier Cup 2024 - Matchday 6</p>
              <div className="flex justify-between items-center px-4">
                <span className="font-bold text-gray-900">{myTeam.shortName}</span>
                <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded font-bold text-sm">VS</span>
                <span className="font-bold text-gray-900">LGN</span>
              </div>
              <p className="text-xs text-gray-400 mt-4">Sat, 26 Oct 2024 • 19:30</p>
            </div>
            <button className="w-full mt-4 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 rounded-lg transition-colors text-sm">
              View All Fixtures
            </button>
          </div>
        </div>

        {/* ฝั่งขวา: ตารางคะแนน (ดึง Component กลางมาใช้!) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           {/* เรียกใช้ Component StandingsTab ที่เราทำไว้ */}
           <StandingsTab />
        </div>

      </div>

    </div>
  );
};

export default ManagerDashboard;