// src/components/CreateLeagueModal.tsx
import React, { useState } from 'react';

interface CreateLeagueModalProps {
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

const CreateLeagueModal: React.FC<CreateLeagueModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    // 1. Identity
    name: '',
    season: '2024/25',
    logo: null as File | null,
    description: '',
    // 2. Rules
    matchFormat: 'SINGLE', // SINGLE, DOUBLE
    // 3. Registration
    maxTeams: 16,
    minPlayers: 11,
    maxPlayers: 25,
    // 4. Schedule
    defaultVenue: '',
    startDate: '',
    endDate: '',
    standardKickoff: '18:00',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('กรุณาระบุชื่อลีก');
    onSubmit(formData);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm";
  const labelClass = "block text-xs font-black text-slate-500 mb-1.5 uppercase tracking-wider";
  const sectionTitleClass = "text-sm font-black text-blue-700 uppercase tracking-widest border-b border-blue-50 pb-2 mb-5 flex items-center gap-2";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-zoom-in">
        
        {/* 固定 Header */}
        <div className="bg-blue-900 p-6 text-white shrink-0 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter">🏆 CREATE NEW LEAGUE</h2>
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mt-1">Tournament Master Configuration (One Page)</p>
          </div>
          <button onClick={onClose} className="text-3xl leading-none hover:text-red-400 transition-colors">&times;</button>
        </div>

        {/* Form Content (Scrollable) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 lg:p-10 flex-1 space-y-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          
          {/* Section 1: Identity */}
          <div className="animate-slide-up">
            <h3 className={sectionTitleClass}>🆔 1. Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}>League Name</label>
                <input type="text" className={inputClass} placeholder="e.g. Pro League Thailand" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
              </div>
              <div>
                <label className={labelClass}>Season</label>
                <input type="text" className={inputClass} value={formData.season} onChange={e => setFormData({...formData, season: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>League Logo</label>
                <input type="file" className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Description / Rules Summary</label>
                <textarea rows={3} className={inputClass} placeholder="สรุปกฎกติกาคร่าวๆ..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Section 2: Competition Rules */}
          <div className="animate-slide-up">
            <h3 className={sectionTitleClass}>⚖️ 2. Competition Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Match Format (Home/Away)</label>
                <select className={inputClass} value={formData.matchFormat} onChange={e => setFormData({...formData, matchFormat: e.target.value})}>
                  <option value="SINGLE">Single Round (เจอครั้งเดียว)</option>
                  <option value="DOUBLE">Double Round (เหย้า-เยือน)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Registration & Rosters */}
          <div className="animate-slide-up">
            <h3 className={sectionTitleClass}>📝 3. Registration & Rosters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Max Teams</label>
                <input type="number" className={`${inputClass} font-bold`} value={formData.maxTeams} onChange={e => setFormData({...formData, maxTeams: +e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Min Players / Team</label>
                <input type="number" className={inputClass} value={formData.minPlayers} onChange={e => setFormData({...formData, minPlayers: +e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Max Players / Team</label>
                <input type="number" className={inputClass} value={formData.maxPlayers} onChange={e => setFormData({...formData, maxPlayers: +e.target.value})} />
              </div>
            </div>
          </div>

          {/* Section 4: Venue & Schedule */}
          <div className="animate-slide-up">
            <h3 className={sectionTitleClass}>📅 4. Venue & Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Default Venue (สนามหลัก)</label>
                <input type="text" className={inputClass} placeholder="ชื่อสนาม, จังหวัด..." value={formData.defaultVenue} onChange={e => setFormData({...formData, defaultVenue: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Start Date</label>
                <input type="date" className={inputClass} value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>End Date (Estimated)</label>
                <input type="date" className={inputClass} value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Standard Kick-off Time</label>
                <input type="time" className={inputClass} value={formData.standardKickoff} onChange={e => setFormData({...formData, standardKickoff: e.target.value})} />
              </div>
            </div>
          </div>
          
        </form>

        {/* 固定 Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2.5 font-bold text-slate-400 hover:text-slate-600 transition-colors text-sm uppercase">CANCEL</button>
          <button 
            onClick={handleSubmit}
            className="px-10 py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2 text-sm"
          >
            CREATE & LAUNCH LEAGUE 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateLeagueModal;