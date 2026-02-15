export default function ListView({ tasks }) {
    return (
        <div className="space-y-2 max-w-4xl">
            {tasks.map(task => (
                <div key={task._id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750">
                    <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${task.status === 'done' ? 'bg-green-500' :
                            task.status === 'in_progress' ? 'bg-yellow-500' :
                                task.status === 'review' ? 'bg-orange-500' :
                                    'bg-blue-500'
                            }`} />
                        <span className="font-medium">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                        <span className="capitalize">{task.status.replace('_', ' ')}</span>
                        <span className={`capitalize ${task.priority === 'urgent' ? 'text-red-400' :
                            task.priority === 'high' ? 'text-orange-400' :
                                'text-gray-400'
                            }`}>{task.priority}</span>
                        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</span>
                        {task.assignedTo?.name && <span className="text-xs border border-gray-600 px-2 rounded">{task.assignedTo.name}</span>}
                    </div>
                </div>
            ))}
        </div>
    )
}
