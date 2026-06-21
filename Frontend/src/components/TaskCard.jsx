// Replace your existing TaskCard.jsx with this
function TaskCard({ task, onDragStart, onStatusChange, onDelete, onClick }) {
  const priorityColors = {
    High: 'bg-red-50 text-theme-red border-red-100',
    Medium: 'bg-orange-50 text-orange-600 border-orange-100',
    Low: 'bg-green-50 text-green-600 border-green-100'
  };

  // Calculate checklist stats to show on the card
  const checklistTotal = task.checklists?.length || 0;
  const checklistDone = task.checklists?.filter(c => c.done).length || 0;

  return (
    <div 
      draggable 
      onDragStart={(e) => onDragStart(e, task)} 
      onClick={() => onClick(task)} // Added onClick trigger
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-theme-blue/30 hover:shadow-md transition-all group flex flex-col gap-3 relative"
    >
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-gray-400">{task.id}</span>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
          className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>

      <h4 className="font-bold text-theme-dark text-sm leading-snug">{task.title}</h4>

      {/* Indicators (Checklist & Comments count) */}
      {(checklistTotal > 0 || task.comments?.length > 0) && (
        <div className="flex gap-3 text-xs font-bold text-gray-400">
          {checklistTotal > 0 && (
            <div className={`flex items-center gap-1 ${checklistDone === checklistTotal ? 'text-green-500' : ''}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              {checklistDone}/{checklistTotal}
            </div>
          )}
          {task.comments?.length > 0 && (
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              {task.comments.length}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mt-1">
        <span className={`text-[10px] px-2 py-0.5 rounded border ${priorityColors[task.priority]}`}>{task.priority}</span>
        <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-bold border border-white shadow-sm" title={task.assignee}>
          {task.assigneeInitials}
        </div>
      </div>
    </div>
  );
}

export default TaskCard;