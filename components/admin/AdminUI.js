'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckIcon, CloseIcon } from '@/components/Icons';

/* ---------------- Bildirim (toast) + onay penceresi ---------------- */

const UICtx = createContext(null);

export function AdminUIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const idRef = useRef(0);

  const notify = useCallback((message, type = 'success') => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), type === 'error' ? 5000 : 2800);
  }, []);

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        setConfirmState({ ...opts, resolve });
      }),
    []
  );

  const close = (val) => {
    confirmState?.resolve(val);
    setConfirmState(null);
  };

  return (
    <UICtx.Provider value={{ notify, confirm }}>
      {children}

      <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex max-w-sm animate-fade-up items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-lift ${
              t.type === 'error' ? 'bg-red-600 text-white' : 'bg-ink text-cream'
            }`}
          >
            {t.type === 'error' ? <CloseIcon className="h-4 w-4 shrink-0" /> : <CheckIcon className="h-4 w-4 shrink-0 text-wa" />}
            {t.message}
          </div>
        ))}
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => close(false)} />
          <div className="relative w-full max-w-sm animate-fade-up rounded-2xl bg-white p-6 shadow-lift">
            <h3 className="text-lg font-semibold">{confirmState.title || 'Emin misiniz?'}</h3>
            {confirmState.message && <p className="mt-2 text-sm text-ink-mute">{confirmState.message}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-outline btn-sm" onClick={() => close(false)}>Vazgeç</button>
              <button autoFocus className={`btn btn-sm ${confirmState.danger ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-ink text-cream'}`} onClick={() => close(true)}>
                {confirmState.confirmText || 'Onayla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </UICtx.Provider>
  );
}

export function useAdminUI() {
  return useContext(UICtx);
}

/* ---------------- Küçük yardımcı bileşenler ---------------- */

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="h-display text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-mute">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Field({ label, error, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="label">{label}</span>}
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : hint ? <span className="mt-1 block text-xs text-ink-mute">{hint}</span> : null}
    </label>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 text-left">
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {description && <span className="block text-xs text-ink-mute">{description}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-ink' : 'bg-cream-line'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(pages, page + 2); p++) nums.push(p);
  return (
    <div className="flex items-center justify-center gap-1 pt-6">
      <button className="btn-ghost btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>‹ Önceki</button>
      {nums.map((p) => (
        <button key={p} onClick={() => onChange(p)} className={`h-8 min-w-[32px] rounded-lg px-2 text-sm font-semibold ${p === page ? 'bg-ink text-cream' : 'hover:bg-ink/5'}`}>
          {p}
        </button>
      ))}
      <button className="btn-ghost btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Sonraki ›</button>
    </div>
  );
}

export function Empty({ title, text, children }) {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <p className="h-display text-3xl">{title}</p>
      {text && <p className="mt-2 max-w-sm text-sm text-ink-mute">{text}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

export function Spinner({ className = 'h-5 w-5' }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} />;
}
