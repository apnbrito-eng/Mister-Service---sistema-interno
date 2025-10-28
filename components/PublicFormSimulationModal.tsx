
import React, { useState, useContext, useEffect } from 'react';
import { AppContext, AppContextType, TimeSlot } from '../types';
import { X, MapPin, Loader2 } from 'lucide-react';

interface PublicFormSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicFormSimulationModal: React.FC<PublicFormSimulationModalProps> = ({ isOpen, onClose }) => {
  const { addUnconfirmedServiceOrder, publicFormAvailability } = useContext(AppContext) as AppContextType;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [applianceType, setApplianceType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerAddress('');
    setApplianceType('');
    setIssueDescription('');
    setLatitude(undefined);
    setLongitude(undefined);
    setLocationError('');
    setSelectedDate('');
    setSelectedTime('');
    setAvailableSlots([]);
  };

  useEffect(() => {
    if(isOpen) {
        resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate) {
        const date = new Date(selectedDate);
        const dayOfWeek = date.getUTCDay();

        const daySchedule = publicFormAvailability.find(d => d.dayOfWeek === dayOfWeek);
        setAvailableSlots(daySchedule?.slots || []);
        setSelectedTime('');
    } else {
        setAvailableSlots([]);
    }
  }, [selectedDate, publicFormAvailability]);

  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLatitude(latitude);
        setLongitude(longitude);
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
           if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          if (data && data.display_name) {
            setCustomerAddress(data.display_name);
          } else {
            setLocationError('No se pudo encontrar una dirección para esta ubicación.');
          }
        } catch (error) {
          console.error("Error fetching address: ", error);
          setLocationError('Error al obtener la dirección.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error: ", error);
        setLocationError(`Error de geolocalización: ${error.message}`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !issueDescription || !customerAddress) {
        alert("Por favor, completa todos los campos obligatorios.");
        return;
    }
    const orderData: any = {
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        applianceType,
        issueDescription,
        latitude,
        longitude
    };

    if (selectedDate && selectedTime) {
        const [startTime, endTime] = selectedTime.split('-');
        const startDateTime = new Date(`${selectedDate}T${startTime.trim()}`);
        const endDateTime = new Date(`${selectedDate}T${endTime.trim()}`);
        orderData.start = startDateTime;
        orderData.end = endDateTime;
    }

    addUnconfirmedServiceOrder(orderData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-slate-700">Solicitar Servicio (Simulación)</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-slate-600">Sus Datos</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                  <label htmlFor="sim-customerName" className="label-style"><b>Nombre y Apellido</b></label>
                  <input type="text" id="sim-customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="mt-1 input-style" />
              </div>
              <div>
                  <label htmlFor="sim-customerPhone" className="label-style"><b>Teléfono (con código de país)</b></label>
                  <input type="tel" id="sim-customerPhone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required className="mt-1 input-style" placeholder="Ej: 18091234567" />
              </div>
              <div className="md:col-span-2">
                  <label htmlFor="sim-customerEmail" className="label-style"><b>Correo Electrónico (Opcional)</b></label>
                  <input type="email" id="sim-customerEmail" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="mt-1 input-style" />
              </div>
               <div className="md:col-span-2">
                  <label htmlFor="sim-customerAddress" className="label-style"><b>Dirección del Servicio</b></label>
                    <div className="relative">
                        <input type="text" id="sim-customerAddress" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} required className="mt-1 input-style pr-10" />
                        <button type="button" onClick={handleGetLocation} disabled={isLocating} className="absolute inset-y-0 right-0 top-0.5 flex items-center pr-3 text-slate-500 hover:text-sky-600 disabled:cursor-not-allowed" aria-label="Obtener ubicación actual">
                            {isLocating ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}
                        </button>
                    </div>
                    {locationError && <p className="text-xs text-red-500 mt-1">{locationError}</p>}
              </div>
            </div>
          </fieldset>
           <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-slate-600">Detalles del Servicio</legend>
            <div className="grid grid-cols-1 gap-4 mt-2">
                <div>
                    <label htmlFor="sim-applianceType" className="label-style"><b>Tipo de Servicio / Asunto</b></label>
                    <input type="text" id="sim-applianceType" value={applianceType} onChange={e => setApplianceType(e.target.value)} required className="mt-1 input-style" />
                </div>
                <div>
                    <label htmlFor="sim-issueDescription" className="label-style"><b>Describa la falla o servicio</b></label>
                    <textarea id="sim-issueDescription" value={issueDescription} onChange={e => setIssueDescription(e.target.value)} rows={3} required className="mt-1 input-style"></textarea>
                </div>
            </div>
          </fieldset>
          <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-slate-600">Fecha y Hora Deseada</legend>
            <div className="space-y-4 mt-2">
                <div>
                    <label htmlFor="sim-date" className="label-style"><b>1. Seleccione una Fecha</b></label>
                    <input type="date" id="sim-date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="mt-1 input-style" min={new Date().toISOString().split('T')[0]}/>
                </div>
                 <div>
                    <label className="label-style"><b>2. Seleccione un Horario</b></label>
                    {selectedDate && availableSlots.length > 0 ? (
                        <div className="mt-2 flex flex-col gap-2">
                            {availableSlots.map((slot, index) => {
                                const slotValue = `${slot.startTime}-${slot.endTime}`;
                                const isSelected = selectedTime === slotValue;
                                return (
                                    <button
                                        type="button"
                                        key={index}
                                        onClick={() => setSelectedTime(slotValue)}
                                        className={`w-full text-center p-3 rounded-md border text-sm font-semibold transition-colors ${
                                            isSelected
                                                ? 'bg-sky-600 text-white border-sky-600'
                                                : 'bg-white text-slate-700 border-slate-300 hover:bg-sky-50'
                                        }`}
                                    >
                                        {slot.startTime} - {slot.endTime}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mt-1 p-3 bg-slate-100 rounded-md text-center text-sm text-slate-500">
                            {!selectedDate
                                ? 'Seleccione una fecha para ver los horarios'
                                : 'No hay horarios disponibles para este día.'}
                        </div>
                    )}
                </div>
            </div>
          </fieldset>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700">
              Enviar Solicitud
            </button>
          </div>
        </form>
         <style>{`.input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; box-shadow: sm; placeholder-slate-400; focus:outline-none focus:ring-sky-500 focus:border-sky-500; } .input-style:disabled { background-color: #f1f5f9; cursor: not-allowed; } .label-style { display: block; font-medium; color: #334155; }`}</style>
      </div>
    </div>
  );
};