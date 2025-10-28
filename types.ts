import React from 'react';

export interface ActionLog {
  action: 'Creado' | 'Confirmado' | 'Editado' | 'Reagendado' | 'Cancelado' | 'Estado Cambiado';
  timestamp: Date;
  userId: string; // Staff ID
  details?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  latitude?: number;
  longitude?: number;
  serviceHistory: string[]; // Array of ServiceOrder IDs
  createdById?: string; // Staff ID of creator
}

export type StaffRole = 'administrador' | 'coordinador' | 'tecnico' | 'secretaria';

export interface Staff {
  id: string;
  name: string;
  email: string;
  calendarId: string;
  role: StaffRole;
  personalPhone?: string;
  fleetPhone?: string;
  idNumber?: string;
  accessKey?: string;
  
  // New detailed fields
  code?: string;
  address?: string;
  salary?: number;
  startDate?: string; // "YYYY-MM-DD"
  tss?: number;
  afp?: number;
  loans?: number;
  workErrorDeduction?: number;
  otherDeductions?: number;
  discount?: number;
  requiredHours?: number;
  workedHours?: number;
  overtimeValue?: number;
  totalHoursValue?: number;
  income?: number;
  commission?: number;
  isPayrollTaxable?: 'Si' | 'No';
  commissionBase?: string;
  tssDeductionSchedule?: string;
  afpDeductionSchedule?: string;
  idPhotoUrl?: string; // Data URL for the image
  employeePhotoUrl?: string; // Data URL for the image
}

export interface TimeSlot {
    startTime: string; // "HH:MM"
    endTime: string; // "HH:MM"
}

export interface DailyAvailability {
  dayOfWeek: number; // 0 for Sunday, 1 for Monday, etc.
  slots: TimeSlot[];
}

export interface Calendar {
  id: string;
  name: string;
  userId: string; // Corresponds to Staff ID
  color: string;
  availability?: DailyAvailability[];
  active?: boolean;
}

export type ServiceOrderStatus = 'Pendiente' | 'En Proceso' | 'Completado' | 'Cancelado' | 'Por Confirmar' | 'Garantía' | 'No Agendado';

export interface ServiceOrder {
  id: string;
  serviceOrderNumber: string;
  title: string;
  start?: Date;
  end?: Date;
  calendarId?: string;
  isGoogleSynced: boolean;
  googleEventId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail?: string;
  latitude?: number;
  longitude?: number;
  applianceType: string; // e.g., "Lavadora Samsung"
  issueDescription: string;
  reminders?: { minutes: number }[];
  status: ServiceOrderStatus;
  serviceNotes?: string;
  isCheckupOnly?: boolean;
  createdAt: Date;
  createdById?: string; // Staff ID of creator
  confirmedById?: string; // Staff ID of confirmer
  attendedById?: string;
  archiveReason?: string;
  cancellationReason?: string;
  cancelledById?: string;
  rescheduledCount?: number;
  history?: ActionLog[];
}

export interface MaintenanceSchedule {
  id: string;
  customerId: string; // Link to Customer
  serviceDescription: string;
  frequencyMonths: 3 | 6 | 12;
  startDate: string; // "YYYY-MM-DD"
  nextDueDate: string; // "YYYY-MM-DD"
}

// --- INVOICING & FINANCE MODULE TYPES ---

export interface BankAccount {
    id: string;
    bankName: string;
    accountHolder: string;
    accountNumber: string;
}

export type ProductType = 'Inventario' | 'Manual';

export interface Product {
    id: string;
    name: string;
    description: string;
    purchasePrice: number;
    sellPrice1: number;
    sellPrice2: number;
    stock: number;
}

export interface Commission {
    technicianId: string;
    amount: number;
}

export interface InvoiceLineItem {
    id: string;
    type: ProductType;
    productId?: string; // Only for 'Inventario'
    description: string;
    quantity: number;
    purchasePrice: number;
    sellPrice: number;
    commission?: Commission;
}

export type InvoiceStatus = 'Borrador' | 'Emitida' | 'Pago Parcial' | 'Pagada' | 'Anulada';
export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Tarjeta de Crédito' | 'Tarjeta de Débito';

