import { createContext, useState, useContext, useEffect } from 'react'; // Added useEffect

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Initialize user from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // NEW: This actually applies the dark mode to the HTML body
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 2. The toggle function
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);

  // 3. GLOBAL STATE FOR DEPARTMENTS 
  const [departments, setDepartments] = useState([]);

  const [backlogTasks, setBacklogTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [activeSprintId, setActiveSprintId] = useState('');

  const addMember = (member) => setTeamMembers([...teamMembers, { ...member, id: Date.now() }]);
  const removeMember = (id) => setTeamMembers(teamMembers.filter(m => m.id !== id));

  return (
    <AuthContext.Provider value={{ 
      user, setUser,
      teamMembers, addMember, removeMember,
      backlogTasks, setBacklogTasks,
      sprints, setSprints,
      activeSprintId, setActiveSprintId,
      searchQuery, setSearchQuery,
      departments, setDepartments,
      theme,        // FIXED: Added theme here
      toggleTheme   // FIXED: Added toggleTheme here
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);