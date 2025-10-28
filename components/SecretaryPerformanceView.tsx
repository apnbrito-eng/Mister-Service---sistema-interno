import React, { useState, useMemo, useContext } from 'react';
import { AppContext, AppContextType } from '../types';
import { Activity, Calendar, UserPlus, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';

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

export const SecretaryPerformanceView: React.FC = () => {
    const { staff, serviceOrders, customers } = useContext(AppContext) as AppContextType;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSecretaryId, setSelectedSecretaryId] = useState<string>('');

    const secretaries = useMemo(() => staff.filter(s => ['secretaria', 'administrador', 'coordinador'].includes(s.role)), [staff]);

    const handleSecretaryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSecretaryId(e.target.value);
    };

    const performanceData = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const relevantSecretaries = selectedSecretaryId ? secretaries.filter(s => s.id === selectedSecretaryId) : secretaries;

        return relevantSecretaries.map(secretary => {
            const confirmedOrders = serviceOrders.filter(o => {
                const orderDate = o.start ? new Date(o.start) : new Date();
                return o.confirmedById === secretary.id && orderDate >= start && orderDate <= end;
            });

            const cancelledOrders = serviceOrders.filter(o => {
                const cancelLog = o.history?.find(h => h.action === 'Cancelado');
                if (!cancelLog) return false;
                const cancelDate = new Date(cancelLog.timestamp);
                return o.cancelledById === secretary.id && cancelDate >= start && cancelDate <= end;
            }).length;

            const rescheduledOrders = serviceOrders.reduce((count, order) => {
                const rescheduleLogs = order.history?.filter(h => 
                    h.action === 'Reagendado' && 
                    h.userId === secretary.id &&
                    new Date(h.timestamp) >= start &&
                    new Date(h.timestamp) <= end
                ) || [];
                return count + rescheduleLogs.length;
            }, 0);

            const newCustomers = customers.filter(c => {
                 const creationDate = c.serviceHistory.length > 0 ? serviceOrders.find(o => o.id === c.serviceHistory[0])?.createdAt : null;
                 if (!creationDate) return false;
                 return c.createdById === secretary.id && new Date(creationDate) >= start && new Date(creationDate) <= end;
            }).length;

            const totalHandled = confirmedOrders.length + serviceOrders.filter(o => o.attendedById === secretary.id && o.status === 'No Agendado').length;
            const confirmationRate = totalHandled > 0 ? (confirmedOrders.length / totalHandled * 100) : 0;

            return {
                secretary,
                stats: {
                    confirmed: confirmedOrders.length,
                    cancelled: cancelledOrders,
                    rescheduled: rescheduledOrders,
                    newClients: newCustomers,
                    confirmationRate: confirmationRate.toFixed(1)
                }
            };
        });

    }, [startDate, endDate, secretaries, serviceOrders, customers, selectedSecretaryId]);
    
    const totalStats = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const filteredOrdersByDate = serviceOrders.filter(o => {
            const orderDate = o.end || o.start;
            if (!orderDate) return false;
            return new Date(orderDate) >= start && new Date(orderDate) <= end;
        });

        return {
            completed: filteredOrdersByDate.filter(o => o.status === 'Completado').length,
            cancelled: serviceOrders.filter(o => {
                const cancelLog = o.history?.find(h => h.action === 'Cancelado');
                if (!cancelLog) return false;
                const cancelDate = new Date(cancelLog.timestamp);
                return o.status === 'Cancelado' && cancelDate >= start && cancelDate <= end;
            }).length,
            rescheduled: serviceOrders.reduce((count, order) => {
                const rescheduleLogs = order.history?.filter(h => 
                    h.action === 'Reagendado' &&
                    new Date(h.timestamp) >= start &&
                    new Date(h.timestamp) <= end
                ) || [];
                return count + rescheduleLogs.length;
            }, 0),
        };
    }, [startDate, endDate, serviceOrders]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-slate-700 flex items-center gap-2">
                        <Activity className="text-sky-600" /> Rendimiento de Secretarías
                    </h2>
                    <div className="w-full sm:w-auto space-y-4 sm:space-y-0 sm:flex sm:items-end sm:gap-4">
                        <div className="flex-1">
                            <label htmlFor="secretary-filter" className="text-sm font-medium text-slate-600">Filtrar por Secretaria:</label>
                            <select id="secretary-filter" value={selectedSecretaryId} onChange={handleSecretaryChange} className="mt-1 w-full p-2 border rounded-md bg-white">
                                <option value="">Todas las Secretarías</option>
                                {secretaries.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                         <div className="flex-1">
                            <label htmlFor="start-date" className="text-sm font-medium text-slate-600">Desde:</label>
                            <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="end-date" className="text-sm font-medium text-slate-600">Hasta:</label>
                            <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <StatCard title="Total Citas Completadas" value={totalStats.completed} icon={<CheckCircle size={24} />} />
                    <StatCard title="Total Citas Canceladas" value={totalStats.cancelled} icon={<XCircle size={24} />} />
                    <StatCard title="Total Citas Reagendadas" value={totalStats.rescheduled} icon={<RefreshCw size={24} />} />
                </div>
            </div>

            <div className="space-y-6">
                {performanceData.map(({ secretary, stats }) => (
                    <div key={secretary.id} className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                                {secretary.employeePhotoUrl ? (
                                    <img src={secretary.employeePhotoUrl} alt={secretary.name} className="h-full w-full object-cover" />
                                ) : (
                                    <UserPlus size={24} className="text-slate-500"/>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 ml-4">{secretary.name}</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            <StatCard title="Citas Confirmadas" value={stats.confirmed} icon={<Calendar size={20} />} />
                            <StatCard title="Citas Canceladas" value={stats.cancelled} icon={<XCircle size={20} />} />
                            <StatCard title="Citas Reagendadas" value={stats.rescheduled} icon={<RefreshCw size={20} />} />
                            <StatCard title="Clientes Nuevos" value={stats.newClients} icon={<UserPlus size={20} />} />
                             <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-slate-500">Tasa de Confirmación</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.confirmationRate}%</p>
                                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${stats.confirmationRate}%` }}></div>
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