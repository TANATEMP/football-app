// src/pages/admin/CreateLeague.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateLeague: React.FC = () => {
  const navigate = useNavigate();
  
  // State สำหรับเก็บข้อมูล Form
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    maxTeams: '16',
    format: 'LEAGUE', // LEAGUE, KNOCKOUT, GROUP_STAGE
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ตรงนี้ไว้เชื่อมต่อ API เพื่อ Save ข้อมูล
    console.log('Creating League:', formData);
    alert('สร้างลีกสำเร็จ! กำลังพาคุณไปที่หน้าจัดการลีก');
    navigate('/admin'); // สร้างเสร็จกลับไปหน้าหลัก
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
        >
          &larr;
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">สร้างทัวร์นาเมนต์ใหม่</h1>
          <p className="text-slate-500 text-sm">กรอกรายละเอียดเพื่อเริ่มต้นฤดูกาลใหม่ของคุณ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: ข้อมูลพื้นฐาน */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-5">
          <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2 border-b border-gray-50 pb-4">
            <span>🏆</span> ข้อมูลเบื้องต้น
          </h3>
          
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อลีก / ทัวร์นาเมนต์</label>
              <input 
                type="text" 
                required
                placeholder="เช่น Premier Cup 2026, บอลกระชับมิตร อบต."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">วันที่เริ่ม</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">วันที่สิ้นสุด (โดยประมาณ)</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: การตั้งค่ากติกา */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-5">
          <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2 border-b border-gray-50 pb-4">
            <span>⚙️</span> รูปแบบการแข่งขัน
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">รูปแบบ</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.format}
                onChange={(e) => setFormData({...formData, format: e.target.value})}
              >
                <option value="LEAGUE">League (พบกันหมด)</option>
                <option value="KNOCKOUT">Knockout (แพ้คัดออก)</option>
                <option value="GROUP_STAGE">Group Stage + Knockout</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">จำนวนทีมสูงสุด</label>
              <input 
                type="number" 
                placeholder="16"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.maxTeams}
                onChange={(e) => setFormData({...formData, maxTeams: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">รายละเอียดเพิ่มเติม / หมายเหตุ</label>
            <textarea 
              rows={3}
              placeholder="กฎกติกาเพิ่มเติม หรือสถานที่จัดการแข่งขัน..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pb-12">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
          >
            ยกเลิก
          </button>
          <button 
            type="submit"
            className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            ยืนยันสร้างลีก ⚽
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLeague;