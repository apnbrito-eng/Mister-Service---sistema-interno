import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AppContext, AppContextType, ServiceOrder, ServiceOrderStatus } from '../types';
import { X, Edit, Phone, MapPin, Wrench, User, Calendar as CalendarIcon, Save, Info, Search, Clock, History, RefreshCw } from 'lucide-react';

interface ServiceOrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ServiceOrder | null;
}

const statusColorClasses: Record<ServiceOrderStatus, string> = {
    Pendiente: 'bg-amber-500 text-white',
    'En Proceso': 'bg-green-500 text-white',
    Completado: 'bg-sky-500 text-white',
    Cancelado: 'bg-slate-500 text-white',
    'Por Confirmar': 'bg-indigo-500 text-white',
    Garantía: 'bg-red-500 text-white',
    'No Agendado': 'bg-slate-500 text-white',
};

export const ServiceOrderDetailsModal: React.FC<ServiceOrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
  const { staff, calendars, updateServiceOrder, serviceOrders } = useContext(AppContext) as AppContextType;
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields state
  const [applianceType, setApplianceType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [calendarId, setCalendarId] = useState('');
  const [status, setStatus] = useState<ServiceOrderStatus>('Pendiente');
  const [isCheckupOnly, setIsCheckupOnly] = useState(false);
  
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  const assignableStaff = useMemo(() => staff.filter(s => {
    if (!['tecnico', 'coordinador', 'administrador'].includes(s.role)) return false;
    const cal = calendars.find(c => c.id === s.calendarId);
    return cal?.active;
  }), [staff, calendars]);
  
  const occupiedTimeSlots = useMemo(() => {
    if (!isEditing || !calendarId || !appointmentDate || !order) return new Set();

    const occupied = new Set<string>();
    const selectedDayStart = new Date(`${appointmentDate}T00:00:00`);
    const selectedDayEnd = new Date(`${appointmentDate}T23:59:59`);

    serviceOrders.forEach(o => {
        if (
            o.id !== order.id &&
            o.calendarId === calendarId &&
            o.start &&
            o.status !== 'Cancelado'
        ) {
            const orderDate = new Date(o.start);
            if (orderDate >= selectedDayStart && orderDate <= selectedDayEnd) {
                const hours = orderDate.getHours().toString().padStart(2, '0');
                const minutes = orderDate.getMinutes().toString().padStart(2, '0');
                occupied.add(`${hours}:${minutes}`);
            }
        }
    });
    return occupied;
}, [isEditing, calendarId, appointmentDate, serviceOrders, order]);

  // Effect to populate form when order changes or edit mode is entered
  useEffect(() => {
    if (order) {
      if (order.start) {
        const startDate = new Date(order.start);
        const yyyy = startDate.getFullYear();
        const mm = String(startDate.getMonth() + 1).padStart(2, '0');
        const dd = String(startDate.getDate()).padStart(2, '0');
        setAppointmentDate(`${yyyy}-${mm}-${dd}`);

        const hours = startDate.getHours().toString().padStart(2, '0');
        const minutes = startDate.getMinutes().toString().padStart(2, '0');
        setAppointmentTime(`${hours}:${minutes}`);
      }
      setCalendarId(order.calendarId || '');
      setStatus(order.status);
      setApplianceType(order.applianceType);
      setIssueDescription(order.issueDescription);
      setServiceNotes(order.serviceNotes || '');
      setIsCheckupOnly(order.isCheckupOnly || false);
    }
  }, [order, isEditing]);

  // Effect to update availability when technician or date changes
  useEffect(() => {
    if (calendarId && appointmentDate) {
      const selectedCalendar = calendars.find(c => c.id === calendarId);
      const [year, month, day] = appointmentDate.split('-').map(Number);
      const checkDate = new Date(year, month - 1, day, 12);
      const dayOfWeek = checkDate.getDay();

      const dayAvailability = selectedCalendar?.availability?.find(d => d.dayOfWeek === dayOfWeek);
      setAvailableTimeSlots(dayAvailability?.slots.map(slot => slot.startTime).sort() || []);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [calendarId, appointmentDate, calendars]);

  const handleSave = () => {
    if (!order) return;

    if (!appointmentDate || !appointmentTime || !calendarId) {
        alert("Por favor, completa los campos de técnico, fecha y hora para guardar.");
        return;
    }

    const start = new Date(`${appointmentDate}T${appointmentTime}`);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // Assume 1 hour duration
    
    const isSlotOccupied = serviceOrders.some(o => 
        o.id !== order.id &&
        o.calendarId === calendarId &&
        o.status !== 'Cancelado' &&
        o.start &&
        new Date(o.start).getTime() === start.getTime()
    );

    if (isSlotOccupied) {
        alert("Este horario ya está ocupado para el técnico seleccionado. Por favor, elige otro horario.");
        return;
    }

    const updatedData: Partial<ServiceOrder> = {
        calendarId,
        start,
        end,
        status,
        applianceType,
        issueDescription,
        serviceNotes,
        isCheckupOnly,
        title: `${applianceType} - ${order.customerName}`,
    };
    
    updateServiceOrder(order.id, updatedData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const handleClose = () => {
    setIsEditing(false);
    onClose();
  }

  if (!isOpen || !order) return null;

  const technician = staff.find(s => s.id === calendars.find(c => c.id === order.calendarId)?.userId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] flex flex-col">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800">
          <X size={20} />
        </button>

        {!isEditing ? (
          // VIEW MODE
          <>
            <main className="overflow-y-auto pr-2">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold mb-4 text-slate-700">
                  <span className="text-lg font-medium text-slate-500 block">#{order.serviceOrderNumber}</span>
                  {order.applianceType} - {order.customerName}
                </h2>
                 <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      {order.isCheckupOnly && (
                        <span className="text-xs font-medium py-1 px-2.5 rounded-full bg-cyan-100 text-cyan-800 flex items-center gap-1.5">
                          <Search size={12}/> Solo Chequeo
                        </span>
                      )}
                      <span className={`text-xs font-medium py-1 px-2.5 rounded-full ${statusColorClasses[order.status]}`}>{order.status}</span>
                    </div>
                    {order.rescheduledCount && order.rescheduledCount > 0 && (
                      <span className="text-xs font-medium py-1 px-2.5 rounded-full bg-purple-100 text-purple-800 flex items-center gap-1.5">
                        <RefreshCw size={12}/> CITA REAGENDADA
                      </span>
                    )}
                 </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-600 flex items-center gap-2 mb-1"><CalendarIcon size={16}/> Cita</h3>
                    <p>{order.start ? new Date(order.start).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' }) : 'No agendada'}</p>
                  </div>
                  <div>
                     <h3 className="font-semibold text-slate-600 flex items-center gap-2 mb-1"><User size={16}/> Personal Asignado</h3>
                     <p>{technician?.name || 'No asignado'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-600 flex items-center gap-2 mb-1"><Phone size={16}/> Contacto Cliente</h3>
                  <p>{order.customerName}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1 text-sm text-sky-600 hover:underline"><Phone size={14}/> {order.customerPhone}</a>
                    <a href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline">WhatsApp</a>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-600 flex items-center gap-2 mb-1"><MapPin size={16}/> Dirección</h3>
                  <p>{order.customerAddress}</p>
                   {order.latitude && order.longitude && (
                      <div className="mt-1 flex gap-2">
                          <a href={`https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Google Maps</a>
                          <a href={`https://waze.com/ul?ll=${order.latitude},${order.longitude}&navigate=yes`} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-600 hover:underline">Waze</a>
                      </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-600 flex items-center gap-2 mb-1"><Wrench size={16}/> Detalles del Servicio</h3>
                  <p><b>Falla Reportada:</b> {order.issueDescription}</p>
                  <div className="mt-2 pt-2 border-t">
                    <h4 className="text-sm font-semibold text-slate-500">Trabajo Realizado y Notas:</h4>
                    {order.serviceNotes ? (
                       <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans mt-1 p-2 bg-slate-50 rounded-md">{order.serviceNotes}</pre>
                    ) : (
                       <p className="text-sm text-slate-400 italic mt-1">Sin notas.</p>
                    )}
                  </div>
                </div>

                 {(order.status === 'Cancelado' || order.status === 'No Agendado') && (
                    <div className={`mt-4 p-3 ${order.status === 'Cancelado' ? 'bg-red-50 border-red-400' : 'bg-slate-100 border-slate-400'} border-l-4 rounded-r-md`}>
                        <h3 className="font-semibold text-slate-600 flex items-center gap-2 mb-1"><Info size={16}/> 
                           {order.status === 'Cancelado' ? 'Motivo de Cancelación' : 'Motivo de No Agendado'}
                        </h3>
                        <p className="text-sm text-slate-800 whitespace-pre-wrap">
                            {order.cancellationReason || order.archiveReason || 'No se especificó un motivo.'}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                            Registrado por: {staff.find(s => s.id === (order.cancelledById || order.attendedById))?.name || 'No registrado'}
                        </p>
                    </div>
                )}
                
                <div className="pt-4 mt-4 border-t">
                    <h3 className="font-semibold text-slate-600 flex items-center gap-2 mb-2"><History size={16}/> Historial de la Orden</h3>
                    <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                       {order.history && [...order.history].reverse().map((log, index) => (
                          <li key={index} className="text-xs text-slate-500 flex items-start gap-2">
                              <div className="w-2 h-2 mt-1.5 bg-slate-300 rounded-full flex-shrink-0"></div>
                              <div>
                                 <span className="font-semibold text-slate-700">{log.action}</span> por <span className="font-medium">{staff.find(s => s.id === log.userId)?.name || log.userId}</span>
                                 <span className="ml-2 text-slate-400">{new Date(log.timestamp).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                 {log.details && <p className="text-slate-600 pl-1">{log.details}</p>}
                              </div>
                          </li>
                       ))}
                       {!order.history && (
                           <p className="text-xs text-slate-400">No hay historial disponible.</p>
                       )}
                    </ul>
                </div>
              </div>
            </main>
            <footer className="flex justify-end gap-4 pt-4 mt-auto border-t">
               <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 flex items-center gap-2">
                <Edit size={14}/> Editar
              </button>
            </footer>
          </>
        ) : (
          // EDIT MODE
          <>
            <main className="overflow-y-auto pr-2">
              <h2 className="text-2xl font-bold mb-4 text-slate-700">
                   <span className="text-lg font-medium text-slate-500 block">Editando Orden #{order.serviceOrderNumber}</span>
                   Editar Orden de Servicio
              </h2>
              <div className="space-y-4">
                  <div>
                      <label htmlFor="edit-applianceType" className="label-style"><b>Tipo de Servicio / Asunto</b></label>
                      <input type="text" id="edit-applianceType" value={applianceType} onChange={e => setApplianceType(e.target.value)} required className="mt-1 input-style" />
                  </div>
                   <div>
                      <label htmlFor="edit-issueDescription" className="label-style"><b>Falla Reportada</b></label>
                      <textarea id="edit-issueDescription" value={issueDescription} onChange={e => setIssueDescription(e.target.value)} rows={2} required className="mt-1 input-style"></textarea>
                  </div>
                  <div>
                    <label htmlFor="edit-serviceNotes" className="label-style"><b>Trabajo Realizado y Notas</b></label>
                    <textarea id="edit-serviceNotes" value={serviceNotes} onChange={e => setServiceNotes(e.target.value)} rows={4} className="mt-1 input-style" placeholder="Ej: Se realizó mantenimiento de hornillas, se indicó un costo de 2500 pesos..."></textarea>
                  </div>
                   <div className="md:col-span-2 flex items-center gap-2 p-2 bg-slate-50 rounded-md border">
                      <input 
                          type="checkbox"
                          id="edit-isCheckupOnly"
                          checked={isCheckupOnly}
                          onChange={e => setIsCheckupOnly(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <label htmlFor="edit-isCheckupOnly" className="text-sm font-medium text-slate-700">Marcar como "Solo Chequeo"</label>
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-calendarId" className="label-style"><b>Asignar a Personal</b></label>
                    <select id="edit-calendarId" value={calendarId} onChange={e => setCalendarId(e.target.value)} required className="mt-1 input-style">
                      <option value="">Seleccionar personal</option>
                      {assignableStaff.map(tech => {
                          const cal = calendars.find(c => c.id === tech.calendarId);
                          return cal ? <option key={cal.id} value={cal.id}>{tech.name}</option> : null;
                      })}
                    </select>
                  </div>
                  <div>
                      <label htmlFor="edit-status" className="label-style"><b>Estado</b></label>
                      <select id="edit-status" value={status} onChange={(e) => setStatus(e.target.value as ServiceOrderStatus)} className="mt-1 input-style">
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Proceso">En Proceso</option>
                          <option value="Completado">Completado</option>
                          <option value="Garantía">Garantía</option>
                          <option value="Cancelado">Cancelado</option>
                      </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="edit-date" className="label-style"><b>Fecha de la Cita</b></label>
                  <input type="date" id="edit-date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} required className="mt-1 input-style" />
                </div>
                <div>
                  <label className="label-style"><b>Hora de Inicio</b></label>
                   {availableTimeSlots.length > 0 ? (
                      <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {availableTimeSlots.map((time, index) => {
                              const isOccupied = occupiedTimeSlots.has(time);
                              return (
                              <button
                                  type="button"
                                  key={index}
                                  onClick={() => !isOccupied && setAppointmentTime(time)}
                                  disabled={isOccupied}
                                  className={`w-full text-center p-3 rounded-md border text-sm font-semibold transition-colors ${ 
                                      appointmentTime === time 
                                        ? 'bg-sky-600 text-white border-sky-600' 
                                        : isOccupied 
                                        ? 'bg-red-100 text-red-500 border-red-200 cursor-not-allowed line-through'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-sky-50' }`}
                              >
                                  {time}
                              </button>
                          )})}
                      </div>
                  ) : (
                       <div className="mt-1 p-3 bg-slate-100 rounded-md text-center text-sm text-slate-500 flex items-center gap-2 justify-center">
                          <Info size={16}/>
                          <span>Seleccione personal/fecha para ver horarios.</span>
                      </div>
                  )}
                </div>
              </div>
            </main>
            <footer className="flex justify-end gap-4 pt-4 mt-auto border-t">
              <button type="button" onClick={handleCancelEdit} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">
                Cancelar
              </button>
              <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 flex items-center gap-2">
                <Save size={14}/> Guardar Cambios
              </button>
            </footer>
          </>
        )}
        <style>{`.input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; box-shadow: sm; placeholder-slate-400; focus:outline-none focus:ring-sky-500 focus:border-sky-500; } .label-style { display: block; font-medium; color: #334155; }`}</style>
      </div>
    </div>
  );
};