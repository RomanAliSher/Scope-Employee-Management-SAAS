import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import myLogo from '../assets/logo.png'; 
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config'; 

function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth(); 
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // 1. Save JWT Token
        localStorage.setItem('jwt_token', data.jwtToken);
        
        // 2. Create safe user data
        const safeUserData = {
          name: data.customerDTO.name,
          email: data.customerDTO.email,
          roles: data.customerDTO.roles,
          workspaceName: data.customerDTO.workspaceName
        };

        // 3. Save user details
        localStorage.setItem('user_data', JSON.stringify(safeUserData));
        setUser(safeUserData);
        toast.success(`Welcome back, ${safeUserData.name}!`);
        navigate('/workspace'); 
        
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Invalid email or password.';
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      toast.error('Could not connect to the server.');
      setError('Could not connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
        @keyframes spin-reverse { 100% { transform: rotate(-360deg); } }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 25s linear infinite; }
      `}</style>

      {/* Main Container: Added dark:bg-gray-900 */}
      <div className="min-h-screen flex items-center justify-between bg-white dark:bg-gray-900 overflow-hidden relative font-sans transition-colors duration-300">
        
        {/* Background Accent Grid */}
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#172B4D 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

        {/* LEFT COLUMN: Form */}
        <div className="w-full lg:w-1/2 flex justify-start pl-8 lg:pl-32 relative z-10">
          <div className="bg-white dark:bg-gray-900 p-10 w-full max-w-md transition-colors duration-300">
            
            <div className="font-bold text-2xl flex items-center gap-2 mb-16">
              <img src={myLogo} alt="Scope Logo" className="w-10 h-10 object-contain rounded" />
              <span className="text-theme-dark dark:text-white tracking-tight">SCOPE</span>
            </div>

            <h1 className="text-4xl font-extrabold text-theme-dark dark:text-white mb-3">Welcome Back.</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-10 font-medium text-lg">Pick up exactly where you left off.</p>

            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  placeholder="you@company.com" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full rounded-2xl border-b-2 border-gray-200 dark:border-gray-700 bg-transparent text-theme-dark dark:text-white focus:outline-none focus:border-theme-blue dark:focus:border-blue-500 transition-colors font-semibold text-lg pb-2 placeholder-gray-300 dark:placeholder-gray-600 p-3" 
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider m-3">Password</label>
                  <a href="#" className="text-xs font-bold text-theme-blue dark:text-blue-400 hover:text-theme-blue-hover dark:hover:text-blue-300">Forgot?</a>
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full rounded-2xl border-b-2 border-gray-200 dark:border-gray-700 bg-transparent text-theme-dark dark:text-white focus:outline-none focus:border-theme-blue dark:focus:border-blue-500 transition-colors font-semibold text-lg pb-2 placeholder-gray-300 dark:placeholder-gray-600 p-3" 
                />
              </div>

              {/* Error Message Display */}
              {error && (
                <div className="text-red-500 dark:text-red-400 text-sm font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800/50">
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-theme-dark dark:bg-theme-blue text-white font-bold text-lg py-4 rounded-xl mt-6 hover:bg-black dark:hover:bg-blue-600 hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-blue-900/20 transition-all disabled:opacity-70"
              >
                {isLoading ? 'Authenticating...' : 'Log In'}
              </button>
            </form>

            <div className="mt-10 font-medium">
              <span className="text-gray-400 dark:text-gray-500">New to SCOPE?</span> <Link to="/signup" className="text-theme-blue dark:text-blue-400 font-bold hover:underline">Create an account</Link>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: High-Tech Geometric Rings (Stays dark universally) */}
        <div className="hidden lg:flex w-1/2 h-screen justify-center items-center pr-24 relative bg-[#0B1426] rounded-l-[100px] overflow-hidden">
          
          <div className="absolute w-64 h-64 bg-theme-blue rounded-full blur-[80px] opacity-60"></div>
          
          <div className="absolute w-[600px] h-[600px] border border-white/10 rounded-full animate-spin-slow flex items-center justify-center">
            <div className="absolute top-0 w-4 h-4 bg-theme-red rounded-full shadow-[0_0_20px_#DE350B]"></div>
          </div>

          <div className="absolute w-[400px] h-[400px] border border-theme-blue/30 rounded-full animate-spin-reverse flex items-center justify-center">
             <div className="absolute bottom-0 right-10 w-3 h-3 bg-white rounded-full shadow-[0_0_15px_white]"></div>
             <div className="absolute top-10 left-10 w-2 h-2 bg-theme-blue rounded-full shadow-[0_0_10px_#0052CC]"></div>
          </div>

          <div className="absolute w-[200px] h-[200px] border-2 border-dashed border-white/20 rounded-full animate-spin-slow"></div>

          <div className="absolute z-10 text-white text-center">
            <h2 className="text-3xl font-bold tracking-widest mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">START</h2>
            <div className="text-xs tracking-[0.3em] text-theme-blue font-mono">WHERE YOU LEFT</div>
          </div>

        </div>

      </div>
    </>
  );
}

export default Login;