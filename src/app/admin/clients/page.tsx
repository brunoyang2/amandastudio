'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Client {
  id: string;
  name: string;
  phone: string;
  last_visit_date: string;
  birthdate: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca os clientes do banco de dados
  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar clientes:', error);
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja apagar este cliente?')) {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (!error) {
        setClients(clients.filter(c => c.id !== id));
      } else {
        alert('Erro ao apagar cliente.');
      }
    }
  };

  // Funções para formatar as datas (ex: 1992-03-07 -> 07/03/1992)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informada';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--admin-sidebar)' }}>
        Lista de Clientes
      </h1>

      {loading ? (
        <p>Carregando clientes...</p>
      ) : clients.length === 0 ? (
        <p>Nenhum cliente cadastrado ainda.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {clients.map(client => (
            <div 
              key={client.id}
              style={{
                backgroundColor: 'var(--admin-card-bg)',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1a365d', marginBottom: '0.5rem' }}>
                  {client.name}
                </h3>
                <div style={{ display: 'flex', gap: '2rem', color: 'var(--admin-text-light)', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📞 {client.phone}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b8912d' }}>
                    📅 Visita: {formatDate(client.last_visit_date)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9f7aea' }}>
                    🎂 Nasc: {formatDate(client.birthdate)}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => handleDelete(client.id)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#a0aec0', 
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  padding: '10px'
                }}
                title="Apagar Cliente"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
