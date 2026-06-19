'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

import { CalendarCheck, Users, Scissors, Gift, XCircle } from 'lucide-react';

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
      
      // Pega todos os clientes e agendamentos para os cálculos
      const { data: allClients } = await supabase.from('clients').select('*');
      const { data: allAppointments } = await supabase
        .from('appointments')
        .select('client_id, date_time, status');

      // 0. Total Agendados (não cancelados nem concluídos)
      const activeAppointments = allAppointments?.filter(a => a.status !== 'cancelado' && a.status !== 'concluido') || [];
      const appointmentsCount = activeAppointments.length;

      // 1. Total de Clientes
      const { count: clientCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // 3. Cancelamentos
      const cancelledCount = allAppointments?.filter(a => a.status === 'cancelado').length || 0;

      // 2. Manutenções Atrasadas (Mesma inteligência da aba Manutenções)
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      let maintenanceCount = 0;
      
      if (allClients && allAppointments) {
        allClients.forEach(client => {
          const clientAppts = allAppointments.filter(a => a.client_id === client.id && a.status !== 'cancelado');
          const hasFutureAppt = clientAppts.some(a => new Date(a.date_time) > now);
          if (hasFutureAppt) return; 
          
          const pastAppts = clientAppts
            .filter(a => new Date(a.date_time) <= now)
            .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());
                                       
          let lastVisitDateStr = client.last_visit_date; 
          if (pastAppts.length > 0) {
            lastVisitDateStr = pastAppts[0].date_time;
          }
          
          const lastVisitDate = new Date(lastVisitDateStr);
          if (lastVisitDate <= thirtyDaysAgo) {
            maintenanceCount++;
          }
        });
      }

      // 4. Aniversariantes do Mês
      const currentMonth = new Date().getMonth() + 1; // 1 a 12
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
    { title: 'Total Agendados', value: loading ? '...' : stats.totalAppointments, icon: <CalendarCheck size={24} />, color: '#48bb78', href: '/admin/agenda' },
    { title: 'Total de Clientes', value: loading ? '...' : stats.totalClients, icon: <Users size={24} />, color: '#4facfe', href: '/admin/clients' },
    { title: 'Manutenções Atrasadas', value: loading ? '...' : stats.maintenanceAlerts, icon: <Scissors size={24} />, color: '#ff6a88', href: '/admin/maintenance' },
    { title: 'Aniversariantes do Mês', value: loading ? '...' : stats.birthdaysThisMonth, icon: <Gift size={24} />, color: '#c471ed', href: '/admin/birthdays' },
    { title: 'Cancelamentos', value: loading ? '...' : stats.cancellations, icon: <XCircle size={24} />, color: '#fddb92', href: '/admin/cancellations' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--admin-sidebar)' }}>
        Painel de Controlo
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {kpis.map((kpi, idx) => (
          <Link 
            href={kpi.href}
            key={idx} 
            className="kpi-card"
            style={{ 
              backgroundColor: 'var(--admin-card-bg)', 
              padding: '1.5rem', 
              borderRadius: '16px', 
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
          </Link>
        ))}
      </div>
    </div>
  );
}
