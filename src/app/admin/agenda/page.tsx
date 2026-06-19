'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de Agendamento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  
  // Dados para o formulário
  const [clients, setClients] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  
  // Estado do Formulário
  const [formClientSearch, setFormClientSearch] = useState('');
  const [formClientId, setFormClientId] = useState('');
  const [formServices, setFormServices] = useState<string[]>([]);

  // Horários disponíveis (08:00 às 18:00, a cada 30 min)
  const timeSlots = [];
  for (let h = 8; h <= 18; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    if (h !== 18) timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  // Carregar Agenda do Dia
  useEffect(() => {
    async function fetchAgenda() {
      setLoading(true);
      // Pega inicio e fim do dia selecionado
      const startOfDay = `${selectedDate}T00:00:00-03:00`;
      const endOfDay = `${selectedDate}T23:59:59-03:00`;

      const { data } = await supabase
        .from('appointments')
        .select('*, clients(name, phone)')
        .gte('date_time', startOfDay)
        .lte('date_time', endOfDay)
        .neq('status', 'cancelado');

      setAppointments(data || []);
      setLoading(false);
    }
    fetchAgenda();
  }, [selectedDate]);

  // Carregar lista de clientes e serviços para o Modal
  useEffect(() => {
    async function loadFormOptions() {
      const { data: cData } = await supabase.from('clients').select('id, name, phone');
      const { data: sData } = await supabase.from('services').select('id, name').eq('active', true);
      setClients(cData || []);
      setServicesList(sData || []);
    }
    loadFormOptions();
  }, []);

  const handleOpenModal = (time: string) => {
    setSelectedTime(time);
    setFormClientId('');
    setFormClientSearch('');
    setFormServices([]);
    setIsModalOpen(true);
  };

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientId) return alert('Selecione um cliente válido da lista.');
    if (formServices.length === 0) return alert('Selecione ao menos um serviço.');

    const dateTimeString = `${selectedDate}T${selectedTime}:00-03:00`;

    const { error } = await supabase.from('appointments').insert([{
      client_id: formClientId,
      services: formServices,
      date_time: dateTimeString,
      status: 'confirmado'
    }]);

    if (error) {
      alert('Erro ao agendar!');
      console.error(error);
    } else {
      alert('Agendado com sucesso!');
      setIsModalOpen(false);
      // Recarregar agenda
      const { data } = await supabase.from('appointments').select('*, clients(name, phone)').gte('date_time', `${selectedDate}T00:00:00-03:00`).lte('date_time', `${selectedDate}T23:59:59-03:00`).neq('status', 'cancelado');
      setAppointments(data || []);
    }
  };

  const handleCancelAppointment = async (apptId: string) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento e deixar o horário livre?')) {
      const { error } = await supabase.from('appointments').update({ status: 'cancelado' }).eq('id', apptId);
      if (!error) {
        alert('Agendamento cancelado com sucesso.');
        // Recarregar
        const startOfDay = `${selectedDate}T00:00:00-03:00`;
        const endOfDay = `${selectedDate}T23:59:59-03:00`;
        const { data } = await supabase.from('appointments').select('*, clients(name, phone)').gte('date_time', startOfDay).lte('date_time', endOfDay).neq('status', 'cancelado');
        setAppointments(data || []);
      } else {
        alert('Erro ao cancelar agendamento.');
      }
    }
  };

  // Filtra clientes baseados na pesquisa (Nome ou Telefone)
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(formClientSearch.toLowerCase()) || 
    c.phone.includes(formClientSearch)
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--admin-sidebar)' }}>
          Agenda Diária
        </h1>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
        />
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#faf8f5', padding: '15px 20px', borderBottom: '1px solid #f0f0f0', fontWeight: 'bold', color: '#8b5e34' }}>
          🕒 Horários do dia
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando agenda...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {timeSlots.map(time => {
              // Verifica se já existe agendamento neste horário
              const appt = appointments.find(a => {
                const d = new Date(a.date_time);
                return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) === time;
              });

              return (
                <div key={time} style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', minHeight: '70px' }}>
                  <div style={{ width: '100px', borderRight: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#1a365d' }}>
                    {time}
                  </div>
                  
                  <div style={{ flex: 1, padding: '10px 20px', display: 'flex', alignItems: 'center' }}>
                    {appt ? (
                      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 15px', borderRadius: '8px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#166534' }}>{appt.clients?.name} <span style={{ fontWeight: 'normal', fontSize: '0.9rem' }}>({appt.clients?.phone})</span></div>
                          <div style={{ fontSize: '0.85rem', color: '#15803d', marginTop: '4px' }}>Serviços: {appt.services.join(', ')}</div>
                        </div>
                        <button 
                          onClick={() => handleCancelAppointment(appt.id)}
                          style={{ background: 'none', border: 'none', color: '#e53e3e', fontSize: '1.2rem', cursor: 'pointer', padding: '5px' }}
                          title="Cancelar Agendamento"
                        >
                          ❌
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleOpenModal(time)}
                        style={{ background: 'none', border: '1px dashed #cbd5e0', color: '#a0aec0', padding: '10px', width: '100%', textAlign: 'left', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        + Horário Disponível - Clique para agendar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Agendamento */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#2d160d' }}>Novo Agendamento às {selectedTime}</h2>
            
            <form onSubmit={handleSaveAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Pesquisa de Cliente */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>1. Pesquise a Cliente (Nome ou Telefone)</label>
                <input 
                  type="text" 
                  value={formClientSearch}
                  onChange={e => setFormClientSearch(e.target.value)}
                  placeholder="Ex: Maria"
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
                <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px', display: formClientSearch ? 'block' : 'none' }}>
                  {filteredClients.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => { setFormClientId(c.id); setFormClientSearch(c.name); }}
                      style={{ padding: '10px', cursor: 'pointer', backgroundColor: formClientId === c.id ? '#e6fffa' : '#fff', borderBottom: '1px solid #f0f0f0' }}
                    >
                      {c.name} - {c.phone}
                    </div>
                  ))}
                  {filteredClients.length === 0 && <div style={{ padding: '10px', color: '#999' }}>Nenhuma cliente encontrada. Vá em Clientes para cadastrar.</div>}
                </div>
              </div>

              {/* Combo Box Múltiplo de Serviços */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>2. Selecione os Serviços (Pode ser mais de um)</label>
                <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                  {servicesList.length === 0 ? (
                    <p style={{ color: '#999', fontSize: '0.9rem' }}>Nenhum serviço cadastrado ainda no banco.</p>
                  ) : servicesList.map(s => (
                    <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={formServices.includes(s.name)}
                        onChange={(e) => {
                          if (e.target.checked) setFormServices([...formServices, s.name]);
                          else setFormServices(formServices.filter(sv => sv !== s.name));
                        }}
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Confirmar Agendamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
