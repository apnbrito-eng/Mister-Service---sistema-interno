import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AppState, ServiceOrder, Staff, AppContext, AppMode, Calendar, GoogleAuthState, Customer, DailyAvailability, StaffRole, ServiceOrderStatus, MaintenanceSchedule, AppContextType, ActionLog, Product, Invoice, BankAccount, PaymentDetails, InvoicePrintPreview, Quote, WorkshopEquipment, QuoteStatus, InvoiceStatus, CompanyInfo } from './types';
import { GoogleCalendarService } from './services/googleCalendarService';
import { EmailService } from './services/emailService';
import { GOOGLE_CLIENT_ID } from '../config';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const defaultAvailability: DailyAvailability[] = [
    { dayOfWeek: 1, slots: [{ startTime: '09:00', endTime: '10:00' }, { startTime: '11:00', endTime: '12:00' }, { startTime: '13:00', endTime: '14:00' }, { startTime: '15:00', endTime: '16:00' }, { startTime: '17:00', endTime: '18:00' }] },
    { dayOfWeek: 2, slots: [{ startTime: '09:00', endTime: '10:00' }, { startTime: '11:00', endTime: '12:00' }, { startTime: '13:00', endTime: '14:00' }, { startTime: '15:00', endTime: '16:00' }, { startTime: '17:00', endTime: '18:00' }] },
    { dayOfWeek: 3, slots: [{ startTime: '09:00', endTime: '10:00' }, { startTime: '11:00', endTime: '12:00' }, { startTime: '13:00', endTime: '14:00' }, { startTime: '15:00', endTime: '16:00' }, { startTime: '17:00', endTime: '18:00' }] },
    { dayOfWeek: 4, slots: [{ startTime: '09:00', endTime: '10:00' }, { startTime: '11:00', endTime: '12:00' }, { startTime: '13:00', endTime: '14:00' }, { startTime: '15:00', endTime: '16:00' }, { startTime: '17:00', endTime: '18:00' }] },
    { dayOfWeek: 5, slots: [{ startTime: '09:00', endTime: '10:00' }, { startTime: '11:00', endTime: '12:00' }, { startTime: '13:00', endTime: '14:00' }, { startTime: '15:00', endTime: '16:00' }, { startTime: '17:00', endTime: '18:00' }] },
    { dayOfWeek: 6, slots: [] },
    { dayOfWeek: 0, slots: [] },
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    const initialStaff: Staff[] = [
      { id: 's0', name: 'Admin General', email: 'admin@misterservicerd.com', calendarId: 'c0', role: 'administrador', personalPhone: '18091112233', fleetPhone: '18291112233', idNumber: '001-0012345-1' },
      { id: 's1', name: 'Lucía (Coordinadora)', email: 'lucia@misterservicerd.com', calendarId: 'c1', role: 'coordinador', personalPhone: '18092223344', fleetPhone: '18292223344', idNumber: '001-0054321-2' },
      { id: 's2', name: 'Marcos (Técnico)', email: 'marcos@misterservicerd.com', calendarId: 'c2', role: 'tecnico', personalPhone: '18093334455', fleetPhone: '18293334455', idNumber: '001-1234567-3' },
      { id: 's3', name: 'Elena (Técnica)', email: 'elena@misterservicerd.com', calendarId: 'c3', role: 'tecnico', personalPhone: '18094445566', fleetPhone: '18294445566', idNumber: '001-7654321-4' },
      { id: 's4', name: 'Ana (Secretaria)', email: 'ana@misterservicerd.com', calendarId: 'c4', role: 'secretaria', personalPhone: '18095556677', fleetPhone: '18295556677', idNumber: '001-1122334-5' },
    ];
    return {
      staff: initialStaff,
      customers: [
        { id: 'cust1', name: 'Carlos Rodríguez', phone: '18095551234', email: 'carlos.r@email.com', address: 'Av. Winston Churchill 101, Santo Domingo', serviceHistory: ['so1'], latitude: 18.4719, longitude: -69.9409 },
        { id: 'cust2', name: 'María Gómez', phone: '18295555678', email: 'maria.g@email.com', address: 'Calle El Sol 52, Santiago de los Caballeros', serviceHistory: ['so2'], latitude: 19.4517, longitude: -70.6970 },
        { id: 'cust3', name: 'Ana Pérez', phone: '18495559999', email: 'ana.p@email.com', address: 'Autopista Duarte Km 5, Santo Domingo Oeste', serviceHistory: ['so3'], latitude: 18.4988, longitude: -69.9684 },
        { id: 'cust4', name: 'Luis Marte', phone: '18095558888', email: 'luis.m@email.com', address: 'Calle Max Henríquez Ureña 72, Santo Domingo', serviceHistory: ['so4'], latitude: 18.4682, longitude: -69.9321 },
      ],
      calendars: [
        { id: 'c0', name: 'Calendario Admin', userId: 's0', color: '#D50000', availability: defaultAvailability, active: true },
        { id: 'c1', name: 'Calendario Coordinación', userId: 's1', color: '#F57C00', availability: defaultAvailability, active: true },
        { id: 'c2', name: 'Agenda Marcos', userId: 's2', color: '#039BE5', availability: defaultAvailability, active: true },
        { id: 'c3', name: 'Agenda Elena', userId: 's3', color: '#33B679', availability: defaultAvailability, active: true },
        { id: 'c4', name: 'Recepción', userId: 's4', color: '#8E24AA', availability: defaultAvailability, active: true },
      ],
      serviceOrders: [
        { id: 'so1', serviceOrderNumber: 'OS-0001', title: 'Reparación Lavadora - Carlos Rodríguez', start: new Date(new Date().setDate(new Date().getDate() + 1)), end: new Date(new Date().setDate(new Date().getDate() + 1)), calendarId: 'c2', isGoogleSynced: false, customerId: 'cust1', customerName: 'Carlos Rodríguez', customerPhone: '18095551234', customerAddress: 'Av. Winston Churchill 101, Santo Domingo', applianceType: 'Reparación Lavadora', issueDescription: 'No centrifuga, hace ruido extraño.', status: 'Completado', createdAt: new Date(), createdById: 's4', confirmedById: 's4', history: [{ action: 'Creado', timestamp: new Date(), userId: 's4' }, { action: 'Confirmado', timestamp: new Date(), userId: 's4' }] },
        { id: 'so2', serviceOrderNumber: 'OS-0002', title: 'Instalación Aire Acondicionado - María Gómez', start: new Date(new Date().setDate(new Date().getDate() + 2)), end: new Date(new Date().setDate(new Date().getDate() + 2)), calendarId: 'c3', isGoogleSynced: false, customerId: 'cust2', customerName: 'María Gómez', customerPhone: '18295555678', customerAddress: 'Calle El Sol 52, Santiago de los Caballeros', applianceType: 'Instalación Aire Acondicionado', issueDescription: 'Instalación completa en habitación principal.', status: 'Pendiente', createdAt: new Date(), createdById: 's4', history: [{ action: 'Creado', timestamp: new Date(), userId: 's4' }] },
        { 
          id: 'so3', 
          serviceOrderNumber: 'OS-0003',
          title: 'Revisión Aire Acondicionado - Ana Pérez', 
          isGoogleSynced: false, 
          customerId: 'cust3', 
          customerName: 'Ana Pérez', 
          customerPhone: '18495559999', 
          customerAddress: 'Autopista Duarte Km 5, Santo Domingo Oeste', 
          applianceType: 'Revisión Aire Acondicionado', 
          issueDescription: 'El aire no enfría lo suficiente.', 
          status: 'Por Confirmar',
          createdAt: new Date(),
          latitude: 18.4988, 
          longitude: -69.9684,
          history: [{ action: 'Creado', timestamp: new Date(), userId: 's4' }]
        },
        { 
          id: 'so4', 
          serviceOrderNumber: 'OS-0004',
          title: 'Mantenimiento Nevera - Luis Marte', 
          start: new Date(new Date().setHours(14, 0, 0, 0)),
          end: new Date(new Date().setHours(15, 0, 0, 0)),
          isGoogleSynced: false, 
          customerId: 'cust4', 
          customerName: 'Luis Marte', 
          customerPhone: '18095558888', 
          customerAddress: 'Calle Max Henríquez Ureña 72, Santo Domingo', 
          applianceType: 'Mantenimiento Nevera', 
          issueDescription: 'Hace escarcha en el congelador.', 
          status: 'Por Confirmar', 
          createdAt: new Date(),
          latitude: 18.4682, 
          longitude: -69.9321,
          history: [{ action: 'Creado', timestamp: new Date(), userId: 's4' }]
        },
      ],
      maintenanceSchedules: [],
      products: [
        { id: 'prod1', name: 'Filtro de Aire Universal', description: 'Filtro de aire para unidades de 5 a 10 toneladas', purchasePrice: 500, sellPrice1: 1200, sellPrice2: 1000, stock: 50 },
        { id: 'prod2', name: 'Gas Refrigerante R410a (libra)', description: 'Gas para recarga de sistemas de AC', purchasePrice: 350, sellPrice1: 800, sellPrice2: 750, stock: 200 },
        { id: 'prod3', name: 'Kit de Mantenimiento Básico', description: 'Incluye limpiador de serpentín y lubricante', purchasePrice: 800, sellPrice1: 2000, sellPrice2: 1800, stock: 30 },
      ],
      invoices: [],
      quotes: [],
      workshopEquipment: [],
      bankAccounts: [{id: 'ba1', bankName: 'Banco Popular', accountHolder: 'Mister Service RD SRL', accountNumber: '**** **** **** 1234'}],
      mode: 'calendar',
      googleAuth: { token: null, user: null },
      publicFormAvailability: defaultAvailability,
      currentUser: initialStaff[0] || null,
      lastServiceOrderNumber: 4,
      lastQuoteNumber: 0,
      orderToConvertToInvoice: null,
      quoteToConvertToInvoice: null,
      invoiceToPrint: null,
      invoiceMode: 'full',
      companyInfo: {
        name: 'Mister Service RD',
        address: 'Av. Los Próceres #38, Diamond Plaza, Local B3A',
        phone: '829-540-7493',
        whatsapp: '809-203-9601',
        email: 'misterservicerd@gmail.com',
        logoUrl: '',
      },
    }
  });

  const isGoogleConfigMissing = !GOOGLE_CLIENT_ID;
  let tokenClient: any = null;

  const setMode = (mode: AppMode) => {
    // When changing mode, clear any print previews
    setInvoiceToPrint(null);
    setAppState(prev => ({ ...prev, mode }));
  };
  const setCurrentUser = (user: Staff | null) => setAppState(prev => ({ ...prev, currentUser: user }));
  const setOrderToConvertToInvoice = (order: ServiceOrder | null) => setAppState(prev => ({ ...prev, orderToConvertToInvoice: order }));
  const setQuoteToConvertToInvoice = (quote: Quote | null) => setAppState(prev => ({ ...prev, quoteToConvertToInvoice: quote }));
  const setInvoiceToPrint = (preview: InvoicePrintPreview | null) => setAppState(prev => ({ ...prev, invoiceToPrint: preview }));
  const setInvoiceMode = (mode: 'full' | 'advance') => setAppState(prev => ({ ...prev, invoiceMode: mode }));

  const addStaff = (staffData: Omit<Staff, 'id' | 'calendarId'>) => {
    setAppState(prev => {
      const newStaffId = `s${Date.now()}`;
      const newCalendarId = `c${Date.now()}`;
      const newStaff: Staff = { ...staffData, id: newStaffId, calendarId: newCalendarId };
      const newCalendar: Calendar = {
        id: newCalendarId,
        name: `Agenda de ${staffData.name}`,
        userId: newStaffId,
        color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
        availability: defaultAvailability,
        active: true,
      };
      return { ...prev, staff: [...prev.staff, newStaff], calendars: [...prev.calendars, newCalendar] };
    });
  };

  const updateStaff = (staffId: string, staffData: Omit<Staff, 'id' | 'calendarId'>) => {
    setAppState(prev => ({
      ...prev,
      staff: prev.staff.map(s => (s.id === staffId ? { ...s, ...staffData } : s)),
    }));
  };

  const deleteStaff = (staffId: string) => {
    setAppState(prev => {
      const staffToDelete = prev.staff.find(s => s.id === staffId);
      if (!staffToDelete) return prev;

      const admins = prev.staff.filter(s => s.role === 'administrador');
      if (staffToDelete.role === 'administrador' && admins.length === 1) {
          alert('No se puede eliminar al único administrador del sistema.');
          return prev;
      }
      
      const calendarIdToDelete = staffToDelete.calendarId;

      const updatedServiceOrders = prev.serviceOrders.map(order => {
        if (order.calendarId === calendarIdToDelete) {
          const { calendarId, ...rest } = order;
          return { ...rest, status: 'Por Confirmar' as ServiceOrderStatus };
        }
        return order;
      });

      const updatedStaff = prev.staff.filter(s => s.id !== staffId);
      const updatedCalendars = prev.calendars.filter(c => c.id !== calendarIdToDelete);

      return {
        ...prev,
        staff: updatedStaff,
        calendars: updatedCalendars,
        serviceOrders: updatedServiceOrders,
        currentUser: prev.currentUser?.id === staffId ? updatedStaff[0] || null : prev.currentUser,
      };
    });
  };

  const updateStaffRole = (staffId: string, role: StaffRole) => {
    setAppState(prev => {
        const admins = prev.staff.filter(s => s.role === 'administrador');
        const targetStaff = prev.staff.find(s => s.id === staffId);
        if (admins.length === 1 && targetStaff?.role === 'administrador' && role !== 'administrador') {
            alert('No se puede cambiar el rol del único administrador.');
            return prev;
        }
        return {
            ...prev,
            staff: prev.staff.map(s => s.id === staffId ? { ...s, role } : s),
        };
    });
  };

  const addCalendar = (calendarData: Omit<Calendar, 'id' | 'color'>) => {
    setAppState(prev => {
      const newCalendar: Calendar = {
        ...calendarData,
        id: `c${Date.now()}`,
        color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
        availability: defaultAvailability,
        active: true,
      };
      return { ...prev, calendars: [...prev.calendars, newCalendar] };
    });
  };
  
  const updateCalendar = (calendarId: string, calendarData: Partial<Omit<Calendar, 'id'>>) => {
    setAppState(prev => ({
        ...prev,
        calendars: prev.calendars.map(c => c.id === calendarId ? { ...c, ...calendarData } : c),
    }));
  };

  const deleteCalendar = (calendarId: string) => {
    const isPrimaryCalendar = appState.staff.some(s => s.calendarId === calendarId);
    if (isPrimaryCalendar) {
        alert('No se puede eliminar un calendario que está asignado como principal a un miembro del personal. Primero, gestiona al miembro del personal.');
        return;
    }

    setAppState(prev => ({
        ...prev,
        calendars: prev.calendars.filter(c => c.id !== calendarId),
    }));
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'serviceHistory' | 'createdById'>) => {
    setAppState(prev => {
      const newCustomer: Customer = { 
          ...customerData, 
          id: `cust${Date.now()}`, 
          serviceHistory: [],
          createdById: prev.currentUser?.id,
      };
      return { ...prev, customers: [...prev.customers, newCustomer] };
    });
  };

  const updateCustomer = (customerId: string, customerData: Omit<Customer, 'id' | 'serviceHistory' | 'createdById'>) => {
    setAppState(prev => ({
        ...prev,
        customers: prev.customers.map(c => c.id === customerId ? { ...c, ...customerData } : c),
    }));
  };

  const loadCustomers = (customers: Customer[]) => {
    if (Array.isArray(customers) && customers.every(c => c.id && c.name && c.phone)) {
        setAppState(prev => ({ ...prev, customers }));
    } else {
        alert("El formato del archivo es incorrecto.");
    }
  };

  const addServiceOrder = useCallback((orderData: Omit<ServiceOrder, 'id' | 'isGoogleSynced' | 'title' | 'status' | 'customerId' | 'createdById' | 'confirmedById' | 'attendedById' | 'isCheckupOnly' | 'archiveReason' | 'serviceOrderNumber' | 'cancellationReason' | 'createdAt' | 'history' | 'cancelledById' | 'rescheduledCount'> & { customerEmail: string }) => {
    setAppState(prev => {
      let customerId: string;
      let existingCustomer = prev.customers.find(c => c.phone === orderData.customerPhone);
      let newCustomer: Customer | null = null;
      let updatedCustomers = [...prev.customers];

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        customerId = `cust${Date.now()}`;
        newCustomer = {
          id: customerId,
          name: orderData.customerName,
          phone: orderData.customerPhone,
          email: orderData.customerEmail,
          address: orderData.customerAddress,
          latitude: orderData.latitude,
          longitude: orderData.longitude,
          serviceHistory: [],
          createdById: prev.currentUser?.id,
        };
        updatedCustomers.push(newCustomer);
      }

      const newOrderNumber = prev.lastServiceOrderNumber + 1;
      const formattedOrderNumber = `OS-${String(newOrderNumber).padStart(4, '0')}`;
      
      const newOrder: ServiceOrder = {
        ...orderData,
        id: `so${Date.now()}`,
        serviceOrderNumber: formattedOrderNumber,
        title: `${orderData.applianceType} - ${orderData.customerName}`,
        isGoogleSynced: false,
        customerId,
        status: 'Por Confirmar',
        createdAt: new Date(),
        createdById: prev.currentUser?.id,
        history: [{
            action: 'Creado',
            timestamp: new Date(),
            userId: prev.currentUser!.id,
            details: 'Cita creada por personal interno.'
        }]
      };

      EmailService.sendNewServiceOrderNotification(newOrder);

      const finalCustomers = updatedCustomers.map(c =>
        c.id === customerId
          ? { ...c, serviceHistory: [...c.serviceHistory, newOrder.id] }
          : c
      );

      return {
        ...prev,
        customers: finalCustomers,
        serviceOrders: [...prev.serviceOrders, newOrder],
        lastServiceOrderNumber: newOrderNumber,
      };
    });
  }, []);

  const addUnconfirmedServiceOrder = useCallback((orderData: Omit<ServiceOrder, 'id' | 'isGoogleSynced' | 'title' | 'status' | 'calendarId' | 'customerId' | 'createdById' | 'confirmedById' | 'attendedById' | 'isCheckupOnly' | 'archiveReason' | 'serviceOrderNumber' | 'cancellationReason' | 'createdAt' | 'history' | 'cancelledById' | 'rescheduledCount'> & { customerEmail: string }) => {
    setAppState(prev => {
      let customerId: string;
      let newCustomers = [...prev.customers];
      let existingCustomer = prev.customers.find(c => c.phone === orderData.customerPhone);

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const newCustomerId = `cust${Date.now()}`;
        const newCustomer: Customer = {
          id: newCustomerId,
          name: orderData.customerName,
          phone: orderData.customerPhone,
          email: orderData.customerEmail,
          address: orderData.customerAddress,
          latitude: orderData.latitude,
          longitude: orderData.longitude,
          serviceHistory: [],
        };
        newCustomers.push(newCustomer);
        customerId = newCustomerId;
      }

      const newOrderNumber = prev.lastServiceOrderNumber + 1;
      const formattedOrderNumber = `OS-${String(newOrderNumber).padStart(4, '0')}`;

      const newOrder: ServiceOrder = {
        ...orderData,
        id: `so${Date.now()}`,
        serviceOrderNumber: formattedOrderNumber,
        title: `${orderData.applianceType} - ${orderData.customerName}`,
        isGoogleSynced: false,
        customerId,
        status: 'Por Confirmar',
        createdAt: new Date(),
        history: [{
            action: 'Creado',
            timestamp: new Date(),
            userId: 'public_form',
            details: 'Cita creada desde formulario público.'
        }]
      };
      
      EmailService.sendNewServiceOrderNotification(newOrder);

      return {
        ...prev,
        customers: newCustomers,
        serviceOrders: [...prev.serviceOrders, newOrder],
        lastServiceOrderNumber: newOrderNumber,
      };
    });
  }, []);

  const confirmServiceOrder = useCallback(async (orderId: string, updatedData: Partial<ServiceOrder>) => {
    let confirmedOrder: ServiceOrder | null = null;
  
    setAppState(prev => {
      const orderToConfirm = prev.serviceOrders.find(o => o.id === orderId);
      if (!orderToConfirm) return prev;
  
      confirmedOrder = {
        ...orderToConfirm,
        ...updatedData,
        status: 'Pendiente',
        confirmedById: prev.currentUser?.id,
        history: [
            ...(orderToConfirm.history || []),
            {
                action: 'Confirmado',
                timestamp: new Date(),
                userId: prev.currentUser!.id,
            }
        ]
      };
  
      if (!confirmedOrder.createdById) {
        confirmedOrder.createdById = prev.currentUser?.id;
      }
      
      let updatedCustomers = prev.customers;
      const customer = prev.customers.find(c => c.id === confirmedOrder!.customerId);
      if (customer && !customer.createdById) {
          updatedCustomers = prev.customers.map(c =>
              c.id === customer.id ? { ...c, createdById: prev.currentUser?.id } : c
          );
      }
  
      return {
        ...prev,
        serviceOrders: prev.serviceOrders.map(o => o.id === orderId ? confirmedOrder! : o),
        customers: updatedCustomers,
      };
    });
  
    if (appState.googleAuth.token && confirmedOrder) {
      if (!confirmedOrder.start || !confirmedOrder.end || !confirmedOrder.calendarId) {
        console.error("Faltan datos de la cita (inicio, fin, calendario) para sincronizar la orden.");
        return;
      }
      try {
        if (confirmedOrder.isGoogleSynced && confirmedOrder.googleEventId) {
          await GoogleCalendarService.patchEvent(confirmedOrder.googleEventId, confirmedOrder.calendarId, {
            summary: `${confirmedOrder.applianceType} - ${confirmedOrder.customerName} [${confirmedOrder.status}]`,
            description: GoogleCalendarService.buildEventDescription(confirmedOrder),
            colorId: GoogleCalendarService.getStatusColorId(confirmedOrder.status),
            start: { dateTime: confirmedOrder.start.toISOString() },
            end: { dateTime: confirmedOrder.end.toISOString() },
          });
        } else {
          const event = await GoogleCalendarService.createEvent(confirmedOrder, confirmedOrder.calendarId);
          setAppState(prev => ({
            ...prev,
            serviceOrders: prev.serviceOrders.map(o => o.id === orderId ? { ...o, isGoogleSynced: true, googleEventId: event.id } : o),
          }));
        }
      } catch (err) {
        console.error("Error al sincronizar con Google Calendar:", err);
        alert("Hubo un error al sincronizar la cita con Google Calendar. Por favor, verifica la conexión.");
      }
    }
}, [appState.googleAuth.token]);

