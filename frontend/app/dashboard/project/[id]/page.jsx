"use client";

import { useEffect, useState } from "react";
import api from "../../../../lib/axios";
import { useParams } from "next/navigation";
import { connectSocket, disconnectSocket, getSocket } from "../../../../lib/socket";
import AddMemberModal from "../../../../components/project/AddMemberModal";
import CreateTaskModal from "../../../../components/project/CreateTaskModal";
import TaskDetailModal from "../../../../components/project/TaskDetailModal";
import BoardView from "../../../../components/project/BoardView";
import ListView from "../../../../components/project/ListView";
import TimelineView from "../../../../components/project/TimelineView";
import TableView from "../../../../components/project/TableView";
import ActivityFeed from "../../../../components/project/ActivityFeed";

export default function ProjectPage() {
    const { id } = useParams();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("board");
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const fetchData = async () => {
        try {
            const [projRes, tasksRes] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get(`/tasks/project/${id}`)
            ]);
            setProject(projRes.data);
            setTasks(tasksRes.data);

            console.log('projectres ', project);
        } catch (error) {
            console.error("Error fetching project data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskStatusChange = async (taskId, newStatus) => {
        // Optimistic update
        setTasks(prev => prev.map(t =>
            t._id === taskId ? { ...t, status: newStatus } : t
        ));
        try {
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            const tasksRes = await api.get(`/tasks/project/${id}`);
            setTasks(tasksRes.data);
        } catch (error) {
            console.error("Error updating task status:", error);
            fetchData();
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    // Initial data fetch
    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    // Socket.IO connection
    useEffect(() => {
        if (!id) return;

        const socket = connectSocket();

        socket.on('connect', () => {
            socket.emit('join-project', id);
        });

        // If already connected, join immediately
        if (socket.connected) {
            socket.emit('join-project', id);
        }

        // Listen for real-time activity events and dispatch to child components
        socket.on('new-activity', (activity) => {
            window.dispatchEvent(new CustomEvent('socket-new-activity', { detail: activity }));
        });

        socket.on('new-comment', (data) => {
            window.dispatchEvent(new CustomEvent('socket-new-comment', { detail: data }));
        });

        return () => {
            socket.emit('leave-project', id);
            socket.off('new-activity');
            socket.off('new-comment');
        };
    }, [id]);

    if (loading) return <div className="p-8 text-white">Loading project...</div>;
    if (!project) return <div className="p-8 text-white">Project not found</div>;

    return (
        <div className="flex h-full gap-4">
            {/* Main Content */}
            <div className="flex-1 flex flex-col space-y-4 min-w-0">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">{project.name}</h1>
                        <p className="text-gray-400 text-sm">{project.description}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsTaskModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            + New Task
                        </button>
                        <button
                            onClick={() => setIsMemberModalOpen(true)}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                        >
                            Add Member
                        </button>
                    </div>
                </div>

                <CreateTaskModal
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    projectId={id}
                    projectMembers={project?.members || []}
                    onTaskCreated={fetchData}
                />

                <AddMemberModal
                    isOpen={isMemberModalOpen}
                    onClose={() => setIsMemberModalOpen(false)}
                    projectId={id}
                    onMemberAdded={fetchData}
                />

                <TaskDetailModal
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    task={selectedTask}
                    onTaskUpdated={fetchData}
                />

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-700 pb-2">
                    {['board', 'list', 'timeline', 'table'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg transition capitalize ${activeTab === tab
                                ? 'bg-gray-800 text-white border border-gray-600'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* View Content */}
                <div className="flex-1 overflow-auto">
                    {activeTab === 'board' && <BoardView tasks={tasks} onTaskStatusChange={handleTaskStatusChange} onTaskClick={handleTaskClick} />}
                    {activeTab === 'list' && <ListView tasks={tasks} />}
                    {activeTab === 'timeline' && <TimelineView tasks={tasks} project={project} />}
                    {activeTab === 'table' && <TableView tasks={tasks} />}
                </div>
            </div>

            {/* Activity Feed Sidebar */}
            <div className="w-72 flex-shrink-0 hidden lg:block">
                <ActivityFeed projectId={id} />
            </div>
        </div>
    );
}
