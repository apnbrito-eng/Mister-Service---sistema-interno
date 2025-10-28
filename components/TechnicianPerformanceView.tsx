import React, { useState, useMemo, useContext } from 'react';
import { AppContext, AppContextType } from '../types';
import { BarChart3, Wrench, ShieldAlert, CheckCircle, Calendar, User } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-4">
        <div className="flex-shrink-0 bg-sky-100 text-sky-600 rounded-full h-12 w-12 flex items-center justify-center">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

export const TechnicianPerformanceView: React.FC = () => {
    const { staff, serviceOrders, calendars } = useContext(AppContext) as AppContextType;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTechId, setSelectedTechId] = useState<string>('');

    const technicians = useMemo(() => staff.filter(s => s.role === 'tecnico'), [staff]);

    const performanceData = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const relevantTechs = selectedTechId ? technicians.filter(t => t.id === selectedTechId) : technicians;

        return relevantTechs.map(tech => {
            const techCalendar = calendars.find(c => c.userId === tech.id);
            if (!techCalendar) {
                return {
                    technician: tech,
                    stats: { completed: 0, warranty: 0, assigned: 0, completionRate: '0.0', warrantyRate: '0.0' }
                };
            }

            const techOrders = serviceOrders.filter(o => {
                const orderDate = o.end || o.start;
                return o.calendarId === techCalendar.id && orderDate && new Date(orderDate) >= start && new Date(orderDate) <= end;
            });
            
            const assigned = techOrders.length;
            const completed = techOrders.filter(o => o.status === 'Completado').length;
            const warranty = techOrders.filter(o => o.status === 'Garantía').length;

            const completionRate = assigned > 0 ? (completed / assigned * 100) : 0;
            const warrantyRate = completed > 0 ? (warranty / completed * 100) : 0;

            return {
                technician: tech,
                stats: {
                    completed,
                    warranty,
                    assigned,
                    completionRate: completionRate.toFixed(1),
                    warrantyRate: warrantyRate.toFixed(1)
                }
            };
        });

    }, [startDate, endDate, technicians, serviceOrders, calendars, selectedTechId]);

    const totalStats = useMemo(() => {
        const totals = performanceData.reduce((acc, data) => {
            acc.completed += data.stats.completed;
            acc.warranty += data.stats.warranty;
            acc.assigned += data.stats.assigned;
            return acc;
        }, { completed: 0, warranty: 0, assigned: 0 });

        return totals;
    }, [performanceData]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-slate-700 flex items-center gap-2">
                        <BarChart3 className="text-sky-600" /> Rendimiento Técnico
                    </h2>
                    <div className="w-full sm:w-auto space-y-4 sm:space-y-0 sm:flex sm:items-end sm:gap-4">
                        <div className="flex-1">
                            <label htmlFor="tech-filter" className="text-sm font-medium text-slate-600">Filtrar por Técnico:</label>
                            <select id="tech-filter" value={selectedTechId} onChange={e => setSelectedTechId(e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-white">
                                <option value="">Todos los Técnicos</option>
                                {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                         <div className="flex-1">
                            <label htmlFor="start-date-tech" className="text-sm font-medium text-slate-600">Desde:</label>
                            <input type="date" id="start-date-tech" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="end-date-tech" className="text-sm font-medium text-slate-600">Hasta:</label>
                            <input type="date" id="end-date-tech" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <StatCard title="Total Citas Completadas" value={totalStats.completed} icon={<CheckCircle size={24} />} />
                    <StatCard title="Total Reclamos de Garantía" value={totalStats.warranty} icon={<ShieldAlert size={24} />} />
                    <StatCard title="Total Citas Asignadas" value={totalStats.assigned} icon={<Calendar size={24} />} />
                </div>
            </div>

            <div className="space-y-6">
                {performanceData.map(({ technician, stats }) => (
                    <div key={technician.id} className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                                {technician.employeePhotoUrl ? (
                                    <img src={technician.employeePhotoUrl} alt={technician.name} className="h-full w-full object-cover" />
                                ) : (
                                    <User size={24} className="text-slate-500"/>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 ml-4">{technician.name}</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            <StatCard title="Asignadas" value={stats.assigned} icon={<Calendar size={20} />} />
                            <StatCard title="Completadas" value={stats.completed} icon={<CheckCircle size={20} />} />
                            <StatCard title="Garantías" value={stats.warranty} icon={<ShieldAlert size={20} />} />
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-slate-500">Tasa de Finalización</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.completionRate}%</p>
                                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${stats.completionRate}%` }}></div>
                                </div>
                            </div>
                             <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-slate-500">Tasa de Garantía</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.warrantyRate}%</p>
                                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${stats.warrantyRate}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {performanceData.length === 0 && (
                     <div className="text-center py-8 text-slate-500 bg-white rounded-lg shadow-md">
                        <p>No hay datos de rendimiento para la selección actual.</p>
                     </div>
                )}
            </div>
        </div>
    );
};