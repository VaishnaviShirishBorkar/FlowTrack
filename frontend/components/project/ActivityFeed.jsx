"use client";

import { useState, useEffect, useRef } from "react";
import api from "../../lib/axios";

export default function ActivityFeed({ projectId }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const feedRef = useRef(null);

    useEffect(() => {
        if (projectId) {
            fetchActivities();
        }
    }, [projectId]);

    const fetchActivities = async () => {
        try {
            const res = await api.get(`/activities/project/${projectId}`);
            setActivities(res.data);
        } catch (error) {
            console.error("Error fetching activities:", error);
        } finally {
            setLoading(false);
        }
    };

    // Listen for real-time activities via window events (dispatched from parent)
    useEffect(() => {
        const handleNewActivity = (e) => {
            const activity = e.detail;
            setActivities((prev) => {
                // Avoid duplicates
                if (prev.some((a) => a._id === activity._id)) return prev;
                return [activity, ...prev];
            });
        };

        window.addEventListener("socket-new-activity", handleNewActivity);
        return () => window.removeEventListener("socket-new-activity", handleNewActivity);
    }, []);

    const getActionIcon = (action) => {
        switch (action) {
            case "created_task": return "✨";
            case "updated_task": return "✏️";
            case "moved_task": return "🔄";
            case "deleted_task": return "🗑️";
            case "added_comment": return "💬";
            case "added_member": return "👥";
            default: return "📌";
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case "created_task": return "border-blue-500/40";
            case "moved_task": return "border-yellow-500/40";
            case "deleted_task": return "border-red-500/40";
            case "added_comment": return "border-purple-500/40";
            case "added_member": return "border-green-500/40";
            default: return "border-gray-600";
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days === 1) return "yesterday";
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <div className="bg-gray-900/60 rounded-xl border border-gray-800 flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <h3 className="text-sm font-semibold text-white">Live Activity</h3>
                <span className="text-xs text-gray-500 ml-auto">{activities.length} events</span>
            </div>

            {/* Activity List */}
            <div ref={feedRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
                {loading ? (
                    <div className="text-center text-gray-500 py-8 text-sm">Loading activity...</div>
                ) : activities.length === 0 ? (
                    <div className="text-center text-gray-600 py-8">
                        <p className="text-sm">No activity yet</p>
                        <p className="text-xs mt-1">Actions will appear here in real-time</p>
                    </div>
                ) : (
                    activities.map((activity) => (
                        <div
                            key={activity._id}
                            className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-gray-800/50 border-l-2 ${getActionColor(activity.action)} transition-all hover:bg-gray-800`}
                        >
                            <span className="text-sm flex-shrink-0 mt-0.5">
                                {getActionIcon(activity.action)}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-300 leading-relaxed break-words">
                                    {activity.details}
                                </p>
                                <p className="text-[10px] text-gray-500 mt-1">
                                    {formatTime(activity.createdAt)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
