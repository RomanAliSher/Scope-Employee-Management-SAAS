import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

function Settings() {
  const { user, setUser } = useAuth();
const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [profileData, setProfileData] = useState({ 
    workspaceName: '',
    name: '', 
    email: '',
    password: '',
    avatarPreview: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`${API_BASE_URL}/api/v1/profile`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(prev => ({
            ...prev,
            workspaceName: data.workspaceName || '',
            name: data.name || '',
            email: data.email || '',
            avatarPreview: user?.avatar || null
          }));
        }
      } catch (error) {
        console.error("Failed to fetch profile details", error);
      }
    };
    fetchProfile();
  }, [user]);

  // ROBUST ROLE EXTRACTION
  const getUserDisplayRole = () => {
    if (!user?.roles) return 'DEVELOPER';
    try {
      if (typeof user.roles === 'string') {
        return user.roles.replace(/ROLE_/g, '').replace(/\[|\]/g, '').trim();
      }
      if (Array.isArray(user.roles)) {
        return user.roles.map(role => {
          if (typeof role === 'object' && role !== null) return role.authority || '';
          return String(role);
        }).join(', ').replace(/ROLE_/g, '').trim();
      }
      return 'DEVELOPER';
    } catch { return 'DEVELOPER'; }
  };

  const displayRole = getUserDisplayRole();
  const isAdmin = displayRole.includes('ADMIN');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('jwt_token');
      const storedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
      const payload = {
        workspaceName: profileData.workspaceName,
        name: profileData.name,
        email: profileData.email,
        password: profileData.password,
        actualEmail: storedUser.email
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const updatedData = await response.json();
        
        // Agar email badla hai, toh force logout
        if (payload.email !== storedUser.email) {
          toast.success('Email updated! Please log in again.');
          setUser(null);
          localStorage.clear();
          window.location.href = '/login';
          return;
        }

        const mergedUser = { ...storedUser, ...updatedData };
        setUser(mergedUser);
        localStorage.setItem('user_data', JSON.stringify(mergedUser));
        
        setProfileData(prev => ({ ...prev, password: '' }));
        toast.success('Profile updated successfully!');
        navigate('/login');
        
      } else {
        const errorMsg = await response.text();
        toast.error(errorMsg || 'Failed to save changes.');
      }
    } catch (error) {
      toast.error('Server connection failed.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const imageUrl = URL.createObjectURL(file);
      setProfileData(prev => ({ ...prev, avatarPreview: imageUrl }));
      toast.success('Image staging updated!');
    } catch (error) {
      toast.error('Failed to read image asset.');
    }
  };
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match!');
      return;
    }
    if (passwords.new.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const storedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
      
      const payload = {
        workspaceName: profileData.workspaceName,
        name: profileData.name,
        email: profileData.email,
        password: passwords.current,
        newPassword: passwords.new,
        actualEmail: storedUser.email
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/profile/changePassword`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Password updated successfully.');
        setPasswords({ current: '', new: '', confirm: '' });
        navigate('/login');
      } else {
        const errorMsg = await response.text();
        toast.error(errorMsg || 'Failed to update password.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col font-sans animate-[fadeIn_0.3s_ease-out]">
      
      <div className="pt-2 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-theme-dark dark:text-white">Settings</h1>
        
        <div className="flex gap-8 mt-6 border-b border-gray-200 dark:border-gray-700">
          <button 
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'profile' ? 'text-theme-blue dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
          >
            General Profile
            {activeTab === 'profile' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-theme-blue dark:bg-blue-400 rounded-t-full"></span>}
          </button>
          
          {isAdmin && (
            <button 
              type="button"
              onClick={() => setActiveTab('security')}
              className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'security' ? 'text-theme-blue dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
            >
              Security & Passwords
              {activeTab === 'security' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-theme-blue dark:bg-blue-400 rounded-t-full"></span>}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        
        <div className="w-full md:w-1/3">
          <div className="flex flex-col items-center p-6 text-center transition-colors bg-white border border-gray-100 shadow-sm dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
            
            <div 
              onClick={() => fileInputRef.current.click()}
              className="relative flex items-center justify-center w-24 h-24 mb-4 overflow-hidden text-3xl font-bold text-white rounded-full shadow-md cursor-pointer bg-gradient-to-tr from-theme-dark to-gray-600 ring-4 ring-gray-50 dark:ring-gray-700 group"
              title="Click to change profile picture"
            >
              {profileData.avatarPreview ? (
                <img src={profileData.avatarPreview} alt="Profile" className="object-cover w-full h-full" />
              ) : (
                profileData.name.charAt(0) || 'U'
              )}
              <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/40 group-hover:opacity-100">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />

            <h3 className="text-lg font-bold text-theme-dark dark:text-white">{profileData.name || 'User'}</h3>
            <p className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">{profileData.email}</p>
            <span className={`text-[10px] px-3 py-1 rounded-full font-bold border tracking-wider uppercase transition-colors ${isAdmin ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800' : 'bg-blue-50 dark:bg-blue-900/30 text-theme-blue dark:text-blue-400 border-blue-100 dark:border-blue-800'}`}>
              {displayRole}
            </span>
          </div>
        </div>

        <div className="w-full md:w-2/3">

          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-[fadeIn_0.2s_ease-out] transition-colors">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="flex items-center gap-2 text-lg font-bold text-theme-dark dark:text-white">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Personal Information
                </h3>
              </div>

              <div className="p-6">
                <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="block pl-1 mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">Workspace Name</label>
                    <input 
                      type="text" 
                      required 
                      value={profileData.workspaceName} 
                      onChange={(e) => setProfileData({...profileData, workspaceName: e.target.value})} 
                      className={`w-full p-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-blue font-medium text-theme-dark dark:text-white transition-colors ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`} 
                      disabled={!isAdmin}
                    />
                  </div>
                  <div>
                    <label className="block pl-1 mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={profileData.name} 
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                      className={`w-full p-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-blue font-medium text-theme-dark dark:text-white transition-colors ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`} 
                      disabled={!isAdmin}
                    />
                  </div>
                  <div>
                    <label className="block pl-1 mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={profileData.email} 
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className={`w-full p-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-blue font-medium text-theme-dark dark:text-white transition-colors ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`} 
                      disabled={!isAdmin} 
                    />
                  </div>
                  {isAdmin && (
                    <div>
                      <label className="block pl-1 mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">Enter Password to Update</label>
                      <input 
                        type="password" 
                        required
                        value={profileData.password}
                        onChange={(e) => setProfileData({...profileData, password: e.target.value})}
                        className="w-full p-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-blue font-medium text-theme-dark dark:text-white transition-colors" 
                      />
                    </div>
                  )}
                  {isAdmin && (
                    <div className="flex justify-end mt-4">
                      <button type="submit" disabled={isLoading} className="bg-theme-blue text-white px-8 py-2.5 rounded-xl font-bold hover:bg-theme-blue-hover transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-[fadeIn_0.2s_ease-out] transition-colors">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="flex items-center gap-2 text-lg font-bold text-theme-dark dark:text-white">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  Change Password
                </h3>
              </div>

              <div className="p-6">
                <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="block pl-1 mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">Current Password</label>
                    <input type="password" required value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} className="w-full p-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-theme-dark dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-blue font-medium transition-colors" />
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="block pl-1 mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">New Password</label>
                      <input type="password" required value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} className="w-full p-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-theme-dark dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-blue font-medium transition-colors" />
                    </div>
                    <div>
                      <label className="block pl-1 mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">Confirm Password</label>
                      <input type="password" required value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} className="w-full p-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-theme-dark dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-blue font-medium transition-colors" />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button type="submit" disabled={isLoading} className="bg-theme-dark dark:bg-gray-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-black dark:hover:bg-gray-500 transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Settings;