export interface PaymentDetails {
    method: PaymentMethod;
    amount: number;
    bankAccountId?: string; // Link to BankAccount
    cashReceived?: number;
    changeGiven?: number;
    paymentDate: Date;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    customerId: string;
    date: Date; // Emission date
    items: InvoiceLineItem[];
    subtotal: number;
    discount: number;
    taxes: number;
    total: number;
    isTaxable: boolean;
    status: InvoiceStatus;
    serviceOrderId?: string; // Link to the original service order
    serviceOrderDescription?: string;
    payments: PaymentDetails[];
    paidAmount: number;
}

export interface InvoicePrintPreview {
    invoice: Invoice;
    customer: Customer;
}

export type QuoteStatus = 'Borrador' | 'Enviada' | 'Aceptada' | 'Rechazada';

export interface Quote {
    id: string;
    quoteNumber: string;
    customerId: string;
    date: Date;
    items: InvoiceLineItem[];
    subtotal: number;
    discount: number;
    taxes: number;
    total: number;
    isTaxable: boolean;
    status: QuoteStatus;
    createdById?: string; // Staff ID of creator
}

// --- END INVOICING & FINANCE MODULE TYPES ---

// --- WORKSHOP MODULE TYPES ---

export type WorkshopEquipmentStatus = 'Recibido' | 'En Diagnóstico' | 'Esperando Repuesto' | 'En Reparación' | 'Listo para Retirar' | 'Entregado';

export interface WorkshopEquipment {
    id: string;
    entryDate: Date;
    customerId: string;
    equipmentType: string;
    brand: string;
    model: string;
    serialNumber: string;
    reportedFault: string;
    technicianId?: string;
    status: WorkshopEquipmentStatus;
    history: ActionLog[];
}


// --- END WORKSHOP MODULE TYPES ---
export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  logoUrl?: string; // Data URL for the logo
}

export type AppMode = 'calendar' | 'staff' | 'calendars' | 'customers' | 'technician-calendar' | 'unconfirmed-appointments' | 'appointment-forms' | 'access-keys' | 'maintenance-schedules' | 'secretary-performance' | 'technician-performance' | 'facturacion' | 'cotizaciones' | 'bank-accounts' | 'workshop-equipment' | 'company-settings' | 'customer-map';

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

export interface GoogleAuthState {
  token: any | null;
  user: GoogleUser | null;
}

export interface AppState {
  staff: Staff[];
  customers: Customer[];
  calendars: Calendar[];
  serviceOrders: ServiceOrder[];
  maintenanceSchedules: MaintenanceSchedule[];
  products: Product[];
  invoices: Invoice[];
  quotes: Quote[];
  workshopEquipment: WorkshopEquipment[];
  bankAccounts: BankAccount[];
  mode: AppMode;
  googleAuth: GoogleAuthState;
  publicFormAvailability: DailyAvailability[];
  currentUser: Staff | null;
  lastServiceOrderNumber: number;
  lastQuoteNumber: number;
  orderToConvertToInvoice: ServiceOrder | null;
  quoteToConvertToInvoice: Quote | null;
  invoiceToPrint: InvoicePrintPreview | null;
  invoiceMode: 'full' | 'advance';
  companyInfo: CompanyInfo;
}

