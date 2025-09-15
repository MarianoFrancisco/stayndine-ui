import { createContext, useContext, useState, useCallback } from 'react';
import Alert from './Alert';

const ToastCtx = createContext(null);

export function ToasterProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const push = useCallback((t) => {
        const id = crypto.randomUUID();
        const toast = { id, timeout: 4500, variant: 'info', ...t };
        setToasts((prev) => [...prev, toast]);
        if (toast.timeout) {
            setTimeout(() => {
                setToasts((prev) => prev.filter(x => x.id !== id));
            }, toast.timeout);
        }
    }, []);

    const remove = useCallback((id) => {
        setToasts((prev) => prev.filter(x => x.id !== id));
    }, []);

    return (
        <ToastCtx.Provider value={{ push, remove }}>
            {children}
            <div className="toaster" aria-live="polite" aria-atomic="true">
                {toasts.map(t => (
                    <div key={t.id} className="toaster__item">
                        <Alert
                            variant={t.variant}
                            title={t.title}
                            onClose={() => remove(t.id)}
                        >
                            {t.message}
                        </Alert>
                    </div>
                ))}
            </div>
        </ToastCtx.Provider>
    );
}

export const useToaster = () => useContext(ToastCtx);