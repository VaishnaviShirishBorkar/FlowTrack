"use client";

import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import CreateProjectModal from "../../components/project/CreateProjectModal";

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentTasks, setRecentTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/tasks/dashboard");
                setStats(res.data.stats);
                setRecentTasks(res.data.myTasks);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-white">Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                {(user?.role === 'Admin' || user?.role === 'Team Leader') && (
                    <button
                        onClick={() => setIsProjectModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        + New Project
                    </button>
                )}
            </div>

            <CreateProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm font-medium">Total Tasks</h3>
                    <p className="text-2xl font-bold mt-2">{stats?.totalTasks || 0}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm font-medium">Urgent</h3>
                    <p className="text-2xl font-bold mt-2 text-red-500">{stats?.byPriority?.urgent || 0}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm font-medium">High</h3>
                    <p className="text-2xl font-bold mt-2 text-orange-500">{stats?.byPriority?.high || 0}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm font-medium">By Status (Todo)</h3>
                    <p className="text-2xl font-bold mt-2 text-blue-400">{stats?.byStatus?.todo || 0}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Priority Distribution Chart */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-semibold mb-6">Task Priority Distribution</h2>
                    <div className="h-64 flex items-end justify-around pb-4 border-b border-gray-700">
                        {['Low', 'Medium', 'High', 'Urgent'].map(p => {
                            const count = stats?.byPriority?.[p.toLowerCase()] || 0;
                            const max = stats?.totalTasks || 1; // Avoid div by zero
                            const height = Math.max((count / max) * 100, 5); // Min height 5%

                            let color = 'bg-gray-500';
                            if (p === 'Medium') color = 'bg-blue-500';
                            if (p === 'High') color = 'bg-orange-500';
                            if (p === 'Urgent') color = 'bg-red-500';

                            return (
                                <div key={p} className="flex flex-col items-center gap-2 w-1/5 group relative">
                                    <div
                                        className={`w-full ${color} rounded-t transition-all duration-500`}
                                        style={{ height: `${height}%` }}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-xs px-2 py-1 rounded border border-gray-600">
                                            {count}
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-400">{p}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Tasks */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-semibold mb-6">Your Recent Tasks</h2>
                    <div className="space-y-4">
                        {recentTasks.length === 0 ? (
                            <p className="text-gray-400">No tasks assigned to you yet.</p>
                        ) : (
                            recentTasks.map(task => (
                                <div key={task._id} className="flex justify-between items-center p-3 hover:bg-gray-700 rounded-lg transition">
                                    <div>
                                        <h4 className="font-medium">{task.title}</h4>
                                        <p className="text-xs text-gray-400">Project: {task.project?.name}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xs px-2 py-1 rounded-full ${task.priority === 'urgent' ? 'bg-red-900/50 text-red-400' :
                                            task.priority === 'high' ? 'bg-orange-900/50 text-orange-400' :
                                                'bg-blue-900/50 text-blue-400'
                                            }`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
