import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AppContext, AppContextType, Customer, Quote, InvoiceLineItem, QuoteStatus } from '../types';
import { X, PlusCircle, Trash2, Pencil, Save, User } from 'lucide-react';
import { InvoiceItemModal } from './InvoiceItemModal';

interface QuoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteToEdit: Quote | null;
}

export const QuoteFormModal: React.FC<QuoteFormModalProps> = ({ isOpen, onClose, quoteToEdit }) => {
    const { customers, addQuote, updateQuote, staff } = useContext(AppContext) as AppContextType;
    
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [date, setDate] = useState(new Date());
    const [items, setItems] = useState<InvoiceLineItem[]>([]);
    const [discount, setDiscount] = useState(0);
    const [status, setStatus] = useState<QuoteStatus>('Borrador');
    const [isTaxable, setIsTaxable] = useState(true);

    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<InvoiceLineItem | null>(null);

    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [customerSearchResults, setCustomerSearchResults] = useState<Customer[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    
    const resetForm = useCallback(() => {
        setCustomer(null);
        setDate(new Date());
        setItems([]);
        setDiscount(0);
        setStatus('Borrador');
        setCustomerSearchQuery('');
        setIsTaxable(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (quoteToEdit) {
                const existingCustomer = customers.find(c => c.id === quoteToEdit.customerId);
                setCustomer(existingCustomer || null);
                setCustomerSearchQuery(existingCustomer?.name || '');
                setDate(new Date(quoteToEdit.date));
                setItems(quoteToEdit.items);
                setDiscount(quoteToEdit.discount);
                setStatus(quoteToEdit.status);
                setIsTaxable(quoteToEdit.isTaxable ?? true);
            } else {
                resetForm();
            }
        }
    }, [isOpen, quoteToEdit, customers, resetForm]);
    
     useEffect(() => {
        if (customerSearchQuery.trim() && !customer) {
          const lowercasedQuery = customerSearchQuery.toLowerCase();
          const filtered = customers.filter(c => 
            c.name.toLowerCase().includes(lowercasedQuery) || 
            c.phone.replace(/\D/g, '').includes(customerSearchQuery.replace(/\D/g, ''))
          ).slice(0, 5);
          setCustomerSearchResults(filtered);
        } else {
          setCustomerSearchResults([]);
        }
    }, [customerSearchQuery, customers, customer]);
    
    const handleCustomerSelect = (selectedCustomer: Customer) => {
        setCustomer(selectedCustomer);
        setCustomerSearchQuery(selectedCustomer.name);
        setCustomerSearchResults([]);
        setIsSearchFocused(false);
    };

    const handleSaveItem = (item: InvoiceLineItem) => {
        if (itemToEdit) {
            setItems(prev => prev.map(i => i.id === item.id ? item : i));
        } else {
            setItems(prev => [...prev, { ...item, id: `item-${Date.now()}` }]);
        }
        setIsItemModalOpen(false);
        setItemToEdit(null);
    };

    const handleEditItem = (item: InvoiceLineItem) => {
        setItemToEdit(item);
        setIsItemModalOpen(true);
    };

    const handleRemoveItem = (itemId: string) => {
        setItems(prev => prev.filter(i => i.id !== itemId));
    };

    const subtotal = items.reduce((acc, item) => acc + (item.sellPrice * item.quantity), 0);
    const subtotalAfterDiscount = subtotal - discount;
    const taxes = isTaxable ? subtotalAfterDiscount * 0.18 : 0;
    const total = subtotalAfterDiscount + taxes;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) {
            alert("Por favor, selecciona un cliente.");
            return;
        }

        const quoteData = { customerId: customer.id, date, items, discount, status, isTaxable };
        
        if (quoteToEdit) {
            updateQuote(quoteToEdit.id, quoteData);
        } else {
            addQuote(quoteData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative max-h-[90vh] flex flex-col">
                    <header className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-xl font-bold text-slate-800">{quoteToEdit ? 'Editar Cotización' : 'Crear Nueva Cotización'}</h2>
                        <button type="button" onClick={onClose}><X size={20} /></button>
                    </header>
                    <main className="p-6 overflow-y-auto flex-grow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Customer Search & Details */}
                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="label-style">Buscar Cliente</label>
                                    <input
                                        type="text"
                                        value={customerSearchQuery}
                                        onChange={(e) => { setCustomerSearchQuery(e.target.value); setCustomer(null); }}
                                        onFocus={() => setIsSearchFocused(true)}
                                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                        placeholder="Buscar o crear cliente..."
                                        className="mt-1 input-style"
                                    />
                                    {isSearchFocused && customerSearchResults.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                                            {customerSearchResults.map(c => <button key={c.id} type="button" onMouseDown={() => handleCustomerSelect(c)} className="w-full text-left p-2 hover:bg-sky-100">{c.name}</button>)}
                                        </div>
                                    )}
                                </div>
                                {customer && (
                                    <div className="p-3 bg-slate-50 border rounded-md text-sm text-slate-600">
                                        <p className="font-semibold text-slate-800 flex items-center gap-2"><User size={14}/> {customer.name}</p>
                                        <p><strong>Tel:</strong> {customer.phone}</p>
                                        <p><strong>Email:</strong> {customer.email}</p>
                                        <p><strong>Dir:</strong> {customer.address}</p>
                                    </div>
                                )}
                            </div>
                            {/* Quote Options */}
                            <div className="p-3 bg-slate-50 border rounded-md space-y-4">
                               <div>
                                    <label className="label-style">Fecha</label>
                                    <input type="date" value={date.toISOString().split('T')[0]} onChange={e => setDate(new Date(e.target.value))} className="mt-1 input-style"/>
                                </div>
                                <div>
                                    <label className="label-style">Estado</label>
                                    <select value={status} onChange={e => setStatus(e.target.value as QuoteStatus)} className="mt-1 input-style">
                                        <option value="Borrador">Borrador</option>
                                        <option value="Enviada">Enviada</option>
                                        <option value="Aceptada">Aceptada</option>
                                        <option value="Rechazada">Rechazada</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Quote Items */}
                        <div className="border rounded-lg">
                            <div className="flex justify-between items-center p-3 bg-slate-50 border-b">
                                <h3 className="font-semibold text-slate-700">Detalles de la Cotización</h3>
                                <button type="button" onClick={() => { setItemToEdit(null); setIsItemModalOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700">
                                    <PlusCircle size={14} /> Agregar Ítem
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100">
                                        <tr className="border-b">
                                            <th className="p-2 text-left font-medium text-slate-500">Cant.</th>
                                            <th className="p-2 text-left font-medium text-slate-500">Descripción</th>
                                            <th className="p-2 text-right font-medium text-slate-500">Precio</th>
                                            <th className="p-2 text-right font-medium text-slate-500">Total</th>
                                            <th className="p-2 text-center font-medium text-slate-500"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(item => (
                                            <tr key={item.id} className="border-b last:border-b-0 hover:bg-slate-50">
                                                <td className="p-2">{item.quantity}</td>
                                                <td className="p-2">{item.description}</td>
                                                <td className="p-2 text-right">RD$ {item.sellPrice.toFixed(2)}</td>
                                                <td className="p-2 text-right font-medium">RD$ {(item.sellPrice * item.quantity).toFixed(2)}</td>
                                                <td className="p-2 text-center">
                                                    <button type="button" onClick={() => handleEditItem(item)} className="p-1 text-slate-500 hover:text-sky-600"><Pencil size={14}/></button>
                                                    <button type="button" onClick={() => handleRemoveItem(item.id)} className="p-1 text-slate-500 hover:text-red-600"><Trash2 size={14}/></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {items.length === 0 && <p className="text-center p-8 text-slate-400">Añade productos o servicios a la cotización.</p>}
                            </div>
                        </div>
                        
                        {/* Totals */}
                        <div className="flex justify-end mt-4">
                            <div className="w-full max-w-sm space-y-2 text-sm">
                                <div className="flex justify-between"><span>SubTotal:</span> <span>RD$ {subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between items-center">
                                    <span>Descuento:</span>
                                    <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="w-24 p-1 border rounded-md text-right"/>
                                </div>
                                <div className="flex justify-between items-center">
                                    <label htmlFor="quote-isTaxable" className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" id="quote-isTaxable" checked={isTaxable} onChange={e => setIsTaxable(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"/>
                                        <span>Impuestos ({isTaxable ? '18%' : '0%'}):</span>
                                    </label>
                                    <span>RD$ {taxes.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2 text-slate-800"><span>Total:</span> <span>RD$ {total.toFixed(2)}</span></div>
                            </div>
                        </div>

                    </main>
                    <footer className="flex justify-end gap-4 p-4 border-t bg-slate-50">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300">Cancelar</button>
                        <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 flex items-center gap-2">
                            <Save size={16}/> Guardar
                        </button>
                    </footer>
                </form>
            </div>
            {isItemModalOpen && (
                <InvoiceItemModal
                    isOpen={isItemModalOpen}
                    onClose={() => { setIsItemModalOpen(false); setItemToEdit(null); }}
                    onSave={handleSaveItem}
                    itemToEdit={itemToEdit}
                />
            )}
             <style>{`.input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; box-shadow: sm; placeholder-slate-400; focus:outline-none focus:ring-sky-500 focus:border-sky-500; } .input-style:disabled, .input-style:read-only { background-color: #f1f5f9; cursor: not-allowed; } .label-style { display: block; font-medium; color: #334155; }`}</style>
        </>
    );
};