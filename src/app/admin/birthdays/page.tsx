'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Gift, Phone, Smartphone } from 'lucide-react';

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
                  <Gift size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1a365d', marginBottom: '0.2rem' }}>
                    {client.name}
                  </h3>
                  <p style={{ color: 'var(--admin-text-light)', fontSize: '0.9rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={14} /> {client.phone}
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
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg> Enviar Parabéns
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
