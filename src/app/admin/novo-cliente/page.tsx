'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function NovoClientePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthdate: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('clients').insert([{
      name: formData.name,
      phone: formData.phone,
      birthdate: formData.birthdate || null,
      last_visit_date: new Date().toISOString().split('T')[0] // Visita hoje ao cadastrar
    }]);

    setLoading(false);

    if (error) {
      alert('Erro ao guardar ficha.');
      console.error(error);
    } else {
      alert('Cliente registada com sucesso!');
      router.push('/admin/clients');
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--admin-sidebar)' }}>
        Registar Nova Cliente
      </h1>

      <div style={{ 
        backgroundColor: 'var(--admin-card-bg)', 
        padding: '2.5rem', 
        borderRadius: '16px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        border: '1px solid #e2e8f0'
      }}>
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
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'A Guardar...' : '👤+ Guardar Ficha de Cliente'}
          </button>
        </form>
      </div>
    </div>
  );
}
