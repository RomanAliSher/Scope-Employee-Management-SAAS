import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

function Backlog() {
  const { user, searchQuery } = useAuth();
  
  const [sprints, setSprints] = useState([]);
  const [backlogTasks, setBacklogTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]); 
  
  // Modals state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  
  // Admin Rejection State
  const [rejectingTask, setRejectingTask] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Move Task State
  const [taskToMove, setTaskToMove] = useState(null);
  
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', type: 'Task', assigneeEmail: 'UN' });
  const [newSprint, setNewSprint] = useState({ name: '', sprintGoal: '', deadline: '' });

  // Tab State
  const [activeTab, setActiveTab] = useState('sprints'); // 'sprints', 'backlog', or 'completed'

  const fetchBoardData = async () => {
    try {
      const workspaceName = user?.workspaceName;
      const token = localStorage.getItem('jwt_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        const teamRes = await fetch(`${API_BASE_URL}/api/v1/team?workspaceName=${workspaceName}`, { headers });
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setTeamMembers(teamData || []);
        }
      } catch (err) {
        console.error("Team fetch failed:", err);
      }

      try {
        const backlogRes = await fetch(`${API_BASE_URL}/api/v1/issues/backlog?workspaceName=${workspaceName}`, { headers });
        if (backlogRes.ok) {
          const backlogData = await backlogRes.json();
          setBacklogTasks(backlogData || []);
        }
      } catch (err) {
        console.error("Backlog fetch failed:", err);
      }

      try {
        const sprintRes = await fetch(`${API_BASE_URL}/api/v1/sprints?workspaceName=${workspaceName}`, { headers });
        if (sprintRes.ok) {
          const fetchedSprints = await sprintRes.json();
          const sprintsWithTasks = await Promise.all((fetchedSprints || []).map(async (sprint) => {
            try {
              const taskRes = await fetch(`${API_BASE_URL}/api/v1/issues/sprint/${sprint.id}`, { headers });
              const tasks = taskRes.ok ? await taskRes.json() : [];
              return { ...sprint, tasks: tasks || [] };
            } catch (taskErr) {
              return { ...sprint, tasks: [] };
            }
          }));
          setSprints(sprintsWithTasks);
        }
      } catch (err) {
        console.error("Sprints fetch failed:", err);
      }

    } catch (error) { 
      console.error("Main fetch operation failed:", error);
    }
  };

  useEffect(() => { fetchBoardData(); }, []);

  // --- FILTERING & SPLITTING LOGIC ---
  const filterTask = (task) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      task.title?.toLowerCase().includes(query) ||
      task.id?.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query)
    );
  };

  const filteredBacklogTasks = (backlogTasks || []).filter(filterTask);

  const activeBacklogTasks = filteredBacklogTasks.filter(t => t.status !== 'DONE');
  const completedBacklogTasks = filteredBacklogTasks.filter(t => t.status === 'DONE');

  const activeSprints = (sprints || []).filter(s => s.status !== 'COMPLETED').map(sprint => ({
    ...sprint,
    tasks: sprint.tasks.filter(filterTask)
  }));

  const completedSprints = (sprints || []).filter(s => s.status === 'COMPLETED').map(sprint => ({
    ...sprint,
    tasks: sprint.tasks.filter(filterTask)
  }));

  const priorityColors = { 
    High: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800', 
    Medium: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800', 
    Low: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
  };

  // --- API CALLS ---
  const handleCreateSprint = async () => {
    const workspaceName = JSON.parse(localStorage.getItem('user_data')).workspaceName;
    const token = localStorage.getItem('jwt_token');
    
    const payload = {
      name: newSprint.name,
      deadline: newSprint.deadline,
      sprintGoal: newSprint.sprintGoal,
      status: 'PLANNED',
      workspaceName: workspaceName
    };

    const res = await fetch(`${API_BASE_URL}/api/v1/sprints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) { 
      toast.success("Sprint Created"); 
      setIsSprintModalOpen(false); 
      setNewSprint({ name: '', sprintGoal: '', deadline: '' });
      fetchBoardData(); 
    }
  };

  const updateSprintAPI = async (sprintId, payload) => {
    const token = localStorage.getItem('jwt_token');
    await fetch(`${API_BASE_URL}/api/v1/sprints/${sprintId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    fetchBoardData();
  };

  const updateSprintField = (sprint, field, value) => {
    updateSprintAPI(sprint.id, { ...sprint, [field]: value });
  };

  const handleStartSprint = (sprint) => {
    updateSprintAPI(sprint.id, { ...sprint, status: 'ACTIVE' });
  };

  const handleDeleteSprint = async (sprint) => {
    const token = localStorage.getItem('jwt_token');
    if (sprint.tasks && sprint.tasks.length > 0) {
      await Promise.all(sprint.tasks.map(t => updateIssueAPI(t.id, { ...t, sprintId: null })));
    }
    await fetch(`${API_BASE_URL}/api/v1/sprints/${sprint.id}`, { 
      method: 'DELETE', 
      headers: { 'Authorization': `Bearer ${token}` } 
    });
    toast.success("Sprint Deleted");
    fetchBoardData();
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    const workspaceName = JSON.parse(localStorage.getItem('user_data')).workspaceName;
    const token = localStorage.getItem('jwt_token');
    
    const payload = {
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority.toUpperCase(),
      type: newTask.type.toUpperCase(),
      status: 'TODO',
      assigneeEmail: newTask.assigneeEmail === 'UN' ? null : newTask.assigneeEmail, 
      workspaceName: workspaceName,
      sprintId: null 
    };

    const res = await fetch(`${API_BASE_URL}/api/v1/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      toast.success("Issue Created");
      setIsIssueModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'Medium', type: 'Task', assigneeEmail: 'UN' });
      fetchBoardData();
    }
  };

  const updateIssueAPI = async (taskId, payload) => {
    const token = localStorage.getItem('jwt_token');
    await fetch(`${API_BASE_URL}/api/v1/issues/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    fetchBoardData();
  };

  const handleDeleteIssue = async (taskId) => {
    const token = localStorage.getItem('jwt_token');
    await fetch(`${API_BASE_URL}/api/v1/issues/${taskId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    toast.success("Issue Deleted");
    fetchBoardData();
  };

  const handleApprove = async (task) => {
    const timestamp = new Date().toISOString();
    await updateIssueAPI(task.id, { ...task, status: 'DONE', rejectionReason: null, lastActionAt: timestamp });
    toast.success("Task Approved and marked as DONE.");
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    const timestamp = new Date().toISOString();
    await updateIssueAPI(rejectingTask.id, { 
      ...rejectingTask, 
      status: 'TODO', 
      rejectionReason: rejectionReason,
      lastActionAt: timestamp 
    });
    
    toast.error("Task Rejected. Sent back to To Do.");
    setRejectingTask(null);
    setRejectionReason('');
  };

  const handleMoveTask = async (targetSprintId) => {
    if (!taskToMove) return;
    await updateIssueAPI(taskToMove.id, { ...taskToMove, sprintId: targetSprintId });
    toast.success(targetSprintId ? "Task moved to sprint." : "Task moved to backlog.");
    setTaskToMove(null);
  };

  const TaskRow = ({ task, source }) => (
    <div className="mb-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="grid grid-cols-12 gap-4 p-3 items-center">
        <div className="col-span-1 text-[10px] font-bold text-gray-400 dark:text-gray-500">{task.id ? task.id.slice(0, 5) : ''}</div>
        <div className="col-span-3 font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{task.title}</div>
        <div className="col-span-1 text-center"><span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">{task.type || 'TASK'}</span></div>
        <div className="col-span-2 text-center"><span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${priorityColors[task.priority] || priorityColors.Medium}`}>{task.priority}</span></div>
        
        <div className="col-span-2">
          <select value={task.assigneeEmail || 'UN'} onChange={(e) => updateIssueAPI(task.id, {...task, assigneeEmail: e.target.value === 'UN' ? null : e.target.value})} className="w-full text-[10px] font-bold bg-gray-50 dark:bg-gray-700 dark:text-white p-1 rounded border border-gray-200 dark:border-gray-600 outline-none cursor-pointer">
            <option value="UN">Unassigned</option>
            {(teamMembers || []).map(m => <option key={m.id} value={m.email}>{m.name}</option>)}
          </select>
        </div>

        <div className="col-span-2">
          <select value={task.status || 'TODO'} onChange={(e) => updateIssueAPI(task.id, {...task, status: e.target.value})} className="w-full text-[10px] font-bold bg-gray-50 dark:bg-gray-700 dark:text-white p-1 rounded border border-gray-200 dark:border-gray-600 outline-none cursor-pointer">
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Action Buttons: Move & Delete */}
        <div className="col-span-1 flex justify-end gap-2">
          <button onClick={() => setTaskToMove({ ...task, source })} className="text-theme-blue dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/30 p-1.5 rounded-lg" title="Move Task">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
          </button>
          <button onClick={() => handleDeleteIssue(task.id)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors bg-red-50 dark:bg-red-900/30 p-1.5 rounded-lg" title="Delete Task">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>

      {/* Admin Approval Banner for IN_REVIEW tasks */}
      {task.status === 'IN_REVIEW' && (
        <div className="bg-yellow-50/50 dark:bg-yellow-900/20 border-t border-yellow-100 dark:border-yellow-900/50 p-3 flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
            <p className="text-xs font-bold text-yellow-800 dark:text-yellow-500">
              Submitted by <span className="text-theme-dark dark:text-gray-200">{task.assigneeEmail}</span> for review. Please approve or reject.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setRejectingTask(task)} className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors">
              Reject
            </button>
            <button onClick={() => handleApprove(task)} className="bg-theme-blue text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-theme-blue-hover shadow-sm transition-all">
              Approve
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto h-full p-6 pb-20 overflow-y-auto">
      
      {/* Header */}
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Project Backlog</h1>
        <div className="flex gap-2">
          <button onClick={() => setIsIssueModalOpen(true)} className="bg-white dark:bg-gray-800 dark:text-white border dark:border-gray-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Create Issue</button>
          <button onClick={() => setIsSprintModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">Create Sprint</button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-8 border-b border-gray-200 dark:border-gray-700 mb-8">
        <button 
          onClick={() => setActiveTab('sprints')}
          className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'sprints' ? 'text-theme-blue dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          Active Sprints ({activeSprints.reduce((acc, sprint) => acc + sprint.tasks.length, 0)})
          {activeTab === 'sprints' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-theme-blue dark:bg-blue-400 rounded-t-full"></span>}
        </button>
        
        <button 
          onClick={() => setActiveTab('backlog')}
          className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'backlog' ? 'text-theme-blue dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          Backlog Tasks ({activeBacklogTasks.length})
          {activeTab === 'backlog' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-theme-blue dark:bg-blue-400 rounded-t-full"></span>}
        </button>

        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          Completed Sprints & Tasks
          {activeTab === 'completed' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 dark:bg-green-400 rounded-t-full"></span>}
        </button>
      </div>

      {/* --- ACTIVE SPRINTS TAB --- */}
      {activeTab === 'sprints' && (
        <div className="animate-[fadeIn_0.2s_ease-out]">
          {activeSprints.length === 0 ? (
            <div className="p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl text-gray-400 dark:text-gray-500 font-bold flex flex-col items-center">
              <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              {searchQuery ? 'No matching active sprints found.' : 'You have no active sprints right now.'}
            </div>
          ) : (
            activeSprints.map(sprint => (
              <div key={sprint.id} className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="font-bold text-lg dark:text-white">{sprint.name}</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      sprint.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {sprint.status}
                    </span>
                  </div>
                  
                  <div className="flex gap-4 items-center">
                    <input type="text" value={sprint.sprintGoal || ''} onChange={e => updateSprintField(sprint, 'sprintGoal', e.target.value)} placeholder="Sprint Goal..." className="text-sm bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:text-white outline-none transition-colors" />
                    <input type="datetime-local" value={sprint.deadline ? sprint.deadline.substring(0, 16) : ''} onChange={e => updateSprintField(sprint, 'deadline', e.target.value)} className="text-xs border border-gray-200 dark:border-gray-600 bg-transparent dark:text-white rounded px-2 py-1 outline-none" />
                    
                    {sprint.status === 'PLANNED' && (
                      <button onClick={() => handleStartSprint(sprint)} className="bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">Start Sprint</button>
                    )}
                    
                    <button onClick={() => handleDeleteSprint(sprint)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
                
                {(() => {
                  const sprintActiveTasks = (sprint.tasks || []).filter(t => t.status !== 'DONE');
                  return (
                    <div className="grid grid-cols-1 gap-2 mb-2">
                      {sprintActiveTasks.length > 0 ? (
                        sprintActiveTasks.map(t => <TaskRow key={t.id} task={t} source={sprint.id} />)
                      ) : (
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic">Click the Move button on a backlog task to assign it here.</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))
          )}
        </div>
      )}

      {/* --- ACTIVE BACKLOG TAB --- */}
      {activeTab === 'backlog' && (
        <div className="animate-[fadeIn_0.2s_ease-out]">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-2xl min-h-[200px] border-gray-100 dark:border-gray-700 transition-colors">
            <h2 className="font-bold text-sm text-gray-500 dark:text-gray-400 uppercase mb-4">Backlog ({activeBacklogTasks.length})</h2>
            <div className="grid grid-cols-1 gap-2">
              {activeBacklogTasks.length === 0 ? (
                <p className="text-center text-sm text-gray-400 font-medium py-10">No active backlog tasks found.</p>
              ) : (
                activeBacklogTasks.map(t => <TaskRow key={t.id} task={t} source="backlog" />)
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- COMPLETED TAB --- */}
      {activeTab === 'completed' && (
        <div className="animate-[fadeIn_0.2s_ease-out]">
          {completedSprints.length === 0 && completedBacklogTasks.length === 0 ? (
            <div className="p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 bg-green-50/50 dark:bg-green-900/10 rounded-3xl text-gray-400 dark:text-gray-500 font-bold flex flex-col items-center">
              <svg className="w-12 h-12 mb-3 text-green-300 dark:text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {searchQuery ? 'No matching completed items found.' : 'You have not completed any sprints or tasks yet.'}
            </div>
          ) : (
            <div>
              {/* COMPLETED SPRINTS */}
              {completedSprints.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Completed Sprints
                  </h2>
                  {completedSprints.map(sprint => (
                    <div key={sprint.id} className="mb-6 p-5 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100 transition-opacity">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <h2 className="font-bold text-lg text-gray-600 dark:text-gray-400 line-through">{sprint.name}</h2>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                            {sprint.status}
                          </span>
                        </div>
                        <button onClick={() => handleDeleteSprint(sprint)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {(sprint.tasks || []).map(t => <TaskRow key={t.id} task={t} source={sprint.id} />)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* COMPLETED BACKLOG TASKS */}
              {completedBacklogTasks.length > 0 && (
                <div className="p-5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl opacity-70 hover:opacity-100 transition-opacity">
                  <h2 className="font-bold text-sm text-gray-500 dark:text-gray-400 uppercase mb-4">Completed Backlog Tasks ({completedBacklogTasks.length})</h2>
                  <div className="grid grid-cols-1 gap-2">
                    {completedBacklogTasks.map(t => <TaskRow key={t.id} task={t} source="backlog" />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- Move Task Modal --- */}
      {taskToMove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md shadow-xl animate-[slideUp_0.2s_ease-out]">
            <h2 className="text-xl font-extrabold text-theme-dark dark:text-white mb-4">Move Task</h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 truncate border-b border-gray-100 dark:border-gray-700 pb-4">
              Moving: <span className="text-theme-dark dark:text-gray-200 font-bold">{taskToMove.title}</span>
            </p>
            
            <div className="flex flex-col gap-3">
              {/* Backlog Option */}
              {taskToMove.source !== 'backlog' && (
                <button 
                  onClick={() => handleMoveTask(null)} 
                  className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:bg-gray-700 font-bold text-sm transition-all text-gray-700 dark:text-gray-300 flex justify-between items-center group"
                >
                  Move to Backlog
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-theme-dark dark:group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              )}

              {/* Active/Planned Sprint Options */}
              {activeSprints.map(sprint => (
                taskToMove.source !== sprint.id && (
                  <button 
                    key={sprint.id} 
                    onClick={() => handleMoveTask(sprint.id)} 
                    className="w-full text-left p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 font-bold text-sm text-theme-blue dark:text-blue-400 transition-all flex justify-between items-center group"
                  >
                    Move to {sprint.name}
                    <svg className="w-5 h-5 text-blue-300 dark:text-blue-500 group-hover:text-theme-blue dark:group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </button>
                )
              ))}

              {activeSprints.length === 0 && taskToMove.source === 'backlog' && (
                <p className="text-center text-sm text-gray-400 italic py-2">No active sprints available to move to.</p>
              )}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => setTaskToMove(null)} className="px-5 py-2.5 font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Add Sprint Modal --- */}
      {isSprintModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm">
            <h2 className="text-lg font-bold dark:text-white mb-4">Create Sprint</h2>
            <input className="w-full p-2 mb-2 border dark:border-gray-600 bg-transparent dark:text-white rounded text-sm outline-none focus:border-blue-500" placeholder="Sprint Name (e.g., Sprint 1: Core Auth)" onChange={e => setNewSprint({...newSprint, name: e.target.value})} />
            <input className="w-full p-2 mb-2 border dark:border-gray-600 bg-transparent dark:text-white rounded text-sm outline-none focus:border-blue-500" placeholder="Sprint Goal" onChange={e => setNewSprint({...newSprint, sprintGoal: e.target.value})} />
            <input type="datetime-local" className="w-full p-2 mb-4 border dark:border-gray-600 bg-transparent dark:text-white rounded text-sm outline-none focus:border-blue-500" onChange={e => setNewSprint({...newSprint, deadline: e.target.value})} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsSprintModalOpen(false)} className="px-4 py-2 font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleCreateSprint} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Add Issue Modal --- */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-lg font-bold dark:text-white mb-4">Create New Issue</h2>
            <form onSubmit={handleCreateIssue} className="flex flex-col gap-4">
              <input required className="w-full p-2 border dark:border-gray-600 bg-transparent dark:text-white rounded text-sm outline-none focus:border-blue-500" placeholder="Issue Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              <textarea className="w-full p-2 border dark:border-gray-600 bg-transparent dark:text-white rounded text-sm min-h-[100px] outline-none focus:border-blue-500" placeholder="Description..." value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              
              <div className="flex gap-4">
                <select className="w-full p-2 border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white rounded text-sm outline-none focus:border-blue-500" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
                <input required className="w-full p-2 border dark:border-gray-600 bg-transparent dark:text-white rounded text-sm outline-none focus:border-blue-500" placeholder="Type (Task, Bug)" value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Assign To</label>
                <select className="w-full p-2 border dark:border-gray-600 rounded text-sm bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:border-blue-500" value={newTask.assigneeEmail} onChange={e => setNewTask({...newTask, assigneeEmail: e.target.value})}>
                  <option value="UN">Unassigned</option>
                  {(teamMembers || []).map(m => <option key={m.id} value={m.email}>{m.name}</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsIssueModalOpen(false)} className="px-4 py-2 font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">Create Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Rejection Modal */}
      {rejectingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Reject Task</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">Please provide a reason. This will be shown to the employee.</p>
            <form onSubmit={handleConfirmReject}>
              <textarea 
                required 
                placeholder="e.g. The UI is broken on mobile screens..." 
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px] mb-4"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => {setRejectingTask(null); setRejectionReason('');}} className="px-4 py-2 font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="bg-red-500 text-white px-5 py-2 rounded-xl font-bold hover:bg-red-600 transition-colors">Confirm Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Backlog;