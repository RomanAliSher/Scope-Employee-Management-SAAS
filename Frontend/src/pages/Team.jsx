import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config'; 

function Team() {
  const { user, departments, searchQuery } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  
  const [teamMembers, setTeamMembers] = useState([]);
  
  const [newMember, setNewMember] = useState({ 
    name: '', 
    email: '', 
    departmentName: '', 
    designation: '',
    password: '' 
  });

  const fetchTeamMembersFromBackend = async () => {
    try {
      const userDataString = localStorage.getItem('user_data');
      if (!userDataString) return;
      
      const workspaceName = JSON.parse(userDataString).workspaceName;
      const token = localStorage.getItem('jwt_token');

      const response = await fetch(`${API_BASE_URL}/api/v1/team?workspaceName=${workspaceName}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data); 
      } else {
        console.error("Failed to fetch team members");
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  useEffect(() => {
    fetchTeamMembersFromBackend();
  }, []);

  const filteredMembers = teamMembers?.filter(m => {
    const query = (searchQuery || '').toLowerCase();
    return (
      m.name?.toLowerCase().includes(query) || 
      m.email?.toLowerCase().includes(query) ||
      m.designation?.toLowerCase().includes(query) ||
      m.departmentName?.toLowerCase().includes(query)
    );
  }) || [];

  const isAdmin = user?.roles === 'ADMIN' || user?.roles?.includes('ADMIN') || user?.roles?.includes('ROLE_ADMIN');

  if (!isAdmin) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-500 font-bold">
        Access Denied. Only Admins can manage the team.
      </div>
    );
  }

  const handleAddMember = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userDataString = localStorage.getItem('user_data');
      if (!userDataString) throw new Error("User data not found in local storage");
      
      const userData = JSON.parse(userDataString);
      const workspaceName = userData.workspaceName;

      const payload = {
        name: newMember.name,
        email: newMember.email,
        designation: newMember.designation,
        departmentName: newMember.departmentName,
        workspaceName: workspaceName,
        password: newMember.password
      };

      const token = localStorage.getItem('jwt_token');

      const response = await fetch(`${API_BASE_URL}/api/v1/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Team member added successfully!');
        setIsModalOpen(false);
        setNewMember({ name: '', email: '', departmentName: '', designation: '', password: '' });
        
        fetchTeamMembersFromBackend(); 
      } else {
        const errorData = await response.text();
        toast.error(errorData || 'Failed to add member.');
      }
    } catch (error) {
      toast.error('Server connection failed.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE_URL}/api/v1/team/${memberToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Member removed successfully.');
        setMemberToDelete(null);
        
        fetchTeamMembersFromBackend();
      } else {
        toast.error('Failed to remove member.');
      }
    } catch (error) {
      toast.error('Server error during deletion.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col font-sans animate-[fadeIn_0.3s_ease-out]">
      
      {/* Header */}
      <div className="mb-8 pt-2 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-theme-dark dark:text-white tracking-tight">Team Management</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Manage workspace access, designations, and member details.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-theme-blue text-white shadow-md shadow-theme-blue/30 px-5 py-2.5 rounded-xl font-bold hover:bg-theme-blue-hover transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          Invite Member
        </button>
      </div>

      {/* Members List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="col-span-5">Member Details</div>
          <div className="col-span-3 text-center">Department</div>
          <div className="col-span-3 text-center">Designation</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          {filteredMembers.map(member => (
            <div key={member.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-theme-blue to-blue-400 text-white flex items-center justify-center text-sm font-bold shadow-sm shrink-0 uppercase">
                  {member.name ? member.name.substring(0, 2) : 'NA'}
                </div>
                <div className="truncate">
                  <div className="font-bold text-theme-dark dark:text-white truncate">{member.name}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 font-medium truncate">{member.email}</div>
                </div>
              </div>

              <div className="col-span-3 flex justify-center">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-md transition-colors">
                  {member.departmentName || 'Unassigned'}
                </span>
              </div>
              
              <div className="col-span-3 flex justify-center">
                <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold border transition-colors
                  ${member.designation === 'ADMIN' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800' : 
                    'bg-blue-50 dark:bg-blue-900/30 text-theme-blue dark:text-blue-400 border-blue-100 dark:border-blue-800'}`}
                >
                  {member.designation ? member.designation.replace('_', ' ') : 'N/A'}
                </span>
              </div>

              <div className="col-span-1 flex justify-end">
                {member.designation !== 'ADMIN' && (
                  <button 
                    onClick={() => setMemberToDelete(member)}
                    className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg transition-colors" 
                    title="Remove Member"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredMembers.length === 0 && (
             <div className="p-8 text-center text-gray-400 dark:text-gray-500 font-medium">
               No members found.
             </div>
          )}
        </div>
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {memberToDelete && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-theme-dark/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setMemberToDelete(null)}></div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-sm relative z-10 animate-[slideUp_0.2s_ease-out]">
            <div className="flex items-start gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500 dark:text-red-400 shrink-0 mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-theme-dark dark:text-white">Remove Member?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Are you sure you want to remove <b className="text-theme-dark dark:text-white">{memberToDelete.name}</b>?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => setMemberToDelete(null)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 shadow-md transition-all">Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD MEMBER MODAL --- */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-theme-dark/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl w-full max-w-xl relative z-10 animate-[slideUp_0.2s_ease-out]">
            <h2 className="text-2xl font-extrabold text-theme-dark dark:text-white mb-6">Invite Team Member</h2>
            
            <form onSubmit={handleAddMember} className="flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 pl-1">Full Name</label>
                  <input 
                    type="text" required value={newMember.name} 
                    onChange={e => setNewMember({...newMember, name: e.target.value})} 
                    placeholder="e.g. Jane Doe" 
                    className="w-full p-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-blue font-medium transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 pl-1">Email Address</label>
                  <input 
                    type="email" required value={newMember.email} 
                    onChange={e => setNewMember({...newMember, email: e.target.value})} 
                    placeholder="jane@company.com" 
                    className="w-full p-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-blue font-medium transition-colors" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 pl-1">Department</label>
                  <select 
                    required value={newMember.departmentName}
                    onChange={e => setNewMember({...newMember, departmentName: e.target.value, designation: ''})} 
                    className="w-full p-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-blue font-bold text-theme-dark dark:text-white cursor-pointer appearance-none transition-colors"
                  >
                    <option value="" disabled>Select Department</option>
                    {departments?.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 pl-1">Designation</label>
                  <select 
                    required
                    disabled={!newMember.departmentName}
                    value={newMember.designation}
                    onChange={e => setNewMember({...newMember, designation: e.target.value})}
                    className="w-full p-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-blue font-bold text-theme-dark dark:text-white cursor-pointer appearance-none disabled:opacity-50 transition-colors"
                  >
                    <option value="" disabled>Select Designation</option>
                    {departments?.find(d => d.name === newMember.departmentName)?.roles?.map(roleName => (
                      <option key={roleName} value={roleName}>{roleName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 pl-1">Temporary Password</label>
                <input 
                  type="password" required value={newMember.password} 
                  onChange={e => setNewMember({...newMember, password: e.target.value})} 
                  placeholder="Set an initial password" 
                  className="w-full p-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-blue font-medium transition-colors" 
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" disabled={isLoading} className="bg-theme-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-theme-blue-hover shadow-md transition-all disabled:opacity-70">
                  {isLoading ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Team;