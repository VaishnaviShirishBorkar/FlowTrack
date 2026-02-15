"use client";

import { useState, useEffect, useRef } from "react";
import api from "../../lib/axios";

export default function TaskDetailModal({ isOpen, onClose, task, onTaskUpdated, projectMembers }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const commentsEndRef = useRef(null);

    // Edit form state
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editStatus, setEditStatus] = useState("");
    const [editPriority, setEditPriority] = useState("");
    const [editAssignee, setEditAssignee] = useState("");
    const [editDueDate, setEditDueDate] = useState("");

    useEffect(() => {
        if (isOpen && task) {
            fetchComments();
            // Reset edit state
            setIsEditing(false);
            setShowDeleteConfirm(false);
            setEditTitle(task.title || "");
            setEditDescription(task.description || "");
            setEditStatus(task.status || "todo");
            setEditPriority(task.priority || "medium");
            setEditAssignee(task.assignedTo?._id || task.assignedTo || "");
            setEditDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
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
            await api.post("/comments", {
                text: newComment,
                taskId: task._id,
            });
            // Don't add comment here — the socket 'new-comment' event will handle it
            // to avoid duplicates (socket broadcasts to all users in the project room)
            setNewComment("");
            setTimeout(() => {
                commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveEdit = async () => {
        setSubmitting(true);
        try {
            await api.put(`/tasks/${task._id}`, {
                title: editTitle,
                description: editDescription,
                status: editStatus,
                priority: editPriority,
                assignedTo: editAssignee || undefined,
                dueDate: editDueDate || undefined,
            });
            setIsEditing(false);
            onTaskUpdated();
            onClose();
        } catch (error) {
            console.error("Error updating task:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTask = async () => {
        setDeleting(true);
        try {
            await api.delete(`/tasks/${task._id}`);
            onTaskUpdated();
            onClose();
        } catch (error) {
            console.error("Error deleting task:", error);
            alert(error.response?.data?.message || "Failed to delete task");
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    // Listen for real-time comments
    useEffect(() => {
        if (!isOpen || !task) return;

        const handleNewComment = (e) => {
            const data = e.detail;
            if (data.taskId === task._id) {
                setComments((prev) => {
                    if (prev.some((c) => c._id === data.comment._id)) return prev;
                    return [...prev, data.comment];
                });
            }
        };

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
                        {isEditing ? (
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full bg-gray-700 text-white text-xl font-bold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                            />
                        ) : (
                            <h2 className="text-xl font-bold text-white truncate">{task.title}</h2>
                        )}
                        {isEditing ? (
                            <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Description..."
                                rows={2}
                                className="w-full mt-2 bg-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 resize-none"
                            />
                        ) : (
                            task.description && (
                                <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                            )
                        )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                        {!isEditing && (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-gray-400 hover:text-blue-400 transition p-1.5 rounded-lg hover:bg-gray-700"
                                    title="Edit task"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="text-gray-400 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-gray-700"
                                    title="Delete task"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition p-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm && (
                    <div className="px-6 py-3 bg-red-900/20 border-b border-red-900/40 flex items-center justify-between">
                        <span className="text-sm text-red-400">Are you sure you want to delete this task?</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-3 py-1 text-sm text-gray-400 hover:text-white bg-gray-700 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteTask}
                                disabled={deleting}
                                className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Task Info / Edit Form */}
                {isEditing ? (
                    <div className="px-6 py-4 border-b border-gray-700/50 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Status</label>
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="todo">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="review">Review</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Priority</label>
                                <select
                                    value={editPriority}
                                    onChange={(e) => setEditPriority(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Assignee</label>
                                <select
                                    value={editAssignee}
                                    onChange={(e) => setEditAssignee(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Unassigned</option>
                                    {projectMembers?.map((m) => (
                                        <option key={m._id} value={m._id}>
                                            {m.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Due Date</label>
                                <input
                                    type="date"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-1.5 text-sm text-gray-400 hover:text-white bg-gray-700 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={submitting || !editTitle.trim()}
                                className="px-4 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
                            >
                                {submitting ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-4 px-6 py-3 border-b border-gray-700/50 text-sm flex-wrap">
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
                )}

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