const updateServiceOrder = useCallback(async (orderId: string, updatedData: Partial<Omit<ServiceOrder, 'id' | 'isGoogleSynced' | 'googleEventId'>>) => {
    let originalOrder: ServiceOrder | undefined;
    let newOrderState: ServiceOrder | undefined;
    setAppState(prev => {
        originalOrder = prev.serviceOrders.find(o => o.id === orderId);
        if (!originalOrder) return prev;

        const wasRescheduled = (updatedData.start && originalOrder.start && new Date(updatedData.start).getTime() !== new Date(originalOrder.start).getTime()) ||
                               (updatedData.calendarId && originalOrder.calendarId && updatedData.calendarId !== originalOrder.calendarId);

        newOrderState = {
            ...originalOrder,
            ...updatedData,
            history: [
                ...(originalOrder.history || []),
                {
                    action: wasRescheduled ? 'Reagendado' : 'Editado',
                    timestamp: new Date(),
                    userId: prev.currentUser!.id,
                }
            ],
            rescheduledCount: wasRescheduled ? (originalOrder.rescheduledCount || 0) + 1 : originalOrder.rescheduledCount
        };

        return {
            ...prev,
            serviceOrders: prev.serviceOrders.map(o => o.id === orderId ? newOrderState! : o)
        };
    });

    if (appState.googleAuth.token && newOrderState && newOrderState.isGoogleSynced && newOrderState.googleEventId && newOrderState.calendarId) {
        try {
            const originalCalendarId = originalOrder?.calendarId;
            const newCalendarId = newOrderState.calendarId;

            if (originalCalendarId && newCalendarId && originalCalendarId !== newCalendarId) {
                await GoogleCalendarService.moveEvent(newOrderState.googleEventId, originalCalendarId, newCalendarId);
            }

            await GoogleCalendarService.patchEvent(newOrderState.googleEventId, newCalendarId, {
                summary: newOrderState.title,
                description: GoogleCalendarService.buildEventDescription(newOrderState),
                colorId: GoogleCalendarService.getStatusColorId(newOrderState.status),
                start: { dateTime: newOrderState.start!.toISOString() },
                end: { dateTime: newOrderState.end!.toISOString() },
            });
        } catch (err) {
            console.error("Error updating Google Calendar event:", err);
            alert("Hubo un error al actualizar la cita en Google Calendar.");
        }
    }
}, [appState.googleAuth.token]);

