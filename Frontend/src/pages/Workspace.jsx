import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

function Workspace() {
  const { user, searchQuery } = useAuth();
  
  const [myBacklogTasks, setMyBacklogTasks] = useState([])
  const [mySprints, setMySprints] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('sprints');
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const fetchMyTasks = async () => {
    try {
      const workspaceName = user?.workspaceName;
      const token = localStorage.getItem('jwt_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const backlogRes = await fetch(`${API_BASE_URL}/api/v1/issues/backlog?workspaceName=${workspaceName}`, { headers });
      if (backlogRes.ok) {
        const backlogData = await backlogRes.json();
        setMyBacklogTasks(backlogData.filter(task => task.assigneeEmail === user?.email));
      }

      const sprintRes = await fetch(`${API_BASE_URL}/api/v1/sprints?workspaceName=${workspaceName}`, { headers });
      if (sprintRes.ok) {
        const sprints = await sprintRes.json();
        const sprintsWithMyTasks = [];

        for (const sprint of sprints) {
          const taskRes = await fetch(`${API_BASE_URL}/api/v1/issues/sprint/${sprint.id}`, { headers });
          if (taskRes.ok) {
            const tasks = await taskRes.json();
            const assignedTasks = tasks.filter(task => task.assigneeEmail === user?.email);
            
            if (assignedTasks.length > 0) {
              sprintsWithMyTasks.push({ ...sprint, tasks: assignedTasks });
            }
          }
        }
        setMySprints(sprintsWithMyTasks);
      }
    } catch (error) {
      toast.error('Failed to load your workspace.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.roles !== 'ADMIN') {
      fetchMyTasks();
    }
  }, [user]);

  const filterTask = (task) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      task.title?.toLowerCase().includes(query) ||
      task.id?.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query)
    );
  };

  // --- DATA SPLITTING LOGIC ---
  const activeSprints = mySprints.map(sprint => ({
    ...sprint,
    tasks: sprint.tasks
      .filter(t => t.status !== 'DONE' && filterTask(t))
      .map(t => ({...t, sourceLabel: `Sprint: ${sprint.name}`}))
  })).filter(sprint => sprint.tasks.length > 0);
    
  const activeBacklogTasks = myBacklogTasks 
    .filter(t => t.status !== 'DONE' && filterTask(t))
    .map(t => ({...t, sourceLabel: 'Backlog'}));

  const completedSprintTasks = mySprints.flatMap(sprint => 
    sprint.tasks
      .filter(t => t.status === 'DONE' && filterTask(t))
      .map(t => ({...t, sourceLabel: `Sprint: ${sprint.name}`}))
  );
  
  const completedBacklogOnly = myBacklogTasks
    .filter(t => t.status === 'DONE' && filterTask(t))
    .map(t => ({...t, sourceLabel: 'Backlog'}));

  const allCompletedTasks = [...completedSprintTasks, ...completedBacklogOnly];

  if (user?.roles === 'ADMIN') {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-400 dark:text-gray-500">
        <svg className="w-16 h-16 mb-4 opacity-30 dark:opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        <h2 className="text-xl font-bold text-theme-dark dark:text-white">Admins do not have a personal workspace.</h2>
        <p className="font-medium mt-2">Please use the Backlog to manage and assign tasks.</p>
      </div>
    );
  }

  const updateTaskStatus = async (task, newStatus) => {
    const token = localStorage.getItem('jwt_token');
    const timestamp = new Date().toISOString(); 

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/issues/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
            ...task, 
            status: newStatus, 
            lastActionAt: timestamp 
        })
      });

      if (res.ok) {
        toast.success(`Task moved to ${newStatus.replace('_', ' ')}`);
        fetchMyTasks(); 
      } else {
        toast.error('Failed to update task.');
      }
    } catch (error) {
      toast.error('Server error.');
    }
  };

  const toggleExpand = (taskId) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const priorityColors = { 
    High: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400', 
    Medium: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400', 
    Low: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' 
  };

  const renderTaskRow = (task) => {
    const isExpanded = expandedTaskId === task.id;

    return (
      <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-2 transition-all hover:border-gray-200 dark:hover:border-gray-600">
        
        {/* Main Row (Condensed View) */}
        <div 
          onClick={() => toggleExpand(task.id)}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-4 flex-grow min-w-0">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded w-16 text-center shrink-0">
              {task.id.slice(0, 5)}
            </span>
            <h3 className="font-bold text-sm text-theme-dark dark:text-gray-200 truncate flex-grow">{task.title}</h3>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            {/* Labels - Hidden on very small screens if necessary */}
            <div className="hidden md:flex items-center gap-3">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">{task.sourceLabel}</span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${priorityColors[task.priority] || priorityColors.Medium}`}>
                {task.priority}
              </span>
            </div>
            
            {/* Action Buttons Container */}
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {task.status === 'TODO' && (
                <button 
                  onClick={() => updateTaskStatus(task, 'IN_PROGRESS')} 
                  className="bg-theme-dark dark:bg-gray-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-black dark:hover:bg-gray-500 transition-all"
                >
                  Start Work
                </button>
              )}
              {task.status === 'IN_PROGRESS' && (
                <button 
                  onClick={() => updateTaskStatus(task, 'IN_REVIEW')} 
                  className="bg-theme-blue dark:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-theme-blue-hover dark:hover:bg-blue-500 transition-all"
                >
                  Submit
                </button>
              )}
              {task.status === 'IN_REVIEW' && (
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-300 px-4 py-1.5 rounded-lg text-xs font-bold">Waiting...</span>
              )}
              {task.status === 'DONE' && (
                <span className="text-green-500 dark:text-green-400 font-bold text-xs flex items-center gap-1">
                  Done
                </span>
              )}
            </div>

            {/* Expand Arrow */}
            <div className="text-gray-400 dark:text-gray-500">
              <svg className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
              {task.description || "No description provided."}
            </p>
            {task.status === 'TODO' && task.rejectionReason && (
              <div className="mt-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold p-3 rounded-lg border border-red-100 dark:border-red-800/50">
                ⚠️ Declined by Admin: {task.rejectionReason}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return <div className="p-10 font-bold text-gray-400 dark:text-gray-500 flex justify-center items-center h-full">Loading your workspace...</div>;

  return (
    <div className="max-w-6xl mx-auto h-full p-6 pb-20 overflow-y-auto">
      <div className="mb-4">
        <h1 className="text-3xl font-extrabold text-theme-dark dark:text-white tracking-tight">My Workspace</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Manage your assigned tasks and update your progress.</p>
      </div>

      <div className="flex gap-8 border-b border-gray-200 dark:border-gray-700 mb-8">
        <button 
          onClick={() => setActiveTab('sprints')}
          className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'sprints' ? 'text-theme-blue dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          My Sprint Tasks ({activeSprints.reduce((acc, sprint) => acc + sprint.tasks.length, 0)})
          {activeTab === 'sprints' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-theme-blue dark:bg-blue-400 rounded-t-full"></span>}
        </button>
        
        <button 
          onClick={() => setActiveTab('backlog')}
          className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'backlog' ? 'text-theme-blue dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          My Backlog Tasks ({activeBacklogTasks.length})
          {activeTab === 'backlog' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-theme-blue dark:bg-blue-400 rounded-t-full"></span>}
        </button>

        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          Completed Tasks ({allCompletedTasks.length})
          {activeTab === 'completed' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 dark:bg-green-400 rounded-t-full"></span>}
        </button>
      </div>

      {activeTab === 'sprints' && (
        <div className="animate-[fadeIn_0.2s_ease-out]">
          {activeSprints.length === 0 ? (
            <div className="p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-3xl text-gray-400 dark:text-gray-500 font-bold flex flex-col items-center">
              <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              {searchQuery ? 'No matching sprint tasks found.' : 'You have no active sprint tasks right now.'}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {activeSprints.map(sprint => (
                <div key={sprint.id} className="bg-blue-50/30 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                  <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-blue-100 dark:border-blue-900/30 pb-3">
                    <div>
                      <h3 className="font-bold text-lg text-theme-dark dark:text-white">{sprint.name}</h3>
                      {sprint.sprintGoal && <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Goal: {sprint.sprintGoal}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-3 py-1.5 rounded-lg">
                        Deadline: {sprint.deadline ? new Date(sprint.deadline).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    {sprint.tasks.map(task => renderTaskRow(task))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'backlog' && (
        <div className="animate-[fadeIn_0.2s_ease-out]">
          {activeBacklogTasks.length === 0 ? (
            <div className="p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-3xl text-gray-400 dark:text-gray-500 font-bold flex flex-col items-center">
              <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
              {searchQuery ? 'No matching backlog tasks found.' : 'You have no backlog tasks assigned to you right now.'}
            </div>
          ) : (
            <div className="flex flex-col bg-gray-50 dark:bg-gray-800/30 p-5 rounded-3xl border border-gray-100 dark:border-gray-700">
              {activeBacklogTasks.map(task => renderTaskRow(task))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="animate-[fadeIn_0.2s_ease-out]">
          {allCompletedTasks.length === 0 ? (
            <div className="p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 bg-green-50/50 dark:bg-green-900/10 rounded-3xl text-gray-400 dark:text-gray-500 font-bold flex flex-col items-center">
              <svg className="w-12 h-12 mb-3 text-green-300 dark:text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {searchQuery ? 'No matching completed tasks found.' : 'You have not completed any tasks yet.'}
            </div>
          ) : (
            <div className="flex flex-col bg-green-50/30 dark:bg-green-900/10 p-5 rounded-3xl border border-green-100 dark:border-green-900/30">
              {allCompletedTasks.map(task => renderTaskRow(task))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default Workspace;