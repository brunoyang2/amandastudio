'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalClients: 0,
    maintenanceAlerts: 0,
    birthdaysThisMonth: 0,
    cancellations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      
      // 0. Total Agendados (não cancelados)
      const { count: appointmentsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'cancelado');

      // 1. Total de Clientes
      const { count: clientCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // 2. Manutenções Atrasadas (last_visit_date <= 30 dias atrás)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: maintenanceCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .lte('last_visit_date', thirtyDaysAgo.toISOString().split('T')[0]);

      // 3. Cancelamentos
      const { count: cancelledCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelado');

      // 4. Aniversariantes do Mês
      const currentMonth = new Date().getMonth() + 1; // 1 a 12
      // No Supabase é chato filtrar só pelo mês em campo date, então pegamos todos e filtramos no front por ser MVP
      const { data: allClients } = await supabase.from('clients').select('birthdate');
      let bdays = 0;
      if (allClients) {
        bdays = allClients.filter(c => {
          if (!c.birthdate) return false;
          const month = parseInt(c.birthdate.split('-')[1], 10);
          return month === currentMonth;
        }).length;
      }

      setStats({
        totalAppointments: appointmentsCount || 0,
        totalClients: clientCount || 0,
        maintenanceAlerts: maintenanceCount || 0,
        cancellations: cancelledCount || 0,
        birthdaysThisMonth: bdays
      });
      setLoading(false);
    }

    loadStats();
  }, []);

  const kpis = [
    { title: 'Total Agendados', value: loading ? '...' : stats.totalAppointments, icon: '📅', color: '#48bb78' },
    { title: 'Total de Clientes', value: loading ? '...' : stats.totalClients, icon: '👥', color: '#4facfe' },
    { title: 'Manutenções Atrasadas', value: loading ? '...' : stats.maintenanceAlerts, icon: '💅', color: '#ff6a88' },
    { title: 'Aniversariantes do Mês', value: loading ? '...' : stats.birthdaysThisMonth, icon: '🎁', color: '#c471ed' },
    { title: 'Cancelamentos', value: loading ? '...' : stats.cancellations, icon: '❌', color: '#fddb92' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--admin-sidebar)' }}>
        Painel de Controlo
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {kpis.map((kpi, idx) => (
          <div 
            key={idx} 
            style={{ 
              backgroundColor: 'var(--admin-card-bg)', 
              padding: '1.5rem', 
              borderRadius: '16px', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              border: '1px solid #f0f0f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ 
              width: '45px', 
              height: '45px', 
              borderRadius: '12px', 
              backgroundColor: `${kpi.color}15`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: kpi.color
            }}>
              {kpi.icon}
            </div>
            <div>
              <p style={{ color: 'var(--admin-text-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                {kpi.title}
              </p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--admin-text-dark)' }}>
                {kpi.value}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