const deleteServiceOrder = useCallback((orderId: string, reason: string) => {
  setAppState(prev => {
      const orderToCancel = prev.serviceOrders.find(o => o.id === orderId);
      if (!orderToCancel) return prev;

      const cancelledOrder: ServiceOrder = {
          ...orderToCancel,
          status: 'Cancelado',
          cancellationReason: reason,
          cancelledById: prev.currentUser!.id,
          history: [
              ...(orderToCancel.history || []),
              {
                  action: 'Cancelado',
                  timestamp: new Date(),
                  userId: prev.currentUser!.id,
                  details: `Motivo: ${reason}`
              }
          ]
      };

      if (prev.googleAuth.token && cancelledOrder.isGoogleSynced && cancelledOrder.googleEventId && cancelledOrder.calendarId) {
          GoogleCalendarService.patchEvent(cancelledOrder.googleEventId, cancelledOrder.calendarId, {
              summary: `${cancelledOrder.applianceType} - ${cancelledOrder.customerName} [CANCELADO]`,
              colorId: GoogleCalendarService.getStatusColorId('Cancelado'),
          }).catch(err => console.error("Failed to update Google event status to cancelled:", err));
      }

      return {
          ...prev,
          serviceOrders: prev.serviceOrders.map(o => o.id === orderId ? cancelledOrder : o)
      };
  });
}, []);

