import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import myLogo from '../assets/logo.png';
import toast from 'react-hot-toast'; 
import { API_BASE_URL } from '../config'; 

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    workspaceName: '',
    name: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Registration successful! Redirecting to login...', { duration: 3000 });
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.email || 'Registration failed. Please check your details.';
        
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'Could not connect to the server. Sorry for the inconvenience.';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* Enhanced floating animations with subtle rotations */
        @keyframes float-1 { 0%, 100% { transform: translateY(0px) rotate(-2deg); } 50% { transform: translateY(-20px) rotate(1deg); } }
        @keyframes float-2 { 0%, 100% { transform: translateY(0px) rotate(1deg) scale(1); } 50% { transform: translateY(-25px) rotate(-1deg) scale(1.02); } }
        @keyframes float-3 { 0%, 100% { transform: translateY(0px) rotate(3deg); } 50% { transform: translateY(-15px) rotate(0deg); } }
        
        .animate-float-1 { animation: float-1 7s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 6s ease-in-out infinite 1s; }
        .animate-float-3 { animation: float-3 5s ease-in-out infinite 2s; }
      `}</style>

      {/* Main Container - Added dark gradient */}
      <div className="h-screen flex items-center justify-between bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden relative font-sans transition-colors duration-300">
        
        {/* Ambient Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-theme-blue/10 dark:bg-blue-900/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-900/20 blur-[120px] pointer-events-none"></div>

        {/* LEFT COLUMN: Form Container */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-start px-6 sm:px-12 lg:px-0 lg:pl-28 relative z-10">
          
          <div className="bg-white/70 dark:bg-gray-800/80 backdrop-blur-xl p-7 sm:p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/80 dark:border-gray-700/50 w-full max-w-[400px] relative overflow-hidden transition-colors duration-300">
            
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-theme-blue to-purple-500"></div>

            <div className="font-extrabold text-2xl flex items-center gap-2.5 mb-6">
              <div className="bg-white dark:bg-gray-700 p-1.5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 transition-colors">
                <img src={myLogo} alt="Scope Logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-theme-dark dark:text-white tracking-tight">Scope</span>
            </div>

            <h1 className="text-3xl font-extrabold text-theme-dark dark:text-white mb-1.5 tracking-tight transition-colors">
              Register <span className="text-transparent bg-clip-text bg-gradient-to-r from-theme-blue to-purple-600 dark:from-blue-400 dark:to-purple-400">Company.</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-7 font-medium leading-relaxed transition-colors">
              Create your workspace and streamline your team's workflow in minutes.
            </p>

            <form onSubmit={handleSignup} className="flex flex-col gap-3.5">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Company / Workspace Name" 
                  required 
                  value={formData.workspaceName}
                  onChange={(e) => setFormData({...formData, workspaceName: e.target.value})}
                  className="w-full p-3.5 text-sm bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-theme-dark dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-blue/50 dark:focus:ring-blue-500/50 focus:border-theme-blue dark:focus:border-blue-500 transition-all font-medium placeholder-gray-400 dark:placeholder-gray-500 shadow-sm group-hover:border-gray-300 dark:group-hover:border-gray-600" 
                />
              </div>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Admin Full Name" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3.5 text-sm bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-theme-dark dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-blue/50 dark:focus:ring-blue-500/50 focus:border-theme-blue dark:focus:border-blue-500 transition-all font-medium placeholder-gray-400 dark:placeholder-gray-500 shadow-sm group-hover:border-gray-300 dark:group-hover:border-gray-600" 
                />
              </div>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="Admin Work Email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3.5 text-sm bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-theme-dark dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-blue/50 dark:focus:ring-blue-500/50 focus:border-theme-blue dark:focus:border-blue-500 transition-all font-medium placeholder-gray-400 dark:placeholder-gray-500 shadow-sm group-hover:border-gray-300 dark:group-hover:border-gray-600" 
                />
              </div>
              <div className="relative group">
                <input 
                  type="password" 
                  placeholder="Password" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full p-3.5 text-sm bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-theme-dark dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-blue/50 dark:focus:ring-blue-500/50 focus:border-theme-blue dark:focus:border-blue-500 transition-all font-medium placeholder-gray-400 dark:placeholder-gray-500 shadow-sm group-hover:border-gray-300 dark:group-hover:border-gray-600" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-theme-blue to-blue-600 dark:from-blue-600 dark:to-purple-600 text-white font-bold py-3.5 text-sm rounded-xl mt-2 hover:shadow-lg hover:shadow-theme-blue/30 dark:hover:shadow-blue-900/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? 'Registering...' : 'Create Workspace'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6 opacity-70">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-gray-300 dark:to-gray-600"></div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Or continue with</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-300 dark:via-gray-600 to-gray-300 dark:to-gray-600"></div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm hover:shadow">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" /> Google
              </button>
              <button className="flex-1 flex items-center justify-center gap-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm hover:shadow">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" className="w-4 h-4 shrink-0">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                </svg>
                Microsoft
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">
                Already have a workspace? <Link to="/login" className="text-theme-blue dark:text-blue-400 font-extrabold hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Log in</Link>
              </p>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Enhanced Abstract Floating UI Animation */}
        <div className="hidden lg:flex w-1/2 h-screen justify-center items-center pr-12 relative">
          
          <div className="absolute w-[450px] h-[450px] bg-gradient-to-br from-theme-blue/10 dark:from-theme-blue/20 to-purple-500/10 dark:to-purple-500/20 rounded-full blur-3xl"></div>
          
          <svg className="absolute w-[300px] h-[300px] text-gray-300/50 dark:text-gray-600/50" fill="none" stroke="currentColor" strokeDasharray="8 8" strokeWidth="2">
            <path d="M50 50 C 150 150, 150 50, 250 250" />
          </svg>

          <div className="relative w-[450px] h-[400px]">
            
            {/* Widget 1 */}
            <div className="absolute top-12 left-0 w-56 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 animate-float-1 z-20 transition-colors">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-theme-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">IN PROGRESS</span>
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-400 to-theme-blue flex items-center justify-center text-white text-[9px] font-bold shadow-sm">JD</div>
              </div>
              <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full mb-2"></div>
              <div className="w-4/5 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full mb-4"></div>
              <div className="w-full bg-gray-50 dark:bg-gray-600 rounded-full h-1.5">
                <div className="bg-theme-blue dark:bg-blue-500 h-1.5 rounded-full w-[65%]"></div>
              </div>
            </div>

            {/* Widget 2 */}
            <div className="absolute top-8 left-[140px] w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-5 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] border border-white dark:border-gray-700 animate-float-2 z-30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-theme-blue to-purple-500 flex items-center justify-center shadow-lg shadow-theme-blue/20 dark:shadow-theme-blue/10">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <div>
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mb-1.5"></div>
                  <div className="w-24 h-3 bg-gray-800 dark:bg-gray-300 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-end gap-2 h-16 mt-4">
                <div className="w-1/4 bg-blue-100 dark:bg-blue-900/50 rounded-t-md h-[40%]"></div>
                <div className="w-1/4 bg-theme-blue dark:bg-blue-500 rounded-t-md h-[80%]"></div>
                <div className="w-1/4 bg-purple-200 dark:bg-purple-900/50 rounded-t-md h-[60%]"></div>
                <div className="w-1/4 bg-purple-500 dark:bg-purple-400 rounded-t-md h-[100%] shadow-[0_0_15px_rgba(168,85,247,0.4)] dark:shadow-[0_0_15px_rgba(168,85,247,0.2)] relative">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-gray-100 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Widget 3 */}
            <div className="absolute top-36 right-0 w-44 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3.5 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 animate-float-3 z-20 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div className="w-full">
                  <div className="w-12 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mb-1.5"></div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                </div>
              </div>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-gray-800"></div>
                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-500 border-2 border-white dark:border-gray-800"></div>
                <div className="w-6 h-6 rounded-full bg-theme-blue dark:bg-blue-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[8px] font-bold text-white">+3</div>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </>
  );
}

export default Signup;