"use client";

import { useState } from "react";
import api from "../../lib/axios";
import { useRouter } from "next/navigation";

export default function CreateProjectModal({ isOpen, onClose }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/projects", formData);
            onClose();
            router.push(`/dashboard/project/${res.data._id}`);
            router.refresh(); // Refresh to show new project in sidebar? 
            // Sidebar fetch might need a trigger or use Context.
            // For now page refresh or navigation is okay.
            window.location.href = `/dashboard/project/${res.data._id}`; // Force reload to update sidebar
        } catch (error) {
            console.error("Failed to create project", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Create New Project</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Project Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-gray-700 rounded px-3 py-2 text-white border border-gray-600 outline-none focus:border-blue-500"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Description</label>
                        <textarea
                            className="w-full bg-gray-700 rounded px-3 py-2 text-white border border-gray-600 outline-none focus:border-blue-500"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                            <input
                                type="date"
                                className="w-full bg-gray-700 rounded px-3 py-2 text-white border border-gray-600"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">End Date</label>
                            <input
                                type="date"
                                className="w-full bg-gray-700 rounded px-3 py-2 text-white border border-gray-600"
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                        <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Create Project</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