const archiveServiceOrder = useCallback((orderId: string, attendedById: string, archiveReason: string) => {
    setAppState(prev => ({
        ...prev,
        serviceOrders: prev.serviceOrders.map(o => 
            o.id === orderId ? { ...o, status: 'No Agendado', attendedById, archiveReason } : o
        )
    }));
}, []);

const updateServiceOrderReminders = async (orderId: string, reminders: { minutes: number }[]) => {
    setAppState(prev => ({
        ...prev,
        serviceOrders: prev.serviceOrders.map(o => o.id === orderId ? { ...o, reminders } : o)
    }));

    const order = appState.serviceOrders.find(o => o.id === orderId);
    if (appState.googleAuth.token && order && order.isGoogleSynced && order.googleEventId && order.calendarId) {
        try {
            await GoogleCalendarService.patchEvent(order.googleEventId, order.calendarId, { reminders });
        } catch (err) {
            console.error("Error updating Google Calendar reminders:", err);
            alert("Hubo un error al actualizar los recordatorios en Google Calendar.");
        }
    }
};

const updateServiceOrderStatus = async (orderId: string, status: ServiceOrderStatus) => {
    setAppState(prev => ({
        ...prev,
        serviceOrders: prev.serviceOrders.map(o => o.id === orderId ? { ...o, status } : o)
    }));

    const order = appState.serviceOrders.find(o => o.id === orderId);
    if (appState.googleAuth.token && order && order.isGoogleSynced && order.googleEventId && order.calendarId) {
        try {
            await GoogleCalendarService.patchEvent(order.googleEventId, order.calendarId, {
                summary: `${order.applianceType} - ${order.customerName} [${status}]`,
                colorId: GoogleCalendarService.getStatusColorId(status),
            });
        } catch (err) {
            console.error("Error updating Google Calendar status:", err);
            alert("Hubo un error al actualizar el estado en Google Calendar.");
        }
    }
};

