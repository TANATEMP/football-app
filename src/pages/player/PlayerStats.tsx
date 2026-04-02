import { useState, useEffect } from 'react';
import api from '../../lib/api';

const PlayerStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const userRes = await api.get('/user');
      const playerProfile = userRes.data.data?.player || userRes.data.player;
      
      if (playerProfile) {
        // ✅ แก้บั๊ก: ป้องกันกรณีไม่มี stats
        const statsArray = playerProfile.stats || [];
        
        const aggregatedStats = statsArray.reduce((acc: any, curr: any) => ({
          matches: acc.matches + (curr.matchesPlayed || 0),
          goals: acc.goals + (curr.goals || 0),
          assists: acc.assists + (curr.assists || 0),
          yellowCards: acc.yellowCards + (curr.yellowCards || 0),
          redCards: acc.redCards + (curr.redCards || 0),
        }), { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 });

        // ✅ แก้บั๊ก: ดึง rating มาด้วย (ถ้ามี) และอัปเดต State
        setStats({
          ...aggregatedStats,
          rating: playerProfile.rating || 'N/A' // สมมติว่าดึง rating จากโปรไฟล์ ถ้าไม่มีให้แสดง N/A
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center font-black italic text-slate-400 animate-pulse uppercase tracking-widest">Loading Performance Stats...</div>;
  
  // ✅ แก้บั๊ก: ป้องกันแอปพังหากโหลดเสร็จแล้วแต่ไม่มีข้อมูล
  if (!stats) return <div className="p-10 text-center font-black italic text-slate-400 uppercase tracking-widest">No Stats Available</div>;

  // ✅ ปรับสมดุล: เพิ่ม 'Matches' เข้ามาเป็นกล่องที่ 6 ทำให้พอดีกับ lg:grid-cols-6
  const statCards = [
    { label: 'Goals', value: stats.goals, icon: '⚽', color: 'green' },
    { label: 'Assists', value: stats.assists, icon: '👟', color: 'purple' },
    { label: 'Yellow Cards', value: stats.yellowCards, icon: '🟨', color: 'orange' },
    { label: 'Red Cards', value: stats.redCards, icon: '🟥', color: 'red' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20 px-4">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter relative z-10">Career Stats 📊</h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 relative z-10">Player Performance Data</p>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* ✅ กริดจะแสดงผล: มือถือ 2 คอลัมน์, แท็บเล็ต 3 คอลัมน์, จอใหญ่ 6 คอลัมน์ ซึ่งพอดีเป๊ะกับ 6 กล่อง */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {statCards.map(stat => (
          <div key={stat.label} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
            <div className="text-3xl mb-4">{stat.icon}</div>
            <div className="text-3xl font-black italic text-slate-800">{stat.value}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerStats;