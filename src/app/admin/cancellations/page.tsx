'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface CancelledAppt {
  id: string;
  client_id: string;
  date_time: string;
  services: string[];
  clients: {
    name: string;
    phone: string;
  };
}

export default function CancellationsPage() {
  const [appointments, setAppointments] = useState<CancelledAppt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCancellations() {
      // Usando inner join com a tabela clients
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date_time,
          services,
          clients (
            name,
            phone
          )
        `)
        .eq('status', 'cancelado')
        .order('date_time', { ascending: false });

      if (data) {
        // @ts-ignore
        setAppointments(data);
      }
      setLoading(false);
    }
    loadCancellations();
  }, []);

  const formatDateTime = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
  };

  const openWhatsApp = (phone: string, name: string, dateString: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const d = new Date(dateString);
    const timeFormatted = `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
    const message = `Olá ${name}, percebi que o seu agendamento de ${timeFormatted} foi cancelado. Gostaria de verificar um novo horário para reagendarmos?`;
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--admin-sidebar)' }}>
        Relatório de Cancelamentos
      </h1>

      {loading ? (
        <p>Buscando histórico...</p>
      ) : appointments.length === 0 ? (
        <div style={{ 
          padding: '4rem 2rem', 
          textAlign: 'center', 
          backgroundColor: '#fff', 
          borderRadius: '16px', 
          border: '1px solid #eee',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '50%', border: '4px solid #68d391', 
            color: '#68d391', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✓</div>
          <p style={{ color: '#4a5568', fontSize: '1.1rem' }}>
            Nenhum cancelamento registado. As suas clientes são pontuais!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {appointments.map(appt => (
            <div 
              key={appt.id}
              style={{
                backgroundColor: '#fff',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid #f0f0f0',
                borderLeft: '4px solid #ecc94b',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1a365d' }}>
                  {appt.clients?.name}
                </h3>
                <p style={{ color: 'var(--admin-text-light)', marginTop: '0.5rem' }}>
                  📞 {appt.clients?.phone} • 📅 Horário Cancelado: {formatDateTime(appt.date_time)}
                </p>
                <p style={{ color: '#718096', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Serviços: {appt.services?.join(', ')}
                </p>
              </div>
              <button 
                onClick={() => openWhatsApp(appt.clients?.phone, appt.clients?.name, appt.date_time)}
                style={{ 
                  backgroundColor: '#48bb78', 
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px', 
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(72, 187, 120, 0.2)'
                }}
              >
                📱 Reagendar via WhatsApp
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
