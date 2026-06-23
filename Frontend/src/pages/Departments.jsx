import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

function Departments() {
  const { user, departments, setDepartments } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [newDeptName, setNewDeptName] = useState('');
  const [newRoleInputs, setNewRoleInputs] = useState({});

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const workspaceName = user?.workspaceName; 
      
      const response = await fetch(`${API_BASE_URL}/api/v1/department?workspaceName=${workspaceName}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-type': 'application/json' 
        }
      });

      if (response.status === 204) {
        setDepartments([]); 
      } else if (response.ok) {
        const data = await response.json();
        setDepartments(data); 
      }
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.roles !== 'ADMIN') {
    return <div className="flex items-center justify-center h-full font-bold text-gray-400 dark:text-gray-500">Access Denied.</div>;
  }

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    
    try {
      const token = localStorage.getItem('jwt_token');
      const workspaceName = user?.workspaceName;

      const response = await fetch(`${API_BASE_URL}/api/v1/department`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: newDeptName.trim(),
          workspaceName: workspaceName 
        }) 
      });

      if (response.ok) {
        const newDept = await response.json();
        setDepartments([...(departments || []), newDept]);
        setNewDeptName('');
        toast.success('Department created');
      } else {
        toast.error('Department name must be unique');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const handleRemoveDepartment = async (deptId) => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE_URL}/api/v1/department/${deptId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setDepartments((departments || []).filter(d => d.id !== deptId));
        toast.success('Department deleted');
      } else {
        toast.error('Failed to delete department');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const handleAddRole = async (e, deptId) => {
    e.preventDefault();
    const roleName = newRoleInputs[deptId]?.trim();
    if (!roleName) return;

    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE_URL}/api/v1/department/${deptId}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roleName }) 
      });

      if (response.ok) {
        const updatedDept = await response.json();
        setDepartments((departments || []).map(dept => dept.id === deptId ? updatedDept : dept));
        setNewRoleInputs({ ...newRoleInputs, [deptId]: '' });
        toast.success('Role added');
      } else {
        toast.error('Failed to add role');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const handleRemoveRole = async (deptId, roleToRemove) => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE_URL}/api/v1/department/${deptId}/roles/${roleToRemove}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const updatedDept = await response.json();
        setDepartments((departments || []).map(dept => dept.id === deptId ? updatedDept : dept));
        toast.success('Role removed');
      } else {
        toast.error('Failed to remove role');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full font-bold text-gray-400 dark:text-gray-500">Loading Departments...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col font-sans animate-[fadeIn_0.3s_ease-out]">
      
      <div className="pt-2 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-theme-dark dark:text-white">Manage Departments</h1>
        <p className="mt-1 font-medium text-gray-500 dark:text-gray-400">Configure your organization's departments and their internal job roles.</p>
      </div>

      {/* Add Department Bar */}
      <div className="flex items-center gap-4 p-5 mb-8 transition-all bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700 hover:shadow-md">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-theme-blue dark:text-blue-400 shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        </div>
        <div className="flex-1">
          <input 
            type="text" 
            value={newDeptName} 
            onChange={(e) => setNewDeptName(e.target.value)} 
            placeholder="Type a new department name (e.g. Finance)" 
            className="w-full text-lg font-bold placeholder-gray-300 bg-transparent text-theme-dark dark:text-white focus:outline-none dark:placeholder-gray-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAddDepartment(e)}
          />
        </div>
        <button 
          onClick={handleAddDepartment} 
          disabled={!newDeptName.trim()} 
          className="bg-theme-blue text-white px-6 py-2.5 rounded-xl font-bold hover:bg-theme-blue-hover transition-all shadow-sm shadow-theme-blue/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Create
        </button>
      </div>

      {/* Empty State */}
      {(!departments || departments.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-gray-200 border-dashed dark:text-gray-500 dark:border-gray-700 rounded-3xl bg-gray-50/50 dark:bg-gray-800/50">
           <svg className="w-16 h-16 mb-4 opacity-30 dark:opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
           <p className="text-lg font-semibold">No departments configured yet</p>
           <p className="text-sm">Use the bar above to create your first department.</p>
        </div>
      )}

      {/* Departments Grid */}
      <div className="grid items-start grid-cols-1 gap-6 pb-10 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
        {(departments || []).map(dept => (
          <div key={dept.id} className="flex flex-col transition-all bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700 group hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md">
            
            {/* Card Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-700/30 rounded-t-2xl">
              <h3 className="text-base font-extrabold text-theme-dark dark:text-white">{dept.name}</h3>
              <button 
                onClick={() => handleRemoveDepartment(dept.id)} 
                className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Department"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>

            {/* Roles List */}
            <div className="flex-grow p-4">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Assigned Roles</p>
              <div className="flex flex-wrap gap-2">
                {(!dept.roles || dept.roles.length === 0) ? (
                  <span className="text-xs italic font-medium text-gray-400 dark:text-gray-500">No roles created yet.</span> 
                ) : (
                  dept.roles.map(role => (
                    <div key={role} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600 text-xs font-bold transition-colors hover:border-gray-300 dark:hover:border-gray-500">
                      {role}
                      <button onClick={() => handleRemoveRole(dept.id, role)} className="ml-1 text-gray-400 transition-colors dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400" title="Remove Role">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add Role Input */}
            <div className="p-3 mt-auto border-t border-gray-100 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700 rounded-b-2xl">
              <form onSubmit={(e) => handleAddRole(e, dept.id)} className="flex gap-2">
                <input 
                  type="text" 
                  value={newRoleInputs[dept.id] || ''} 
                  onChange={(e) => setNewRoleInputs({ ...newRoleInputs, [dept.id]: e.target.value })} 
                  placeholder="Type new role..." 
                  className="flex-1 p-2 text-sm font-medium placeholder-gray-400 transition-all bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-theme-blue dark:focus:ring-blue-500 focus:border-theme-blue dark:focus:border-blue-500 dark:placeholder-gray-500" 
                />
                <button 
                  type="submit" 
                  disabled={!newRoleInputs[dept.id]?.trim()} 
                  className="px-4 py-2 text-xs font-bold text-white transition-colors rounded-lg bg-theme-dark dark:bg-gray-600 hover:bg-black dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </form>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default Departments;