export default function TimelineView({ tasks, project }) {
    // Determine timeline range
    const start = project?.startDate ? new Date(project.startDate) : new Date();
    const end = project?.endDate ? new Date(project.endDate) : new Date(new Date().setMonth(new Date().getMonth() + 3)); // Default 3 months

    // Generate months/days for header (Simplified: Months)
    const months = [];
    const current = new Date(start);
    while (current <= end) {
        months.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
    }

    const getPosition = (date) => {
        if (!date) return 0;
        const d = new Date(date);
        const total = end - start;
        const pos = d - start;
        return Math.max(0, Math.min(100, (pos / total) * 100));
    };

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="flex border-b border-gray-700 bg-gray-900">
                <div className="w-48 p-4 border-r border-gray-700 shrink-0 font-medium text-gray-400">Task Name</div>
                <div className="flex-1 flex overflow-hidden">
                    {months.map((m, i) => (
                        <div key={i} className="flex-1 p-4 text-center border-r border-gray-800 text-sm text-gray-500 last:border-0">
                            {m.toLocaleDateString('default', { month: 'short', year: 'numeric' })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-700">
                {tasks.map(task => {
                    // Mock duration if missing
                    const taskStart = task.startDate ? new Date(task.startDate) : new Date(); // Mock start now
                    const taskEnd = task.dueDate ? new Date(task.dueDate) : new Date(new Date().setDate(new Date().getDate() + 5)); // Mock 5 days

                    const left = getPosition(taskStart);
                    const width = Math.max(2, getPosition(taskEnd) - left); // Min 2% width

                    return (
                        <div key={task._id} className="flex hover:bg-gray-750 transition group">
                            <div className="w-48 p-4 border-r border-gray-700 shrink-0 text-sm truncate" title={task.title}>
                                {task.title}
                            </div>
                            <div className="flex-1 relative h-12">
                                <div
                                    className={`absolute top-3 h-6 rounded px-2 text-xs flex items-center text-white
                                        ${task.status === 'done' ? 'bg-green-600' : 'bg-blue-600'}
                                    `}
                                    style={{ left: `${left}%`, width: `${width}%` }}
                                >
                                    <span className="truncate">{task.title}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
