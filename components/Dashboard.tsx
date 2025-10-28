import React, { useContext } from 'react';
import { AppContext, AppContextType } from '../types';
import { CalendarView } from './CalendarView';
import { StaffManagement } from './StaffManagement';
import { CustomerManagement } from './CustomerManagement';
import { Chatbot } from './Chatbot';
import { CalendarManagement } from './CalendarManagement';
import { UnconfirmedAppointmentsView } from './UnconfirmedAppointmentsView';
import { AppointmentFormsView } from './AppointmentFormsView';
import { TechnicianCalendarView } from './TechnicianCalendarView';
import { AccessKeysManagement } from './AccessKeysManagement';
import { MaintenanceManagement } from './MaintenanceManagement';
import { SecretaryPerformanceView } from './SecretaryPerformanceView';
import { TechnicianPerformanceView } from './TechnicianPerformanceView';
import { InvoiceView } from './InvoiceView';
import { BankAccountManagement } from './BankAccountManagement';
import { InvoicePrintView } from './InvoicePrintView';
import { QuoteView } from './QuoteView';
import { WorkshopEquipmentView } from './WorkshopEquipmentView';
import { CompanySettingsView } from './CompanySettingsView';
import { CustomerMapView } from './CustomerMapView';

export const Dashboard: React.FC = () => {
  const { mode, invoiceToPrint } = useContext(AppContext) as AppContextType;

  if (invoiceToPrint) {
    return <InvoicePrintView />;
  }

  return (
    <div className="relative">
      {mode === 'calendar' && <CalendarView />}
      {mode === 'staff' && <StaffManagement />}
      {mode === 'customers' && <CustomerManagement />}
      {mode === 'calendars' && <CalendarManagement />}
      {mode === 'technician-calendar' && <TechnicianCalendarView />}
      {mode === 'unconfirmed-appointments' && <UnconfirmedAppointmentsView />}
      {mode === 'appointment-forms' && <AppointmentFormsView />}
      {mode === 'access-keys' && <AccessKeysManagement />}
      {mode === 'maintenance-schedules' && <MaintenanceManagement />}
      {mode === 'secretary-performance' && <SecretaryPerformanceView />}
      {mode === 'technician-performance' && <TechnicianPerformanceView />}
      {mode === 'facturacion' && <InvoiceView />}
      {mode === 'cotizaciones' && <QuoteView />}
      {mode === 'bank-accounts' && <BankAccountManagement />}
      {mode === 'workshop-equipment' && <WorkshopEquipmentView />}
      {mode === 'company-settings' && <CompanySettingsView />}
      {mode === 'customer-map' && <CustomerMapView />}
      <Chatbot />
    </div>
  );
};