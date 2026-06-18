'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Client {
  id: string;
  name: string;
  phone: string;
  last_visit_date: string;
  days_since: number;
}

export default function MaintenancePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMaintenanceAlerts() {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .lte('last_visit_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('last_visit_date', { ascending: true }); // Quem não vem há mais tempo aparece primeiro

      if (data) {
        // Calcular os dias exatos desde a última visita
        const now = new Date();
        const mappedData = data.map(c => {
          const visit = new Date(c.last_visit_date);
          const diffTime = Math.abs(now.getTime() - visit.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return { ...c, days_since: diffDays };
        });
        setClients(mappedData);
      }
      setLoading(false);
    }
    loadMaintenanceAlerts();
  }, []);

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--admin-sidebar)' }}>
        Alerta de Manutenções (30+ Dias)
      </h1>

      {loading ? (
        <p>Procurando clientes atrasados...</p>
      ) : clients.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee' }}>
          ✅ Todas as clientes estão em dia com a manutenção!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {clients.map(client => (
            <div 
              key={client.id}
              style={{
                backgroundColor: '#fff',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid #f0f0f0',
                borderLeft: '4px solid #e53e3e',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1a365d', marginBottom: '0.3rem' }}>
                  {client.name}
                </h3>
                <p style={{ color: 'var(--admin-text-light)', fontSize: '0.9rem', marginBottom: '0.8rem' }}>
                  📞 {client.phone}
                </p>
                <div style={{ color: '#e53e3e', backgroundColor: '#fff5f5', padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-block' }}>
                  ⚠️ Há {client.days_since} dias sem vir ({formatDate(client.last_visit_date)})
                </div>
              </div>
              
              <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                📅 Agendar Manutenção
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
