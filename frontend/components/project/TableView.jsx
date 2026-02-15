export default function TableView({ tasks }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="w-full text-left bg-gray-800">
                <thead className="bg-gray-900 text-gray-400 text-sm">
                    <tr>
                        <th className="p-4 font-medium">Title</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Priority</th>
                        <th className="p-4 font-medium">Due Date</th>
                        <th className="p-4 font-medium">Assignee</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {tasks.map(task => (
                        <tr key={task._id} className="hover:bg-gray-750 transition">
                            <td className="p-4">{task.title}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs capitalize ${task.status === 'done' ? 'bg-green-900/30 text-green-400' :
                                    task.status === 'in_progress' ? 'bg-yellow-900/30 text-yellow-400' :
                                        'bg-blue-900/30 text-blue-400'
                                    }`}>
                                    {task.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className={`text-sm capitalize ${task.priority === 'urgent' ? 'text-red-400' :
                                    task.priority === 'high' ? 'text-orange-400' :
                                        'text-gray-400'
                                    }`}>
                                    {task.priority}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-gray-400">
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                            </td>
                            <td className="p-4 text-sm text-gray-400">
                                {task.assignedTo?.name || 'Unassigned'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
