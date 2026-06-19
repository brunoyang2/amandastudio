'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Client {
  id: string;
  name: string;
  phone: string;
  birthdate: string;
}

export default function BirthdaysPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBirthdays() {
      const currentMonth = new Date().getMonth() + 1;
      
      const { data, error } = await supabase
        .from('clients')
        .select('*');

      if (data) {
        // Filtrar aniversariantes do mês atual no Frontend (MVP approach)
        const bdays = data.filter(c => {
          if (!c.birthdate) return false;
          const month = parseInt(c.birthdate.split('-')[1], 10);
          return month === currentMonth;
        });

        // Ordenar por dia
        bdays.sort((a, b) => {
          const dayA = parseInt(a.birthdate.split('-')[2], 10);
          const dayB = parseInt(b.birthdate.split('-')[2], 10);
          return dayA - dayB;
        });

        setClients(bdays);
      }
      setLoading(false);
    }
    loadBirthdays();
  }, []);

  const formatBirthday = (dateString: string) => {
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const [_, month, day] = dateString.split('-');
    return `Aniversário: ${parseInt(day)} de ${months[parseInt(month)-1]}`;
  };

  const openWhatsApp = (phone: string, name: string) => {
    // Limpar o telefone para conter apenas números
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Olá ${name}! O Studio Amanda Morais te deseja um feliz aniversário! 🎉 Tem um presente especial esperando por você aqui no Studio.`;
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--admin-sidebar)' }}>
        Aniversariantes do Mês
      </h1>

      {loading ? (
        <p>Buscando aniversariantes...</p>
      ) : clients.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee' }}>
          Nenhum cliente faz aniversário este mês.
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
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ 
                  width: '50px', height: '50px', borderRadius: '50%', 
                  backgroundColor: '#faf5ff', color: '#9f7aea', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' 
                }}>
                  🎂
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1a365d', marginBottom: '0.2rem' }}>
                    {client.name}
                  </h3>
                  <p style={{ color: 'var(--admin-text-light)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                    📞 {client.phone}
                  </p>
                  <p style={{ color: '#9f7aea', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {formatBirthday(client.birthdate)}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => openWhatsApp(client.phone, client.name)}
                style={{ 
                  backgroundColor: '#48bb78', 
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px', 
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(72, 187, 120, 0.2)'
                }}
              >
                📱 Enviar Parabéns
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