const updateCalendarAvailability = (calendarId: string, availability: DailyAvailability[]) => {
    setAppState(prev => ({
        ...prev,
        calendars: prev.calendars.map(c => c.id === calendarId ? { ...c, availability } : c),
    }));
};

const updatePublicFormAvailability = (availability: DailyAvailability[]) => {
    setAppState(prev => ({...prev, publicFormAvailability: availability }));
};

const addAccessKey = (staffId: string, key: string) => {
    setAppState(prev => ({
        ...prev,
        staff: prev.staff.map(s => s.id === staffId ? { ...s, accessKey: key } : s)
    }));
};

const deleteAccessKey = (staffId: string) => {
    setAppState(prev => ({
        ...prev,
        staff: prev.staff.map(s => {
            if (s.id === staffId) {
                const { accessKey, ...rest } = s;
                return rest;
            }
            return s;
        })
    }));
};

const addMaintenanceSchedule = (scheduleData: Omit<MaintenanceSchedule, 'id' | 'nextDueDate'>) => {
    setAppState(prev => {
        const nextDueDate = new Date(scheduleData.startDate);
        nextDueDate.setMonth(nextDueDate.getMonth() + scheduleData.frequencyMonths);
        const newSchedule: MaintenanceSchedule = {
            ...scheduleData,
            id: `ms${Date.now()}`,
            nextDueDate: nextDueDate.toISOString().split('T')[0],
        };
        return { ...prev, maintenanceSchedules: [...prev.maintenanceSchedules, newSchedule] };
    });
};

