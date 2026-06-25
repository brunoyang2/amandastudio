'use client';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmColor = "var(--admin-sidebar)"
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
}) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#2d3748' }}>{title}</h3>
        <p style={{ color: '#4a5568', marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.5' }}>{message}</p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={onCancel}
            style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e0', backgroundColor: '#fff', color: '#4a5568', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: confirmColor, color: '#fff', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
