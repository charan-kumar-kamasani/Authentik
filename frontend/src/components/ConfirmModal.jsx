import React, { createContext, useContext, useState, useCallback } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState({ open: false });

  const confirm = useCallback(({ title = 'Confirm', description = '', confirmText = 'Confirm', cancelText = 'Cancel' } = {}) => {
    return new Promise((resolve) => {
      setDialog({ open: true, title, description, confirmText, cancelText, resolve });
    });
  }, []);

  const handleClose = (result) => {
    if (dialog.resolve) dialog.resolve(result);
    setDialog({ open: false });
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b">
              <h3 className="text-lg font-black text-slate-800">{dialog.title}</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600">{dialog.description}</p>
            </div>
            <div className="p-4 flex gap-3 justify-end bg-slate-50">
              {dialog.cancelText && (
                <button onClick={() => handleClose(false)} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold">{dialog.cancelText}</button>
              )}
              <button onClick={() => handleClose(true)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold">{dialog.confirmText}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}

export default ConfirmProvider;
