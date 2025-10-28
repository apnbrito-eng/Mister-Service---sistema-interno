import React, { useContext, useState, useMemo, useRef, useEffect } from 'react';
import { AppContext, AppContextType, AppMode, Staff } from '../types';
import { Wrench, Users, User, CalendarDays, LogOut, AlertTriangle, Smartphone, FileText, CalendarCheck, Menu, X, Calendar as CalendarIcon, Key, ClipboardList, Activity, BarChart3, Receipt, Landmark, FileSpreadsheet, HardHat, Building2, Map } from 'lucide-react';
import { MobileAccessModal } from './MobileAccessModal';

const NavButton: React.FC<{ 
  targetMode: AppMode, 
  children: React.ReactNode, 
  count?: number, 
  hiddenForRoles?: Staff['role'][], 
  onClick: () => void,
  currentMode: AppMode,
  currentUser: Staff | null,
  isHighlighted?: boolean,
}> = ({ targetMode, children, count, hiddenForRoles = [], onClick, currentMode, currentUser, isHighlighted = false }) => {
  if (currentUser && hiddenForRoles.includes(currentUser.role)) {
    return null;
  }
  
  const baseClasses = `flex items-center gap-2 px-4 py-2 transition-colors w-full text-left text-sm rounded-md`;
  const activeClasses = currentMode === targetMode ? 'bg-sky-100 text-sky-800' : 'text-slate-700 hover:bg-slate-100';
  const highlightedClasses = isHighlighted ? 'bg-sky-50 hover:bg-sky-100' : '';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${activeClasses} ${highlightedClasses}`}
    >
      <div className="flex justify-between items-center w-full">
          <span className="flex items-center gap-2">{children}</span>
          {count !== undefined && count > 0 && (
               <span className="bg-red-500 text-white text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {count > 99 ? '99+' : count}
              </span>
          )}
      </div>
    </button>
  );
};

export const Header: React.FC = () => {
  const { 
    mode, setMode, googleAuth, signInToGoogle, signOutFromGoogle, isGoogleConfigMissing,
    serviceOrders, maintenanceSchedules, customers, calendars, staff, currentUser, setCurrentUser, companyInfo
  } = useContext(AppContext) as AppContextType;
  
  const isSynced = !!googleAuth.token;
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuRef]);

  const handleNavClick = (targetMode: AppMode) => {
    setMode(targetMode);
    setIsMenuOpen(false);
  };
  
  const {
    serviceOrdersCount,
    unconfirmedCount,
    dueMaintenanceCount,
    customersCount,
    calendarsCount
  } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueSchedules = maintenanceSchedules.filter(schedule => {
        const [year, month, day] = schedule.nextDueDate.split('-').map(s => parseInt(s, 10));
        const dueDate = new Date(year, month - 1, day);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() <= today.getTime();
    }).length;

    return {
      serviceOrdersCount: serviceOrders.filter(o => o.status !== 'Por Confirmar' && o.start).length,
      unconfirmedCount: serviceOrders.filter(o => o.status === 'Por Confirmar').length,
      dueMaintenanceCount: dueSchedules,
      customersCount: customers.length,
      calendarsCount: calendars.length,
    };
  }, [serviceOrders, maintenanceSchedules, customers, calendars]);
  
  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStaff = staff.find(s => s.id === e.target.value) || null;
    setCurrentUser(selectedStaff);
  };
  
  const handleMobileUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleUserChange(e);
    setIsMenuOpen(false);
  };

  const menuItems = (
    onClickHandler: (mode: AppMode) => void
  ) => (
    <>
      <div className="px-4 pt-2 pb-1 text-xs font-semibold uppercase text-slate-400">Gestión de Citas</div>
      <NavButton targetMode="calendar" count={serviceOrdersCount} onClick={() => onClickHandler('calendar')} currentMode={mode} currentUser={currentUser}><CalendarDays size={18} /><span>Órdenes de Servicio</span></NavButton>
      <NavButton targetMode="unconfirmed-appointments" count={unconfirmedCount} onClick={() => onClickHandler('unconfirmed-appointments')} currentMode={mode} currentUser={currentUser}><CalendarCheck size={18} /><span>Citas por Confirmar</span></NavButton>
      <NavButton targetMode="appointment-forms" onClick={() => onClickHandler('appointment-forms')} currentMode={mode} currentUser={currentUser}><FileText size={18} /><span>Formularios de Citas</span></NavButton>
      <NavButton targetMode="technician-calendar" onClick={() => onClickHandler('technician-calendar')} currentMode={mode} currentUser={currentUser}><CalendarIcon size={18} /><span>Calendario Técnico</span></NavButton>
      <NavButton targetMode="maintenance-schedules" count={dueMaintenanceCount} onClick={() => onClickHandler('maintenance-schedules')} currentMode={mode} currentUser={currentUser}><ClipboardList size={18} /><span>Mantenimiento</span></NavButton>
      
      <div className="border-t my-1 mx-2 border-slate-200"></div>
      
      <div className="px-4 pt-2 pb-1 text-xs font-semibold uppercase text-slate-400 bg-sky-50 -mx-1 py-1">Facturación</div>
      <div className="bg-sky-50 -mx-1">
        <NavButton targetMode="facturacion" isHighlighted hiddenForRoles={['tecnico', 'secretaria']} onClick={() => onClickHandler('facturacion')} currentMode={mode} currentUser={currentUser}><Receipt size={18}/><span>Facturas</span></NavButton>
        <NavButton targetMode="cotizaciones" isHighlighted hiddenForRoles={['tecnico', 'secretaria']} onClick={() => onClickHandler('cotizaciones')} currentMode={mode} currentUser={currentUser}><FileSpreadsheet size={18}/><span>Cotizaciones</span></NavButton>
        <NavButton targetMode="bank-accounts" isHighlighted hiddenForRoles={['tecnico', 'secretaria']} onClick={() => onClickHandler('bank-accounts')} currentMode={mode} currentUser={currentUser}><Landmark size={18}/><span>Cuentas Bancarias</span></NavButton>
      </div>

      <div className="border-t my-1 mx-2 border-slate-200"></div>

      <div className="px-4 pt-2 pb-1 text-xs font-semibold uppercase text-slate-400">Administración</div>
      <NavButton targetMode="customers" count={customersCount} onClick={() => onClickHandler('customers')} currentMode={mode} currentUser={currentUser}><User size={18} /><span>Clientes</span></NavButton>
      <NavButton targetMode="customer-map" onClick={() => onClickHandler('customer-map')} currentMode={mode} currentUser={currentUser}><Map size={18} /><span>Mapa de Clientes</span></NavButton>
      <NavButton targetMode="staff" onClick={() => onClickHandler('staff')} currentMode={mode} currentUser={currentUser}><Users size={18} /><span>Personal</span></NavButton>
      <NavButton targetMode="workshop-equipment" hiddenForRoles={['tecnico']} onClick={() => onClickHandler('workshop-equipment')} currentMode={mode} currentUser={currentUser}><HardHat size={18}/><span>Equipos en Taller</span></NavButton>
      <NavButton targetMode="calendars" count={calendarsCount} onClick={() => onClickHandler('calendars')} currentMode={mode} currentUser={currentUser}><CalendarDays size={18} /><span>Calendarios</span></NavButton>
      <NavButton targetMode="company-settings" hiddenForRoles={['tecnico', 'secretaria']} onClick={() => onClickHandler('company-settings')} currentMode={mode} currentUser={currentUser}><Building2 size={18}/><span>Datos de la Empresa</span></NavButton>
      <NavButton targetMode="access-keys" onClick={() => onClickHandler('access-keys')} currentMode={mode} currentUser={currentUser}><Key size={18} /><span>Claves de Acceso</span></NavButton>
      <NavButton targetMode="secretary-performance" hiddenForRoles={['tecnico']} onClick={() => onClickHandler('secretary-performance')} currentMode={mode} currentUser={currentUser}><Activity size={18}/><span>Rendimiento Sec.</span></NavButton>
      <NavButton targetMode="technician-performance" hiddenForRoles={['tecnico', 'secretaria']} onClick={() => onClickHandler('technician-performance')} currentMode={mode} currentUser={currentUser}><BarChart3 size={18}/><span>Rendimiento Téc.</span></NavButton>
    </>
  );

  const AuthSection: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => (
    <div className={`flex items-center gap-2 ${isMobile ? 'flex-col items-stretch space-y-4' : ''}`}>
      {isGoogleConfigMissing ? (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-md">
          <AlertTriangle size={14} /><span>Configura tu Google Client ID</span>
        </div>
      ) : isSynced ? (
          <div className="flex items-center gap-2">
            <div className="text-right text-sm">
                <div className="font-medium text-slate-800">{googleAuth.user?.name}</div>
                <div className="text-slate-500">{googleAuth.user?.email}</div>
            </div>
            <button onClick={signOutFromGoogle} title="Desconectar" className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <LogOut size={18} />
            </button>
          </div>
      ) : (
          <button onClick={signInToGoogle} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all bg-white text-slate-700 border border-slate-300 hover:bg-slate-50">
            <img src="https://www.google.com/images/icons/product/calendar-32.png" alt="Google Calendar" className="h-4 w-4" />
            <span>Conectar Calendario</span>
          </button>
      )}
      <button onClick={() => { setIsMobileModalOpen(true); setIsMenuOpen(false); }} className={`p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors ${isMobile ? 'flex items-center justify-center gap-2 w-full rounded-md border border-slate-300' : ''}`} title="Acceso Móvil">
          <Smartphone size={18} /> {isMobile && <span>Acceso Móvil</span>}
      </button>
    </div>
  );

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-[1001]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Side: Menu and Title */}
            <div className="flex items-center gap-2">
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(prev => !prev)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-md"
                  aria-label="Abrir menú principal"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                {isMenuOpen && (
                  <div className="absolute left-0 z-50 mt-2 w-72 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                     {/* Mobile-only header section in dropdown */}
                    <div className="p-4 space-y-4 border-b md:hidden">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Usuario Actual</label>
                             <select
                                value={currentUser?.id || ''}
                                onChange={handleMobileUserChange}
                                className="mt-1 w-full p-2 border border-slate-300 rounded-md"
                              >
                                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <AuthSection isMobile />
                    </div>
                    
                    {/* Navigation Links */}
                    <div className="py-1">
                      {menuItems(handleNavClick)}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Wrench className="h-6 w-6 text-sky-500" />
                <h1 className="text-xl font-bold text-slate-800">{companyInfo.name}</h1>
              </div>
            </div>

            {/* Right Side (Desktop) */}
            <div className="hidden md:flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="relative bg-slate-100 rounded-lg">
                    <select
                      value={currentUser?.id || ''}
                      onChange={handleUserChange}
                      className="appearance-none bg-transparent py-2 pl-8 pr-4 text-sm font-medium text-slate-600 focus:outline-none"
                    >
                      {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <User size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"/>
                  </div>
              </div>
              <AuthSection />
            </div>
          </div>
        </div>
      </header>

      <MobileAccessModal isOpen={isMobileModalOpen} onClose={() => setIsMobileModalOpen(false)} />
    </>
  );
};