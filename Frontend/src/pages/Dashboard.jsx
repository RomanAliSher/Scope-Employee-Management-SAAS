import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

function Dashboard() {
  // Extract theme to pass specific hex codes to Recharts
  const { user, theme } = useAuth();

  const [sprints, setSprints] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH REAL-TIME DATA ---
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const workspaceName = user?.workspaceName;
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch Team Members (for assigning names to emails)
      const teamRes = await fetch(`${API_BASE_URL}/api/v1/team?workspaceName=${workspaceName}`, { headers });
      const teamData = teamRes.ok ? await teamRes.json() : [];
      setTeamMembers(teamData);

      // 2. Fetch Backlog
      const backlogRes = await fetch(`${API_BASE_URL}/api/v1/issues/backlog?workspaceName=${workspaceName}`, { headers });
      const backlogData = backlogRes.ok ? await backlogRes.json() : [];

      // 3. Fetch Sprints & Sprint Issues
      const sprintRes = await fetch(`${API_BASE_URL}/api/v1/sprints?workspaceName=${workspaceName}`, { headers });
      let sprintsData = [];
      let sprintTasksData = [];
      
      if (sprintRes.ok) {
        const fetchedSprints = await sprintRes.json();
        const sprintsWithTasks = await Promise.all(fetchedSprints.map(async (sprint) => {
          const taskRes = await fetch(`${API_BASE_URL}/api/v1/issues/sprint/${sprint.id}`, { headers });
          const tasks = taskRes.ok ? await taskRes.json() : [];
          sprintTasksData.push(...tasks);
          return { ...sprint, tasks };
        }));
        sprintsData = sprintsWithTasks;
      }

      setSprints(sprintsData);
      setAllTasks([...backlogData, ...sprintTasksData]);

    } catch (error) {
      console.error("Error loading dashboard metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.roles === 'ADMIN' || user?.roles?.includes('ADMIN')) {
      fetchDashboardData();
    }
  }, [user]);

  // Admin Security Check
  if (user?.roles !== 'ADMIN' && !user?.roles?.includes('ADMIN')) {
    return <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-500 font-bold">Access Denied. Admins only.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-theme-blue font-bold animate-pulse">Syncing live workspace data...</div>
      </div>
    );
  }

  // --- CALCULATE METRICS ---
  const activeSprints = sprints.filter(s => s.status === 'ACTIVE');
  const activeTasks = activeSprints.flatMap(s => s.tasks || []);

  const totalIssues = allTasks.length;
  const completedIssues = allTasks.filter(t => t.status === 'DONE').length;
  const completionRate = totalIssues === 0 ? 0 : Math.round((completedIssues / totalIssues) * 100);
  const activeSprintCount = activeSprints.length;

  // --- CHART DATA PREP ---
  const statusData = [
    { name: 'To Do', value: activeTasks.filter(t => t.status === 'TODO').length, color: '#9CA3AF' },
    { name: 'In Progress', value: activeTasks.filter(t => t.status === 'IN_PROGRESS').length, color: '#0052CC' },
    { name: 'In Review', value: activeTasks.filter(t => t.status === 'IN_REVIEW').length, color: '#FB923C' },
    { name: 'Done', value: activeTasks.filter(t => t.status === 'DONE').length, color: '#22C55E' }
  ].filter(d => d.value > 0);

  // Helper to map emails to First Names for the charts
  const getAssigneeName = (email) => {
    if (!email || email === 'UN') return 'Unassigned';
    const member = teamMembers.find(m => m.email === email);
    return member ? member.name.split(' ')[0] : email.split('@')[0];
  };

  const assigneeMap = {};
  allTasks.forEach(t => {
    const a = getAssigneeName(t.assigneeEmail);
    assigneeMap[a] = (assigneeMap[a] || 0) + 1;
  });
  const workloadData = Object.keys(assigneeMap).map(key => ({ name: key, tasks: assigneeMap[key] }));

const typeMap = {};
  allTasks.forEach(t => {
    // Convert to uppercase to prevent duplicates like "Bug" and "BUG"
    const type = (t.type || 'TASK').toUpperCase(); 
    typeMap[type] = (typeMap[type] || 0) + 1;
  });
  
  const TYPE_COLORS = ['#0052CC', '#FF5630', '#FFAB00', '#36B37E', '#9C27B0'];
  const typeData = Object.keys(typeMap).map((key, index) => ({
    name: key,
    value: typeMap[key],
    color: TYPE_COLORS[index % TYPE_COLORS.length]
  }));
  // --- DARK THEME VARIABLES FOR RECHARTS ---
  const isDark = theme === 'dark';
  const chartTextColor = isDark ? '#9CA3AF' : '#6B7280'; // text-gray-400 vs text-gray-500
  const tooltipStyle = {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF', // bg-gray-800 vs bg-white
    borderColor: isDark ? '#374151' : '#F3F4F6', // border-gray-700 vs border-gray-100
    color: isDark ? '#F9FAFB' : '#111827', // text-gray-50 vs text-gray-900
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col font-sans animate-[fadeIn_0.3s_ease-out]">
      
      {/* Header */}
      <div className="mb-6 pt-2 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-theme-dark dark:text-white tracking-tight">Analytics Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 text-sm">Real-time metrics synced from your workspace.</p>
        </div>
        <button onClick={fetchDashboardData} className="flex items-center gap-2 text-sm font-bold text-theme-blue dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Refresh Data
        </button>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center transition-colors">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Total Issues</span>
          <span className="text-3xl font-extrabold text-theme-dark dark:text-white">{totalIssues}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center transition-colors">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Completed</span>
          <span className="text-3xl font-extrabold text-green-500 dark:text-green-400">{completedIssues}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center transition-colors">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Completion Rate</span>
          <span className="text-3xl font-extrabold text-theme-blue dark:text-blue-400">{completionRate}%</span>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center transition-colors">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Active Sprints</span>
          <span className="text-3xl font-extrabold text-orange-500 dark:text-orange-400">{activeSprintCount}</span>
        </div>
      </div>

      {totalIssues === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 border-dashed transition-colors">
          <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          <span className="font-bold">No workspace data found.</span>
          <span className="text-xs mt-1">Create issues and sprints in the Backlog to generate reports.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6 flex-1">
          
          {/* Active Sprint Status (Donut Chart) */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col transition-colors">
            <h3 className="text-sm font-extrabold text-theme-dark dark:text-white mb-4">Active Sprint Progress</h3>
            <div className="flex-1 min-h-[200px]">
              {statusData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400 dark:text-gray-500 font-bold">No active tasks in sprints</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} stroke="none" dataKey="value">
                      {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ fontWeight: 'bold' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: chartTextColor }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Workload Distribution (Bar Chart) */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col lg:col-span-2 transition-colors">
            <h3 className="text-sm font-extrabold text-theme-dark dark:text-white mb-4">Team Workload Distribution</h3>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: chartTextColor }} />
                  <Tooltip cursor={{ fill: isDark ? '#374151' : '#F3F4F6' }} contentStyle={tooltipStyle} itemStyle={{ fontWeight: 'bold' }} />
                  <Bar dataKey="tasks" fill="#0052CC" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Issue Types (Pie Chart) */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col lg:col-span-3 transition-colors">
            <h3 className="text-sm font-extrabold text-theme-dark dark:text-white mb-4">Workspace Issue Breakdown</h3>
            <div className="h-[250px] w-full flex justify-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" outerRadius={90} stroke="none" dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {typeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} itemStyle={{ fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Dashboard;