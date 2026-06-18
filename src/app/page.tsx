'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: 'Manicure Completa',
    date: '',
    time: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log("URL CONFIGURADA:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("CHAVE ANON:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 5) + "...");

    try {
      // Juntando data e hora em um formato que o banco entende (ISO 8601 Timestamp)
      const dateTimeString = `${formData.date}T${formData.time}:00-03:00`; // Considerando horário de Brasília

      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            customer_name: formData.name,
            customer_phone: formData.phone,
            service: formData.service,
            date_time: dateTimeString,
          }
        ]);

      if (error) {
        console.error('Erro ao salvar:', error);
        alert('Houve um erro ao agendar. Você criou a tabela no Supabase?');
      } else {
        alert('Agendamento realizado com sucesso! Em breve entraremos em contato.');
        setFormData({ name: '', phone: '', service: 'Manicure Completa', date: '', time: '' });
      }
    } catch (error) {
      console.error(error);
      alert('Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px' }}>
        <h1 className="gold-text" style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          Amanda Studio
        </h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Agende seu horário e sinta a experiência premium de Nail Design.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div className="input-group">
            <label>Seu Nome</label>
            <input 
              type="text" 
              required
              placeholder="Ex: Maria Eduarda"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="premium-input"
            />
          </div>

          <div className="input-group">
            <label>WhatsApp</label>
            <input 
              type="tel" 
              required
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="premium-input"
            />
          </div>

          <div className="input-group">
            <label>Serviço Desejado</label>
            <select 
              value={formData.service}
              onChange={e => setFormData({...formData, service: e.target.value})}
              className="premium-input"
            >
              <option value="Manicure Completa">Manicure Completa</option>
              <option value="Alongamento em Gel">Alongamento em Gel</option>
              <option value="Manutenção de Gel">Manutenção de Gel</option>
              <option value="Nail Art Especial">Nail Art Especial</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Data</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="premium-input"
              />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Horário</label>
              <input 
                type="time" 
                required
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})}
                className="premium-input"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
            Confirmar Agendamento
          </button>
        </form>
      </div>
    </main>
  );
}
