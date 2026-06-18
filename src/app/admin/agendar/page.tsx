'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AgendarSessaoPage() {
  const router = useRouter();
  
  // Opções vindas do banco
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  // Estado do formulário
  const [searchClient, setSearchClient] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [newServiceInput, setNewServiceInput] = useState('');
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: cData } = await supabase.from('clients').select('id, name, phone');
      const { data: sData } = await supabase.from('services').select('id, name').eq('active', true);
      setClients(cData || []);
      setServices(sData || []);
    }
    loadData();
  }, []);

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
    
    // Adiciona no Supabase para ficar salvo nas opções futuras
    const { data, error } = await supabase.from('services').insert([
      { name: newServiceInput.trim(), active: true }
    ]).select();

    if (!error && data) {
      setServices([...services, data[0]]);
      setSelectedServices([...selectedServices, data[0].name]);
      setNewServiceInput('');
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

    if (error) {
      alert('Erro ao agendar.');
      console.error(error);
    } else {
      alert('Agendamento confirmado com sucesso!');
      router.push('/admin/agenda');
    }
  };

  const filteredClients = searchClient 
    ? clients.filter(c => c.name.toLowerCase().includes(searchClient.toLowerCase()) || c.phone.includes(searchClient))
    : [];

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--admin-sidebar)' }}>
        Agendar Sessão
      </h1>

      <div style={{ 
        backgroundColor: 'var(--admin-card-bg)', 
        padding: '2.5rem', 
        borderRadius: '16px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        border: '1px solid #e2e8f0'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* 1. Selecionar Cliente */}
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
                style={{ width: '100%', padding: '12px 15px 12px 40px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none', fontSize: '1rem' }}
              />
              {/* Dropdown de Clientes */}
              {searchClient && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  {filteredClients.length > 0 ? filteredClients.map(c => (
                    <div 
                      key={c.id}
                      onClick={() => {
                        setSelectedClientId(c.id);
                        setSearchClient(c.name);
                      }}
                      style={{ padding: '12px 15px', cursor: 'pointer', backgroundColor: selectedClientId === c.id ? '#ebf8ff' : '#fff', borderBottom: '1px solid #edf2f7' }}
                    >
                      <strong>{c.name}</strong> <span style={{ color: '#718096', fontSize: '0.9rem' }}>({c.phone})</span>
                    </div>
                  )) : (
                    <div style={{ padding: '12px 15px', color: '#718096' }}>Cliente não encontrada. Vá em "+ Novo Cliente" para cadastrar.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 2. Data e 3. Horário */}
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                📅 2. Data
              </label>
              <input 
                type="date" 
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none', fontSize: '1rem' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                🕒 3. Horário
              </label>
              <select 
                value={time}
                onChange={e => setTime(e.target.value)}
                style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none', fontSize: '1rem', backgroundColor: '#fff' }}
              >
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* 4. Serviços */}
          <div>
            <label style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              ✂️ 4. Serviços Solicitados (Opcional Combo)
            </label>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1rem' }}>
              {services.map(s => {
                const isSelected = selectedServices.includes(s.name);
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleService(s.name)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: isSelected ? '1px solid var(--gold-main)' : '1px solid #cbd5e0',
                      backgroundColor: isSelected ? '#fffaf0' : '#fff',
                      color: isSelected ? 'var(--gold-dark)' : '#4a5568',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      transition: 'all 0.2s'
                    }}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>

            {/* Adicionar novo serviço */}
            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px' }}>
              <input 
                type="text" 
                placeholder="Outro serviço? Digite aqui..." 
                value={newServiceInput}
                onChange={e => setNewServiceInput(e.target.value)}
                style={{ flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none', fontSize: '0.9rem' }}
              />
              <button 
                type="button"
                onClick={handleAddNewService}
                style={{
                  padding: '0 15px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#edf2f7',
                  color: '#4a5568',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Separador e Botão Confirmar */}
          <div style={{ marginTop: '1rem', paddingTop: '2rem', borderTop: '1px solid #edf2f7', display: 'flex', justifyContent: 'center' }}>
            <button 
              type="submit" 
              disabled={loading || !selectedClientId}
              style={{ 
                backgroundColor: (!loading && selectedClientId && selectedServices.length > 0) ? '#cbd5e0' : '#e2e8f0', // Cor acinzentada conforme o mockup
                color: '#4a5568', 
                border: 'none',
                padding: '14px 40px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: (!loading && selectedClientId && selectedServices.length > 0) ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? 'A processar...' : '✔️ Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
