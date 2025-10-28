
import React, { useState, useEffect } from 'react';
import { X, QrCode, Link as LinkIcon } from 'lucide-react';

interface MobileAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAccessModal: React.FC<MobileAccessModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      const currentUrl = window.location.href;
      setUrl(currentUrl);
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800">
          <X size={20} />
        </button>
        <div className="flex justify-center items-center gap-2">
            <QrCode className="text-sky-600" />
            <h2 className="text-2xl font-bold text-slate-700">Acceso Móvil</h2>
        </div>
        <p className="text-slate-500 mt-2 mb-4 text-sm">Escanea este código QR con la cámara de tu teléfono para abrir la aplicación.</p>
        
        <div className="flex justify-center p-4 bg-slate-50 rounded-lg">
            {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Código QR para acceder a la aplicación" width="250" height="250" />
            ) : (
                <div className="w-[250px] h-[250px] bg-slate-200 animate-pulse rounded-md"></div>
            )}
        </div>
        
        <div className="mt-4">
            <p className="text-xs text-slate-500 mb-1">O copia este enlace:</p>
            <div className="flex items-center bg-slate-100 p-2 rounded-md">
                <LinkIcon size={16} className="text-slate-400 mr-2 flex-shrink-0" />
                <input 
                    type="text" 
                    readOnly 
                    value={url} 
                    className="text-xs text-slate-700 bg-transparent w-full outline-none"
                    onFocus={(e) => e.target.select()}
                />
            </div>
        </div>
      </div>
    </div>
  );
};