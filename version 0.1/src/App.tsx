import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { NotificationCenter } from './components/NotificationCenter';
import { ServerDashboard } from './components/ServerDashboard';
import { KitchenDashboard } from './components/KitchenDashboard';
import { AdminDashboard } from './components/AdminDashboard';

function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <NotificationCenter />
      {user.role === 'server' && <ServerDashboard />}
      {user.role === 'kitchen' && <KitchenDashboard />}
      {user.role === 'admin' && <AdminDashboard />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}

export default App;