export interface AppContextType extends AppState {
  setMode: (mode: AppMode) => void;
  setCurrentUser: (staff: Staff | null) => void;
  addServiceOrder: (order: Omit<ServiceOrder, 'id' | 'isGoogleSynced' | 'title' | 'status' | 'customerId' | 'createdById' | 'confirmedById' | 'attendedById' | 'isCheckupOnly' | 'archiveReason' | 'serviceOrderNumber' | 'cancellationReason' | 'createdAt' | 'history' | 'cancelledById' | 'rescheduledCount'> & { customerEmail: string }) => void;
  addUnconfirmedServiceOrder: (order: Omit<ServiceOrder, 'id' | 'isGoogleSynced' | 'title' | 'status' | 'calendarId' | 'customerId' | 'createdById' | 'confirmedById' | 'attendedById' | 'isCheckupOnly' | 'archiveReason' | 'serviceOrderNumber' | 'cancellationReason' | 'createdAt' | 'history' | 'cancelledById' | 'rescheduledCount'> & { customerEmail: string }) => void;
  confirmServiceOrder: (orderId: string, updatedData: Partial<ServiceOrder>) => void;
  updateServiceOrder: (orderId: string, updatedData: Partial<Omit<ServiceOrder, 'id' | 'isGoogleSynced' | 'googleEventId'>>) => void;
  deleteServiceOrder: (orderId: string, reason: string) => void;
  archiveServiceOrder: (orderId: string, attendedById: string, archiveReason: string) => void;
  addStaff: (staff: Omit<Staff, 'id' | 'calendarId'>) => void;
  updateStaff: (staffId: string, staffData: Omit<Staff, 'id' | 'calendarId'>) => void;
  deleteStaff: (staffId: string) => void;
  updateStaffRole: (staffId: string, role: StaffRole) => void;
  addCalendar: (calendar: Omit<Calendar, 'id' | 'color'>) => void;
  updateCalendar: (calendarId: string, calendarData: Partial<Omit<Calendar, 'id'>>) => void;
  deleteCalendar: (calendarId: string) => void;
  addCustomer: (customerData: Omit<Customer, 'id' | 'serviceHistory' | 'createdById'>) => void;
  updateCustomer: (customerId: string, customerData: Omit<Customer, 'id' | 'serviceHistory' | 'createdById'>) => void;
  loadCustomers: (customers: Customer[]) => void;
  signInToGoogle: () => void;
  signOutFromGoogle: () => void;
  isGoogleConfigMissing: boolean;
  updateServiceOrderReminders: (orderId: string, reminders: { minutes: number }[]) => void;
  updateServiceOrderStatus: (orderId: string, status: ServiceOrderStatus) => void;
  updateCalendarAvailability: (calendarId: string, availability: DailyAvailability[]) => void;
  updatePublicFormAvailability: (availability: DailyAvailability[]) => void;
  addAccessKey: (staffId: string, key: string) => void;
  deleteAccessKey: (staffId: string) => void;
  addMaintenanceSchedule: (schedule: Omit<MaintenanceSchedule, 'id' | 'nextDueDate'>) => void;
  updateMaintenanceSchedule: (scheduleId: string, scheduleData: Omit<MaintenanceSchedule, 'id'>) => void;
  deleteMaintenanceSchedule: (scheduleId: string) => void;
  // Invoicing functions
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'subtotal' | 'taxes' | 'total' | 'payments' | 'paidAmount'>) => string;
  updateInvoice: (invoiceId: string, invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'subtotal' | 'taxes' | 'total' | 'payments' | 'paidAmount'>) => void;
  recordInvoicePayment: (invoiceId: string, paymentDetails: PaymentDetails) => void;
  viewInvoice: (invoiceId: string) => void;
  setOrderToConvertToInvoice: (order: ServiceOrder | null) => void;
  setInvoiceToPrint: (preview: InvoicePrintPreview | null) => void;
  setInvoiceMode: (mode: 'full' | 'advance') => void;
  // Quote functions
  addQuote: (quote: Omit<Quote, 'id' | 'quoteNumber' | 'subtotal' | 'taxes' | 'total' | 'createdById'>) => string;
  updateQuote: (quoteId: string, quote: Omit<Quote, 'id' | 'quoteNumber' | 'subtotal' | 'taxes' | 'total'>) => void;
  deleteQuote: (quoteId: string) => void;
  setQuoteToConvertToInvoice: (quote: Quote | null) => void;
  // Bank Account functions
  addBankAccount: (account: Omit<BankAccount, 'id'>) => void;
  updateBankAccount: (accountId: string, account: Omit<BankAccount, 'id'>) => void;
  deleteBankAccount: (accountId: string) => void;
  // Workshop Equipment functions
  addWorkshopEquipment: (equipment: Omit<WorkshopEquipment, 'id' | 'history'>) => void;
  updateWorkshopEquipment: (equipmentId: string, equipmentData: Partial<Omit<WorkshopEquipment, 'id'>>) => void;
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
}

export const AppContext = React.createContext<AppContextType | null>(null);