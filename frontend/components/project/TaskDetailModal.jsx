"use client";

import { useState, useEffect, useRef } from "react";
import api from "../../lib/axios";

export default function TaskDetailModal({ isOpen, onClose, task, onTaskUpdated }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const commentsEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && task) {
            fetchComments();
        }
        return () => {
            setComments([]);
            setNewComment("");
        };
    }, [isOpen, task?._id]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/comments/task/${task._id}`);
            setComments(res.data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const res = await api.post("/comments", {
                text: newComment,
                taskId: task._id,
            });
            setComments((prev) => [...prev, res.data]);
            setNewComment("");
            // Scroll to bottom
            setTimeout(() => {
                commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setSubmitting(false);
        }
    };

    // Listen for real-time comments
    useEffect(() => {
        if (!isOpen || !task) return;

        const handleNewComment = (data) => {
            if (data.taskId === task._id) {
                setComments((prev) => {
                    // Avoid duplicates
                    if (prev.some((c) => c._id === data.comment._id)) return prev;
                    return [...prev, data.comment];
                });
            }
        };

        // We'll use a custom event on window for cross-component Socket.IO communication
        window.addEventListener("socket-new-comment", handleNewComment);
        return () => window.removeEventListener("socket-new-comment", handleNewComment);
    }, [isOpen, task?._id]);

    if (!isOpen || !task) return null;

    const statusColors = {
        todo: "bg-blue-900/40 text-blue-400",
        in_progress: "bg-yellow-900/40 text-yellow-400",
        review: "bg-orange-900/40 text-orange-400",
        done: "bg-green-900/40 text-green-400",
    };

    const statusLabels = {
        todo: "To Do",
        in_progress: "In Progress",
        review: "Under Review",
        done: "Completed",
    };

    const priorityColors = {
        urgent: "bg-red-900/40 text-red-400",
        high: "bg-orange-900/40 text-orange-400",
        medium: "bg-yellow-900/40 text-yellow-400",
        low: "bg-gray-700 text-gray-300",
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
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
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-700">
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-700">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-white truncate">{task.title}</h2>
                        {task.description && (
                            <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 text-gray-400 hover:text-white transition p-1"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Task Info */}
                <div className="flex gap-4 px-6 py-3 border-b border-gray-700/50 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Status:</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[task.status]}`}>
                            {statusLabels[task.status]}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Priority:</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${priorityColors[task.priority]}`}>
                            {task.priority}
                        </span>
                    </div>
                    {task.assignedTo?.name && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">Assignee:</span>
                            <span className="text-white text-xs">👤 {task.assignedTo.name}</span>
                        </div>
                    )}
                    {task.dueDate && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">Due:</span>
                            <span className="text-white text-xs">{formatDate(task.dueDate)}</span>
                        </div>
                    )}
                </div>

                {/* Comments Section */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                        Comments ({comments.length})
                    </h3>

                    {loading ? (
                        <div className="text-center text-gray-500 py-6">Loading comments...</div>
                    ) : comments.length === 0 ? (
                        <div className="text-center text-gray-600 py-8 border border-dashed border-gray-700 rounded-lg">
                            <p className="text-sm">No comments yet</p>
                            <p className="text-xs mt-1">Be the first to comment on this task</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment._id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {comment.user?.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-white">
                                            {comment.user?.name || "Unknown"}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatTime(comment.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300 mt-0.5 break-words">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={commentsEndRef} />
                </div>

                {/* Comment Input */}
                <form onSubmit={handleSubmitComment} className="p-4 border-t border-gray-700">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 bg-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-600"
                        />
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
                        >
                            {submitting ? "..." : "Send"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
