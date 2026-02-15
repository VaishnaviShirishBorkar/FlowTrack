"use client";

import { useEffect, useState, useMemo } from "react";
import api from "../../../../lib/axios";
import { useParams, useRouter } from "next/navigation";
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
    const router = useRouter();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("board");
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Filter state
    const [filterStatus, setFilterStatus] = useState("");
    const [filterPriority, setFilterPriority] = useState("");
    const [filterAssignee, setFilterAssignee] = useState("");
    const [showDeleteProjectConfirm, setShowDeleteProjectConfirm] = useState(false);
    const [deletingProject, setDeletingProject] = useState(false);

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

    // Client-side filtering
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            if (filterStatus && task.status !== filterStatus) return false;
            if (filterPriority && task.priority !== filterPriority) return false;
            if (filterAssignee) {
                const assigneeId = task.assignedTo?._id || task.assignedTo;
                if (!assigneeId || assigneeId.toString() !== filterAssignee) return false;
            }
            return true;
        });
    }, [tasks, filterStatus, filterPriority, filterAssignee]);

    const activeFilterCount = [filterStatus, filterPriority, filterAssignee].filter(Boolean).length;

    const clearFilters = () => {
        setFilterStatus("");
        setFilterPriority("");
        setFilterAssignee("");
    };

    const handleRemoveMember = async (userId, memberName) => {
        if (!confirm(`Remove ${memberName} from this project?`)) return;
        try {
            const res = await api.delete(`/projects/${id}/members`, { data: { userId } });
            setProject(res.data);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to remove member");
        }
    };

    const handleDeleteProject = async () => {
        setDeletingProject(true);
        try {
            await api.delete(`/projects/${id}`);
            window.dispatchEvent(new Event("sidebar-refresh"));
            router.push("/dashboard");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete project");
        } finally {
            setDeletingProject(false);
            setShowDeleteProjectConfirm(false);
        }
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
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">{project.name}</h1>
                        <p className="text-gray-400 text-sm">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {project.members.map(member => (
                                <div
                                    key={member._id}
                                    className="bg-gray-700 px-3 py-1 rounded-full text-sm text-white flex items-center gap-1.5 group"
                                >
                                    {member.name}
                                    {project.owner !== member._id && (
                                        <button
                                            onClick={() => handleRemoveMember(member._id, member.name)}
                                            className="text-gray-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100 ml-0.5"
                                            title={`Remove ${member.name}`}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <button
                            onClick={() => setIsTaskModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm"
                        >
                            + New Task
                        </button>
                        <button
                            onClick={() => setIsMemberModalOpen(true)}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition text-sm"
                        >
                            Add Member
                        </button>
                        <button
                            onClick={() => setShowDeleteProjectConfirm(true)}
                            className="bg-red-900/30 hover:bg-red-900/60 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg transition text-sm border border-red-900/40"
                        >
                            Delete Project
                        </button>
                    </div>
                </div>

                {/* Delete Project Confirmation */}
                {showDeleteProjectConfirm && (
                    <div className="bg-red-900/20 border border-red-900/40 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="text-red-400 text-sm font-medium">Delete "{project.name}"?</p>
                            <p className="text-red-400/70 text-xs mt-0.5">This will permanently delete the project and all its tasks.</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDeleteProjectConfirm(false)}
                                className="px-4 py-1.5 text-sm text-gray-400 hover:text-white bg-gray-700 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteProject}
                                disabled={deletingProject}
                                className="px-4 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
                            >
                                {deletingProject ? "Deleting..." : "Confirm Delete"}
                            </button>
                        </div>
                    </div>
                )}

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
                    projectMembers={project?.members || []}
                />

                {/* Tabs + Filters */}
                <div className="flex flex-col gap-3">
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

                    {/* Filter Bar */}
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Filters:</span>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                        </select>

                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
                        >
                            <option value="">All Priority</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>

                        <select
                            value={filterAssignee}
                            onChange={(e) => setFilterAssignee(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
                        >
                            <option value="">All Assignees</option>
                            {project?.members?.map((member) => (
                                <option key={member._id} value={member._id}>
                                    {member.name}
                                </option>
                            ))}
                        </select>

                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-900/20 hover:bg-red-900/40 transition"
                            >
                                Clear filters ({activeFilterCount})
                            </button>
                        )}

                        <span className="text-xs text-gray-500 ml-auto">
                            {filteredTasks.length} of {tasks.length} tasks
                        </span>
                    </div>
                </div>

                {/* View Content */}
                <div className="flex-1 overflow-auto">
                    {activeTab === 'board' && <BoardView tasks={filteredTasks} onTaskStatusChange={handleTaskStatusChange} onTaskClick={handleTaskClick} />}
                    {activeTab === 'list' && <ListView tasks={filteredTasks} />}
                    {activeTab === 'timeline' && <TimelineView tasks={filteredTasks} project={project} />}
                    {activeTab === 'table' && <TableView tasks={filteredTasks} />}
                </div>
            </div>

            {/* Activity Feed Sidebar */}
            <div className="w-72 flex-shrink-0 hidden lg:block">
                <ActivityFeed projectId={id} />
            </div>
        </div>
    );
}
