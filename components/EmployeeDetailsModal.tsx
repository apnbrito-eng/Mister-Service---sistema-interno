
import React, { useState, useContext, useEffect } from 'react';
import { AppContext, AppContextType, Staff, StaffRole } from '../types';
import { X, Save, Camera } from 'lucide-react';

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffMember: Staff | null;
  mode: 'create' | 'view' | 'edit';
}

const initialFormState: Omit<Staff, 'id' | 'calendarId' | 'accessKey'> = {
    name: '',
    email: '',
    role: 'tecnico',
    code: '',
    idNumber: '',
    address: '',
    personalPhone: '',
    fleetPhone: '',
    salary: 0,
    startDate: '',
    tss: 0,
    afp: 0,
    loans: 0,
    workErrorDeduction: 0,
    otherDeductions: 0,
    discount: 0,
    requiredHours: 0,
    workedHours: 0,
    overtimeValue: 0,
    totalHoursValue: 0,
    income: 0,
    commission: 0,
    isPayrollTaxable: 'Si',
    commissionBase: 'Productos',
    tssDeductionSchedule: '2. Quincena',
    afpDeductionSchedule: '2. Quincena',
    idPhotoUrl: '',
    employeePhotoUrl: ''
};

export const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({ isOpen, onClose, staffMember, mode }) => {
  const { addStaff, updateStaff } = useContext(AppContext) as AppContextType;
  const [formState, setFormState] = useState(initialFormState);

  const isReadOnly = mode === 'view';

  useEffect(() => {
    if (isOpen) {
      if (staffMember) {
        setFormState({
            ...initialFormState,
            ...staffMember
        });
      } else {
        setFormState(initialFormState);
      }
    }
  }, [isOpen, staffMember]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value === '' ? 0 : parseFloat(value) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'idPhotoUrl' | 'employeePhotoUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormState(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    
    if (!formState.name || !formState.idNumber || !formState.email) {
        alert("Por favor, complete los campos de Nombre, Identificación y Correo Electrónico.");
        return;
    }
    
    if (mode === 'create') {
        addStaff(formState);
    } else if (mode === 'edit' && staffMember) {
        updateStaff(staffMember.id, formState);
    }
    onClose();
  };

  if (!isOpen) return null;

  const InputField: React.FC<{label: string, name: keyof Staff, type?: string, readOnly?: boolean}> = ({label, name, type='text', readOnly=false}) => (
    <div>
        <label htmlFor={name} className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
        <input type={type} id={name} name={name} value={(formState[name] as any) || ''} onChange={handleInputChange} readOnly={readOnly} className="input-style"/>
    </div>
  );
  
  const NumberField: React.FC<{label: string, name: keyof Staff, readOnly?: boolean}> = ({label, name, readOnly=false}) => (
    <div>
        <label htmlFor={name} className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
        <input type="number" id={name} name={name} value={(formState[name] as any) || 0} onChange={handleNumberChange} readOnly={readOnly} className="input-style"/>
    </div>
  );
  
   const SelectField: React.FC<{label: string, name: keyof Staff, options: string[], readOnly?: boolean}> = ({label, name, options, readOnly=false}) => (
    <div>
        <label htmlFor={name} className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
        <select id={name} name={name} value={(formState[name] as any) || ''} onChange={handleInputChange} disabled={readOnly} className="input-style">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
  );
  
  const PhotoUpload: React.FC<{label: string, field: 'idPhotoUrl' | 'employeePhotoUrl', readOnly?: boolean}> = ({label, field, readOnly=false}) => (
    <div className="flex flex-col items-center p-4 bg-slate-100 rounded-lg h-48 justify-center">
        <p className="font-semibold text-slate-700 mb-2">{label}</p>
        <div className="w-32 h-32 bg-slate-300 rounded-md flex items-center justify-center overflow-hidden">
            {formState[field] ? (
                 <img src={formState[field]} alt={label} className="w-full h-full object-cover" />
            ) : (
                <div className="text-center text-slate-500">
                    <Camera size={32}/>
                    <p className="text-xs mt-1">NO PHOTO AVAILABLE</p>
                </div>
            )}
        </div>
        {!readOnly && (
            <div className="mt-2">
                <label htmlFor={field} className="cursor-pointer text-sm text-sky-600 bg-white border border-sky-600 rounded-md px-3 py-1 hover:bg-sky-50">
                    Seleccionar archivo
                </label>
                <input type="file" id={field} name={field} accept="image/*" onChange={(e) => handleFileChange(e, field)} className="hidden"/>
            </div>
        )}
    </div>
  );


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-5xl relative max-h-[95vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold text-slate-800">
                {mode === 'create' && 'Agregar Empleado'}
                {mode === 'edit' && 'Editar Empleado'}
                {mode === 'view' && 'Detalles del Empleado'}
            </h2>
            <button type="button" onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800">
              <X size={20} />
            </button>
        </header>

        <main className="p-6 overflow-y-auto flex-grow">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Fila 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField label="Codigo" name="code" readOnly={isReadOnly}/>
                        <InputField label="Identificacion" name="idNumber" readOnly={isReadOnly}/>
                        <InputField label="Nombre" name="name" readOnly={isReadOnly}/>
                    </div>
                     {/* Fila 2 */}
                    <div className="grid grid-cols-1 gap-4">
                         <InputField label="Direccion" name="address" readOnly={isReadOnly}/>
                    </div>
                     {/* Fila 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Telefono" name="personalPhone" readOnly={isReadOnly}/>
                        <InputField label="Celular" name="fleetPhone" readOnly={isReadOnly}/>
                    </div>
                     {/* Fila 4 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                            <SelectField label="Cargo" name="role" options={['administrador', 'coordinador', 'tecnico', 'secretaria']} readOnly={isReadOnly}/>
                        </div>
                         <NumberField label="Salario" name="salary" readOnly={isReadOnly}/>
                         <InputField label="Fecha de Entrada" name="startDate" type="date" readOnly={isReadOnly}/>
                         <NumberField label="TSS" name="tss" readOnly={isReadOnly}/>
                    </div>
                    {/* Fila 5 */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                         <NumberField label="AFP" name="afp" readOnly={isReadOnly}/>
                         <NumberField label="Prestamos" name="loans" readOnly={isReadOnly}/>
                         <NumberField label="Error lab." name="workErrorDeduction" readOnly={isReadOnly}/>
                         <NumberField label="Otros desc." name="otherDeductions" readOnly={isReadOnly}/>
                         <NumberField label="Descuento" name="discount" readOnly={isReadOnly}/>
                         <NumberField label="Horas Req." name="requiredHours" readOnly={isReadOnly}/>
                    </div>
                     {/* Fila 6 */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                         <NumberField label="Horas Trab." name="workedHours" readOnly={isReadOnly}/>
                         <NumberField label="Valor HE" name="overtimeValue" readOnly={isReadOnly}/>
                         <NumberField label="Valor HT" name="totalHoursValue" readOnly={isReadOnly}/>
                         <NumberField label="Ingresos" name="income" readOnly={isReadOnly}/>
                         <NumberField label="Comision" name="commission" readOnly={isReadOnly}/>
                    </div>
                    {/* Fila 7 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <SelectField label="Cotizable en nomina" name="isPayrollTaxable" options={['Si', 'No']} readOnly={isReadOnly}/>
                        <SelectField label="Base de comision" name="commissionBase" options={['Productos', 'Servicios', 'Ambos']} readOnly={isReadOnly}/>
                        <SelectField label="Descuento TSS" name="tssDeductionSchedule" options={['1. Quincena', '2. Quincena', 'Fin de Mes']} readOnly={isReadOnly}/>
                        <SelectField label="Descuento AFP" name="afpDeductionSchedule" options={['1. Quincena', '2. Quincena', 'Fin de Mes']} readOnly={isReadOnly}/>
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <PhotoUpload label="Foto Empleado" field="employeePhotoUrl" readOnly={isReadOnly}/>
                    <PhotoUpload label="Foto Identificacion" field="idPhotoUrl" readOnly={isReadOnly}/>
                </div>
            </div>
        </main>
        
        <footer className="flex justify-end gap-4 p-4 border-t bg-slate-50">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                {isReadOnly ? 'Cerrar' : 'Cancelar'}
            </button>
            {!isReadOnly && (
                <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 flex items-center gap-2">
                    <Save size={16}/> {mode === 'create' ? 'Guardar' : 'Guardar Cambios'}
                </button>
            )}
        </footer>
        <style>{`.input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; box-shadow: sm; placeholder-slate-400; font-size: 0.875rem; focus:outline-none focus:ring-sky-500 focus:border-sky-500; } .input-style:read-only, .input-style:disabled { background-color: #f1f5f9; cursor: not-allowed; color: #64748b; }`}</style>
      </form>
    </div>
  );
};