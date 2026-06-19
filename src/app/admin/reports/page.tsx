'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Calendar as CalendarIcon, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ReportsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterType, setFilterType] = useState<'month' | 'day'>('month');
  
  // Para mês: Formato YYYY-MM
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  // Para dia: Formato YYYY-MM-DD
  const currentDay = new Date().toISOString().split('T')[0];
  const [selectedDay, setSelectedDay] = useState(currentDay);

  useEffect(() => {
    async function loadReportData() {
      setLoading(true);
      
      let startOfPeriod = '';
      let endOfPeriod = '';

      if (filterType === 'month') {
        const [year, month] = selectedMonth.split('-');
        startOfPeriod = `${year}-${month}-01T00:00:00-03:00`;
        // Para pegar o último dia do mês
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        endOfPeriod = `${year}-${month}-${lastDay}T23:59:59-03:00`;
      } else {
        startOfPeriod = `${selectedDay}T00:00:00-03:00`;
        endOfPeriod = `${selectedDay}T23:59:59-03:00`;
      }

      const { data } = await supabase
        .from('appointments')
        .select('*')
        .gte('date_time', startOfPeriod)
        .lte('date_time', endOfPeriod);

      setAppointments(data || []);
      setLoading(false);
    }

    loadReportData();
  }, [filterType, selectedMonth, selectedDay]);

  // Cálculos de Resumo
  const totalAgendados = appointments.length;
  const totalConfirmados = appointments.filter(a => a.status === 'confirmado' || a.status === 'pendente' || !a.status).length;
  const totalConcluidos = appointments.filter(a => a.status === 'concluido').length;
  const totalCancelados = appointments.filter(a => a.status === 'cancelado').length;

  // Lógica para o Gráfico de Serviços Populares
  const serviceCounts: Record<string, number> = {};
  
  appointments.forEach(appt => {
    // Apenas conta serviços que não foram cancelados (para ver o que realmente saiu)
    if (appt.status !== 'cancelado' && appt.services) {
      appt.services.forEach((service: string) => {
        if (serviceCounts[service]) {
          serviceCounts[service]++;
        } else {
          serviceCounts[service] = 1;
        }
      });
    }
  });

  const chartData = Object.keys(serviceCounts)
    .map(key => ({
      name: key,
      quantidade: serviceCounts[key]
    }))
    .sort((a, b) => b.quantidade - a.quantidade); // Ordena do maior para o menor

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--admin-sidebar)' }}>
          Relatórios
        </h1>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            className="premium-input"
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value as 'month' | 'day')}
            style={{ padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            <option value="month">Filtrar por Mês</option>
            <option value="day">Filtrar por Dia</option>
          </select>

          {filterType === 'month' ? (
            <input 
              type="month" 
              className="premium-input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          ) : (
            <input 
              type="date" 
              className="premium-input"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            />
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>Carregando dados...</div>
      ) : (
        <>
          {/* Cards de Resumo */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#718096', marginBottom: '10px' }}>
                <CalendarIcon size={20} color="#b8912d" />
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Total de Agendamentos</span>
              </div>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2d160d' }}>{totalAgendados}</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#718096', marginBottom: '10px' }}>
                <CheckCircle size={20} color="#38a169" />
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Ativos / Concluídos</span>
              </div>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#38a169' }}>
                {totalConfirmados + totalConcluidos}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '5px' }}>
                {totalConfirmados} ativos, {totalConcluidos} concluídos
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#718096', marginBottom: '10px' }}>
                <XCircle size={20} color="#e53e3e" />
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Cancelados</span>
              </div>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#e53e3e' }}>{totalCancelados}</span>
            </div>
          </div>

          {/* Gráfico */}
          <div className="glass-panel" style={{ padding: '2rem', backgroundColor: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#2d160d', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 size={24} color="#b8912d" />
              Serviços Mais Realizados
            </h2>

            {chartData.length > 0 ? (
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#718096', fontSize: 12 }}
                      axisLine={{ stroke: '#cbd5e0' }}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      allowDecimals={false}
                      tick={{ fill: '#718096', fontSize: 12 }}
                      axisLine={{ stroke: '#cbd5e0' }}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(212, 175, 55, 0.1)' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="quantidade" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#b8912d' : '#e2e8f0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#a0aec0', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
                Nenhum serviço realizado neste período.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
