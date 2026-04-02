// src/components/CreateLeagueModal.tsx
import React, { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal'; // 👈 นำเข้า ConfirmModal (แก้ไข Path ให้ตรงกับโปรเจกต์ของคุณ)

interface CreateLeagueModalProps {
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

const CreateLeagueModal: React.FC<CreateLeagueModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    // identity
    name: '',
    logo: null as File | null,
    description: '',
    // rules
    matchFormat: 'SINGLE', // SINGLE, DOUBLE
    // registration
    maxTeams: 10,
    minPlayers: 11,
    maxPlayers: 25,
    regDaysBeforeStart: 7,
    // schedule defaults
    daysOfWeek: [6, 0], // Saturday (6), Sunday (0)
    startTime: '18:00',
    endTime: '22:00',
    matchDuration: 120,
    defaultVenue: '',
    startDate: '',
    endDate: '',
  });

  // 🔔 1. เพิ่ม State สำหรับคุม Error Modal
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'DANGER' | 'SUCCESS' | 'INFO';
    onConfirm: () => void;
  } | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const calculateRegDate = (start: string, offset: number) => {
    if (!start) return null;
    const d = new Date(start);
    d.setDate(d.getDate() - (offset || 0));
    return d.toISOString().split('T')[0];
  };

  const regEndDate = calculateRegDate(formData.startDate, formData.regDaysBeforeStart);

  const [suggestedEndDate, setSuggestedEndDate] = useState<string | null>(null);

  // --- Auto-Suggest End Date Logic ---
  useEffect(() => {
    if (!formData.startDate || !formData.maxTeams || !formData.daysOfWeek.length) {
      setSuggestedEndDate(null);
      return;
    }

    const n = formData.maxTeams;
    let rounds = n % 2 === 0 ? n - 1 : n;
    if (formData.matchFormat === 'DOUBLE') rounds *= 2;
    
    // Simple estimation: 1 round per week as base
    const start = new Date(formData.startDate);
    const suggested = new Date(start);
    suggested.setDate(start.getDate() + (rounds * 7));
    
    setSuggestedEndDate(suggested.toISOString().split('T')[0]);
  }, [formData.startDate, formData.maxTeams, formData.matchFormat, formData.daysOfWeek]);

  const toggleDay = (day: number) => {
    const current = [...formData.daysOfWeek];
    if (current.includes(day)) {
      setFormData({ ...formData, daysOfWeek: current.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, daysOfWeek: [...current, day].sort() });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const showError = (message: string) => {
      setModalConfig({
        isOpen: true,
        title: "Validation Error",
        message,
        type: 'DANGER',
        onConfirm: () => setModalConfig(null)
      });
    };

    if (!formData.name) return showError('กรุณาระบุชื่อลีก (Tournament Name)');
    if (!formData.daysOfWeek.length) return showError('กรุณาเลือกวันแข่งอย่างน้อย 1 วัน (Standard Match Days)');
    if (formData.startDate < today) return showError('วันที่เริ่มแข่ง (Tournament Start) ต้องไม่เป็นวันในอดีต');
    if (formData.endDate && formData.endDate <= formData.startDate) return showError('วันที่สิ้นสุดการแข่งต้องอยู่หลังจากวันที่เริ่มแข่ง');
    
    if (regEndDate && regEndDate < today) {
      return showError(`วันปิดรับสมัคร (${regEndDate}) ตกอยู่ในอดีต\nกรุณาลดจำนวนวันเตรียมตัว หรือเลื่อนวันเริ่มแข่งไปข้างหน้า`);
    }

    onSubmit({
      ...formData,
      registrationEnd: regEndDate ? `${regEndDate}T23:59:59Z` : undefined
    });
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold uppercase italic";
  const labelClass = "block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest";
  const sectionTitleClass = "text-xs font-black text-blue-700 uppercase tracking-[0.2em] border-l-4 border-blue-600 pl-4 mb-6 flex items-center gap-2 italic";

  const days = [
    { label: 'จ', val: 1 }, { label: 'อ', val: 2 }, { label: 'พ', val: 3 }, 
    { label: 'พฤ', val: 4 }, { label: 'ศ', val: 5 }, { label: 'ส', val: 6 }, { label: 'อา', val: 0 }
  ];

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in text-slate-800">
        <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-zoom-in border border-slate-100">
          
          {/* Header */}
          <div className="bg-blue-950 p-8 text-white shrink-0 flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-800/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none flex items-center gap-3">
                <span className="text-blue-400">#</span> NEW LEAGUE SETUP
              </h2>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Initialize your professional tournament rhythm</p>
            </div>
            <button type="button" onClick={onClose} className="text-white/40 hover:text-white transition-all text-2xl relative z-10">&times;</button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="overflow-y-auto p-10 lg:p-12 flex-1 space-y-14 scrollbar-hide">
            
            {/* Identity */}
            <div className="animate-slide-up">
              <h3 className={sectionTitleClass}>1. Identity & Format</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className={labelClass}>Tournament Name</label>
                  <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black italic uppercase tracking-wider text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all" placeholder="e.g. Bangkok Premier Cup..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:col-span-2">
                  <div>
                    <label className={labelClass}>Tournament Format</label>
                    <div className="grid grid-cols-2 gap-4">
                      {['SINGLE', 'DOUBLE'].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFormData({...formData, matchFormat: f})}
                          className={`px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                            formData.matchFormat === f
                            ? 'bg-blue-100 border-blue-600 text-blue-900 shadow-lg shadow-blue-50'
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                          }`}
                        >
                          {f === 'SINGLE' ? 'Single Round' : 'Double Round'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Max Teams</label>
                    <input 
                      type="number" 
                      min="2"
                      step="2"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black italic uppercase tracking-wider text-blue-600 focus:ring-2 focus:ring-blue-500 transition-all text-center"
                      value={formData.maxTeams} 
                      onChange={e => setFormData({...formData, maxTeams: +e.target.value})} 
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Tournament Description</label>
                  <textarea 
                    rows={2} 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 transition-all" 
                    placeholder="อธิบายรายละเอียดลีก กฎกติกา หรือรางวัล..." 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            {/* Schedule Configuration */}
            <div className="animate-slide-up">
              <h3 className={sectionTitleClass}>2. Routine & Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="md:col-span-2">
                  <label className={labelClass}>Standard Match Days</label>
                  <div className="flex flex-wrap gap-3">
                    {days.map(d => (
                      <button
                        key={d.val}
                        type="button"
                        onClick={() => toggleDay(d.val)}
                        className={`w-14 h-14 rounded-[1.25rem] font-black text-sm transition-all border-2 ${
                          formData.daysOfWeek.includes(d.val)
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 -translate-y-1'
                          : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Start Time</label>
                    <input type="time" className={inputClass} value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelClass}>End Time</label>
                    <input type="time" className={inputClass} value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Duration (mins)</label>
                  <input type="number" className={inputClass} value={formData.matchDuration} onChange={e => setFormData({...formData, matchDuration: +e.target.value})} step="15" />
                </div>
              </div>
            </div>

            {/* Limits & Registration */}
            <div className="animate-slide-up">
              <h3 className={sectionTitleClass}>3. Timeline & Logic</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                  <div>
                    <label className={labelClass}>Tournament Start</label>
                    <input type="date" min={today} className={inputClass} value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={labelClass}>Tournament End</label>
                      {suggestedEndDate && (
                        <button 
                          type="button" 
                          onClick={() => setFormData({...formData, endDate: suggestedEndDate})}
                          className="text-[9px] font-black text-blue-600 hover:underline transition-all"
                        >
                          Auto: {suggestedEndDate}
                        </button>
                      )}
                    </div>
                    <input type="date" min={formData.startDate || today} className={inputClass} value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                  </div>
                </div>

                <div className="md:col-span-2 p-8 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <label className="text-[10px] font-black text-blue-800 uppercase tracking-widest block">Apply Closes Before Start</label>
                         <p className="text-[9px] font-bold text-blue-400 uppercase mt-1">Lead time for administration</p>
                      </div>
                      <div className="flex items-center gap-3">
                          <input 
                            type="number" 
                            min="0"
                            className="w-20 px-4 py-3 bg-white border border-blue-200 rounded-2xl font-black text-center text-blue-600 outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.regDaysBeforeStart}
                            onChange={(e) => setFormData({...formData, regDaysBeforeStart: +e.target.value})}
                          />
                          <span className="text-[10px] font-black text-blue-400 uppercase">Days</span>
                      </div>
                   </div>
                   <div className="flex items-center justify-between pt-6 border-t border-blue-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Calculated Deadline:</span>
                      <span className={`font-black italic uppercase text-lg ${regEndDate && regEndDate < today ? 'text-red-500 animate-pulse' : 'text-blue-900'}`}>
                        {regEndDate ? new Date(regEndDate).toLocaleDateString() : 'Pick a start date first'}
                      </span>
                   </div>
                   {regEndDate && regEndDate < today && (
                     <div className="text-[9px] font-black text-red-100 bg-red-600 px-3 py-1 rounded-full inline-block uppercase tracking-widest mt-2">
                       ⚠️ Deadline is in the past!
                     </div>
                   )}
                </div>
              </div>
            </div>
            
          </form>

          {/* Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button type="button" onClick={onClose} className="px-6 py-2.5 font-bold text-slate-400 hover:text-slate-600 transition-colors text-sm uppercase">CANCEL</button>
            <button 
              type="button" // 👈 เปลี่ยนเป็น type="button" เพื่อให้ปุ่มเรียก handleSubmit เอง ไม่ใช่ผ่าน onSubmit ของฟอร์ม (กันปัญหาตอนกด Enter แล้ว modal ไม่เด้ง)
              onClick={handleSubmit}
              className="px-10 py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center gap-2 text-sm"
            >
              CREATE LEAGUE 🚀
            </button>
          </div>
        </div>
      </div>

      {/* 🛎️ 3. นำ Modal แจ้งเตือนมาวางไว้ที่ Root Level ของ Component */}
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

export default CreateLeagueModal;