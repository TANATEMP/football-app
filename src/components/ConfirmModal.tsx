import React from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  type?: 'DANGER' | 'SUCCESS' | 'INFO';
  isSubmitting?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "OK", 
  type = 'INFO', 
  isSubmitting = false 
}) => {
  if (!isOpen) return null;

  let bgColor = 'bg-slate-50';
  let icon = 'ℹ️';
  let titleColor = 'text-slate-700';
  let btnColor = 'bg-blue-600 hover:bg-blue-700 shadow-blue-200';

  if (type === 'DANGER') {
    bgColor = 'bg-rose-50';
    icon = '⚠️';
    titleColor = 'text-rose-600';
    btnColor = 'bg-rose-600 hover:bg-rose-700 shadow-rose-200';
  } else if (type === 'SUCCESS') {
    bgColor = 'bg-emerald-50';
    icon = '✅';
    titleColor = 'text-emerald-600';
    btnColor = 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200';
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={!isSubmitting ? onCancel : undefined}
      ></div>
      
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        <div className={`p-8 text-center ${bgColor}`}>
           <span className="text-4xl mb-4 block leading-none">
             {icon}
           </span>
           <h3 className={`text-xl font-black italic uppercase tracking-tight ${titleColor}`}>
             {title}
           </h3>
        </div>

        <div className="p-8 text-center">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-wide leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button 
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button 
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`flex-1 py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 ${btnColor}`}
          >
            {isSubmitting ? 'Processing...' : confirmText}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;