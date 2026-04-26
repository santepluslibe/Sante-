import React, { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';
import { HashRouter as Router, Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { api } from './api';
import Login from './pages/Login';
import Register from './pages/Register';
import Agenda from './pages/Agenda';
import Patients from './pages/Patients';
import PatientFiche from './pages/PatientFiche';
import DiagrammeSoins from './pages/DiagrammeSoins';
import DiagrammeDetail from './pages/DiagrammeDetail';
import Tournee from './pages/Tournee';
import Planning from './pages/Planning';
import Messagerie from './pages/Messagerie';
import Profil from './pages/Profil';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getProfil()
        .then(data => { if (data) setUser(data); })
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, mot_de_passe) => {
    const data = await api.login({ email, mot_de_passe });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh',
        background: 'linear-gradient(160deg, #0C2D4E 0%, #1A4A6E 100%)',
        color: '#fff', gap: 12,
      }}>
        <div style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontStyle: 'italic', fontSize: 22, opacity: 0.9,
        }}>Santé +</div>
        <div style={{ width: 28, height: 28, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      <Router>
        <Routes>
          <Route path="/login"    element={!user ? <Login />    : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/*"        element={user  ? <MainApp />  : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

/* ============================================================
   ICÔNES DE LA NAVIGATION
   ============================================================ */
const NAV_ITEMS = [
  {
    path: '/',
    label: 'Agenda',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#98A4B3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8"  y1="2" x2="8"  y2="6"/>
        <line x1="3"  y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    path: '/patients',
    label: 'Patients',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#98A4B3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9"  cy="7"  r="4"/>
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        <path d="M21 21v-2a4 4 0 0 0-3-3.87"/>
      </svg>
    ),
  },
  {
    path: '/soins',
    label: 'Soins',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#98A4B3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
        <line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
    ),
  },
  {
    path: '/tournee',
    label: 'Tournée',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#98A4B3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 18 0A9 9 0 0 0 3 12"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
  },
  {
    path: '/planning',
    label: 'Planning',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#98A4B3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
];

function MainApp() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user }   = useAuth();
  const initials  = user ? (user.prenom?.[0] || '') + (user.nom?.[0] || '') : '?';

  const [notifications, setNotifications] = useState([]);
  const [notifCount,    setNotifCount]    = useState(0);
  const [showNotifPanel,setShowNotifPanel]= useState(false);
  const [unreadMsgCount,setUnreadMsgCount]= useState(0);
  const notifRef = useRef(null);

  // BUG FIX: useCallback évite les recréations inutiles dans useEffect
  const loadNotifs = useCallback(() => {
    api.getNotifications()
      .then(data => {
        setNotifications(data?.notifications || []);
        setNotifCount(data?.unread_count || 0);
      })
      .catch(() => {});
  }, []);

  const loadUnreadMessages = useCallback(() => {
    api.getUnreadMsgCount()
      .then(data => setUnreadMsgCount(data?.count || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadNotifs();
    loadUnreadMessages();
    const interval = setInterval(() => { loadNotifs(); loadUnreadMessages(); }, 60000);
    return () => clearInterval(interval);
  }, [loadNotifs, loadUnreadMessages]);

  // BUG FIX: fermeture du panel notifs en cliquant à l'extérieur
  useEffect(() => {
    if (!showNotifPanel) return;
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifPanel]);

  const handleNotifClick = async (notif) => {
    if (!notif.lu) {
      await api.markNotifRead(notif.id).catch(() => {});
      loadNotifs();
    }
    setShowNotifPanel(false);
    if (notif.lien) navigate(notif.lien);
  };

  const markAllRead = async () => {
    await api.markAllNotifsRead().catch(() => {});
    loadNotifs();
  };

  /* Titre dynamique de la page courante */
  const pageTitle = () => {
    const p = location.pathname;
    if (p === '/')           return 'Agenda';
    if (p === '/patients')   return 'Patients';
    if (p === '/soins')      return 'Diagrammes de soins';
    if (p === '/tournee')    return 'Tournée';
    if (p === '/planning')   return 'Planning';
    if (p === '/messages')   return 'Messagerie';
    if (p === '/profil')     return 'Mon profil';
    if (p.startsWith('/patients/')) return 'Fiche patient';
    if (p.startsWith('/soins/'))    return 'Diagramme';
    return '';
  };

  const isSubPage = location.pathname !== '/' &&
    !NAV_ITEMS.some(n => n.path === location.pathname);

  return (
    <div className="app-container">
      {/* ===== HEADER ===== */}
      <header className="app-header">
        {isSubPage ? (
          <>
            <button className="header-back" onClick={() => navigate(-1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Retour
            </button>
            <span className="header-title">{pageTitle()}</span>
          </>
        ) : (
          <span className="logo">Santé +</span>
        )}

        <div className="header-right">
          {/* Bouton messagerie */}
          <button
            onClick={() => navigate('/messages')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', position: 'relative', display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.75)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {unreadMsgCount > 0 && (
              <span className="notif-badge">{unreadMsgCount}</span>
            )}
          </button>

          {/* Bouton notifications */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              onClick={() => setShowNotifPanel(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', position: 'relative', display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.75)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {notifCount > 0 && (
                <span className="notif-badge">{notifCount}</span>
              )}
            </button>

            {showNotifPanel && (
              <div className="notif-panel">
                <div className="notif-panel-header">
                  <span>Notifications</span>
                  {notifCount > 0 && (
                    <button onClick={markAllRead} style={{ background: 'none', border: 'none', fontSize: 11, color: '#1A4A6E', cursor: 'pointer', fontWeight: 500 }}>
                      Tout lire
                    </button>
                  )}
                </div>
                <div className="notif-panel-body">
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 16px', color: '#6B7A8D', fontSize: 12 }}>
                      Aucune notification
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`notif-item ${n.lu ? '' : 'notif-unread'}`} onClick={() => handleNotifClick(n)}>
                        <span className="notif-icon">{n.icone || '🔔'}</span>
                        <div>
                          <div className="notif-title">{n.titre}</div>
                          <div className="notif-msg">{n.message}</div>
                          <div className="notif-time">{n.created_at ? new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar / Profil */}
          <div className="avatar-circle" onClick={() => navigate('/profil')}>
            {initials.toUpperCase()}
          </div>
        </div>
      </header>

      {/* ===== CONTENU ===== */}
      <main className="screen">
        <Routes>
          <Route path="/"                element={<Agenda />} />
          <Route path="/patients"        element={<Patients />} />
          <Route path="/patients/:id"    element={<PatientFiche />} />
          <Route path="/soins"           element={<DiagrammeSoins />} />
          <Route path="/soins/:id"       element={<DiagrammeDetail />} />
          <Route path="/tournee"         element={<Tournee />} />
          <Route path="/planning"        element={<Planning />} />
          <Route path="/messages"        element={<Messagerie />} />
          <Route path="/profil"          element={<Profil />} />
        </Routes>
      </main>

      {/* ===== NAVIGATION BAS ===== */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              className={`nav-item ${active ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default App;
