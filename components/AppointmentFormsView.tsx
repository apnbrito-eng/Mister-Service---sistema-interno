
import React, { useState, useContext } from 'react';
import { FileText, Send, Clock } from 'lucide-react';
import { PublicFormSimulationModal } from './PublicFormSimulationModal';
import { AppContext, AppContextType } from '../types';
import { AvailabilityModal } from './AvailabilityModal';

export const AppointmentFormsView: React.FC = () => {
    const { publicFormAvailability, updatePublicFormAvailability } = useContext(AppContext) as AppContextType;
    const [isSimModalOpen, setIsSimModalOpen] = useState(false);
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);

    const publicFormCalendar = {
        id: 'public-form',
        name: 'Disponibilidad del Formulario Público',
        userId: '',
        color: '#16a34a',
        availability: publicFormAvailability,
    };

    return (
        <>
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-slate-700 flex items-center gap-2">
                        <FileText size={22} className="text-sky-600" />
                        Formularios de Citas
                    </h2>
                    <div className="p-4 bg-slate-50 rounded-md">
                        <p className="text-slate-600 mb-4">
                            Aquí podrías gestionar los formularios que insertas en tu página web. Para fines de demostración, puedes simular el envío de un cliente.
                        </p>
                        <button
                            onClick={() => setIsSimModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                        >
                            <Send size={16} />
                            Simular envío de cliente
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                     <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-sky-600" />
                        Disponibilidad del Formulario Público
                    </h3>
                    <div className="p-4 bg-slate-50 rounded-md">
                         <p className="text-slate-600 mb-4">
                            Define los días y horas en que los clientes pueden solicitar una cita a través de tu formulario.
                        </p>
                         <button
                            onClick={() => setIsAvailabilityModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                        >
                            <Clock size={16} />
                            Configurar Horarios
                        </button>
                    </div>
                </div>
            </div>

            <PublicFormSimulationModal
                isOpen={isSimModalOpen}
                onClose={() => setIsSimModalOpen(false)}
            />

            {isAvailabilityModalOpen && (
                <AvailabilityModal
                    isOpen={isAvailabilityModalOpen}
                    onClose={() => setIsAvailabilityModalOpen(false)}
                    calendar={publicFormCalendar}
                    onSave={(newAvailability) => {
                        updatePublicFormAvailability(newAvailability);
                        setIsAvailabilityModalOpen(false);
                    }}
                />
            )}
        </>
    );
};