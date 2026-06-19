'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus } from 'lucide-react';

export default function NovoClienteModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthdate: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('clients').insert([{
      name: formData.name,
      phone: formData.phone,
      birthdate: formData.birthdate || null,
      last_visit_date: new Date().toISOString().split('T')[0]
    }]);

    setLoading(false);

    if (error) {
      alert('Erro ao guardar ficha.');
      console.error(error);
    } else {
      alert('Cliente registada com sucesso!');
      setFormData({ name: '', phone: '', birthdate: '' });
      onClose(); // Fecha o modal
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#fff', padding: '2.5rem', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', position: 'relative' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#a0aec0' }}>
          &times;
        </button>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--admin-sidebar)' }}>
          Registar Nova Cliente
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#2d3748' }}>Nome Completo</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none', fontSize: '1rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#2d3748' }}>Telemóvel / WhatsApp</label>
            <input 
              type="tel" 
              required
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none', fontSize: '1rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#2d3748' }}>Data de Nascimento</label>
            <input 
              type="date" 
              value={formData.birthdate}
              onChange={e => setFormData({...formData, birthdate: e.target.value})}
              style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none', fontSize: '1rem' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '1rem',
              backgroundColor: 'var(--admin-sidebar)', 
              color: 'var(--gold-light)', 
              border: 'none',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? 'A Guardar...' : <><UserPlus size={18} /> Guardar Ficha de Cliente</>}
          </button>
        </form>
      </div>
    </div>
  );
}
