import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Workspace from './pages/Workspace';
import Backlog from './pages/Backlog';
import Settings from './pages/Settings';
import Team from './pages/Team';
import Departments from './pages/Departments';
import Dashboard from './pages/Dashboard';
import { Toaster } from 'react-hot-toast';
function App() {
  return (
    <Router>
     <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            zIndex: 999999,
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        
        {/* Protected Routes (Wrapped in Layout) */}
        <Route path="/workspace" element={
          <Layout>
            <Workspace />
          </Layout>
        } />
<Route element={<Layout><Dashboard /></Layout>} path="/dashboard" />

        <Route element={<Layout><Team /></Layout>} path="/team" />
        <Route path="/backlog" element={
          <Layout>
            <Backlog />
          </Layout>
        } />
        
        <Route path="/departments" element={<Layout><Departments /></Layout>} />
        <Route path="/settings" element={
          <Layout>
            <Settings />
          </Layout>
        } />
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;