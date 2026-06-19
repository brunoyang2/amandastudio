'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Calendar } from 'lucide-react';

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

  // Estados do Modal de Remarcar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<CancelledAppt | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const loadCancellations = async () => {
    setLoading(true);
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
  };

  useEffect(() => {
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

  const openRescheduleModal = (appt: CancelledAppt) => {
    setSelectedAppt(appt);
    setNewDate('');
    setNewTime('');
    setIsModalOpen(true);
  };

  const handleReschedule = async () => {
    if (!selectedAppt || !newDate || !newTime) {
      alert('Por favor, preencha a nova data e o novo horário.');
      return;
    }

    const newDateTime = `${newDate}T${newTime}:00-03:00`;
    
    // Atualiza o agendamento para o novo horário e muda o status de volta para confirmado
    const { error } = await supabase
      .from('appointments')
      .update({ date_time: newDateTime, status: 'confirmado' })
      .eq('id', selectedAppt.id);

    if (!error) {
      alert('Agendamento remarcado com sucesso!');
      setIsModalOpen(false);
      loadCancellations(); // Recarrega a lista para remover o item
    } else {
      alert('Erro ao remarcar agendamento.');
    }
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
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
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
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => openRescheduleModal(appt)}
                  style={{ 
                    backgroundColor: '#fff', 
                    color: '#1a365d',
                    border: '1px solid #e2e8f0',
                    padding: '10px 20px', 
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <Calendar size={18} /> Remarcar Horário
                </button>

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
            </div>
          ))}
        </div>
      )}

      {/* Modal de Remarcação */}
      {isModalOpen && selectedAppt && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a365d' }}>Remarcar Cliente</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#a0aec0' }}>&times;</button>
            </div>
            
            <p style={{ marginBottom: '1.5rem', color: '#4a5568' }}>
              Escolha a nova data e horário para <strong>{selectedAppt.clients?.name}</strong>.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4a5568' }}>Nova Data</label>
              <input 
                type="date" 
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4a5568' }}>Novo Horário</label>
              <input 
                type="time" 
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ flex: 1, padding: '12px', backgroundColor: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleReschedule}
                style={{ flex: 1, padding: '12px', backgroundColor: 'var(--admin-sidebar)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Confirmar Novo Horário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
