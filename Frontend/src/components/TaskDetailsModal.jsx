import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function TaskDetailsModal({ task, onClose, onSave }) {
  const { user } = useAuth();
  
  // Checklist aur Comments ki state Workspace/Backend mein update hogi
  const [checklists, setChecklists] = useState(task.checklists || []);
  const [comments, setComments] = useState(task.comments || []);
  const [newComment, setNewComment] = useState('');

  // Sub-tasks sirf check/uncheck ho sakte hain, naye add nahi ho sakte yahan se
  const toggleChecklist = (id) => {
    setChecklists(checklists.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'UN';
    
    const commentObj = {
      id: Date.now(),
      author: user?.name || 'User',
      initials: initials,
      text: newComment,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    
    setComments([...comments, commentObj]);
    setNewComment('');
  };

  const handleSave = () => {
    onSave({
      ...task,
      checklists,
      comments
    });
    onClose();
  };

  const progress = checklists.length > 0 
    ? Math.round((checklists.filter(c => c.done).length / checklists.length) * 100) 
    : 0;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-theme-dark/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative z-10 animate-[slideUp_0.2s_ease-out]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 rounded-t-xl">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">{task.id}</span>
              <span className="text-[10px] font-bold text-theme-blue bg-blue-50 px-1.5 py-0.5 rounded">{task.type}</span>
            </div>
            <h2 className="text-xl font-extrabold text-theme-dark leading-tight">{task.title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 bg-white rounded-md border border-gray-200 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-6">
          
          {/* Read-Only Description */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
              Description
            </h3>
            <div className="w-full min-h-[60px] p-3 text-sm bg-gray-50 border border-gray-100 rounded-lg text-theme-dark whitespace-pre-wrap">
              {task.description || <span className="text-gray-400 italic">No description provided for this task.</span>}
            </div>
          </div>

          {/* Checklist (Toggle Only) */}
          {checklists.length > 0 && (
            <div>
              <div className="flex justify-between items-end mb-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                  Sub-Tasks
                </h3>
                <span className="text-[10px] font-bold text-theme-blue">{progress}% Done</span>
              </div>
              
              <div className="w-full bg-gray-100 rounded-full h-1 mb-3">
                <div className="bg-theme-blue h-1 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>

              <div className="flex flex-col gap-1.5 mb-3">
                {checklists.map(item => (
                  <div key={item.id} className="flex items-center group py-1.5 px-2 hover:bg-gray-50 rounded-md border border-transparent transition-colors cursor-pointer" onClick={() => toggleChecklist(item.id)}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 mr-3 ${item.done ? 'bg-theme-blue border-theme-blue' : 'border-gray-300'}`}>
                      {item.done && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                    </div>
                    <span className={`text-sm select-none ${item.done ? 'line-through text-gray-400' : 'text-theme-dark font-medium'}`}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fully Interactive Comments */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              Activity
            </h3>
            
            <div className="flex flex-col gap-3 mb-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-theme-blue text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{comment.initials}</div>
                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-xs text-theme-dark">{comment.author}</span>
                      <span className="text-[9px] font-bold text-gray-400">{comment.timestamp}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2.5 items-start">
              <div className="w-7 h-7 rounded-full bg-theme-dark text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'UN'}
              </div>
              <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-theme-blue transition-all bg-white flex flex-col">
                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write an update or comment..." className="w-full p-2 text-xs focus:outline-none resize-none bg-transparent min-h-[50px]"></textarea>
                <div className="bg-gray-50 p-1.5 flex justify-end border-t border-gray-100">
                  <button type="submit" disabled={!newComment.trim()} className="bg-theme-blue text-white px-3 py-1 rounded text-xs font-bold hover:bg-theme-blue-hover transition-colors disabled:opacity-50">Post Comment</button>
                </div>
              </div>
            </form>
          </div>

        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-xl">
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors">Close</button>
          <button onClick={handleSave} className="bg-theme-dark text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-black shadow-sm transition-all hover:-translate-y-0.5">Save Updates</button>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailsModal;