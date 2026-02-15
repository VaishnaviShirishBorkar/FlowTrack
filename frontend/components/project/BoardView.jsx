"use client";

import { useState } from "react";

export default function BoardView({ tasks, onTaskStatusChange, onTaskClick }) {
    const [draggedTask, setDraggedTask] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    const columns = {
        todo: { title: "To Do", color: "border-blue-500", bgHover: "bg-blue-500/10" },
        in_progress: { title: "In Progress", color: "border-yellow-500", bgHover: "bg-yellow-500/10" },
        review: { title: "Under Review", color: "border-orange-500", bgHover: "bg-orange-500/10" },
        done: { title: "Completed", color: "border-green-500", bgHover: "bg-green-500/10" }
    };

    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = "move";
        e.target.style.opacity = "0.5";
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = "1";
        setDraggedTask(null);
        setDragOverColumn(null);
    };

    const handleDragOver = (e, colId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverColumn(colId);
    };

    const handleDragLeave = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragOverColumn(null);
        }
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        setDragOverColumn(null);

        if (!draggedTask || draggedTask.status === newStatus) {
            setDraggedTask(null);
            return;
        }

        if (onTaskStatusChange) {
            await onTaskStatusChange(draggedTask._id, newStatus);
        }

        setDraggedTask(null);
    };

    return (
        <div className="flex gap-4 h-full min-w-full overflow-x-auto pb-4">
            {Object.entries(columns).map(([colId, col]) => {
                const columnTasks = tasks.filter(t => t.status === colId);
                const isOver = dragOverColumn === colId && draggedTask?.status !== colId;

                return (
                    <div
                        key={colId}
                        className={`w-80 flex-shrink-0 flex flex-col rounded-xl p-4 transition-colors duration-200 ${isOver
                                ? `bg-gray-900/80 ring-2 ring-inset ${col.color.replace('border-', 'ring-')} ${col.bgHover}`
                                : 'bg-gray-900/50'
                            }`}
                        onDragOver={(e) => handleDragOver(e, colId)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, colId)}
                    >
                        <div className={`flex justify-between items-center mb-4 pl-2 border-l-4 ${col.color}`}>
                            <h3 className="font-semibold">{col.title}</h3>
                            <span className="bg-gray-800 px-2 py-0.5 rounded text-xs text-gray-400">
                                {columnTasks.length}
                            </span>
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto min-h-[100px]">
                            {columnTasks.map(task => (
                                <div
                                    key={task._id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => onTaskClick && onTaskClick(task)}
                                    className={`bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-gray-500 transition cursor-grab active:cursor-grabbing select-none ${draggedTask?._id === task._id ? 'opacity-50' : ''
                                        }`}
                                >
                                    <h4 className="font-medium mb-2">{task.title}</h4>
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span className={`px-2 py-0.5 rounded capitalize ${task.priority === 'urgent' ? 'bg-red-900/40 text-red-400' :
                                            task.priority === 'high' ? 'bg-orange-900/40 text-orange-400' :
                                                'bg-gray-700 text-gray-300'
                                            }`}>
                                            {task.priority}
                                        </span>
                                        {task.dueDate && <span>{new Date(task.dueDate).toLocaleDateString()}</span>}
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400">
                                        {task.assignedTo?.name && <span>👤: {task.assignedTo.name}</span>}
                                    </div>
                                </div>
                            ))}

                            {columnTasks.length === 0 && (
                                <div className={`flex items-center justify-center h-20 rounded-lg border-2 border-dashed transition-colors ${isOver ? 'border-gray-500 text-gray-400' : 'border-gray-800 text-gray-600'
                                    }`}>
                                    <span className="text-sm">Drop tasks here</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
