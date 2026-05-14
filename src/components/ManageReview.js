import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, Users, Layers, Clock, TrendingUp, BarChart3, Loader2, UserCheck, Star, ShieldCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-start justify-between">
    <div>
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white">{value}</h3>
      {trend && (
        <p className="text-emerald-500 text-sm font-medium flex items-center gap-1 mt-2">
          <TrendingUp size={14} /> {trend}
        </p>
      )}
    </div>
    <div className={`p-3 rounded-xl ${colorClass}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const ManageReview = () => {
  const { id } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_API_URL;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/hackathons/${id}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Помилка завантаження аналітики", error);
    } finally {
      setLoading(false);
    }
  }, [id, apiUrl]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-slate-400">Не вдалося завантажити дані.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <BarChart3 className="text-indigo-500" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Аналітика хакатону</h2>
          <p className="text-slate-400 mt-1">Огляд активності та статистика реєстрацій</p>
        </div>
      </div>

      {/* Верхній ряд: Основні метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Перегляди сторінки" value={analytics.pageViews} icon={Eye} colorClass="bg-blue-500/20 text-blue-500" />
        <StatCard title="Звичайні учасники" value={analytics.totalMembers} icon={Users} colorClass="bg-indigo-500/20 text-indigo-500" />
        <StatCard title="Сформовані команди" value={analytics.teamsCount} icon={Layers} colorClass="bg-purple-500/20 text-purple-500" />
        <StatCard title="Днів до дедлайну" value={analytics.daysToDeadline} icon={Clock} colorClass={analytics.daysToDeadline < 3 ? "bg-rose-500/20 text-rose-500" : "bg-emerald-500/20 text-emerald-500"} />
      </div>

      {/* Середній ряд: Склад команди / ролі */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row flex-wrap gap-6 justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Персонал хакатону</h3>
          <p className="text-slate-400 text-sm mt-1">Кількість залучених експертів та організаторів</p>
        </div>
        
        <div className="flex gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500"><Star size={20}/></div>
            <div>
              <p className="text-white font-bold text-xl">{analytics.roleBreakdown.Jury}</p>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Журі</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500"><UserCheck size={20}/></div>
            <div>
              <p className="text-white font-bold text-xl">{analytics.roleBreakdown.Mentor}</p>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Ментори</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500"><ShieldCheck size={20}/></div>
            <div>
              <p className="text-white font-bold text-xl">{analytics.roleBreakdown['Co-organizer']}</p>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Співорганізатори</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Лінійний графік */}
        <div className="col-span-1 lg:col-span-2 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 sm:mb-6">Динаміка реєстрацій</h3>
            {analytics.registrationsData.length > 0 ? (
            <div className="w-full h-56 sm:h-72">
                {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.registrationsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                        itemStyle={{ color: '#c7d2fe' }}
                    />
                    <Line type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
                )}
            </div>
            ) : (
            <div className="h-56 sm:h-72 flex items-center justify-center text-slate-500">Ще немає реєстрацій</div>
            )}
        </div>

        {/* Круговий графік */}
        <div className="col-span-1 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4 sm:mb-6">Спеціалізації учасників</h3>
          {analytics.rolesData.length > 0 ? (
            <>
              <div className="w-full h-48 sm:h-56">
                {isMounted && (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analytics.rolesData}
                        cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5}
                        dataKey="value" stroke="none"
                      >
                        {analytics.rolesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}  
              </div>
              <div className="mt-4 space-y-2">
                {analytics.rolesData.map((role, index) => (
                  <div key={role.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-slate-300 truncate">{role.name}</span>
                    </div>
                    <span className="text-white font-medium ml-2">{role.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 sm:h-56 flex items-center justify-center text-slate-500">Немає даних про учасників</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageReview;