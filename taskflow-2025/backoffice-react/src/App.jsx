import { useCallback, useEffect, useState } from 'react';
import { api, setUnauthorizedHandler } from './api';
import Login from './components/Login.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Users from './pages/Users.jsx';
import Projects from './pages/Projects.jsx';
import Tasks from './pages/Tasks.jsx';
import Profile from './pages/Profile.jsx';

const isMobile = () => window.innerWidth < 768; // même seuil que "md" de Tailwind

export default function App() {
  const [me, setMe] = useState(null);
  const [checking, setChecking] = useState(!!localStorage.getItem('tf_token'));
  const [page, setPage] = useState('dashboard');
  const [projectId, setProjectId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile());
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, ok = true) => {
    setToast({ message, ok });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tf_token');
    setMe(null);
  }, []);

  useEffect(() => { setUnauthorizedHandler(logout); }, [logout]);

  useEffect(() => {
    if (!localStorage.getItem('tf_token')) return;
    api('/api/users/me')
      .then((d) => (d.user.role === 'ADMIN' ? setMe(d.user) : logout()))
      .catch(logout)
      .finally(() => setChecking(false));
  }, [logout]);

  const handleLogin = (token, user) => {
    localStorage.setItem('tf_token', token);
    setMe(user);
  };

  const goTo = (key) => {
    setPage(key);
    if (isMobile()) setSidebarOpen(false);
  };

  const openTasks = (id) => { setProjectId(id); goTo('tasks'); };

  let content;
  if (checking) {
    content = <p className="mt-20 text-center">Chargement…</p>;
  } else if (!me) {
    content = <Login onLogin={handleLogin} notify={notify} />;
  } else {
    content = (
      <>
        <Navbar me={me} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onLogout={logout} />
        <div className="flex min-h-[calc(100vh-3.5rem)]">
          <Sidebar current={page} open={sidebarOpen} onSelect={goTo} onClose={() => setSidebarOpen(false)} />
          <main className="min-w-0 flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-6xl">
              {page === 'dashboard' && <Dashboard notify={notify} />}
              {page === 'users' && <Users notify={notify} />}
              {page === 'projects' && <Projects notify={notify} onOpenTasks={openTasks} />}
              {page === 'tasks' && <Tasks notify={notify} projectId={projectId} setProjectId={setProjectId} />}
              {page === 'profile' && <Profile notify={notify} />}
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      {content}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 max-w-xs rounded-lg px-4 py-3 text-white shadow-lg ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}