'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AgendarModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  const [searchClient, setSearchClient] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [newServiceInput, setNewServiceInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  async function loadData() {
    const { data: cData } = await supabase.from('clients').select('id, name, phone');
    const { data: sData } = await supabase.from('services').select('id, name').eq('active', true);
    setClients(cData || []);
    setServices(sData || []);
  }

  const timeSlots = [];
  for (let h = 8; h <= 18; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    if (h !== 18) timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  const toggleService = (serviceName: string) => {
    if (selectedServices.includes(serviceName)) {
      setSelectedServices(selectedServices.filter(s => s !== serviceName));
    } else {
      setSelectedServices([...selectedServices, serviceName]);
    }
  };

  const handleAddNewService = async () => {
    if (!newServiceInput.trim()) return;
    const { data, error } = await supabase.from('services').insert([
      { name: newServiceInput.trim(), active: true }
    ]).select();

    if (!error && data) {
      setServices([...services, data[0]]);
      setSelectedServices([...selectedServices, data[0].name]);
      setNewServiceInput('');
    }
  };

  // Nova função para deletar serviço permanentemente do banco
  const handleDeleteService = async (serviceId: string, serviceName: string) => {
    if (window.confirm(`Tem certeza que deseja apagar permanentemente o serviço "${serviceName}"?`)) {
      const { error } = await supabase.from('services').delete().eq('id', serviceId);
      if (!error) {
        setServices(services.filter(s => s.id !== serviceId));
        setSelectedServices(selectedServices.filter(s => s !== serviceName));
      } else {
        alert('Erro ao apagar serviço.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return alert('Por favor, selecione uma cliente da lista.');
    if (selectedServices.length === 0) return alert('Por favor, selecione pelo menos um serviço.');

    setLoading(true);
    const dateTimeString = `${date}T${time}:00-03:00`;

    const { error } = await supabase.from('appointments').insert([{
      client_id: selectedClientId,
      services: selectedServices,
      date_time: dateTimeString,
      status: 'pendente'
    }]);

    setLoading(false);
    if (!error) {
      alert('Agendamento confirmado com sucesso!');
      setSelectedClientId('');
      setSearchClient('');
      setSelectedServices([]);
      onClose(); // Fecha o modal após agendar
    } else {
      alert('Erro ao agendar.');
    }
  };

  if (!isOpen) return null;

  const filteredClients = searchClient 
    ? clients.filter(c => c.name.toLowerCase().includes(searchClient.toLowerCase()) || c.phone.includes(searchClient))
    : [];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: '#fff', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', position: 'relative' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#a0aec0' }}>
          &times;
        </button>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--admin-sidebar)' }}>
          Agendar Sessão
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Selecionar Cliente */}
          <div>
            <label style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              👥 1. Selecionar Cliente
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="🔍 Escreva o nome para procurar..." 
                value={searchClient}
                onChange={e => setSearchClient(e.target.value)}
                style={{ width: '100%', padding: '12px 15px 12px 40px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none' }}
              />
              {searchClient && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px', zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
                  {filteredClients.length > 0 ? filteredClients.map(c => (
                    <div 
                      key={c.id}
                      onClick={() => { setSelectedClientId(c.id); setSearchClient(c.name); }}
                      style={{ padding: '12px 15px', cursor: 'pointer', backgroundColor: selectedClientId === c.id ? '#ebf8ff' : '#fff', borderBottom: '1px solid #edf2f7' }}
                    >
                      <strong>{c.name}</strong> <span style={{ color: '#718096', fontSize: '0.9rem' }}>({c.phone})</span>
                    </div>
                  )) : (
                    <div style={{ padding: '12px 15px', color: '#718096' }}>Cliente não encontrada.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Data e Horário */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#2d3748', display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>📅 2. Data</label>
              <input 
                type="date" required value={date} onChange={e => setDate(e.target.value)}
                style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#2d3748', display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>🕒 3. Horário</label>
              <select value={time} onChange={e => setTime(e.target.value)} style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none', backgroundColor: '#fff' }}>
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Serviços Solicitados */}
          <div>
            <label style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#2d3748', display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              ✂️ 4. Serviços Solicitados (Opcional Combo)
            </label>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1rem' }}>
              {services.map(s => {
                const isSelected = selectedServices.includes(s.name);
                return (
                  <div key={s.id} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => toggleService(s.name)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px 0 0 20px',
                        border: isSelected ? '1px solid var(--gold-main)' : '1px solid #cbd5e0',
                        backgroundColor: isSelected ? '#fffaf0' : '#fff',
                        color: isSelected ? 'var(--gold-dark)' : '#4a5568',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: isSelected ? 'bold' : 'normal',
                        borderRight: 'none'
                      }}
                    >
                      {s.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(s.id, s.name)}
                      title="Excluir este serviço do banco"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '0 20px 20px 0',
                        border: isSelected ? '1px solid var(--gold-main)' : '1px solid #cbd5e0',
                        backgroundColor: isSelected ? '#fffaf0' : '#fff',
                        color: '#e53e3e',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        borderLeft: '1px solid #edf2f7'
                      }}
                    >
                      &times;
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px' }}>
              <input 
                type="text" 
                placeholder="Outro serviço? Digite aqui..." 
                value={newServiceInput}
                onChange={e => setNewServiceInput(e.target.value)}
                style={{ flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none' }}
              />
              <button type="button" onClick={handleAddNewService} style={{ padding: '0 15px', borderRadius: '8px', border: 'none', backgroundColor: '#edf2f7', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #edf2f7', display: 'flex', justifyContent: 'center' }}>
            <button 
              type="submit" 
              disabled={loading || !selectedClientId}
              style={{ 
                backgroundColor: (!loading && selectedClientId && selectedServices.length > 0) ? '#e2e8f0' : '#f7fafc',
                color: '#4a5568', 
                border: '1px solid #cbd5e0',
                padding: '12px 30px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: (!loading && selectedClientId && selectedServices.length > 0) ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              ✔️ Confirmar Agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
