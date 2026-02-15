"use client";

import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import CreateProjectModal from "../../components/project/CreateProjectModal";
import Link from "next/link";

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentTasks, setRecentTasks] = useState([]);
    const [projectBreakdown, setProjectBreakdown] = useState([]);
    const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/tasks/dashboard");
                setStats(res.data.stats);
                setRecentTasks(res.data.myTasks);
                setProjectBreakdown(res.data.projectBreakdown || []);
                setUpcomingDeadlines(res.data.upcomingDeadlines || []);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-full text-gray-400">Loading dashboard...</div>;

    const statusColors = {
        todo: "#60a5fa",
        in_progress: "#facc15",
        review: "#fb923c",
        done: "#4ade80",
    };

    const statusLabels = {
        todo: "To Do",
        in_progress: "In Progress",
        review: "Review",
        done: "Done",
    };

    const priorityColors = {
        urgent: "#f87171",
        high: "#fb923c",
        medium: "#60a5fa",
        low: "#9ca3af",
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        const now = new Date();
        const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
        const dateFormatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (diff < 0) return `${dateFormatted} (overdue)`;
        if (diff === 0) return `${dateFormatted} (today)`;
        if (diff === 1) return `${dateFormatted} (tomorrow)`;
        return `${dateFormatted} (${diff}d)`;
    };

    // Donut chart SVG helper
    const DonutChart = ({ data, size = 140, strokeWidth = 18 }) => {
        const total = data.reduce((sum, d) => sum + d.value, 0);
        if (total === 0) {
            return (
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle cx={size / 2} cy={size / 2} r={(size - strokeWidth) / 2} fill="none" stroke="#374151" strokeWidth={strokeWidth} />
                    <text x="50%" y="50%" textAnchor="middle" dy="0.3em" className="text-2xl font-bold" fill="#9ca3af">0</text>
                </svg>
            );
        }

        let accum = 0;
        const r = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * r;

        return (
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
                {data.map((d, i) => {
                    const dashLength = (d.value / total) * circumference;
                    const dashOffset = -accum;
                    accum += dashLength;
                    return (
                        <circle
                            key={i}
                            cx={size / 2}
                            cy={size / 2}
                            r={r}
                            fill="none"
                            stroke={d.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            className="transition-all duration-700"
                        />
                    );
                })}
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dy="0.35em"
                    fill="white"
                    className="text-2xl font-bold"
                    style={{ transform: "rotate(90deg)", transformOrigin: "center" }}
                >
                    {total}
                </text>
            </svg>
        );
    };

    const statusData = [
        { label: "To Do", value: stats?.byStatus?.todo || 0, color: statusColors.todo },
        { label: "In Progress", value: stats?.byStatus?.in_progress || 0, color: statusColors.in_progress },
        { label: "Review", value: stats?.byStatus?.review || 0, color: statusColors.review },
        { label: "Done", value: stats?.byStatus?.done || 0, color: statusColors.done },
    ];

    const priorityData = [
        { label: "Low", value: stats?.byPriority?.low || 0, color: priorityColors.low },
        { label: "Medium", value: stats?.byPriority?.medium || 0, color: priorityColors.medium },
        { label: "High", value: stats?.byPriority?.high || 0, color: priorityColors.high },
        { label: "Urgent", value: stats?.byPriority?.urgent || 0, color: priorityColors.urgent },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
                    <p className="text-gray-400 text-sm mt-1">Here's what's happening across your projects</p>
                </div>
                {(user?.role === 'Admin' || user?.role === 'Team Leader') && (
                    <button
                        onClick={() => setIsProjectModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                    >
                        + New Project
                    </button>
                )}
            </div>

            <CreateProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wide">Projects</div>
                    <div className="text-2xl font-bold mt-1">{stats?.totalProjects || 0}</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wide">Total Tasks</div>
                    <div className="text-2xl font-bold mt-1">{stats?.totalTasks || 0}</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wide">Completed</div>
                    <div className="text-2xl font-bold mt-1 text-green-400">{stats?.byStatus?.done || 0}</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wide">Overdue</div>
                    <div className={`text-2xl font-bold mt-1 ${stats?.overdue > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                        {stats?.overdue || 0}
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wide">Completion</div>
                    <div className="text-2xl font-bold mt-1">
                        {stats?.completionRate || 0}<span className="text-sm text-gray-500">%</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Status Donut */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-base font-semibold mb-4">Tasks by Status</h2>
                    <div className="flex items-center gap-8">
                        <DonutChart data={statusData} />
                        <div className="space-y-3 flex-1">
                            {statusData.map((d) => (
                                <div key={d.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                                        <span className="text-sm text-gray-300">{d.label}</span>
                                    </div>
                                    <span className="text-sm font-medium text-white">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Priority Bar Chart */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-base font-semibold mb-4">Tasks by Priority</h2>
                    <div className="space-y-3">
                        {priorityData.map((d) => {
                            const max = stats?.totalTasks || 1;
                            const pct = Math.max((d.value / max) * 100, 2);
                            return (
                                <div key={d.label}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">{d.label}</span>
                                        <span className="font-medium text-white">{d.value}</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%`, backgroundColor: d.color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Project Breakdown + Upcoming Deadlines */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Project Breakdown */}
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-base font-semibold mb-4">Project Overview</h2>
                    {projectBreakdown.length === 0 ? (
                        <p className="text-gray-500 text-sm">No projects yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {projectBreakdown.map((p) => {
                                const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
                                return (
                                    <Link
                                        key={p._id}
                                        href={`/dashboard/project/${p._id}`}
                                        className="block p-4 bg-gray-700/40 rounded-lg hover:bg-gray-700/70 transition border border-gray-700/50 group"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium group-hover:text-blue-400 transition">{p.name}</span>
                                                <span className="text-xs text-gray-500">{p.memberCount} members</span>
                                            </div>
                                            <span className="text-xs text-gray-400">{pct}% complete</span>
                                        </div>
                                        {/* Stacked progress bar */}
                                        <div className="w-full bg-gray-600 rounded-full h-2 overflow-hidden flex">
                                            {p.total > 0 && (
                                                <>
                                                    <div style={{ width: `${(p.done / p.total) * 100}%`, backgroundColor: statusColors.done }} className="h-full" />
                                                    <div style={{ width: `${(p.review / p.total) * 100}%`, backgroundColor: statusColors.review }} className="h-full" />
                                                    <div style={{ width: `${(p.in_progress / p.total) * 100}%`, backgroundColor: statusColors.in_progress }} className="h-full" />
                                                    <div style={{ width: `${(p.todo / p.total) * 100}%`, backgroundColor: statusColors.todo }} className="h-full" />
                                                </>
                                            )}
                                        </div>
                                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                            <span>{p.todo} todo</span>
                                            <span>{p.in_progress} active</span>
                                            <span>{p.review} review</span>
                                            <span className="text-green-500">{p.done} done</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Upcoming Deadlines */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-base font-semibold mb-4">Upcoming Deadlines</h2>
                    {upcomingDeadlines.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-sm">No upcoming deadlines</p>
                            <p className="text-gray-600 text-xs mt-1">🎉 You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingDeadlines.map((task) => {
                                const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                                return (
                                    <div
                                        key={task._id}
                                        className="p-3 bg-gray-700/40 rounded-lg border border-gray-700/50"
                                    >
                                        <div className="text-sm font-medium text-white truncate">{task.title}</div>
                                        <div className="flex items-center justify-between mt-1.5">
                                            <span className="text-xs text-gray-400">{task.project?.name}</span>
                                            <span className={`text-xs font-medium ${daysLeft <= 1 ? 'text-red-400' : daysLeft <= 3 ? 'text-yellow-400' : 'text-gray-400'
                                                }`}>
                                                {formatDate(task.dueDate)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h2 className="text-base font-semibold mb-4">Your Recent Tasks</h2>
                {recentTasks.length === 0 ? (
                    <p className="text-gray-500 text-sm">No tasks assigned to you yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-700">
                                    <th className="text-left py-2 pr-4">Task</th>
                                    <th className="text-left py-2 pr-4">Project</th>
                                    <th className="text-left py-2 pr-4">Status</th>
                                    <th className="text-left py-2 pr-4">Priority</th>
                                    <th className="text-left py-2">Due</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTasks.map((task) => (
                                    <tr key={task._id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition">
                                        <td className="py-3 pr-4 font-medium text-white">{task.title}</td>
                                        <td className="py-3 pr-4 text-gray-400">{task.project?.name || "—"}</td>
                                        <td className="py-3 pr-4">
                                            <span className="px-2 py-0.5 rounded text-xs font-medium" style={{
                                                backgroundColor: statusColors[task.status] + '20',
                                                color: statusColors[task.status],
                                            }}>
                                                {statusLabels[task.status] || task.status}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span className="px-2 py-0.5 rounded text-xs font-medium capitalize" style={{
                                                backgroundColor: priorityColors[task.priority] + '20',
                                                color: priorityColors[task.priority],
                                            }}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className="py-3 text-gray-400 text-xs">
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
