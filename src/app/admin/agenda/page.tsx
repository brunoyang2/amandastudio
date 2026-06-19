'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { Clock, CheckCircle, XCircle, Calendar as CalendarIcon } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function AgendaPage() {
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentDates, setAppointmentDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Fechar calendário ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
  const fetchAgenda = async () => {
    setLoading(true);
    const startOfDay = `${selectedDateStr}T00:00:00-03:00`;
    const endOfDay = `${selectedDateStr}T23:59:59-03:00`;

    const { data } = await supabase
      .from('appointments')
      .select('*, clients(name, phone)')
      .gte('date_time', startOfDay)
      .lte('date_time', endOfDay)
      .neq('status', 'cancelado');

    setAppointments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAgenda();
  }, [selectedDateStr]);

  // Carregar todas as datas que têm agendamentos
  const fetchAppointmentDates = async () => {
    const { data } = await supabase
      .from('appointments')
      .select('date_time')
      .neq('status', 'cancelado');
      
    if (data) {
      const dates = data.map(a => a.date_time.split('T')[0]);
      setAppointmentDates(Array.from(new Set(dates)));
    }
  };

  useEffect(() => {
    fetchAppointmentDates();
  }, []);

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

    const dateTimeString = `${selectedDateStr}T${selectedTime}:00-03:00`;

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
      fetchAgenda();
      fetchAppointmentDates();
    }
  };

  const handleCancelAppointment = async (apptId: string) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento e deixar o horário livre?')) {
      const { error } = await supabase.from('appointments').update({ status: 'cancelado' }).eq('id', apptId);
      if (!error) {
        alert('Agendamento cancelado com sucesso.');
        fetchAgenda();
        fetchAppointmentDates();
      } else {
        alert('Erro ao cancelar agendamento.');
      }
    }
  };

  const handleConcluirAppointment = async (apptId: string) => {
    if (window.confirm('A cliente já foi atendida? Ao concluir, este agendamento sairá da contagem do Dashboard.')) {
      const { error } = await supabase.from('appointments').update({ status: 'concluido' }).eq('id', apptId);
      if (!error) {
        alert('Agendamento concluído com sucesso!');
        fetchAgenda();
      } else {
        alert('Erro ao concluir agendamento.');
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
        <div style={{ position: 'relative' }} ref={calendarRef}>
          <button 
            onClick={() => setShowCalendar(!showCalendar)}
            style={{ 
              padding: '10px 15px', 
              borderRadius: '8px', 
              border: '1px solid #ccc', 
              backgroundColor: '#fff', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 'bold',
              color: '#4a5568'
            }}
          >
            {selectedDateStr.split('-').reverse().join('/')} <CalendarIcon size={18} />
          </button>

          {showCalendar && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '10px', zIndex: 50, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
              <Calendar 
                onChange={(val: any) => {
                  const y = val.getFullYear();
                  const m = String(val.getMonth() + 1).padStart(2, '0');
                  const d = String(val.getDate()).padStart(2, '0');
                  setSelectedDateStr(`${y}-${m}-${d}`);
                  setShowCalendar(false);
                }}
                value={new Date(selectedDateStr + 'T12:00:00')} // Força meio dia para não ter problema de fuso
                tileClassName={({ date, view }) => {
                  if (view === 'month') {
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, '0');
                    const d = String(date.getDate()).padStart(2, '0');
                    const dateString = `${y}-${m}-${d}`;
                    if (appointmentDates.includes(dateString)) {
                      return 'has-appointment';
                    }
                  }
                  return null;
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#faf8f5', padding: '15px 20px', borderBottom: '1px solid #f0f0f0', fontWeight: 'bold', color: '#8b5e34', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} /> Horários do dia
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
                      <div style={{ 
                        backgroundColor: appt.status === 'concluido' ? '#f7fafc' : '#f0fdf4', 
                        border: appt.status === 'concluido' ? '1px solid #e2e8f0' : '1px solid #bbf7d0', 
                        padding: '10px 15px', 
                        borderRadius: '8px', 
                        width: '100%', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        opacity: appt.status === 'concluido' ? 0.7 : 1
                      }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: appt.status === 'concluido' ? '#4a5568' : '#166534', textDecoration: appt.status === 'concluido' ? 'line-through' : 'none' }}>
                            {appt.clients?.name} <span style={{ fontWeight: 'normal', fontSize: '0.9rem' }}>({appt.clients?.phone})</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: appt.status === 'concluido' ? '#718096' : '#15803d', marginTop: '4px' }}>
                            Serviços: {appt.services.join(', ')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {appt.status !== 'concluido' && (
                            <button 
                              onClick={() => handleConcluirAppointment(appt.id)}
                              style={{ background: 'none', border: 'none', color: '#48bb78', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '5px' }}
                              title="Concluir Agendamento (Cliente veio)"
                            >
                              <CheckCircle size={20} />
                            </button>
                          )}
                          {appt.status === 'concluido' ? (
                            <span style={{ color: '#718096', fontWeight: 'bold', fontSize: '0.9rem' }}>Concluído</span>
                          ) : (
                            <button 
                              onClick={() => handleCancelAppointment(appt.id)}
                              style={{ background: 'none', border: 'none', color: '#e53e3e', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '5px' }}
                              title="Cancelar Agendamento"
                            >
                              <XCircle size={20} />
                            </button>
                          )}
                        </div>
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