const updateMaintenanceSchedule = (scheduleId: string, scheduleData: Omit<MaintenanceSchedule, 'id'>) => {
    setAppState(prev => ({
        ...prev,
        maintenanceSchedules: prev.maintenanceSchedules.map(s =>
            s.id === scheduleId ? { ...s, ...scheduleData } : s
        ),
    }));
};

const deleteMaintenanceSchedule = (scheduleId: string) => {
    setAppState(prev => ({
        ...prev,
        maintenanceSchedules: prev.maintenanceSchedules.filter(s => s.id !== scheduleId),
    }));
};

const handleAuthChange = (tokenResponse: any) => {
    if (tokenResponse.access_token) {
        setAppState(prev => ({ ...prev, googleAuth: { ...prev.googleAuth, token: tokenResponse }}));
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` }
        })
        .then(res => res.json())
        .then(data => {
            setAppState(prev => ({ ...prev, googleAuth: { ...prev.googleAuth, user: { name: data.name, email: data.email, picture: data.picture } }}));
        });
    } else {
        console.error("Auth failed", tokenResponse);
        setAppState(prev => ({...prev, googleAuth: { token: null, user: null } }));
    }
};

const signInToGoogle = () => {
    if (tokenClient) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        console.error("Google token client not initialized.");
    }
};

const signOutFromGoogle = () => {
    const token = appState.googleAuth.token;
    if (token) {
        window.google.accounts.oauth2.revoke(token.access_token, () => {
            setAppState(prev => ({...prev, googleAuth: { token: null, user: null } }));
        });
    }
};

useEffect(() => {
    if (isGoogleConfigMissing) {
        console.warn("Falta el ID de Cliente de Google. La integración con el calendario está deshabilitada.");
        return;
    }

    const initGapi = () => {
        window.gapi.load('client', async () => {
            await GoogleCalendarService.initGapiClient();
            
            const client = GoogleCalendarService.initTokenClient(handleAuthChange);
            if(client) {
                tokenClient = client;
            } else {
                console.error("Failed to initialize Google Token Client.");
            }
        });
    };

    if (window.gapi) {
        initGapi();
    }
}, [isGoogleConfigMissing]);

const checkForDueMaintenance = useCallback(() => {
    setAppState(prev => {
        const todayStr = new Date().toISOString().split('T')[0];
        let hasChanges = false;
        let newServiceOrders: ServiceOrder[] = [];
        let newLastServiceOrderNumber = prev.lastServiceOrderNumber;

        const newSchedules = prev.maintenanceSchedules.map(schedule => {
            if (schedule.nextDueDate <= todayStr) {
                const customer = prev.customers.find(c => c.id === schedule.customerId);
                if (!customer) return schedule;

                const existingOrder = prev.serviceOrders.some(o =>
                    o.customerId === customer.id &&
                    o.issueDescription.includes(`Mantenimiento programado: ${schedule.serviceDescription}`) &&
                    (o.status === 'Por Confirmar' || o.status === 'Pendiente')
                );

                if (!existingOrder) {
                    hasChanges = true;
                    newLastServiceOrderNumber++;
                    const newOrder: ServiceOrder = {
                        id: `so${Date.now()}${Math.random()}`,
                        serviceOrderNumber: `OS-${String(newLastServiceOrderNumber).padStart(4, '0')}`,
                        title: `Mantenimiento: ${schedule.serviceDescription} - ${customer.name}`,
                        isGoogleSynced: false,
                        customerId: customer.id,
                        customerName: customer.name,
                        customerPhone: customer.phone,
                        customerAddress: customer.address,
                        latitude: customer.latitude,
                        longitude: customer.longitude,
                        applianceType: `Mantenimiento: ${schedule.serviceDescription}`,
                        issueDescription: `Mantenimiento programado: ${schedule.serviceDescription}`,
                        status: 'Por Confirmar',
                        createdAt: new Date(),
                        history: [{ action: 'Creado', timestamp: new Date(), userId: 'system', details: 'Generado automáticamente por programa de mantenimiento.' }]
                    };
                    newServiceOrders.push(newOrder);

                    const nextDueDate = new Date(schedule.nextDueDate);
                    nextDueDate.setMonth(nextDueDate.getMonth() + schedule.frequencyMonths);
                    return { ...schedule, nextDueDate: nextDueDate.toISOString().split('T')[0] };
                }
            }
            return schedule;
        });

        if (hasChanges) {
            return {
                ...prev,
                maintenanceSchedules: newSchedules,
                serviceOrders: [...prev.serviceOrders, ...newServiceOrders],
                lastServiceOrderNumber: newLastServiceOrderNumber
            };
        }
        return prev;
    });
}, []);


useEffect(() => {
    const interval = setInterval(() => {
        checkForDueMaintenance();
    }, 1000 * 60 * 60); // Check every hour
    checkForDueMaintenance(); // Check once on startup
    return () => clearInterval(interval);
}, [checkForDueMaintenance]);

// --- INVOICING & FINANCE FUNCTIONS ---

const addBankAccount = (account: Omit<BankAccount, 'id'>) => {
    setAppState(prev => ({
        ...prev,
        bankAccounts: [...prev.bankAccounts, { ...account, id: `ba-${Date.now()}` }]
    }));
};
const updateBankAccount = (accountId: string, account: Omit<BankAccount, 'id'>) => {
    setAppState(prev => ({
        ...prev,
        bankAccounts: prev.bankAccounts.map(ba => ba.id === accountId ? { ...ba, ...account } : ba)
    }));
};
const deleteBankAccount = (accountId: string) => {
    setAppState(prev => ({
        ...prev,
        bankAccounts: prev.bankAccounts.filter(ba => ba.id !== accountId)
    }));
};

const calculateInvoiceTotals = (invoiceData: Pick<Invoice, 'items' | 'discount' | 'isTaxable'>) => {
    const subtotal = invoiceData.items.reduce((acc, item) => acc + (item.sellPrice * item.quantity), 0);
    const subtotalAfterDiscount = subtotal - invoiceData.discount;
    const taxes = invoiceData.isTaxable ? subtotalAfterDiscount * 0.18 : 0;
    const total = subtotalAfterDiscount + taxes;
    return { subtotal, taxes, total };
};

const addInvoice = useCallback((invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'subtotal' | 'taxes' | 'total' | 'payments' | 'paidAmount'>): string => {
    let newInvoiceId = '';
    setAppState(prev => {
        const lastInvoiceNumber = prev.invoices.length > 0 ? Math.max(0, ...prev.invoices.map(inv => parseInt(inv.invoiceNumber.split('-')[1], 10))) : 0;
        const newInvoiceNumber = `F-${String(lastInvoiceNumber + 1).padStart(6, '0')}`;
        const totals = calculateInvoiceTotals(invoiceData);
        newInvoiceId = `inv-${Date.now()}`;

        const newInvoice: Invoice = {
            ...invoiceData,
            id: newInvoiceId,
            invoiceNumber: newInvoiceNumber,
            ...totals,
            payments: [],
            paidAmount: 0,
        };
        return {
            ...prev,
            invoices: [...prev.invoices, newInvoice]
        };
    });
    return newInvoiceId;
}, []);

const updateInvoice = useCallback((invoiceId: string, invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'subtotal' | 'taxes' | 'total' | 'payments' | 'paidAmount'>) => {
    setAppState(prev => {
        const originalInvoice = prev.invoices.find(inv => inv.id === invoiceId);
        if (!originalInvoice) {
            console.error("Invoice not found for update");
            return prev;
        }

        if (originalInvoice.status === 'Pagada' || originalInvoice.status === 'Anulada') {
            alert("No se puede editar una factura que ya ha sido pagada o anulada.");
            return prev;
        }
        
        const totals = calculateInvoiceTotals(invoiceData);

        const updatedInvoice: Invoice = {
            ...originalInvoice,
            ...invoiceData,
            ...totals
        };

        return {
            ...prev,
            invoices: prev.invoices.map(inv => inv.id === invoiceId ? updatedInvoice : inv)
        };
    });
}, []);

const recordInvoicePayment = (invoiceId: string, paymentDetails: PaymentDetails) => {
    setAppState(prev => {
        const invoiceToPay = prev.invoices.find(inv => inv.id === invoiceId);
        if (!invoiceToPay) return prev;

        const newPayments = [...invoiceToPay.payments, paymentDetails];
        const newPaidAmount = newPayments.reduce((acc, p) => acc + p.amount, 0);

        let newStatus: InvoiceStatus = 'Pago Parcial';
        if (newPaidAmount >= invoiceToPay.total) {
            newStatus = 'Pagada';
        }

        const paidInvoice: Invoice = {
            ...invoiceToPay,
            payments: newPayments,
            paidAmount: newPaidAmount,
            status: newStatus,
        };

        if (newStatus === 'Pagada' || newStatus === 'Pago Parcial') {
            const customer = prev.customers.find(c => c.id === paidInvoice.customerId);
            if (customer) {
                setInvoiceToPrint({ invoice: paidInvoice, customer });
            }
        }

        return {
            ...prev,
            invoices: prev.invoices.map(inv => inv.id === invoiceId ? paidInvoice : inv)
        };
    });
};

const viewInvoice = (invoiceId: string) => {
    setAppState(prev => {
        const invoice = prev.invoices.find(inv => inv.id === invoiceId);
        if (!invoice) return prev;
        
        const customer = prev.customers.find(c => c.id === invoice.customerId);
        if (!customer) return prev;

        return {
            ...prev,
            invoiceToPrint: { invoice, customer }
        };
    });
};

// --- QUOTING FUNCTIONS ---
const calculateQuoteTotals = (quoteData: Pick<Quote, 'items' | 'discount' | 'isTaxable'>) => {
    const subtotal = quoteData.items.reduce((acc, item) => acc + (item.sellPrice * item.quantity), 0);
    const subtotalAfterDiscount = subtotal - quoteData.discount;
    const taxes = quoteData.isTaxable ? subtotalAfterDiscount * 0.18 : 0;
    const total = subtotalAfterDiscount + taxes;
    return { subtotal, taxes, total };
};

const addQuote = useCallback((quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'subtotal' | 'taxes' | 'total' | 'createdById'>): string => {
    let newQuoteId = '';
    setAppState(prev => {
        const newQuoteNumberVal = prev.lastQuoteNumber + 1;
        const newQuoteNumber = `COT-${String(newQuoteNumberVal).padStart(6, '0')}`;
        const totals = calculateQuoteTotals(quoteData);
        newQuoteId = `qt-${Date.now()}`;

        const newQuote: Quote = {
            ...quoteData,
            id: newQuoteId,
            quoteNumber: newQuoteNumber,
            ...totals,
            createdById: prev.currentUser?.id,
        };
        return {
            ...prev,
            quotes: [...prev.quotes, newQuote],
            lastQuoteNumber: newQuoteNumberVal
        };
    });
    return newQuoteId;
}, []);

const updateQuote = useCallback((quoteId: string, quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'subtotal' | 'taxes' | 'total'>) => {
    setAppState(prev => {
        const originalQuote = prev.quotes.find(q => q.id === quoteId);
        if (!originalQuote) {
            console.error("Quote not found for update");
            return prev;
        }
        
        const totals = calculateQuoteTotals(quoteData);

        const updatedQuote: Quote = {
            ...originalQuote,
            ...quoteData,
            ...totals
        };

        return {
            ...prev,
            quotes: prev.quotes.map(q => q.id === quoteId ? updatedQuote : q)
        };
    });
}, []);

const deleteQuote = useCallback((quoteId: string) => {
    setAppState(prev => ({
        ...prev,
        quotes: prev.quotes.filter(q => q.id !== quoteId),
    }));
}, []);
// --- END QUOTING FUNCTIONS ---

// --- WORKSHOP EQUIPMENT FUNCTIONS ---

const addWorkshopEquipment = (equipmentData: Omit<WorkshopEquipment, 'id' | 'history'>) => {
    setAppState(prev => {
        const newEquipment: WorkshopEquipment = {
            ...equipmentData,
            id: `we-${Date.now()}`,
            history: [
                {
                    action: 'Creado',
                    timestamp: new Date(),
                    userId: prev.currentUser!.id,
                    details: 'Equipo registrado en taller.'
                }
            ]
        };
        return {
            ...prev,
            workshopEquipment: [...prev.workshopEquipment, newEquipment]
        }
    });
}

const updateWorkshopEquipment = (equipmentId: string, equipmentData: Partial<Omit<WorkshopEquipment, 'id'>>) => {
    setAppState(prev => {
        const originalEquipment = prev.workshopEquipment.find(we => we.id === equipmentId);
        if (!originalEquipment) return prev;

        const newHistoryLog: ActionLog | null = equipmentData.status && equipmentData.status !== originalEquipment.status
            ? {
                action: 'Estado Cambiado',
                timestamp: new Date(),
                userId: prev.currentUser!.id,
                details: `Estado cambiado a: ${equipmentData.status}`
            }
            : null;

        const updatedEquipment: WorkshopEquipment = {
            ...originalEquipment,
            ...equipmentData,
            history: newHistoryLog ? [...originalEquipment.history, newHistoryLog] : originalEquipment.history
        };
        return {
            ...prev,
            workshopEquipment: prev.workshopEquipment.map(we => we.id === equipmentId ? updatedEquipment : we)
        }
    });
}

// --- END WORKSHOP EQUIPMENT FUNCTIONS ---

const updateCompanyInfo = (info: Partial<CompanyInfo>) => {
    setAppState(prev => ({
        ...prev,
        companyInfo: { ...prev.companyInfo, ...info }
    }));
};

const appContextValue: AppContextType = {
  ...appState,
  setMode,
  setCurrentUser,
  addServiceOrder,
  addUnconfirmedServiceOrder,
  confirmServiceOrder,
  updateServiceOrder,
  deleteServiceOrder,
  archiveServiceOrder,
  addStaff,
  updateStaff,
  deleteStaff,
  updateStaffRole,
  addCalendar,
  updateCalendar,
  deleteCalendar,
  addCustomer,
  updateCustomer,
  loadCustomers,
  signInToGoogle,
  signOutFromGoogle,
  isGoogleConfigMissing,
  updateServiceOrderReminders,
  updateServiceOrderStatus,
  updateCalendarAvailability,
  updatePublicFormAvailability,
  addAccessKey,
  deleteAccessKey,
  addMaintenanceSchedule,
  updateMaintenanceSchedule,
  deleteMaintenanceSchedule,
  addInvoice,
  updateInvoice,
  recordInvoicePayment,
  viewInvoice,
  setOrderToConvertToInvoice,
  setInvoiceToPrint,
  setInvoiceMode,
  addQuote,
  updateQuote,
  deleteQuote,
  setQuoteToConvertToInvoice,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
  addWorkshopEquipment,
  updateWorkshopEquipment,
  updateCompanyInfo,
};

return (
  <AppContext.Provider value={appContextValue}>
    <div className="bg-slate-100 min-h-screen">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <Dashboard />
      </main>
    </div>
  </AppContext.Provider>
);
};

export default App;