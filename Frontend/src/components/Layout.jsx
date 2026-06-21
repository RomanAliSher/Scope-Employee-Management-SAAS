import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import myLogo from '../assets/logo.png';
import { API_BASE_URL } from '../config';

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Destructured theme and toggleTheme from AuthContext
  const { user, setSearchQuery, setUser, theme, toggleTheme } = useAuth(); 

  const [localSearch, setLocalSearch] = useState('');
  
  // State for the notification dots
  const [indicators, setIndicators] = useState({
    needsReview: false,
    hasSprintTask: false,
    hasBacklogTask: false
  });

  // 1. DEBOUNCE LOGIC (500ms delay after typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 500); 

    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  // 2. CLEAR SEARCH ON PAGE CHANGE
  useEffect(() => {
    setLocalSearch('');
    setSearchQuery('');
  }, [location.pathname, setSearchQuery]);

  // 3. FETCH NOTIFICATION INDICATORS (Polling every 30s)
  useEffect(() => {
    const fetchIndicators = async () => {
      if (!user) return;
      
      try {
        const workspaceName = user.workspaceName;
        const token = localStorage.getItem('jwt_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch Backlog Issues
        const backlogRes = await fetch(`${API_BASE_URL}/api/v1/issues/backlog?workspaceName=${workspaceName}`, { headers });
        const backlogData = backlogRes.ok ? await backlogRes.json() : [];

        // Fetch Sprint Issues
        const sprintRes = await fetch(`${API_BASE_URL}/api/v1/sprints?workspaceName=${workspaceName}`, { headers });
        let sprintTasks = [];
        if (sprintRes.ok) {
          const sprints = await sprintRes.json();
          const sprintTasksPromises = sprints.map(async (sprint) => {
            const taskRes = await fetch(`${API_BASE_URL}/api/v1/issues/sprint/${sprint.id}`, { headers });
            return taskRes.ok ? await taskRes.json() : [];
          });
          const resolvedTasks = await Promise.all(sprintTasksPromises);
          sprintTasks = resolvedTasks.flat();
        }

        const allTasks = [...backlogData, ...sprintTasks];

        // Admin Check: Any task in review
        const anyTaskNeedsReview = allTasks.some(task => task.status === 'IN_REVIEW');

        // Employee Check: Assigned active tasks
        const mySprintTasks = sprintTasks.filter(task => task.assigneeEmail === user.email && task.status !== 'DONE');
        const myBacklogTasks = backlogData.filter(task => task.assigneeEmail === user.email && task.status !== 'DONE');

        setIndicators({
          needsReview: anyTaskNeedsReview,
          hasSprintTask: mySprintTasks.length > 0,
          hasBacklogTask: myBacklogTasks.length > 0
        });

      } catch (error) {
        console.error("Failed to fetch sidebar indicators", error);
      }
    };

    fetchIndicators();
    const interval = setInterval(fetchIndicators, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    navigate('/login');
    setUser(null);
    localStorage.clear(); 
  };
  
  const isActive = (path) => location.pathname.includes(path);

  // Reusable class generator for navigation links to keep the code clean and identical
  const getNavClass = (path) => {
    const baseClass = "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm";
    const activeClass = "bg-theme-blue/10 text-theme-blue dark:bg-gray-700/80 dark:text-blue-500 shadow-sm";
    const inactiveClass = "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:text-gray-200";
    
    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  // 4. SHOW SEARCH ONLY ON SPECIFIC PAGES
  const showSearch = ['/workspace', '/backlog', '/team'].some(path => location.pathname.includes(path));

  // SAFE ROLE EXTRACTION
  const getUserDisplayRole = () => {
    if (!user?.roles) return 'EMPLOYEE';

    try {
      // 1. If the backend returns a raw string like "[ROLE_ADMIN]" or "ROLE_ADMIN"
      if (typeof user.roles === 'string') {
        return user.roles.replace(/ROLE_/g, '').replace(/\[|\]/g, '').trim();
      }

      // 2. If the backend returns an array
      if (Array.isArray(user.roles)) {
        return user.roles.map(role => {
          // If it's an object like { authority: "ROLE_ADMIN" }, extract the string
          if (typeof role === 'object' && role !== null) {
            return role.authority || role.name || role.role || '';
          }
          // If it's a plain string in an array
          return String(role);
        }).join(', ').replace(/ROLE_/g, '').trim();
      }

      return 'EMPLOYEE';
    } catch (error) {
      return 'EMPLOYEE';
    }
  };

  const displayRole = getUserDisplayRole();

  // Helper check for admin (Updated to handle nested properties cleanly)
  const isAdmin = displayRole.includes('ADMIN');

  return (
    <div className="flex h-screen bg-[#F4F5F7] dark:bg-gray-900 overflow-hidden font-sans transition-colors duration-200">
      
      {/* Sidebar */}
      <aside className="z-20 flex flex-col justify-between w-64 transition-colors duration-200 bg-white border-r border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div>
          <div className="flex items-center h-20 px-1 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center w-full">
              <div className="shrink-0">
                <img 
                  src={myLogo} 
                  alt="Scope Logo" 
                  className="object-contain w-20 h-20" 
                />
              </div>    
              <span className="text-3xl font-extrabold tracking-tight text-theme-dark dark:text-white whitespace-nowrap">
                SCOPE
              </span>
            </div>
          </div>

          <nav className="flex flex-col gap-1 px-4 mt-6">
            <p className="px-3 mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500">Menu</p>
            
            <Link to="/workspace" className={getNavClass('/workspace')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
              Workspace
              {/* NOTIFICATION DOT FOR WORKSPACE */}
              {!isAdmin && indicators.hasSprintTask ? (
                <span className="absolute right-4 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.6)] animate-pulse"></span>
              ) : !isAdmin && indicators.hasBacklogTask ? (
                <span className="absolute right-4 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]"></span>
              ) : null}
            </Link>

            {isAdmin && (
              <Link to="/dashboard" className={getNavClass('/dashboard')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link to="/backlog" className={getNavClass('/backlog')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                Backlog
                {/* NOTIFICATION DOT FOR BACKLOG */}
                {indicators.needsReview && (
                  <span className="absolute right-4 w-2 h-2 rounded-full bg-theme-blue shadow-[0_0_6px_rgba(0,82,204,0.5)] animate-pulse"></span>
                )}
              </Link>
            )}

            {isAdmin && (
              <Link to="/team" className={getNavClass('/team')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Team Members
              </Link>
            )}

            {isAdmin && (
              <Link to="/departments" className={getNavClass('/departments')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                Departments
              </Link>
            )}

            <Link to="/settings" className={getNavClass('/settings')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Settings
            </Link>
          </nav>
        </div>

        {/* Footer Profile */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between p-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl group">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center overflow-hidden text-xs font-bold text-white rounded-full w-9 h-9 bg-theme-dark dark:bg-gray-600">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="object-cover w-full h-full" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-theme-dark dark:text-white">{user?.name || 'User'}</p>
                <p className="text-[10px] uppercase font-bold text-theme-blue dark:text-blue-400">
                  {displayRole} 
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-theme-red dark:hover:text-red-400 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Logout">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="relative flex flex-col flex-1 overflow-hidden">
        <header className="h-20 bg-[#F4F5F7]/80 dark:bg-gray-900/80 backdrop-blur-md flex justify-between items-center px-8 z-10 sticky top-0 transition-colors duration-200">
          
          {/* Left: Search Bar */}
          <div className="flex-1">
            {showSearch && (
              <div className="relative w-96 group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input 
                  type="text" 
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-blue/50 transition-all" 
                  placeholder="Search..." 
                />
              </div>
            )}
          </div>

          {/* Right: Theme Toggle Button */}
          <div className="flex items-center">
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              title="Toggle Dark Mode"
            >
              {theme === 'light' ? (
                /* Moon Icon */
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              ) : (
                /* Sun Icon */
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              )}
            </button>
          </div>

        </header>

        <div className="flex-1 px-8 pb-8 overflow-y-auto text-gray-900 scroll-smooth dark:text-gray-100">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;