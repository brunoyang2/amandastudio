'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Phone, CheckCircle, AlertTriangle, Smartphone } from 'lucide-react';

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
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // 1. Pega todas as clientes
      const { data: allClients } = await supabase.from('clients').select('*');
      
      // 2. Pega todos os agendamentos válidos
      const { data: allAppointments } = await supabase
        .from('appointments')
        .select('client_id, date_time')
        .neq('status', 'cancelado');
        
      if (!allClients) {
        setLoading(false);
        return;
      }

      // 3. Processa cliente a cliente
      const alerts: Client[] = [];
      
      allClients.forEach(client => {
        // Pega todos os agendamentos da cliente
        const clientAppts = (allAppointments || []).filter(a => a.client_id === client.id);
        
        // Verifica se tem agendamento futuro
        const hasFutureAppt = clientAppts.some(a => new Date(a.date_time) > now);
        
        // Se já tem agendamento futuro, não precisa de cobrança de manutenção
        if (hasFutureAppt) return; 
        
        // Acha a última visita (seja pelo último agendamento passado ou data de cadastro)
        const pastAppts = clientAppts
          .filter(a => new Date(a.date_time) <= now)
          .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());
                                     
        let lastVisitDateStr = client.last_visit_date; 
        if (pastAppts.length > 0) {
          lastVisitDateStr = pastAppts[0].date_time;
        }
        
        const lastVisitDate = new Date(lastVisitDateStr);
        
        // Verifica se a última visita foi há mais de 30 dias (ou exatamente 30)
        if (lastVisitDate <= thirtyDaysAgo) {
          const diffTime = Math.abs(now.getTime() - lastVisitDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          alerts.push({
            ...client,
            last_visit_date: lastVisitDate.toISOString().split('T')[0],
            days_since: diffDays
          });
        }
      });
      
      // Ordena pelos que estão mais tempo sem vir primeiro
      alerts.sort((a, b) => b.days_since - a.days_since);
      setClients(alerts);
      setLoading(false);
    }
    loadMaintenanceAlerts();
  }, []);

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Olá ${name}, tudo bem? Percebemos que já faz mais de 30 dias desde a sua última manutenção no Amanda Studio. Gostaria de verificar os horários disponíveis para deixarmos suas unhas perfeitas novamente? 💅✨`;
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--admin-sidebar)' }}>
        Alerta de Manutenções (30+ Dias)
      </h1>

      {loading ? (
        <p>Procurando clientes atrasados...</p>
      ) : clients.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#38a169', fontWeight: 'bold' }}>
          <CheckCircle size={20} /> Todas as clientes estão em dia com a manutenção!
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
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1a365d', marginBottom: '0.3rem' }}>
                  {client.name}
                </h3>
                <p style={{ color: 'var(--admin-text-light)', fontSize: '0.9rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={14} /> {client.phone}
                </p>
                <div style={{ color: '#e53e3e', backgroundColor: '#fff5f5', padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={14} /> Há {client.days_since} dias sem vir (Última vez em: {formatDate(client.last_visit_date)})
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
                </svg> Reagendar Manutenção
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
