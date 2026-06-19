'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import AgendarModal from '../../components/AgendarModal';
import NovoClienteModal from '../../components/NovoClienteModal';
import { LayoutDashboard, Calendar, Users, Scissors, XCircle, Gift, Menu, X, CalendarPlus, UserPlus, BarChart } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const [isAgendarOpen, setIsAgendarOpen] = useState(false);
  const [isNovoClienteOpen, setIsNovoClienteOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Relatórios', path: '/admin/reports', icon: <BarChart size={20} /> },
    { name: 'Agenda', path: '/admin/agenda', icon: <Calendar size={20} /> },
    { name: 'Clientes', path: '/admin/clients', icon: <Users size={20} /> },
    { name: 'Manutenções', path: '/admin/maintenance', icon: <Scissors size={20} /> },
    { name: 'Cancelamentos', path: '/admin/cancellations', icon: <XCircle size={20} /> },
    { name: 'Aniversários', path: '/admin/birthdays', icon: <Gift size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text-dark)', overflowX: 'hidden' }}>
      
      {/* Overlay escuro pro celular quando o menu abre */}
      <div 
        className={`admin-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '0 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="gold-text" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Amanda Studio</h2>
          <button 
            className="hamburger-btn" 
            style={{ display: isSidebarOpen ? 'block' : 'none', color: 'var(--gold-light)' }} 
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1rem' }}>
          {menuItems.map(item => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name} 
                href={item.path}
                onClick={() => setIsSidebarOpen(false)} // Fecha ao clicar no mobile
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: isActive ? 'bold' : 'normal',
                  color: isActive ? '#2d160d' : 'var(--gold-light)',
                  background: isActive ? 'linear-gradient(to right, var(--gold-main), var(--gold-light))' : 'transparent',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        
        {/* Topbar */}
        <header style={{ 
          minHeight: '80px', 
          backgroundColor: '#fff', 
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          
          {/* Hambúrguer + Pesquisa */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '250px' }}>
            <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              style={{
                width: '100%',
                maxWidth: '350px',
                padding: '12px 20px',
                borderRadius: '20px',
                border: '1px solid #e0e0e0',
                backgroundColor: '#f9f9f9',
                outline: 'none'
              }}
            />
          </div>
          
          {/* Botões de Ação */}
          <div className="admin-header-actions" style={{ display: 'flex', gap: '0.8rem' }}>
            <button 
              onClick={() => setIsAgendarOpen(true)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '2px solid var(--gold-main)',
                backgroundColor: 'transparent',
                color: 'var(--gold-dark)',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <CalendarPlus size={18} /> Agendar
            </button>
            <button 
              onClick={() => setIsNovoClienteOpen(true)}
              className="btn-primary" 
              style={{ padding: '10px 20px', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <UserPlus size={18} /> Novo Cliente
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>

      <AgendarModal isOpen={isAgendarOpen} onClose={() => setIsAgendarOpen(false)} />
      <NovoClienteModal isOpen={isNovoClienteOpen} onClose={() => setIsNovoClienteOpen(false)} />
    </div>
  );
}
